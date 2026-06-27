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
    <div className="w-full h-full flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center">
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-0"></div>

      <div className="z-10 w-full max-w-4xl p-4 flex flex-col md:flex-row items-center gap-8">
        
        {/* Información y Estado */}
        <div className="w-full md:w-1/2 flex flex-col gap-6 text-white text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full w-fit mx-auto md:mx-0 border border-blue-500/30">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Conexión Segura Encriptada</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {isPatient ? 'Tu médico se unirá en breve' : 'Esperando al paciente'}
          </h1>
          
          <p className="text-xl text-gray-300">
            {isPatient 
              ? 'Por favor espera en esta pantalla. Hemos notificado al especialista que ya estás aquí.'
              : 'El paciente aún no ha ingresado a la sala. Te notificaremos cuando se conecte.'}
          </p>

          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700 mt-4 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-400 font-medium">Tiempo restante programado</p>
                <p className="text-2xl font-bold font-mono">{formattedTime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-400 border-t border-gray-700 pt-4 mt-2">
              <Bell className="w-4 h-4" />
              <p>Te avisaremos automáticamente cuando la consulta inicie.</p>
            </div>
          </div>
        </div>

        {/* Vista miniatura del usuario */}
        <div className="w-full md:w-1/2 max-w-sm">
          <div className="bg-black rounded-3xl overflow-hidden aspect-[3/4] relative border-4 border-gray-800 shadow-2xl ring-1 ring-white/10">
            {localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                Cámara desactivada
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black/60 backdrop-blur-md text-white text-sm py-2 px-4 rounded-full inline-block">
                Tu video (Vista previa)
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
