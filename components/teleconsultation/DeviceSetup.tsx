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
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start text-white">
      {/* Vista previa de cámara */}
      <div className="w-full md:w-3/5 rounded-2xl overflow-hidden bg-gray-800 aspect-video relative border border-gray-700 shadow-2xl flex items-center justify-center">
        {localStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]" // Espejo
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            {media.isInitializing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            ) : (
              <Video className="w-16 h-16 mb-4 opacity-50" />
            )}
            <p className="text-lg">
              {media.error 
                ? 'No pudimos acceder a tu cámara' 
                : 'Solicitando permisos de cámara y micrófono...'}
            </p>
            {media.error && (
              <Button onClick={() => media.requestPermissions()} variant="outline" className="mt-4 text-black">
                Reintentar
              </Button>
            )}
          </div>
        )}
        
        {/* Badges de estado en la cámara */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-2">
            <div className={`p-2 rounded-full backdrop-blur-md ${systemChecks.mic ? 'bg-black/50 text-white' : 'bg-red-500/80 text-white'}`}>
              <Mic className="w-5 h-5" />
            </div>
            <div className={`p-2 rounded-full backdrop-blur-md ${systemChecks.camera ? 'bg-black/50 text-white' : 'bg-red-500/80 text-white'}`}>
              <Video className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Panel de configuración */}
      <div className="w-full md:w-2/5 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Preparación</h2>
          <p className="text-gray-400">Verifica que tu equipo funcione correctamente antes de entrar a la sala.</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${systemChecks.camera ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Cámara</p>
                <p className="text-sm text-gray-400">{systemChecks.camera ? 'Detectada y funcionando' : 'No detectada'}</p>
              </div>
            </div>
            {systemChecks.camera && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${systemChecks.mic ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Micrófono</p>
                <p className="text-sm text-gray-400">{systemChecks.mic ? 'Detectado y funcionando' : 'No detectado'}</p>
              </div>
            </div>
            {systemChecks.mic && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${systemChecks.internet ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Conexión</p>
                <p className="text-sm text-gray-400">{systemChecks.internet ? 'Estable' : 'Sin conexión'}</p>
              </div>
            </div>
            {systemChecks.internet && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </div>
        </div>

        <Button 
          className="w-full py-6 text-lg rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all"
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
