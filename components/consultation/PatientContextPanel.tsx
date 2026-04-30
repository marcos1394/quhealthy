import React from 'react';
import { useTranslations } from "next-intl";
import { User, AlertTriangle, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PatientClinicalProfile } from '@/types/ehr';

interface PatientContextPanelProps {
  patientProfile: PatientClinicalProfile | null;
  isOfflinePatient: boolean;
  displayFullName: string;
}

export const PatientContextPanel: React.FC<PatientContextPanelProps> = ({
  patientProfile,
  isOfflinePatient,
  displayFullName
}) => {
  const t = useTranslations('EHR');
  const displayInitial = displayFullName.charAt(0).toUpperCase();

  return (
    <aside className="w-full lg:w-1/4 lg:min-w-[280px] lg:max-w-[350px] bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center uppercase tracking-wider">
        <User className="w-4 h-4 mr-2 text-slate-500 dark:text-slate-400" /> {t('patient_profile')}
      </h2>
      
      {/* 👤 Ficha Rápida */}
      <div className="text-center">
        <div className="w-20 h-20 bg-medical-100 dark:bg-medical-900/30 rounded-full mx-auto flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-medical-700 dark:text-medical-400">{displayInitial}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{displayFullName}</h3>
        {!isOfflinePatient ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {patientProfile?.gender} • {patientProfile?.bloodType || 'Sangre N/D'}
          </p>
        ) : (
          <p className="text-sm text-amber-600 dark:text-amber-500 mt-1 font-medium flex items-center justify-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Paciente no registrado en App
          </p>
        )}
      </div>

      {!isOfflinePatient && (
        <>
          {/* 📊 QuScore */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('qu_score')}</p>
            <div className="text-3xl font-black text-medical-600 dark:text-medical-400 leading-none mb-2">
              {patientProfile?.quScore || '--'}
            </div>
            <Badge variant="outline" className="border-medical-200 text-medical-700 dark:border-medical-500/30 dark:text-medical-400">
              {patientProfile?.quScoreBand || 'Sin calcular'}
            </Badge>
          </div>

          {/* ⚠️ Alergias y Condiciones */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> {t('allergies')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {patientProfile?.allergies?.length ? (
                  patientProfile.allergies.map(a => (
                    <Badge key={a} variant="secondary" className="bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                      {a}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">{t('no_data')}</span>
                )}
              </div>
            </div>
            <Separator className="dark:bg-slate-800" />
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-500" /> {t('conditions')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {patientProfile?.chronicConditions?.length ? (
                  patientProfile.chronicConditions.map(c => (
                    <Badge key={c} variant="outline" className="text-xs dark:border-slate-700 dark:text-slate-300">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500">{t('no_data')}</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};