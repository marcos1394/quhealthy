import React, { useEffect, useRef } from 'react';
import { useTeleconsultationStore } from '@/stores/TeleconsultationStore';
import { Video, Mic, AlertCircle, Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeviceSetupProps {
 media: any; // Return type of useMediaDevices
 onJoin: () => void;
 isLoading?: boolean;
}

export const DeviceSetup: React.FC<DeviceSetupProps> = ({ media, onJoin, isLoading }) => {
 const { systemChecks, localStream } = useTeleconsultationStore();
 const videoRef = useRef<HTMLVideoElement>(null);

 useEffect(() => {
 // Si no tenemos stream, lo solicitamos automáticamente al entrar
 if (!localStream && !media.isInitializing && !media.error) {
 media.requestPermissions();
 }
 }, [localStream, media]);

 // Asignar el stream local al video tag para que el usuario se vea a sí mismo
 useEffect(() => {
 if (videoRef.current && localStream) {
 videoRef.current.srcObject = localStream;
 }
 }, [localStream]);

 const allChecksPassed = systemChecks.camera && systemChecks.mic && systemChecks.internet;

 return (
 <div className="relative w-full h-full bg-black flex flex-col overflow-hidden border-l border-black dark:border-white">
 {/* Vista previa de cámara full screen */}
 <div className="absolute inset-0 z-0 bg-gray-100 dark:bg-[#111] flex items-center justify-center">
 {localStream ? (
 <video
 ref={videoRef}
 autoPlay
 playsInline
 muted
 className="w-full h-full object-cover transform scale-x-[-1]"
 />
 ) : (
 <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
 {media.isInitializing ? (
 <div className="animate-spin h-12 w-12 border-2 border-black dark:border-white mb-4"></div>
 ) : (
 <Video className="w-12 h-12 mb-4 opacity-50" />
 )}
 <p className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">
 {media.error ? 'Cámara no accesible' : 'Solicitando permisos...'}
 </p>
 {media.error && (
 <Button onClick={() => media.requestPermissions()} variant="outline" className="mt-4 rounded-none border-black dark:border-white uppercase text-[10px] tracking-widest font-bold">
 Reintentar
 </Button>
 )}
 </div>
 )}
 </div>

 {/* Banners Flotantes de Estado (Top Right) */}
 <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 pointer-events-none">
 <div className={`flex items-center gap-2 p-2 border border-black dark:border-white shadow-lg ${systemChecks.camera ? 'bg-white/90 dark:bg-black/90 text-black dark:text-white' : 'bg-red-500 text-white'}`}>
 <Video className="w-3.5 h-3.5" />
 <span className="text-[9px] font-bold uppercase tracking-widest">{systemChecks.camera ? 'CÁMARA OK' : 'ERROR CÁMARA'}</span>
 </div>
 <div className={`flex items-center gap-2 p-2 border border-black dark:border-white shadow-lg ${systemChecks.mic ? 'bg-white/90 dark:bg-black/90 text-black dark:text-white' : 'bg-red-500 text-white'}`}>
 <Mic className="w-3.5 h-3.5" />
 <span className="text-[9px] font-bold uppercase tracking-widest">{systemChecks.mic ? 'MIC OK' : 'ERROR MIC'}</span>
 </div>
 <div className={`flex items-center gap-2 p-2 border border-black dark:border-white shadow-lg ${systemChecks.internet ? 'bg-white/90 dark:bg-black/90 text-black dark:text-white' : 'bg-amber-500 text-white'}`}>
 <AlertCircle className="w-3.5 h-3.5" />
 <span className="text-[9px] font-bold uppercase tracking-widest">{systemChecks.internet ? 'RED OK' : 'SIN RED'}</span>
 </div>
 </div>

 {/* Overlay inferior y botón de entrada */}
 <div className="absolute bottom-0 left-0 right-0 z-20 p-6 flex flex-col items-center bg-gradient-to-t from-black/80 via-black/60 to-transparent">
  
  <div className="mb-4 w-full sm:w-auto min-w-[200px] flex flex-col gap-1">
    <label className="text-[10px] font-bold uppercase tracking-widest text-white text-center">
      Idioma de Subtítulos / Traducción
    </label>
    <select 
      className="w-full bg-white text-black border border-black rounded-none p-2 text-[12px] font-mono font-bold outline-none"
      value={useTeleconsultationStore((s) => s.preferredLanguage)}
      onChange={(e) => useTeleconsultationStore.getState().setPreferredLanguage(e.target.value)}
    >
      <option value="es">Español</option>
      <option value="en">English (Inglés)</option>
    </select>
  </div>

  <Button 
  className="w-full sm:w-auto min-w-[200px] h-12 text-[10px] uppercase tracking-widest rounded-none font-bold border border-transparent bg-white text-black hover:bg-gray-200 shadow-2xl transition-all"
  onClick={onJoin}
  disabled={!allChecksPassed || isLoading}
  >
  {isLoading ? 'Conectando...' : 'ENTRAR A LA SALA'}
  </Button>
 </div>
 </div>
 );
};
