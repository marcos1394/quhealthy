import React from 'react';
import { useTranslations } from "next-intl";
import { User, AlertTriangle, ShieldAlert } from "lucide-react";
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
    <aside className="w-full lg:w-1/4 lg:min-w-[280px] lg:max-w-[350px] bg-white dark:bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-black dark:border-white p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8 z-0">
      
      <h2 className="text-[10px] font-bold text-black dark:text-white flex items-center gap-3 uppercase tracking-widest">
        <User className="w-4 h-4" strokeWidth={1.5} /> {t('patient_profile')}
      </h2>
      
      {/* 👤 Ficha Rápida */}
      <div className="text-center flex flex-col items-center">
        <div className="w-24 h-24 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-6">
          <span className="text-4xl font-serif italic font-bold">{displayInitial}</span>
        </div>
        <h3 className="text-xl font-serif italic font-bold text-black dark:text-white uppercase mb-2">
          {displayFullName}
        </h3>
        {!isOfflinePatient ? (
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2 flex gap-2">
            {patientProfile?.gender && <span className="border border-gray-300 dark:border-gray-700 px-2 py-1">{patientProfile.gender}</span>}
            <span className="border border-gray-300 dark:border-gray-700 px-2 py-1">{patientProfile?.bloodType || 'SANGRE N/D'}</span>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center gap-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
            <AlertTriangle className="w-3 h-3" strokeWidth={2} />
            <span>NO REGISTRADO EN APP</span>
          </div>
        )}
      </div>

      {!isOfflinePatient && (
        <div className="flex flex-col gap-6">
          {/* 📊 QuScore */}
          <div className="bg-gray-50 dark:bg-[#050505] p-6 border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] text-center">
            <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest mb-2">{t('qu_score')}</p>
            <div className="text-4xl font-serif italic font-bold text-black dark:text-white leading-none mb-4">
              {patientProfile?.quScore || '--'}
            </div>
            <span className="inline-block border border-black dark:border-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-white dark:bg-[#0a0a0a]">
              {patientProfile?.quScoreBand || 'SIN CALCULAR'}
            </span>
          </div>

          {/* ⚠️ Alergias y Condiciones */}
          <div className="space-y-6 pt-4 border-t border-black dark:border-white">
            <div>
              <p className="text-[10px] font-bold text-black dark:text-white flex items-center gap-3 mb-3 uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4" strokeWidth={1.5} /> {t('allergies')}
              </p>
              <div className="flex flex-wrap gap-2">
                {patientProfile?.allergies?.length ? (
                  patientProfile.allergies.map(a => (
                    <span key={a} className="border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{t('no_data')}</span>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-300 dark:border-gray-700" />
            
            <div>
              <p className="text-[10px] font-bold text-black dark:text-white flex items-center gap-3 mb-3 uppercase tracking-widest">
                <ShieldAlert className="w-4 h-4" strokeWidth={1.5} /> {t('conditions')}
              </p>
              <div className="flex flex-wrap gap-2">
                {patientProfile?.chronicConditions?.length ? (
                  patientProfile.chronicConditions.map(c => (
                    <span key={c} className="border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{t('no_data')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};