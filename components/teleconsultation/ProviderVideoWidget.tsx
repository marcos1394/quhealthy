import React, { useEffect } from 'react';
import { useTeleconsultation } from '@/hooks/useTeleconsultation';
import { useTeleconsultationStore } from '@/stores/TeleconsultationStore';
import { DeviceSetup } from '@/components/teleconsultation/DeviceSetup';
import { WaitingRoom } from '@/components/teleconsultation/WaitingRoom';
import { ConsultationRoom } from '@/components/teleconsultation/ConsultationRoom';
import { CallFinished } from '@/components/teleconsultation/CallFinished';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { AlertCircle } from 'lucide-react';

interface ProviderVideoWidgetProps {
  appointmentId: number;
}

export const ProviderVideoWidget: React.FC<ProviderVideoWidgetProps> = ({ appointmentId }) => {
  const { startSetup, joinCall, cleanup, media } = useTeleconsultation(appointmentId.toString(), 'PROVIDER');
  const { state } = useTeleconsultationStore();

  useEffect(() => {
    if (state === 'IDLE') {
      startSetup();
    }
  }, [state, startSetup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleJoin = async () => {
    await joinCall(appointmentId.toString());
  };

  if (state === 'IDLE' || state === 'CHECKING_ACCESS') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black">
        <QhSpinner size="lg" />
        <p className="text-gray-400 mt-4 animate-pulse text-sm">Iniciando videollamada...</p>
      </div>
    );
  }

  if (state === 'FAILED') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-black">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold mb-2">Error de conexión</h3>
        <p className="text-gray-400 text-xs">
          No se pudo establecer la conexión. Verifica tus permisos o conexión a internet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      {state === 'DEVICE_SETUP' && (
        <DeviceSetup media={media} onJoin={handleJoin} isLoading={false} />
      )}
      
      {(state === 'JOINING' || state === 'WAITING') && (
        <WaitingRoom />
      )}
      
      {(state === 'CONNECTING' || state === 'RECONNECTING' || state === 'CONNECTED') && (
        <ConsultationRoom />
      )}
      
      {state === 'COMPLETED' && (
        <CallFinished />
      )}
    </div>
  );
};
