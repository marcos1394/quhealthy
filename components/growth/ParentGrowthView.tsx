import React from 'react';
import { GrowthMeasurementResponse } from '@/types/growth';
import { ShieldCheckIcon, ShieldExclamationIcon, ShieldAlertIcon } from '@heroicons/react/24/solid';

interface ParentGrowthViewProps {
  latestMeasurement: GrowthMeasurementResponse | null;
}

export default function ParentGrowthView({ latestMeasurement }: ParentGrowthViewProps) {
  if (!latestMeasurement) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center">
        <p className="text-gray-500">Aún no hay mediciones registradas para mostrar el estado de crecimiento.</p>
      </div>
    );
  }

  const { clinicalStatus, parentMessage } = latestMeasurement;

  const isNormal = clinicalStatus === 'NORMAL';
  const isVigilance = clinicalStatus === 'VIGILANCIA';
  const isAlert = clinicalStatus === 'ALERTA';

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
      
      {/* Background Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none
        ${isNormal ? 'bg-green-500' : isVigilance ? 'bg-yellow-500' : 'bg-red-500'}
      `} />

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Estado de Crecimiento</h2>

      <div className="flex flex-col items-center justify-center py-8">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-[color:var(--tw-shadow-color)]
          ${isNormal ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30' : 
            isVigilance ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-500/30' : 
            'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30'}
        `}>
          {isNormal && <ShieldCheckIcon className="w-16 h-16 text-white" />}
          {isVigilance && <ShieldExclamationIcon className="w-16 h-16 text-white" />}
          {isAlert && <ShieldAlertIcon className="w-16 h-16 text-white" />}
        </div>
        
        <h3 className={`text-2xl font-black mb-2
          ${isNormal ? 'text-green-600 dark:text-green-400' : 
            isVigilance ? 'text-yellow-600 dark:text-yellow-400' : 
            'text-red-600 dark:text-red-400'}
        `}>
          {isNormal ? 'Crecimiento Saludable' : 
           isVigilance ? 'Requiere Seguimiento' : 
           'Alerta Médica'}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md text-lg leading-relaxed">
          {parentMessage || 'Los indicadores de crecimiento están siendo monitoreados constantemente por nuestro sistema.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Última Medición</p>
          <p className="text-sm font-semibold dark:text-white">{new Date(latestMeasurement.measurementDate).toLocaleDateString()}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Edad</p>
          <p className="text-sm font-semibold dark:text-white">{latestMeasurement.ageInMonths} meses</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Peso</p>
          <p className="text-sm font-semibold dark:text-white">{latestMeasurement.weightKg ? `${latestMeasurement.weightKg} kg` : '--'}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Talla</p>
          <p className="text-sm font-semibold dark:text-white">{latestMeasurement.heightCm ? `${latestMeasurement.heightCm} cm` : '--'}</p>
        </div>
      </div>
    </div>
  );
}
