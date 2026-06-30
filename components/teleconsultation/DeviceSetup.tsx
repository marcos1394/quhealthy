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
    <div className="w-full h-full p-4 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start bg-white dark:bg-[#050505] text-black dark:text-white border-l border-black dark:border-white">
      {/* Vista previa de cámara */}
      <div className="w-full md:w-3/5 bg-gray-100 dark:bg-[#111] aspect-video relative border-4 border-black dark:border-white flex items-center justify-center">
        {localStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]" // Espejo
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
            {media.isInitializing ? (
              <div className="animate-spin h-12 w-12 border-2 border-black dark:border-white mb-4"></div>
            ) : (
              <Video className="w-12 h-12 mb-4 opacity-50" />
            )}
            <p className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">
              {media.error 
                ? 'Cámara no accesible' 
                : 'Solicitando permisos...'}
            </p>
            {media.error && (
              <Button onClick={() => media.requestPermissions()} variant="outline" className="mt-4 rounded-none border-black dark:border-white uppercase text-[10px] tracking-widest font-bold">
                Reintentar
              </Button>
            )}
          </div>
        )}
        
        {/* Badges de estado en la cámara */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-2">
            <div className={`p-2 border border-black dark:border-white ${systemChecks.mic ? 'bg-white dark:bg-black text-black dark:text-white' : 'bg-red-500 text-white'}`}>
              <Mic className="w-4 h-4" />
            </div>
            <div className={`p-2 border border-black dark:border-white ${systemChecks.camera ? 'bg-white dark:bg-black text-black dark:text-white' : 'bg-red-500 text-white'}`}>
              <Video className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Panel de configuración */}
      <div className="w-full md:w-2/5 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Preparación</h2>
          <p className="text-sm uppercase font-semibold text-gray-500 mt-2">Verifica tu equipo antes de entrar.</p>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-6 border border-black dark:border-white flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 border border-black dark:border-white ${systemChecks.camera ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                <Video className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Cámara</p>
                <p className="text-[9px] uppercase font-semibold text-gray-500">{systemChecks.camera ? 'Funcionando' : 'No detectada'}</p>
              </div>
            </div>
            {systemChecks.camera && <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 border border-black dark:border-white ${systemChecks.mic ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Micrófono</p>
                <p className="text-[9px] uppercase font-semibold text-gray-500">{systemChecks.mic ? 'Funcionando' : 'No detectado'}</p>
              </div>
            </div>
            {systemChecks.mic && <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 border border-black dark:border-white ${systemChecks.internet ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-red-500 text-white'}`}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold uppercase tracking-widest text-[10px]">Conexión</p>
                <p className="text-[9px] uppercase font-semibold text-gray-500">{systemChecks.internet ? 'Estable' : 'Sin conexión'}</p>
              </div>
            </div>
            {systemChecks.internet && <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />}
          </div>
        </div>

        <Button 
          className="w-full py-6 text-xs uppercase tracking-widest rounded-none font-bold border border-transparent bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
          size="lg"
          onClick={onJoin}
          disabled={!allChecksPassed || isLoading}
        >
          {isLoading ? 'Conectando...' : 'Entrar a la Sala'}
        </Button>
      </div>
    </div>
  );
};
