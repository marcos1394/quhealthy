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
 <div className="w-full h-full relative flex flex-col bg-white dark:bg-[#050505]">
 
 {/* Video Remoto (Especialista/Paciente) - Ocupa todo el fondo */}
 <div className="absolute inset-0 z-0 bg-gray-100 dark:bg-[#111] flex items-center justify-center">
 {remoteStream ? (
 <video
 ref={remoteVideoRef}
 autoPlay
 playsInline
 className="w-full h-full object-cover xl:object-contain"
 />
 ) : (
 <div className="flex flex-col items-center justify-center text-gray-500 px-4 text-center">
 <div className="animate-pulse bg-gray-200 dark:bg-[#222] p-8 mb-4 border border-black dark:border-white">
 <Video className="w-12 h-12 text-black dark:text-white" />
 </div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white leading-tight">
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
 pointer-events-auto flex items-center gap-2 px-4 py-2 font-mono text-[12px] font-bold uppercase tracking-widest transition-colors border
 ${isCritical 
 ? 'bg-red-500 text-white border-red-500 animate-pulse' 
 : isWarning 
 ? 'bg-orange-500 text-white border-orange-500' 
 : 'bg-white dark:bg-[#050505] text-black dark:text-white border-black dark:border-white'}
 `}>
 <Clock className="w-4 h-4" />
 {formattedTime}
 </div>
 </div>

 {/* Video Local (Miniatura) */}
 <div className="flex-1 w-full flex items-end justify-end pb-20 md:pb-0">
 <div className="pointer-events-auto w-32 md:w-48 aspect-[3/4] bg-white dark:bg-black overflow-hidden shadow-2xl border-2 border-black dark:border-white relative group">
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
 <VideoOff className="w-8 h-8 text-black dark:text-white" />
 </div>
 )}
 
 {isAudioMuted && (
 <div className="absolute bottom-2 right-2 bg-red-500 p-1.5 border border-black dark:border-white">
 <MicOff className="w-4 h-4 text-white" />
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex justify-center bg-gradient-to-t from-white via-white/80 dark:from-[#050505] dark:via-[#050505]/80 to-transparent">
 <div className="flex items-center gap-2 bg-white dark:bg-[#0a0a0a] px-3 py-2 border border-black dark:border-white shadow-2xl">
 
 <button
 className={`w-10 h-10 flex items-center justify-center border transition-colors ${
 isAudioMuted 
 ? 'bg-red-500 hover:bg-red-600 text-white border-black dark:border-white' 
 : 'bg-white dark:bg-[#050505] hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black border-black dark:border-white'
 }`}
 onClick={toggleAudioMuted}
 >
 {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
 </button>

 <button
 className={`w-10 h-10 flex items-center justify-center border transition-colors ${
 isVideoMuted 
 ? 'bg-red-500 hover:bg-red-600 text-white border-black dark:border-white' 
 : 'bg-white dark:bg-[#050505] hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black border-black dark:border-white'
 }`}
 onClick={toggleVideoMuted}
 >
 {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
 </button>

 <div className="w-px h-8 bg-black/20 dark:bg-white/20 mx-1"></div>

 <button
 className="w-10 h-10 flex items-center justify-center border border-black dark:border-white bg-red-600 hover:bg-red-700 text-white transition-colors"
 onClick={handleHangup}
 >
 <PhoneOff className="w-4 h-4" />
 </button>
 
 </div>
 </div>

 </div>
 );
};
