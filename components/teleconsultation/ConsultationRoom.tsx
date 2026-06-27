import React, { useEffect, useRef } from 'react';
import { useTeleconsultationStore } from '@/stores/TeleconsultationStore';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeleconsultationTimer } from '@/hooks/useTeleconsultationTimer';

export const ConsultationRoom: React.FC = () => {
  const { 
    localStream, 
    remoteStream, 
    isAudioMuted, 
    isVideoMuted, 
    toggleAudioMuted, 
    toggleVideoMuted,
    state
  } = useTeleconsultationStore();
  
  const { formattedTime, isWarning, isCritical } = useTeleconsultationTimer();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleHangup = () => {
    // Para colgar, el usuario simplemente cierra la pestaña o navega atrás,
    // o podemos llamar al endpoint de finalizar si queremos permitir finalización manual.
    // Por ahora, recargar limpiará la sesión, o redirigir a dashboard.
    window.location.href = '/patient/dashboard';
  };

  return (
    <div className="w-full h-full relative flex flex-col bg-black">
      
      {/* Video Remoto (Especialista/Paciente) - Ocupa todo el fondo */}
      <div className="absolute inset-0 z-0 bg-gray-900 flex items-center justify-center">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <div className="animate-pulse rounded-full bg-gray-800 p-8 mb-4">
              <Video className="w-12 h-12" />
            </div>
            <p className="text-xl">
              {state === 'CONNECTING' ? 'Estableciendo conexión...' : 'Esperando video...'}
            </p>
          </div>
        )}
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none p-4 md:p-8">
        
        {/* Top Bar: Timer */}
        <div className="flex justify-center w-full">
          <div className={`
            pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold shadow-lg backdrop-blur-md transition-colors
            ${isCritical 
              ? 'bg-red-500 text-white animate-pulse' 
              : isWarning 
                ? 'bg-orange-500/80 text-white' 
                : 'bg-black/50 text-white border border-gray-600'}
          `}>
            <Clock className="w-5 h-5" />
            {formattedTime}
          </div>
        </div>

        {/* Video Local (Miniatura) */}
        <div className="flex-1 w-full flex items-end justify-end pb-20 md:pb-0">
          <div className="pointer-events-auto w-32 md:w-48 aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800 relative group">
            {localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity ${isVideoMuted ? 'opacity-30' : 'opacity-100'}`}
              />
            ) : null}
            
            {isVideoMuted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            {isAudioMuted && (
              <div className="absolute bottom-2 right-2 bg-red-500 p-1.5 rounded-full">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controles Inferiores */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-4 bg-gray-900/80 backdrop-blur-xl px-6 py-4 rounded-full border border-gray-800 shadow-2xl">
          
          <Button
            variant="outline"
            size="icon"
            className={`w-14 h-14 rounded-full border-none transition-colors ${
              isAudioMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            onClick={toggleAudioMuted}
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`w-14 h-14 rounded-full border-none transition-colors ${
              isVideoMuted 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            onClick={toggleVideoMuted}
          >
            {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>

          <div className="w-px h-10 bg-gray-700 mx-2"></div>

          <Button
            variant="destructive"
            size="icon"
            className="w-14 h-14 rounded-full hover:bg-red-700 shadow-lg shadow-red-500/20"
            onClick={handleHangup}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
          
        </div>
      </div>

    </div>
  );
};
