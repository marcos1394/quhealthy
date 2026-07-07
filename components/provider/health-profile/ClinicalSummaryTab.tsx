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

      {/* 🔹 EDITORIAL TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 md:px-8 pb-8">
        
        {/* COLUMN 1 */}
        <div className="flex flex-col gap-8">
          
          {/* PROBLEMAS ACTIVOS */}
          <div className="flex flex-col border-t-2 border-black dark:border-white pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> Problemas Activos
              </h4>
              <span className="text-[9px] font-bold uppercase border border-black/20 dark:border-white/20 px-2 py-1">{activeProblems.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {activeProblems.length > 0 ? activeProblems.map(p => (
                <div key={p.id} className="flex flex-col text-sm font-semibold text-black dark:text-white border-l border-black/20 dark:border-white/20 pl-4 py-1">
                  <span>{p.diagnosis}</span>
                  {p.startDate && (
                    <span className="text-[9px] uppercase text-gray-500 mt-1 font-normal tracking-widest">
                      Desde {format(new Date(p.startDate), 'MMM yyyy', { locale: dateLocale })}
                    </span>
                  )}
                </div>
              )) : (
                <div className="text-[10px] uppercase tracking-widest text-gray-400 py-2">Sin problemas activos</div>
              )}
            </div>
          </div>

          {/* ÚLTIMA CONSULTA & CONTEXTO */}
          <div className="flex flex-col border-t-2 border-black dark:border-white pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> Última Intervención
              </h4>
            </div>
            <div className="flex flex-col">
              {latestAppointment ? (
                <div className="p-5 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                    <h5 className="font-semibold uppercase tracking-tight text-black dark:text-white">
                      {latestAppointment.serviceName}
                    </h5>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 border-b border-black/10 dark:border-white/10 pb-3">
                    {format(new Date(latestAppointment.date), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                  {latestAppointment.publicNotes ? (
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      "{latestAppointment.publicNotes}"
                    </p>
                  ) : (
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Sin notas registradas</p>
                  )}
                </div>
              ) : (
                <div className="text-[10px] uppercase tracking-widest text-gray-400 py-2">Sin consultas registradas</div>
              )}
            </div>
          </div>

        </div>

        {/* COLUMN 2 */}
        <div className="flex flex-col gap-8">
          
          {/* ALERGIAS */}
          <div className="flex flex-col border-t-2 border-black dark:border-white pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> Alergias
              </h4>
              <span className="text-[9px] font-bold uppercase border border-black/20 dark:border-white/20 px-2 py-1">{allergies.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.length > 0 ? allergies.map(a => (
                <span key={a.id} className="text-[9px] font-bold uppercase tracking-widest border border-black dark:border-white bg-transparent text-black dark:text-white px-3 py-1.5">
                  {a.substance} <span className="opacity-50">({a.severity})</span>
                </span>
              )) : (
                <div className="text-[10px] uppercase tracking-widest text-gray-400 py-2">Sin alergias documentadas</div>
              )}
            </div>
          </div>

          {/* MEDICACIÓN */}
          <div className="flex flex-col border-t-2 border-black dark:border-white pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> Medicación Actual
              </h4>
              <span className="text-[9px] font-bold uppercase border border-black/20 dark:border-white/20 px-2 py-1">{medications.length}</span>
            </div>
            <div className="flex flex-col">
              {medications.length > 0 ? medications.map((m, index) => (
                <div key={m.id} className={`flex justify-between items-center text-sm font-semibold text-black dark:text-white py-3 ${index !== medications.length - 1 ? 'border-b border-black/10 dark:border-white/10' : ''}`}>
                  <span>{m.name}</span>
                  <span className="text-[9px] uppercase text-gray-500 tracking-widest text-right max-w-[50%]">{m.dosage}</span>
                </div>
              )) : (
                <div className="text-[10px] uppercase tracking-widest text-gray-400 py-2">Sin medicación actual</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
