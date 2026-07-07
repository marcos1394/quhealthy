import React, { useMemo, useState } from 'react';
import { GrowthMeasurementResponse, WhoGrowthStandard } from '@/types/growth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity, Info } from 'lucide-react';
import {
  ComposedChart,
  Area,
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

  const chartData = useMemo(() => {
    const std = standards.find(s => s.indicator === activeIndicator && s.sex === sex);
    if (!std || !std.lmsData) return [];
    
    // Create base data from standards
    const mergedData = std.lmsData.map((data: any) => ({
      month: data.month,
      P50: data.percentiles?.P50 || null,
      healthyRange: data.percentiles?.P3 && data.percentiles?.P97 
        ? [data.percentiles.P3, data.percentiles.P97] 
        : null,
      Paciente: null as number | null,
      isMeasurement: false
    }));

    // Inject measurements at their exact age in months with interpolation for smooth area curves
    history.forEach(m => {
      const patientValue = activeIndicator === 'WEIGHT_FOR_AGE' ? m.weightKg : 
                           activeIndicator === 'LENGTH_FOR_AGE' ? m.heightCm : 
                           m.headCircumferenceCm;
      
      if (patientValue == null) return;

      const exactMonth = m.ageInMonths;
      const existingPoint = mergedData.find(d => Math.abs(d.month - exactMonth) < 0.01);
      
      if (existingPoint) {
         existingPoint.Paciente = patientValue;
         existingPoint.isMeasurement = true;
      } else {
         // Interpolate percentiles for the exact month to prevent gaps in the Area chart
         const lower = std.lmsData.filter((d: any) => d.month <= exactMonth).pop();
         const upper = std.lmsData.find((d: any) => d.month > exactMonth);
         
         let healthyRange = null;
         let p50 = null;
         
         if (lower && upper) {
           const fraction = (exactMonth - lower.month) / (upper.month - lower.month);
           const p3 = lower.percentiles.P3 + (upper.percentiles.P3 - lower.percentiles.P3) * fraction;
           const p97 = lower.percentiles.P97 + (upper.percentiles.P97 - lower.percentiles.P97) * fraction;
           p50 = lower.percentiles.P50 + (upper.percentiles.P50 - lower.percentiles.P50) * fraction;
           healthyRange = [p3, p97];
         }

         mergedData.push({
           month: exactMonth,
           P50: p50,
           healthyRange,
           Paciente: patientValue,
           isMeasurement: true
         });
      }
    });

    mergedData.sort((a, b) => a.month - b.month);
    return mergedData;
  }, [standards, history, sex, activeIndicator]);

  const yAxisLabel = activeIndicator === 'WEIGHT_FOR_AGE' ? 'Peso (kg)' : 
                     activeIndicator === 'LENGTH_FOR_AGE' ? 'Talla (cm)' : 'Perímetro (cm)';
                     
  const indicatorTitle = activeIndicator === 'WEIGHT_FOR_AGE' ? 'Peso para la Edad' : 
                         activeIndicator === 'LENGTH_FOR_AGE' ? 'Talla para la Edad' : 'Perímetro Cefálico';

  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    if (status === 'NORMAL') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> Normal</span>;
    if (status === 'VIGILANCIA') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"><AlertTriangle className="w-3.5 h-3.5" /> Vigilancia</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><ShieldAlert className="w-3.5 h-3.5" /> Alerta</span>;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const patientData = payload.find((p: any) => p.dataKey === 'Paciente');
      const p50Data = payload.find((p: any) => p.dataKey === 'P50');
      
      return (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xl shadow-black/5 dark:shadow-white/5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Edad: {Number(label).toFixed(1)} meses</p>
          {patientData && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
              <p className="text-sm font-semibold text-black dark:text-white">
                Paciente: <span className="text-[#2563eb]">{Number(patientData.value).toFixed(2)}</span>
              </p>
            </div>
          )}
          {p50Data && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#14b8a6]" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Media Ideal: <span>{Number(p50Data.value).toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Chart Section */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 dark:bg-teal-900/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1e40af] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Activity className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Evolución de {indicatorTitle}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> La zona sombreada representa el rango de crecimiento saludable (OMS).
              </p>
            </div>
          </div>

          <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl overflow-x-auto hide-scrollbar shrink-0 border border-gray-200 dark:border-gray-700/50">
            {[
              { id: 'WEIGHT_FOR_AGE', label: 'Peso' },
              { id: 'LENGTH_FOR_AGE', label: 'Talla' },
              { id: 'HEAD_CIRCUMFERENCE_FOR_AGE', label: 'Perímetro Cef.' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveIndicator(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg whitespace-nowrap
                  ${activeIndicator === tab.id 
                    ? 'bg-white dark:bg-[#2563eb] text-black dark:text-white shadow-sm' 
                    : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05}/>
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.3" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="4 4" opacity={0.3} vertical={false} stroke="#9ca3af" />
              <XAxis 
                type="number" 
                dataKey="month" 
                domain={['dataMin', 'dataMax']}
                label={{ value: 'Edad (meses)', position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 12, fontWeight: 600 }} 
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12, fontWeight: 600 }, dx: -10 }} 
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
              
              {/* Healthy Range Area */}
              <Area 
                type="monotone" 
                dataKey="healthyRange" 
                fill="url(#colorHealthy)" 
                stroke="none" 
                name="Rango Saludable (P3 - P97)" 
                connectNulls 
              />
              
              {/* Median Line */}
              <Line 
                type="monotone" 
                dataKey="P50" 
                stroke="#14b8a6" 
                strokeWidth={2} 
                strokeDasharray="6 6" 
                dot={false} 
                name="Media Ideal (OMS)" 
                connectNulls 
              />
              
              {/* Patient Line */}
              <Line 
                type="monotone" 
                dataKey="Paciente" 
                stroke="#2563eb" 
                strokeWidth={4} 
                dot={{ stroke: '#2563eb', strokeWidth: 3, r: 5, fill: '#fff' }} 
                activeDot={{ r: 8, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }} 
                name="Paciente"
                connectNulls
                style={{ filter: 'url(#shadow)' }}
              />
            </ComposedChart>
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
              {[...history].sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()).map((measurement) => (
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
