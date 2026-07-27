'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Syringe, CheckCircle2, Clock, Calendar, User, ShieldCheck } from 'lucide-react';

interface VaccineRecord {
  id?: string;
  name: string;
  diseasePrevented?: string;
  scheduledAgeMonths?: number;
  isApplied: boolean;
  appliedDate?: string;
  appliedBy?: string;
  nextDoseDate?: string;
  notes?: string;
}

interface VaccinationData {
  dependentId: string;
  dependentName?: string;
  vaccines: VaccineRecord[];
  totalApplied: number;
  totalPending: number;
}

interface Props {
  widget: { id: string; type: string; data: VaccinationData; actions?: any[] };
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

export const VaccinationWidget: React.FC<Props> = ({ widget }) => {
  const { data } = widget;

  if (!data || !data.vaccines) {
    return (
      <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
        <CardContent className="p-6 text-center text-sm font-medium text-gray-500">
          No se encontraron registros de vacunación.
        </CardContent>
      </Card>
    );
  }

  const applied = data.vaccines.filter(v => v.isApplied);
  const pending = data.vaccines.filter(v => !v.isApplied);
  const total = data.vaccines.length;
  const progress = total > 0 ? Math.round((applied.length / total) * 100) : 0;

  return (
    <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
      {/* Header */}
      <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-white min-w-0">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
            <Syringe className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate font-bold">Cartilla de Vacunación</span>
            {data.dependentName && (
              <span className="text-xs text-gray-500 font-medium truncate flex items-center gap-1">
                <User className="w-3 h-3" /> {data.dependentName}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-quhealthy-green dark:text-emerald-400" />
              Cobertura de vacunación
            </span>
            <span className="text-quhealthy-green dark:text-emerald-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-quhealthy-green dark:bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-3 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-quhealthy-green dark:bg-emerald-500" />
              {data.totalApplied ?? applied.length} aplicadas
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {data.totalPending ?? pending.length} pendientes
            </span>
          </div>
        </div>

        {/* Vaccine list */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {data.vaccines.map((vaccine, i) => (
            <div
              key={vaccine.id ?? i}
              className={`flex items-start gap-3 p-3 rounded-xl border text-xs transition-colors ${
                vaccine.isApplied
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                  : 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/30'
              }`}
            >
              <div className={`shrink-0 mt-0.5 ${vaccine.isApplied ? 'text-quhealthy-green dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>
                {vaccine.isApplied
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <Clock className="w-4 h-4" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{vaccine.name}</p>
                {vaccine.diseasePrevented && (
                  <p className="text-gray-500 dark:text-gray-400 truncate">Previene: {vaccine.diseasePrevented}</p>
                )}
                {vaccine.isApplied && vaccine.appliedDate && (
                  <p className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    Aplicada: {formatDate(vaccine.appliedDate)}
                  </p>
                )}
                {!vaccine.isApplied && vaccine.nextDoseDate && (
                  <p className="flex items-center gap-1 text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
                    <Calendar className="w-3 h-3" />
                    Próxima: {formatDate(vaccine.nextDoseDate)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
