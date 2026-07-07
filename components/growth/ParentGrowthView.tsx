import React from 'react';
import { GrowthMeasurementResponse } from '@/types/growth';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ParentGrowthViewProps {
  latestMeasurement: GrowthMeasurementResponse | null;
}

export default function ParentGrowthView({ latestMeasurement }: ParentGrowthViewProps) {
  if (!latestMeasurement) {
    return (
      <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 text-center">
        <p className="text-sm text-gray-500">Aún no hay mediciones registradas para mostrar el estado de crecimiento.</p>
      </div>
    );
  }

  const { clinicalStatus, parentMessage } = latestMeasurement;

  const isNormal = clinicalStatus === 'NORMAL';
  const isVigilance = clinicalStatus === 'VIGILANCIA';

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
      
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border
          ${isNormal ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800' : 
            isVigilance ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50' : 
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'}
        `}>
          {isNormal && <ShieldCheck className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />}
          {isVigilance && <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" strokeWidth={1.5} />}
          {!isNormal && !isVigilance && <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-500" strokeWidth={1.5} />}
        </div>
        
        <div>
          <h3 className="text-base font-bold text-black dark:text-white">
            {isNormal ? 'Crecimiento Estable' : 
             isVigilance ? 'Requiere Seguimiento' : 
             'Alerta Médica'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {parentMessage || 'Los indicadores de crecimiento están siendo monitoreados constantemente.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 md:gap-8 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Última Medición</span>
          <span className="text-sm font-semibold text-black dark:text-white">{new Date(latestMeasurement.measurementDate).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Edad</span>
          <span className="text-sm font-semibold text-black dark:text-white">{latestMeasurement.ageInMonths} meses</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Peso</span>
          <span className="text-sm font-semibold text-black dark:text-white">{latestMeasurement.weightKg ? `${latestMeasurement.weightKg} kg` : '--'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Estatura</span>
          <span className="text-sm font-semibold text-black dark:text-white">{latestMeasurement.heightCm ? `${latestMeasurement.heightCm} cm` : '--'}</span>
        </div>
      </div>

    </div>
  );
}
