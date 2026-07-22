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

type IndicatorType = 'WEIGHT_FOR_AGE' | 'LENGTH_FOR_AGE' | 'HEAD_CIRCUMFERENCE_FOR_AGE' | 'BMI';

export default function ParentGrowthHistory({ history, standards, sex }: ParentGrowthHistoryProps) {
  const [activeIndicator, setActiveIndicator] = useState<IndicatorType>('WEIGHT_FOR_AGE');

  const chartData = useMemo(() => {
    const std = standards.find(s => s.indicator === activeIndicator && s.sex === sex);
    const hasStandards = !!std && !!std.lmsData;
    
    // Create base data from standards if they exist
    const mergedData = hasStandards ? std.lmsData.map((data: any) => ({
      month: data.month,
      P50: data.percentiles?.P50 || null,
      healthyRange: data.percentiles?.P3 && data.percentiles?.P97 
        ? [data.percentiles.P3, data.percentiles.P97] 
        : null,
      Paciente: null as number | null,
      isMeasurement: false
    })) : [];

    // Inject measurements at their exact age in months
    history.forEach(m => {
      let patientValue = null;
      if (activeIndicator === 'WEIGHT_FOR_AGE') patientValue = m.weightKg;
      else if (activeIndicator === 'LENGTH_FOR_AGE') patientValue = m.heightCm;
      else if (activeIndicator === 'HEAD_CIRCUMFERENCE_FOR_AGE') patientValue = m.headCircumferenceCm;
      else if (activeIndicator === 'BMI') {
        if (m.weightKg && m.heightCm) {
          const heightM = m.heightCm / 100;
          patientValue = m.weightKg / (heightM * heightM);
        }
      }
      
      if (patientValue == null) return;

      const exactMonth = m.ageInMonths;
      const existingPoint = mergedData.find(d => Math.abs(d.month - exactMonth) < 0.01);
      
      if (existingPoint) {
         existingPoint.Paciente = patientValue;
         existingPoint.isMeasurement = true;
      } else {
         let healthyRange = null;
         let p50 = null;
         
         if (hasStandards) {
           const lower = std.lmsData.filter((d: any) => d.month <= exactMonth).pop();
           const upper = std.lmsData.find((d: any) => d.month > exactMonth);
           if (lower && upper) {
             const fraction = (exactMonth - lower.month) / (upper.month - lower.month);
             const p3 = lower.percentiles.P3 + (upper.percentiles.P3 - lower.percentiles.P3) * fraction;
             const p97 = lower.percentiles.P97 + (upper.percentiles.P97 - lower.percentiles.P97) * fraction;
             p50 = lower.percentiles.P50 + (upper.percentiles.P50 - lower.percentiles.P50) * fraction;
             healthyRange = [p3, p97];
           }
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
                     activeIndicator === 'LENGTH_FOR_AGE' ? 'Estatura (cm)' : 
                     activeIndicator === 'HEAD_CIRCUMFERENCE_FOR_AGE' ? 'Perímetro (cm)' : 'IMC';
                     
  const indicatorTitle = activeIndicator === 'WEIGHT_FOR_AGE' ? 'Peso' : 
                         activeIndicator === 'LENGTH_FOR_AGE' ? 'Estatura' : 
                         activeIndicator === 'HEAD_CIRCUMFERENCE_FOR_AGE' ? 'Cráneo' : 'IMC';

  const showReference = activeIndicator === 'WEIGHT_FOR_AGE' || activeIndicator === 'LENGTH_FOR_AGE';

  const renderStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-400">--</span>;
    if (status === 'NORMAL') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> Estable</span>;
    if (status === 'VIGILANCIA') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /> Seguir</span>;
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"><ShieldAlert className="w-3.5 h-3.5" /> Alerta</span>;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const patientData = payload.find((p: any) => p.dataKey === 'Paciente');
      const p50Data = payload.find((p: any) => p.dataKey === 'P50');
      
      return (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xl shadow-black/5 dark:shadow-white/5">
          <p className="text-xs font-semibold text-gray-500 mb-2">Edad: {Number(label).toFixed(1)} meses</p>
          {patientData && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-black dark:bg-white" />
              <p className="text-sm font-semibold text-black dark:text-white">
                Paciente: <span>{Number(patientData.value).toFixed(2)}</span>
              </p>
            </div>
          )}
          {showReference && p50Data && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
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
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-quhealthy-green" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-0.5">
                Evolución de {indicatorTitle}
              </h3>
              {showReference ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> La zona sombreada indica el rango saludable (OMS).
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Comportamiento histórico del paciente (sin curva comparativa).
                </p>
              )}
            </div>
          </div>

          <div className="flex p-1 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto hide-scrollbar shrink-0 border border-gray-200 dark:border-gray-800">
            {[
              { id: 'WEIGHT_FOR_AGE', label: 'Peso' },
              { id: 'LENGTH_FOR_AGE', label: 'Estatura' },
              { id: 'HEAD_CIRCUMFERENCE_FOR_AGE', label: 'Cráneo' },
              { id: 'BMI', label: 'IMC' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveIndicator(tab.id as IndicatorType)}
                className={`px-4 py-1.5 text-xs font-semibold transition-all rounded-md whitespace-nowrap
                  ${activeIndicator === tab.id 
                    ? 'bg-white dark:bg-gray-800 text-quhealthy-green dark:text-teal-400 shadow-sm border border-gray-200 dark:border-gray-700' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-transparent'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorHealthyLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f3f4f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorHealthyDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#374151" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#111827" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis 
                type="number" 
                dataKey="month" 
                domain={['dataMin', 'dataMax']}
                label={{ value: 'Edad (meses)', position: 'insideBottom', offset: -15, fill: '#9ca3af', fontSize: 10, fontWeight: 700, textAnchor: 'middle' }} 
                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10, fontWeight: 700, textAnchor: 'middle' }, dx: -10 }} 
                tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af' }} />
              
              {/* Healthy Range Area */}
              {showReference && (
                <Area 
                  type="monotone" 
                  dataKey="healthyRange" 
                  fill="var(--area-fill, #f3f4f6)" 
                  stroke="none" 
                  name="Rango Saludable" 
                  connectNulls 
                  className="fill-gray-100 dark:fill-gray-900"
                />
              )}
              
              {/* Median Line */}
              {showReference && (
                <Line 
                  type="monotone" 
                  dataKey="P50" 
                  stroke="#9ca3af" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4" 
                  dot={false} 
                  name="Media Ideal" 
                  connectNulls 
                />
              )}
              
              {/* Patient Line */}
              <Line 
                type="monotone" 
                dataKey="Paciente" 
                stroke="#0d9488" 
                strokeWidth={3} 
                dot={{ stroke: '#0d9488', strokeWidth: 2, r: 4, fill: 'var(--bg-color, white)' }} 
                activeDot={{ r: 6, stroke: '#0d9488', strokeWidth: 2, fill: 'var(--bg-color, white)' }} 
                name="Paciente"
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-[#050505]/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Historial de Mediciones
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-semibold text-gray-500 bg-gray-50/80 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Fecha</th>
                <th className="px-6 py-4">Edad</th>
                <th className="px-6 py-4">Peso</th>
                <th className="px-6 py-4">Estatura</th>
                <th className="px-6 py-4">IMC</th>
                <th className="px-6 py-4 rounded-tr-lg">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[...history].sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime()).map((measurement) => {
                let bmi = null;
                if (measurement.weightKg && measurement.heightCm) {
                   const h = measurement.heightCm / 100;
                   bmi = (measurement.weightKg / (h * h)).toFixed(1);
                }
                
                return (
                  <tr key={measurement.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
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
                    <td className="px-6 py-4 text-black dark:text-white font-semibold">
                      {bmi ? bmi : '--'}
                    </td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(measurement.clinicalStatus)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
