'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Pill, Activity, CheckCircle2, Clock, User, AlertCircle } from 'lucide-react';

interface MedicationTask {
  id?: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  nextDoseTime?: string;
  isTaken?: boolean;
}

interface VitalSign {
  type: string;
  value: string;
  unit?: string;
  recordedAt?: string;
  isNormal?: boolean;
}

interface EldercareData {
  dependentId: string;
  dependentName?: string;
  activeMedications: MedicationTask[];
  recentVitalSigns?: VitalSign[];
  adherencePercentage?: number;
  nextMedication?: MedicationTask;
}

interface Props {
  widget: { id: string; type: string; data: EldercareData; actions?: any[] };
  onAction?: (action: any) => void;
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  try {
    return new Date(timeStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
}

const VITAL_ICONS: Record<string, string> = {
  BLOOD_PRESSURE: '🩺',
  HEART_RATE: '❤️',
  OXYGEN: '🫁',
  TEMPERATURE: '🌡️',
  GLUCOSE: '🩸',
  WEIGHT: '⚖️',
};

export const EldercareWidget: React.FC<Props> = ({ widget }) => {
  const { data } = widget;

  if (!data) {
    return (
      <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
        <CardContent className="p-6 text-center text-sm font-medium text-gray-500">
          No se encontraron datos de cuidado geriátrico.
        </CardContent>
      </Card>
    );
  }

  const medications = data.activeMedications || [];
  const vitals = data.recentVitalSigns || [];
  const adherence = data.adherencePercentage;

  return (
    <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
      {/* Header */}
      <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-white min-w-0">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate font-bold">Cuidado Geriátrico</span>
            {data.dependentName && (
              <span className="text-xs text-gray-500 font-medium truncate flex items-center gap-1">
                <User className="w-3 h-3" /> {data.dependentName}
              </span>
            )}
          </div>
          {adherence !== undefined && (
            <div className="ml-auto shrink-0 text-right">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">Adherencia</p>
              <p className={`text-base font-bold ${adherence >= 80 ? 'text-quhealthy-green dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>
                {Math.round(adherence)}%
              </p>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Medications */}
        {medications.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-quhealthy-green dark:text-emerald-400" />
              Medicamentos activos
            </p>
            <div className="space-y-2">
              {medications.map((med, i) => (
                <div
                  key={med.id ?? i}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs transition-colors ${
                    med.isTaken
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                      : 'bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <div className={`shrink-0 ${med.isTaken ? 'text-quhealthy-green dark:text-emerald-400' : 'text-gray-400'}`}>
                    {med.isTaken
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <Clock className="w-4 h-4" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{med.medicationName}</p>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-0.5">
                      {med.dosage && <span>{med.dosage}</span>}
                      {med.dosage && med.frequency && <span>·</span>}
                      {med.frequency && <span>{med.frequency}</span>}
                    </div>
                  </div>
                  {med.nextDoseTime && !med.isTaken && (
                    <span className="shrink-0 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
                      {formatTime(med.nextDoseTime)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vital Signs */}
        {vitals.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-quhealthy-green dark:text-emerald-400" />
              Signos vitales recientes
            </p>
            <div className="grid grid-cols-2 gap-2">
              {vitals.map((vital, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs ${
                    vital.isNormal === false
                      ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40'
                      : 'bg-gray-50 dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <span className="text-lg">{VITAL_ICONS[vital.type] || '📊'}</span>
                  <div className="min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 font-medium truncate">{vital.type?.replace(/_/g, ' ')}</p>
                    <p className={`font-bold truncate ${vital.isNormal === false ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {vital.value}{vital.unit ? ` ${vital.unit}` : ''}
                      {vital.isNormal === false && <AlertCircle className="inline w-3 h-3 ml-1 text-red-500" />}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {medications.length === 0 && vitals.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">No hay datos de cuidado disponibles aún.</p>
        )}
      </CardContent>
    </Card>
  );
};
