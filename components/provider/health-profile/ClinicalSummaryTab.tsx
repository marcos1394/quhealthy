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
    <div className="flex flex-col gap-6 bg-gray-50 dark:bg-[#050505] min-h-full">
      {/* 🔹 VITAL SIGNS ROW */}
      {vitalSigns.length > 0 && (
        <div className="bg-white dark:bg-[#0a0a0a] border-b border-black/10 dark:border-white/10 p-6 md:p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Últimos Signos Vitales</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {vitalSigns.map(vs => (
              <div key={vs.id} className="flex flex-col items-start p-4 border border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  {getVitalSignIcon(vs.type)}
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{getVitalSignLabel(vs.type)}</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-semibold uppercase text-black dark:text-white">
                    {vs.value}{vs.secondaryValue ? `/${vs.secondaryValue}` : ''}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 mb-1">{vs.unit}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-gray-400 mt-2">
                  Hace {formatDistanceToNow(new Date(vs.measuredAt), { locale: dateLocale })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 WIDGETS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-8 pb-8">
        
        {/* 1. PROBLEMAS ACTIVOS */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 flex flex-col h-72">
          <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-black dark:text-white">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500" /> Problemas Activos
            </h4>
            <span className="text-[9px] font-bold uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{activeProblems.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeProblems.length > 0 ? activeProblems.map(p => (
              <div key={p.id} className="text-sm font-semibold text-black dark:text-white border-l-2 border-blue-500 pl-3">
                {p.diagnosis}
                <div className="text-[10px] uppercase text-gray-500 mt-1 font-normal tracking-widest">
                  Desde {format(new Date(p.startDate), 'MMM yyyy', { locale: dateLocale })}
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">Sin problemas activos</div>
            )}
          </div>
        </div>

        {/* 2. ALERGIAS Y MEDICACIÓN */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 flex flex-col flex-1 h-[132px]">
            <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-black dark:text-white">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Alergias
              </h4>
              <span className="text-[9px] font-bold uppercase bg-red-50 dark:bg-red-900/10 text-red-600 px-2 py-1 rounded-full">{allergies.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allergies.map(a => (
                    <span key={a.id} className="text-[9px] font-bold uppercase tracking-widest border border-red-500/30 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 px-2 py-1">
                      {a.substance} ({a.severity})
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">Sin alergias</div>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 flex flex-col flex-1 h-[132px]">
            <div className="p-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-black dark:text-white">
                <Pill className="w-3.5 h-3.5 text-emerald-500" /> Medicación
              </h4>
              <span className="text-[9px] font-bold uppercase bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 px-2 py-1 rounded-full">{medications.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {medications.length > 0 ? medications.map(m => (
                <div key={m.id} className="flex justify-between items-center text-[11px] font-semibold text-black dark:text-white border-b border-black/5 pb-1">
                  <span>{m.name}</span>
                  <span className="text-[9px] uppercase text-gray-500 tracking-widest">{m.dosage}</span>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-400">Sin medicación actual</div>
              )}
            </div>
          </div>
        </div>

        {/* 3. ÚLTIMA CONSULTA & CONTEXTO */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 flex flex-col h-72">
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-black dark:text-white">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Última Intervención
            </h4>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6">
            {latestAppointment ? (
              <>
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-500/20 flex items-center justify-center rounded-full mb-4">
                  <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                </div>
                <h5 className="font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                  {latestAppointment.serviceName}
                </h5>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">
                  {format(new Date(latestAppointment.date), "dd MMM yyyy", { locale: dateLocale })}
                </p>
                {latestAppointment.publicNotes && (
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 line-clamp-3">
                    "{latestAppointment.publicNotes}"
                  </p>
                )}
              </>
            ) : (
              <div className="text-[10px] uppercase tracking-widest text-gray-400">Sin consultas registradas</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
