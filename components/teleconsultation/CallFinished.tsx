import React from 'react';
import { CheckCircle, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeleconsultationStore } from '@/stores/TeleconsultationStore';

export const CallFinished: React.FC = () => {
  const { role } = useTeleconsultationStore();
  const isPatient = role === 'PATIENT';

  return (
    <div className="w-full max-w-lg mx-auto p-6 text-center text-white">
      <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
        
        <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h2 className="text-3xl font-bold mb-4 tracking-tight">Consulta Finalizada</h2>
        
        <p className="text-gray-400 mb-8 text-lg">
          {isPatient 
            ? 'La sesión ha terminado exitosamente. Esperamos que hayas tenido una excelente experiencia.' 
            : 'La consulta ha finalizado. El tiempo se ha registrado en el sistema.'}
        </p>

        {isPatient && (
          <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-700 text-left">
            <h3 className="font-semibold text-lg mb-4 text-center">¿Cómo calificarías tu consulta?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="text-gray-600 hover:text-yellow-400 transition-colors">
                  <Star className="w-8 h-8 fill-current" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.location.href = isPatient ? '/patient/dashboard' : '/provider/dashboard'}
            className="w-full py-6 text-lg rounded-xl font-medium"
          >
            Volver al Inicio
          </Button>
          
          {isPatient && (
            <Button 
              variant="outline" 
              className="w-full py-6 text-lg rounded-xl text-black"
              onClick={() => window.location.href = '/patient/appointments'}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar nueva cita
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};
