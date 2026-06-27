import React from 'react';
import { useTeleconsultationStore } from '@/stores/TeleconsultationStore';

interface ConsultationLayoutProps {
  children: React.ReactNode;
}

export const ConsultationLayout: React.FC<ConsultationLayoutProps> = ({ children }) => {
  const { state } = useTeleconsultationStore();

  const getStatusText = () => {
    switch (state) {
      case 'DEVICE_SETUP': return 'Configuración de Equipo';
      case 'JOINING': return 'Conectando a la sala...';
      case 'WAITING': return 'Sala de Espera';
      case 'CONNECTING': return 'Iniciando conexión segura...';
      case 'RECONNECTING': return 'Reconectando...';
      case 'CONNECTED': return 'Consulta en Progreso';
      case 'COMPLETED': return 'Consulta Finalizada';
      case 'FAILED': return 'Error de Conexión';
      default: return 'Cargando...';
    }
  };

  const getStatusColor = () => {
    if (state === 'CONNECTED') return 'bg-green-500';
    if (state === 'COMPLETED') return 'bg-gray-500';
    if (state === 'FAILED' || state === 'RECONNECTING') return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <span className="text-blue-400">Qu</span>Healthy
          </div>
          <div className="h-4 w-px bg-gray-600 mx-2 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-300">
            <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor()}`}></div>
            {getStatusText()}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-[calc(100vh-64px)] flex justify-center items-center overflow-hidden bg-black">
        {children}
      </main>
    </div>
  );
};
