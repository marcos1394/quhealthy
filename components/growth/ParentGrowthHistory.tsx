import React, { useMemo } from 'react';
import { GrowthMeasurementResponse } from '@/types/growth';
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
}

export default function ParentGrowthHistory({ history }: ParentGrowthHistoryProps) {
  // We reverse the array to plot from oldest to newest
  const chartData = useMemo(() => {
    return [...history].reverse().map(m => ({
      date: format(new Date(m.measurementDate), 'dd MMM yy', { locale: es }),
      age: m.ageInMonths,
      weight: m.weightKg,
      height: m.heightCm
    }));
  }, [history]);

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
              Curva de Crecimiento
            </h3>
            <p className="text-xs text-gray-500">Evolución de peso y talla</p>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickMargin={10} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickMargin={10}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickMargin={10}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Talla (cm)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 } }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="weight" 
                name="Peso (kg)"
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="height" 
                name="Talla (cm)"
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
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
