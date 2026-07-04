import React, { useEffect, useRef } from 'react';
import { useTeleconsultationStore, ParticipantRole } from '@/stores/TeleconsultationStore';
import { Clock, Shield, Bell } from 'lucide-react';
import { useTeleconsultationTimer } from '@/hooks/useTeleconsultationTimer';

export const WaitingRoom: React.FC = () => {
 const { localStream, role } = useTeleconsultationStore();
 const videoRef = useRef<HTMLVideoElement>(null);
 const { formattedTime } = useTeleconsultationTimer();

 useEffect(() => {
 if (videoRef.current && localStream) {
 videoRef.current.srcObject = localStream;
 }
 }, [localStream]);

 const isPatient = role === 'PATIENT';

 return (
 <div className="w-full h-full flex items-center justify-center relative bg-white dark:bg-[#050505] text-black dark:text-white border-l border-black dark:border-white">
 <div className="z-10 w-full max-w-4xl p-4 flex flex-col md:flex-row items-center gap-8">
 
 {/* Información y Estado */}
 <div className="w-full md:w-1/2 flex flex-col gap-6 text-center md:text-left">
 <div className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 w-fit mx-auto md:mx-0 border border-black dark:border-white uppercase tracking-widest text-[10px] font-bold">
 <Shield className="w-4 h-4" />
 <span>Conexión Segura</span>
 </div>

 <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
 {isPatient ? 'Médico en breve' : 'Esperando paciente'}
 </h1>
 
 <p className="text-sm uppercase font-semibold text-gray-500">
 {isPatient 
 ? 'Espera en esta pantalla. El especialista ha sido notificado.'
 : 'El paciente aún no ha ingresado a la sala. Te notificaremos.'}
 </p>

 <div className="bg-white dark:bg-[#0a0a0a] p-6 border border-black dark:border-white mt-4">
 <div className="flex items-center gap-4 mb-4">
 <div className="border border-black dark:border-white p-3">
 <Clock className="w-6 h-6" />
 </div>
 <div className="text-left">
 <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Tiempo restante</p>
 <p className="text-2xl font-bold font-mono text-black dark:text-white">{formattedTime}</p>
 </div>
 </div>
 
 <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-gray-500 border-t border-black dark:border-white pt-4 mt-2">
 <Bell className="w-4 h-4" />
 <p>Aviso automático al iniciar.</p>
 </div>
 </div>
 </div>

 {/* Vista miniatura del usuario */}
 <div className="w-full md:w-1/2 max-w-sm">
 <div className="bg-gray-100 dark:bg-[#111] overflow-hidden aspect-[3/4] relative border-4 border-black dark:border-white">
 {localStream ? (
 <video
 ref={videoRef}
 autoPlay
 playsInline
 muted
 className="w-full h-full object-cover transform scale-x-[-1]"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
 Cámara desactivada
 </div>
 )}
 
 <div className="absolute bottom-4 left-4 right-4 text-center">
 <div className="bg-white dark:bg-black text-black dark:text-white border border-black dark:border-white font-bold text-[10px] uppercase tracking-widest py-2 px-4 inline-block">
 Tu video (Local)
 </div>
 </div>
 </div>
 </div>

 </div>
 </div>
 );
};
