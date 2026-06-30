import { useCallback, useEffect, useRef } from 'react';
import { useTeleconsultationStore, ParticipantRole } from '@/stores/TeleconsultationStore';
import { teleconsultationService } from '@/services/teleconsultation.service';
import { useStompTeleconsultation } from './useStompTeleconsultation';
import { useWebRTC } from './useWebRTC';
import { useTeleconsultationTimer } from './useTeleconsultationTimer';
import { useMediaDevices } from './useMediaDevices';
import { toast } from 'react-toastify';

export const useTeleconsultation = (appointmentId: string, role: ParticipantRole) => {
  const isJoinedRef = useRef(false);

  // Timer is just called to run its interval in the background
  useTeleconsultationTimer();

  // Media Devices
  const media = useMediaDevices();

  // STOMP Messaging
  const handleSignalingMessage = useCallback((msg: any) => {
    const store = useTeleconsultationStore.getState();
    switch (msg.type) {
      case 'TELECONSULTATION_STARTED':
        store.setState('CONNECTING');
        // El proveedor siempre crea la oferta inicial para empezar P2P
        if (role === 'PROVIDER') {
          webrtc.initPeerConnection();
          webrtc.createOffer();
        }
        break;
      case 'TELECONSULTATION_FINISHED':
        store.setState('COMPLETED');
        cleanup();
        break;
      case 'SDP_OFFER':
        if (msg.sdp) {
          webrtc.handleReceiveOffer(msg.sdp);
        }
        break;
      case 'SDP_ANSWER':
        if (msg.sdp) {
          webrtc.handleReceiveAnswer(msg.sdp);
        }
        break;
      case 'ICE_CANDIDATE':
        if (msg.candidate) {
          webrtc.handleReceiveIceCandidate({
            candidate: msg.candidate,
            sdpMid: msg.sdpMid,
            sdpMLineIndex: msg.sdpMLineIndex
          });
        }
        break;
      default:
        console.warn('Unknown message type:', msg.type);
    }
  }, [role]);

  const stomp = useStompTeleconsultation(handleSignalingMessage);
  
  // WebRTC
  const webrtc = useWebRTC(stomp.sendSignalingMessage);

  // Funciones de Orquestación
  const startSetup = useCallback(() => {
    const store = useTeleconsultationStore.getState();
    store.setState('CHECKING_ACCESS');
    // Pre-validar o simplemente ir a setup
    store.setState('DEVICE_SETUP');
    media.getDevices();
  }, [media]);

  const joinCall = useCallback(async (teleconsultationId: string) => {
    if (isJoinedRef.current) return;
    
    const store = useTeleconsultationStore.getState();
    store.setState('JOINING');
    store.setIdentifiers(appointmentId, teleconsultationId, role);
    
    try {
      // 1. Obtener acceso a la cámara si no lo tiene
      let stream = store.localStream;
      if (!stream) {
        stream = await media.requestPermissions();
        if (!stream) {
          store.setState('FAILED');
          return;
        }
      }

      // 2. Unirse al backend para validar y obtener timer
      const response = await teleconsultationService.joinTeleconsultation(teleconsultationId, role === 'PROVIDER');
      
      store.setTimerConfig(response.serverEndTime, response.remainingSeconds);
      
      // 3. Conectar al STOMP para empezar a escuchar
      stomp.connect();
      isJoinedRef.current = true;

      if (response.canStartWebRTC) {
        store.setState('CONNECTING');
        // Si ya podíamos iniciar, el proveedor crea la oferta
        if (role === 'PROVIDER') {
          webrtc.initPeerConnection();
          webrtc.createOffer();
        }
      } else {
        store.setState('WAITING');
      }
      
    } catch (error: any) {
      console.error('Failed to join teleconsultation:', error);
      toast.error(error?.response?.data?.message || 'Error al conectar a la consulta');
      const latestStore = useTeleconsultationStore.getState();
      latestStore.setState('FAILED');
    }
  }, [appointmentId, role, media, stomp, webrtc]);

  const cleanup = useCallback(() => {
    webrtc.cleanupWebRTC();
    stomp.disconnect();
    
    const store = useTeleconsultationStore.getState();
    if (store.localStream) {
      store.localStream.getTracks().forEach(track => track.stop());
    }
    
    store.reset();
    isJoinedRef.current = false;
  }, [webrtc, stomp]);

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
    media
  };
};
