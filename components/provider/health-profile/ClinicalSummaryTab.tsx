import React from 'react';
import { useTranslations } from 'next-intl';
import { PatientHealthProfile, PatientVitalSignDto } from '@/types/healthProfile';
import { MedicalHistoryResponse } from '@/types/medicalHistory';
import { Heart, Activity, Thermometer, Droplet, Weight, AlertCircle, AlertTriangle, Pill, FileText, CheckCircle2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface ClinicalSummaryTabProps {
  healthProfile: PatientHealthProfile | null;
  history: MedicalHistoryResponse | null;
}

const getVitalSignIcon = (type: string) => {
  switch (type) {
    case 'HEART_RATE': return <Heart className="w-4 h-4 text-red-500" />;
    case 'BLOOD_PRESSURE': return <Activity className="w-4 h-4 text-blue-500" />;
    case 'BODY_TEMPERATURE': return <Thermometer className="w-4 h-4 text-orange-500" />;
    case 'BLOOD_OXYGEN': return <Droplet className="w-4 h-4 text-cyan-500" />;
    case 'WEIGHT': return <Weight className="w-4 h-4 text-emerald-500" />;
    default: return <Activity className="w-4 h-4 text-gray-500" />;
  }
};

const getVitalSignLabel = (type: string) => {
  switch (type) {
    case 'HEART_RATE': return 'Frecuencia Cardíaca';
    case 'BLOOD_PRESSURE': return 'Presión Arterial';
    case 'BODY_TEMPERATURE': return 'Temperatura';
    case 'BLOOD_OXYGEN': return 'Oxígeno';
    case 'WEIGHT': return 'Peso';
    case 'HEIGHT': return 'Estatura';
    case 'BMI': return 'IMC';
    case 'RESPIRATORY_RATE': return 'Frecuencia Resp.';
    case 'GLUCOSE': return 'Glucosa';
    default: return type;
  }
};

export const ClinicalSummaryTab: React.FC<ClinicalSummaryTabProps> = ({ healthProfile, history }) => {
  const t = useTranslations('DashboardPatientDetail');
  const locale = useLocale();
  const dateLocale = locale === 'es' ? es : enUS;

  const latestAppointment = history?.timeline?.[0];
  const vitalSigns = healthProfile?.latestVitalSigns || [];
  const activeProblems = healthProfile?.activeProblems?.filter(p => p.status === 'ACTIVO') || [];
  const allergies = healthProfile?.allergies?.filter(a => a.status === 'ACTIVA') || [];
  const medications = healthProfile?.medications || [];

  return (
    <div className="flex flex-col gap-6 bg-transparent min-h-full p-6 md:p-8">
      {/* 🔹 VITAL SIGNS ROW */}
      {vitalSigns.length > 0 && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Últimos Signos Vitales
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {vitalSigns.map(vs => (
              <div key={vs.id} className="flex flex-col items-start p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  {getVitalSignIcon(vs.type)}
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{getVitalSignLabel(vs.type)}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {vs.value}{vs.secondaryValue ? `/${vs.secondaryValue}` : ''}
                  </span>
                  <span className="text-xs font-medium text-gray-500 mb-1">{vs.unit}</span>
                </div>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                  Hace {formatDistanceToNow(new Date(vs.measuredAt), { locale: dateLocale })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMN 1 */}
        <div className="flex flex-col gap-6">
          
          {/* PROBLEMAS ACTIVOS */}
          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emerald-500" strokeWidth={2} /> Problemas Activos
              </h4>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full">{activeProblems.length}</span>
            </div>
            <div className="flex flex-col gap-4">
              {activeProblems.length > 0 ? activeProblems.map(p => (
                <div key={p.id} className="flex flex-col p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505]/50 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.diagnosis}</span>
                  {p.startDate && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                      Desde {format(new Date(p.startDate), 'MMM yyyy', { locale: dateLocale })}
                    </span>
                  )}
                </div>
              )) : (
                <div className="text-sm font-medium text-gray-400 py-4 text-center bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed">Sin problemas activos</div>
              )}
            </div>
          </div>

          {/* ÚLTIMA CONSULTA & CONTEXTO */}
          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" strokeWidth={2} /> Última Intervención
              </h4>
            </div>
            <div className="flex flex-col">
              {latestAppointment ? (
                <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      {latestAppointment.serviceName}
                    </h5>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 mb-4 border-b border-gray-200 dark:border-gray-800 pb-4">
                    {format(new Date(latestAppointment.date), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                  {latestAppointment.publicNotes ? (
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                      "{latestAppointment.publicNotes}"
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-400 italic">Sin notas registradas</p>
                  )}
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-400 py-4 text-center bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed">Sin consultas registradas</div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2 */}
        <div className="flex flex-col gap-6">
          
          {/* ALERGIAS */}
          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={2} /> Alergias
              </h4>
              <span className="text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full">{allergies.length}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {allergies.length > 0 ? allergies.map(a => (
                <span key={a.id} className="text-sm font-semibold border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl flex items-center gap-2">
                  {a.substance} <span className="opacity-70 text-xs bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-lg">{a.severity}</span>
                </span>
              )) : (
                <div className="text-sm font-medium text-gray-400 py-4 text-center bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed w-full">Sin alergias documentadas</div>
              )}
            </div>
          </div>

          {/* MEDICACIÓN */}
          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-500" strokeWidth={2} /> Medicación Actual
              </h4>
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full">{medications.length}</span>
            </div>
            <div className="flex flex-col">
              {medications.length > 0 ? medications.map((m, index) => (
                <div key={m.id} className={`flex justify-between items-center text-sm font-semibold text-gray-900 dark:text-white py-4 ${index !== medications.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>{m.name}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 dark:bg-[#111] px-3 py-1.5 rounded-lg text-right max-w-[50%]">{m.dosage}</span>
                </div>
              )) : (
                <div className="text-sm font-medium text-gray-400 py-4 text-center bg-gray-50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed">Sin medicación actual</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
