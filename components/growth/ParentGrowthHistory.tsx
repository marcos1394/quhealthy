import React, { useMemo, useState } from 'react';
import { GrowthMeasurementResponse, WhoGrowthStandard } from '@/types/growth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ParentGrowthHistoryProps {
  history: GrowthMeasurementResponse[];
  standards: WhoGrowthStandard[];
  sex: 'MALE' | 'FEMALE';
}

export default function ParentGrowthHistory({ history, standards, sex }: ParentGrowthHistoryProps) {
  const [activeIndicator, setActiveIndicator] = useState<'WEIGHT_FOR_AGE' | 'LENGTH_FOR_AGE' | 'HEAD_CIRCUMFERENCE_FOR_AGE'>('WEIGHT_FOR_AGE');

  const standardData = useMemo(() => {
    const std = standards.find(s => s.indicator === activeIndicator && s.sex === sex);
    if (!std || !std.lmsData) return [];
    
    // Create base data from standards
    const mergedData = std.lmsData.map((data: any) => ({
      month: data.month,
      P3: data.percentiles?.P3 || null,
      P50: data.percentiles?.P50 || null,
      P97: data.percentiles?.P97 || null,
      Paciente: null as number | null
    }));

    // Inject measurements at their exact age in months
    history.forEach(m => {
      const patientValue = activeIndicator === 'WEIGHT_FOR_AGE' ? m.weightKg : 
                           activeIndicator === 'LENGTH_FOR_AGE' ? m.heightCm : 
                           m.headCircumferenceCm;
      
      if (patientValue == null) return;

      const exactMonth = m.ageInMonths;
      const existingPoint = mergedData.find(d => Math.abs(d.month - exactMonth) < 0.01);
      
      if (existingPoint) {
         existingPoint.Paciente = patientValue;
      } else {
         mergedData.push({
           month: exactMonth,
           P3: null,
           P50: null,
           P97: null,
           Paciente: patientValue
         });
      }
    });

    mergedData.sort((a, b) => a.month - b.month);
    return mergedData;
  }, [standards, history, sex, activeIndicator]);

  const yAxisLabel = activeIndicator === 'WEIGHT_FOR_AGE' ? 'Peso (kg)' : activeIndicator === 'LENGTH_FOR_AGE' ? 'Talla (cm)' : 'Perímetro (cm)';

  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    
    if (status === 'NORMAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <ShieldCheck className="w-3.5 h-3.5" /> Normal
        </span>
      );
    }
    if (status === 'VIGILANCIA') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
          <AlertTriangle className="w-3.5 h-3.5" /> Vigilancia
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <ShieldAlert className="w-3.5 h-3.5" /> Alerta
      </span>
    );
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Chart Section */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                Curva de Crecimiento OMS
              </h3>
              <p className="text-xs text-gray-500">Desarrollo comparado con estándares internacionales</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setActiveIndicator('WEIGHT_FOR_AGE')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors whitespace-nowrap rounded-none
                ${activeIndicator === 'WEIGHT_FOR_AGE' 
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                  : 'bg-transparent text-gray-500 border-black/20 dark:border-white/20 hover:text-black dark:hover:text-white'}`}
            >
              Peso
            </button>
            <button 
              onClick={() => setActiveIndicator('LENGTH_FOR_AGE')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors whitespace-nowrap rounded-none
                ${activeIndicator === 'LENGTH_FOR_AGE' 
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                  : 'bg-transparent text-gray-500 border-black/20 dark:border-white/20 hover:text-black dark:hover:text-white'}`}
            >
              Talla
            </button>
            <button 
              onClick={() => setActiveIndicator('HEAD_CIRCUMFERENCE_FOR_AGE')}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors whitespace-nowrap rounded-none
                ${activeIndicator === 'HEAD_CIRCUMFERENCE_FOR_AGE' 
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                  : 'bg-transparent text-gray-500 border-black/20 dark:border-white/20 hover:text-black dark:hover:text-white'}`}
            >
              Perímetro Cef.
            </button>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={standardData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis 
                type="number" 
                dataKey="month" 
                domain={['dataMin', 'dataMax']}
                label={{ value: 'Edad (meses)', position: 'insideBottomRight', offset: -10 }} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              
              <Line type="monotone" dataKey="P97" stroke="#ef4444" strokeWidth={1} dot={false} name="Percentil 97" connectNulls />
              <Line type="monotone" dataKey="P50" stroke="#22c55e" strokeWidth={2} dot={false} name="Percentil 50" connectNulls />
              <Line type="monotone" dataKey="P3" stroke="#ef4444" strokeWidth={1} dot={false} name="Percentil 3" connectNulls />
              
              <Line 
                type="monotone" 
                dataKey="Paciente" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#fff' }} 
                activeDot={{ r: 6 }} 
                name="Paciente"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
            Historial de Mediciones
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-[#050505]">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Edad</th>
                <th className="px-6 py-4">Peso</th>
                <th className="px-6 py-4">Talla</th>
                <th className="px-6 py-4">Perímetro Cef.</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((measurement) => (
                <tr key={measurement.id} className="hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-black dark:text-white">
                    {format(new Date(measurement.measurementDate), "dd MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {measurement.ageInMonths} meses
                  </td>
                  <td className="px-6 py-4 text-black dark:text-white font-semibold">
                    {measurement.weightKg ? `${measurement.weightKg} kg` : '--'}
                  </td>
                  <td className="px-6 py-4 text-black dark:text-white font-semibold">
                    {measurement.heightCm ? `${measurement.heightCm} cm` : '--'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {measurement.headCircumferenceCm ? `${measurement.headCircumferenceCm} cm` : '--'}
                  </td>
                  <td className="px-6 py-4">
                    {renderStatusBadge(measurement.clinicalStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
