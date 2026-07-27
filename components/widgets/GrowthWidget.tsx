'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Weight, Ruler, Brain, User, Activity } from 'lucide-react';

interface GrowthMeasurement {
  id?: string;
  measurementDate: string;
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  weightPercentile?: number;
  heightPercentile?: number;
  bmi?: number;
  notes?: string;
}

interface GrowthData {
  dependentId: string;
  dependentName?: string;
  measurements: GrowthMeasurement[];
  latestMeasurement?: GrowthMeasurement;
}

interface Props {
  widget: { id: string; type: string; data: GrowthData; actions?: any[] };
  onAction?: (action: any) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  percentile?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, percentile }) => (
  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-xl p-3 gap-1.5">
    <div className="w-8 h-8 rounded-lg bg-quhealthy-green/10 dark:bg-emerald-900/30 flex items-center justify-center text-quhealthy-green dark:text-emerald-400">
      {icon}
    </div>
    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">{label}</p>
    <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
    {percentile !== undefined && (
      <span className="text-[10px] font-medium text-quhealthy-green dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
        P{percentile}
      </span>
    )}
  </div>
);

export const GrowthWidget: React.FC<Props> = ({ widget }) => {
  const { data } = widget;

  if (!data) {
    return (
      <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
        <CardContent className="p-6 text-center text-sm font-medium text-gray-500">
          No se encontraron registros de crecimiento.
        </CardContent>
      </Card>
    );
  }

  const latest = data.latestMeasurement && Object.keys(data.latestMeasurement).length > 0
    ? data.latestMeasurement
    : (data.measurements && data.measurements.length > 0 ? data.measurements[0] : null);

  const history = (data.measurements || []).slice(0, 6);

  return (
    <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
      {/* Header */}
      <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-white min-w-0">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate font-bold">Crecimiento y Desarrollo</span>
            {data.dependentName && (
              <span className="text-xs text-gray-500 font-medium truncate flex items-center gap-1">
                <User className="w-3 h-3" /> {data.dependentName}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Latest Measurement Metrics */}
        {latest ? (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-quhealthy-green dark:text-emerald-400" />
              Última medición · {formatDate(latest.measurementDate)}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {latest.weightKg && (
                <MetricCard
                  icon={<Weight className="w-4 h-4" />}
                  label="Peso"
                  value={`${latest.weightKg} kg`}
                  percentile={latest.weightPercentile}
                />
              )}
              {latest.heightCm && (
                <MetricCard
                  icon={<Ruler className="w-4 h-4" />}
                  label="Talla"
                  value={`${latest.heightCm} cm`}
                  percentile={latest.heightPercentile}
                />
              )}
              {latest.headCircumferenceCm && (
                <MetricCard
                  icon={<Brain className="w-4 h-4" />}
                  label="P. Cefálico"
                  value={`${latest.headCircumferenceCm} cm`}
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">Sin mediciones recientes</p>
        )}

        {/* History table */}
        {history.length > 1 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Historial reciente</p>
            <div className="space-y-1.5">
              {history.map((m, i) => (
                <div key={m.id ?? i} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">{formatDate(m.measurementDate)}</span>
                  <div className="flex items-center gap-3 font-semibold text-gray-700 dark:text-gray-300">
                    {m.weightKg && <span>{m.weightKg} kg</span>}
                    {m.heightCm && <span>{m.heightCm} cm</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
