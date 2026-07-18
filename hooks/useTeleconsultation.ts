import { useCallback, useEffect, useRef } from "react";
import {
  useTeleconsultationStore,
  ParticipantRole,
} from "@/stores/TeleconsultationStore";
import { teleconsultationService } from "@/services/teleconsultation.service";
import { useTeleconsultationTimer } from "./useTeleconsultationTimer";
import { useMediaDevices } from "./useMediaDevices";
import { useLiveKitVideo } from "./useLiveKitVideo";
import { toast } from "react-toastify";

export const useTeleconsultation = (
  appointmentId: string,
  role: ParticipantRole,
) => {
  const isJoinedRef = useRef(false);

  // Timer is just called to run its interval in the background
  useTeleconsultationTimer();

  // Media Devices
  const media = useMediaDevices();

  // LiveKit Video
  const liveKit = useLiveKitVideo();

  // Funciones de Orquestación
  const startSetup = useCallback(() => {
    const store = useTeleconsultationStore.getState();
    store.setState("CHECKING_ACCESS");
    // Pre-validar o simplemente ir a setup
    store.setState("DEVICE_SETUP");
    media.getDevices();
  }, [media]);

  const joinCall = useCallback(
    async (teleconsultationId: string) => {
      if (isJoinedRef.current) return;

      const store = useTeleconsultationStore.getState();
      store.setState("JOINING");
      store.setIdentifiers(appointmentId, teleconsultationId, role);

      try {
        // 1. Obtener acceso a la cámara si no lo tiene
        let stream = store.localStream;
        if (!stream) {
          stream = await media.requestPermissions();
          if (!stream) {
            store.setState("FAILED");
            return;
          }
        }

        // 2. Unirse al backend para validar y obtener credenciales de LiveKit
        const response = await teleconsultationService.joinTeleconsultation(
          teleconsultationId,
          role === "PROVIDER",
        );

        store.setTimerConfig(response.serverEndTime, response.remainingSeconds);

        if (!response.canStartWebRTC) {
          store.setState("WAITING");
          return;
        }

        // 3. Conectar a la sala de LiveKit Cloud
        if (response.livekitWsUrl && response.livekitToken) {
          await liveKit.connectToRoom(response.livekitWsUrl, response.livekitToken);
          isJoinedRef.current = true;
          // El estado "CONNECTED" o "CONNECTING" se maneja dentro de useLiveKitVideo
        } else {
          throw new Error("No se recibieron credenciales de LiveKit del servidor");
        }
      } catch (error: any) {
        console.error("Failed to join teleconsultation:", error);
        toast.error(
          error?.response?.data?.message || "Error al conectar a la consulta",
        );
        const latestStore = useTeleconsultationStore.getState();
        latestStore.setState("FAILED");
      }
    },
    [appointmentId, role, media, liveKit],
  );

  const cleanup = useCallback(() => {
    liveKit.disconnectFromRoom();

    const store = useTeleconsultationStore.getState();
    if (store.localStream) {
      store.localStream.getTracks().forEach((track) => track.stop());
    }

    store.reset();
    isJoinedRef.current = false;
  }, [liveKit]);

  const endCall = useCallback(() => {
    liveKit.disconnectFromRoom();

    const store = useTeleconsultationStore.getState();
    if (store.localStream) {
      store.localStream.getTracks().forEach((track) => track.stop());
    }

    store.setState('COMPLETED');
    isJoinedRef.current = false;
  }, [liveKit]);

  // Polling al servidor cuando estamos en estado WAITING
  const state = useTeleconsultationStore(s => s.state);
  const teleconsultationId = useTeleconsultationStore(s => s.teleconsultationId);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      if (state !== "WAITING" || !teleconsultationId || isJoinedRef.current) {
        return;
      }

      try {
        const response = await teleconsultationService.joinTeleconsultation(
          teleconsultationId,
          role === "PROVIDER",
        );

        const store = useTeleconsultationStore.getState();
        store.setTimerConfig(response.serverEndTime, response.remainingSeconds);

        if (response.canStartWebRTC && response.livekitWsUrl && response.livekitToken) {
          await liveKit.connectToRoom(response.livekitWsUrl, response.livekitToken);
          isJoinedRef.current = true;
          // El estado pasa a ser controlado por LiveKit
        } else {
          // Seguir esperando
          timeoutId = setTimeout(pollStatus, 5000);
        }
      } catch (error) {
        console.error("Error polling teleconsultation status:", error);
        // Reintentar a pesar del error
        timeoutId = setTimeout(pollStatus, 5000);
      }
    };

    if (state === "WAITING") {
      timeoutId = setTimeout(pollStatus, 5000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [state, teleconsultationId, role, liveKit]);

  // Limpieza al desmontar el componente padre
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    startSetup,
    joinCall,
    cleanup,
    endCall,
    media,
  };
};
