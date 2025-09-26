/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSessionStore } from '@/stores/SessionStore';
import Video from 'twilio-video';
import axios from 'axios';
import { Loader2, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VideoCallPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;
  const { user } = useSessionStore();
  
  const [room, setRoom] = useState<Video.Room | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
    const [isConnecting, setIsConnecting] = useState(true);


  useEffect(() => {
    if (!appointmentId || !user) return;

   const connectToRoom = async () => {
      try {
        // 1. Obtenemos el token de acceso desde nuestro backend
        const { data } = await axios.get(`/api/twilio/video/token/${appointmentId}`, {
          withCredentials: true
        });
        
        // 2. Nos conectamos a la sala de Twilio con el token
        const videoRoom = await Video.connect(data.token, {
          name: data.roomName,
          audio: true,
          video: { width: 640 }
        });
        
        setRoom(videoRoom);
        setIsConnecting(false);

        // 3. Mostramos nuestro propio video
        if (localVideoRef.current && videoRoom.localParticipant.videoTracks.size > 0) {
          const localTrackPublication = Array.from(videoRoom.localParticipant.videoTracks.values())[0];
          if (localTrackPublication.track) {
            localVideoRef.current.appendChild(localTrackPublication.track.attach());
          }
        }
        
        // --- INICIO DE LA LÓGICA CORREGIDA ---

        // 4. Función reutilizable para manejar a un participante (nuevo o existente)
        const handleParticipant = (participant: Video.RemoteParticipant) => {
          participant.on('trackSubscribed', (track: Video.RemoteTrack) => {
            // Verificamos que sea un track de video o audio antes de adjuntarlo
            if (track.kind === 'video' || track.kind === 'audio') {
              if (remoteVideoRef.current) {
                // Limpiamos el contenedor antes de añadir el nuevo video para evitar duplicados
                remoteVideoRef.current.innerHTML = ''; 
                remoteVideoRef.current.appendChild(track.attach());
              }
            }
          });
        };

        // 5. Manejamos a los participantes que YA ESTÁN en la sala
        videoRoom.participants.forEach(handleParticipant);
        
        // 6. Manejamos a los NUEVOS participantes que se conecten
        videoRoom.on('participantConnected', handleParticipant);

        // --- FIN DE LA LÓGICA CORREGIDA ---

      } catch (error) {
        console.error("Error connecting to Twilio room:", error);
        setIsConnecting(false);
      }
    };

    connectToRoom();

    return () => {
      // Desconectarse de la sala al salir del componente
      if (room) {
        room.disconnect();
      }
    };
  }, [appointmentId, user, room]);

  const handleHangUp = () => {
    if (room) room.disconnect();
    window.history.back(); // Vuelve a la página anterior
  };

  if (!room) {
    return <div className="min-h-screen bg-black flex flex-col justify-center items-center text-white"><Loader2 className="w-8 h-8 animate-spin mb-4"/>Conectando a la videollamada...</div>;
  }
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
      {/* Video del otro participante (ocupa el fondo) */}
      <div ref={remoteVideoRef} className="absolute inset-0 w-full h-full" />
      
      {/* Nuestro video (en una esquina) */}
      <div ref={localVideoRef} className="absolute top-4 right-4 w-48 h-36 border-2 border-purple-500 rounded-lg overflow-hidden z-10" />

      {/* Controles */}
      <div className="absolute bottom-8 flex gap-4 z-10 bg-black/50 backdrop-blur-sm p-4 rounded-full">
        <Button variant="outline" size="default" className="w-12 h-12 rounded-full" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <MicOff/> : <Mic/>}
        </Button>
        <Button variant="outline" size="default" className="w-12 h-12 rounded-full" onClick={() => setVideoEnabled(!videoEnabled)}>
            {videoEnabled ? <VideoIcon/> : <VideoOff/>}
        </Button>
        <Button variant="destructive" size="default" className="w-16 h-12 rounded-full" onClick={handleHangUp}>
          <PhoneOff/>
        </Button>
      </div>
    </div>
  );
}