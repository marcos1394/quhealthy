import { useRef, useCallback, useMemo } from "react";
import { useTeleconsultationStore } from "@/stores/TeleconsultationStore";

export const useWebRTC = (sendSignalingMessage: (msg: any) => void) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const getIceServers = () => {
    return [
      {
        urls:
          process.env.NEXT_PUBLIC_STUN_URL || "stun:stun.l.google.com:19302",
      },
      // TURN servers will be injected here in the future
    ];
  };

  const initPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return;

    const configuration: RTCConfiguration = {
      iceServers: getIceServers(),
      iceCandidatePoolSize: 10,
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    const { localStream, setRemoteStream, setState } =
      useTeleconsultationStore.getState();

    // Agregar tracks locales
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Escuchar tracks remotos
    pc.ontrack = (event) => {
      const { setRemoteStream } = useTeleconsultationStore.getState();
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const stream = new MediaStream([event.track]);
        setRemoteStream(stream);
      }
    };

    // Escuchar ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: "ICE_CANDIDATE",
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
        });
      }
    };

    // Manejar el estado de conexión
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      const { setState } = useTeleconsultationStore.getState();
      console.log("ICE Connection State:", state);

      if (state === "failed" || state === "disconnected") {
        setState("RECONNECTING");
        // TODO: Implementar lógica de reconexión real (reiniciar peer connection)
      } else if (state === "connected" || state === "completed") {
        setState("CONNECTED");
      }
    };
  }, [sendSignalingMessage]);

  const createOffer = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignalingMessage({
        type: "SDP_OFFER",
        sdp: offer.sdp,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }, [sendSignalingMessage]);

  const handleReceiveOffer = useCallback(
    async (sdp: string) => {
      initPeerConnection();
      const pc = peerConnectionRef.current;
      if (!pc) return;

      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: "offer", sdp }),
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignalingMessage({
          type: "SDP_ANSWER",
          sdp: answer.sdp,
        });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    },
    [initPeerConnection, sendSignalingMessage],
  );

  const handleReceiveAnswer = useCallback(async (sdp: string) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "answer", sdp }),
      );
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  }, []);

  const handleReceiveIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    },
    [],
  );

  const cleanupWebRTC = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    const { setRemoteStream } = useTeleconsultationStore.getState();
    setRemoteStream(null);
  }, []);

  return useMemo(
    () => ({
      initPeerConnection,
      createOffer,
      handleReceiveOffer,
      handleReceiveAnswer,
      handleReceiveIceCandidate,
      cleanupWebRTC,
    }),
    [
      initPeerConnection,
      createOffer,
      handleReceiveOffer,
      handleReceiveAnswer,
      handleReceiveIceCandidate,
      cleanupWebRTC,
    ],
  );
};
