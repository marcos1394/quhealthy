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
      <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-[#050505] text-black dark:text-white">
        <QhSpinner size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest mt-6 animate-pulse">Iniciando videollamada...</p>
      </div>
    );
  }

  if (state === 'FAILED') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-[#050505] text-black dark:text-white">
        <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-none flex items-center justify-center mb-4 border border-red-500">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
        </div>
        <h3 className="text-[12px] font-bold uppercase tracking-widest mb-2">Error de conexión</h3>
        <p className="text-[10px] uppercase font-semibold text-gray-500">
          No se pudo establecer la conexión. Verifica tus permisos o conexión a internet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-white dark:bg-[#050505]">
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
