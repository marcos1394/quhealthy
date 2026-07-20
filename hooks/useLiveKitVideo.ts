import { useRef, useCallback, useMemo } from "react";
import { Room, RoomEvent, VideoPresets, Track, ParticipantKind } from "livekit-client";
import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";

export const useLiveKitVideo = () => {
  const roomRef = useRef<Room | null>(null);

  const connectToRoom = useCallback(async (wsUrl: string, token: string) => {
    if (roomRef.current) return;

    // 1. Inicializar la sala con configuraciones óptimas para telemedicina
    const room = new Room({
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
      publishDefaults: {
        simulcast: true, // Permite adaptar la calidad si el internet del paciente fluctúa
      },
    });

    roomRef.current = room;
    const { setRemoteStream, setState } = useTeleconsultationStore.getState();

    // 2. Escuchar cuando un participante comparte su track (video/audio)
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio) {
        // Fix: La forma más segura de reproducir múltiples audios (Humano + Agente IA)
        // es permitiendo que LiveKit cree los elementos <audio> y los ancle al DOM
        const element = track.attach();
        element.id = `audio-${track.sid}`;
        document.body.appendChild(element);
      } else if (track.kind === Track.Kind.Video) {
        // Mantenemos el flujo del store para el Video y que React lo ponga en el <video> principal
        const mediaStream = new MediaStream([track.mediaStreamTrack]);
        setRemoteStream(mediaStream);
        setState("CONNECTED");
      }
    });

    // 3. Escuchar cuando un participante remueve un track
    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach().forEach(el => el.remove());
        const el = document.getElementById(`audio-${track.sid}`);
        if (el) el.remove();
      } else if (track.kind === Track.Kind.Video) {
        setRemoteStream(null);
      }
    });

    // 4. Manejar cambios de estado de la conexión
    room.on(RoomEvent.ConnectionStateChanged, (connectionState) => {
      const { setState } = useTeleconsultationStore.getState();
      console.log("LiveKit Connection State:", connectionState);
      
      if (connectionState === "connecting") setState("CONNECTING");
      if (connectionState === "connected") setState("CONNECTED");
      if (connectionState === "disconnected") setState("RECONNECTING");
    });

    // Función para revisar si el AudioAgent está en la sala
    const checkAiAgent = (room: Room) => {
      const { setAiAgentActive } = useTeleconsultationStore.getState();
      const hasAgent = Array.from(room.remoteParticipants.values()).some(p => 
        p.kind === ParticipantKind.AGENT
      );
      setAiAgentActive(hasAgent);
    };

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      checkAiAgent(room);
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      checkAiAgent(room);
    });

    room.on(RoomEvent.TranscriptionReceived, (transcriptions, participant, publication) => {
      const { addTranscription } = useTeleconsultationStore.getState();
      
      transcriptions.forEach((transcription) => {
        // The text sent by the agent contains both original and translation if they differ
        // e.g. "[ES] Hola\n[EN] Hello" or just the text if same language
        addTranscription({
          id: transcription.id || Math.random().toString(),
          text: transcription.text,
          participantName: participant?.name || participant?.identity || "Unknown",
          isTranslation: transcription.text.includes('\n[') // simple heuristic based on our agent format
        });
      });
    });

    try {
      // 5. Conectarse al servidor de LiveKit Cloud
      await room.connect(wsUrl, token);
      
      // Checar si el agente ya estaba en la sala
      checkAiAgent(room);
      
      // 6. Publicar automáticamente los tracks locales que ya están en el Store
      const { localStream } = useTeleconsultationStore.getState();
      if (localStream) {
        for (const track of localStream.getTracks()) {
          await room.localParticipant.publishTrack(track);
        }
      } else {
        // Fallback si no había stream (raro en este flujo)
        await room.localParticipant.enableCameraAndMicrophone();
      }
      
    } catch (error) {
      console.error("Error connecting to LiveKit room:", error);
      setState("FAILED");
    }
  }, []);

  const disconnectFromRoom = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    const { setRemoteStream } = useTeleconsultationStore.getState();
    setRemoteStream(null);
  }, []);

  return useMemo(
    () => ({
      connectToRoom,
      disconnectFromRoom,
    }),
    [connectToRoom, disconnectFromRoom]
  );
};