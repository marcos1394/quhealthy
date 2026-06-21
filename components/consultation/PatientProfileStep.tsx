"use client";

import React, { useState } from 'react';
import { useTranslations } from "next-intl";
import { 
  User, ShieldAlert, History, FileCheck, AlertTriangle, 
  ArrowRight, BookOpen, Activity, Pill, Users 
} from "lucide-react";
import { VaultDocument } from '@/types/ehr';
import { PastConsultationModal } from '@/components/consultation/PastConsultationModal';

interface PatientProfileStepProps {
  patientProfile: any;
  vaultDocuments: VaultDocument[];
  vaultAccessDenied?: boolean;
  consumerId?: number | null;
  isOfflinePatient: boolean;
  displayFullName: string;
  patientDirectoryId: number | null;
  onNext: () => void;
}

export const PatientProfileStep: React.FC<PatientProfileStepProps> = ({
  patientProfile,
  vaultDocuments,
  vaultAccessDenied,
  consumerId,
  isOfflinePatient,
  displayFullName,
  patientDirectoryId,
  onNext
}) => {
  const t = useTranslations('EHR');
  const displayInitial = displayFullName.charAt(0).toUpperCase();

  const [selectedPastConsultation, setSelectedPastConsultation] = useState<{ id: number; date: string } | null>(null);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);

  const handleRequestAccess = async () => {
    if (!consumerId) return;
    try {
      setIsRequestingAccess(true);
      const axiosInstance = (await import('@/lib/axios')).default;
      await axiosInstance.post(`/api/onboarding/provider/vault/permissions/request/${consumerId}`);
      import('react-toastify').then(({ toast }) => toast.success("SOLICITUD DE ACCESO ENVIADA."));
    } catch (error) {
      import('react-toastify').then(({ toast }) => toast.error("FALLO EN LA SOLICITUD DE AUTORIZACIÓN."));
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const renderHistoryData = (data: any, fallbackText: string) => {
    if (!data || data === "Ninguno") return <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{fallbackText}</span>;
    
    if (Array.isArray(data)) {
      if (data.length === 0 || data[0] === "Ninguno") {
        return <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{fallbackText}</span>;
      }
      return data.map((item, idx) => {
        const text = typeof item === 'object' && item !== null ? (item.name || item.disease || JSON.stringify(item)) : item;
        return (
          <span key={idx} className="border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
            {String(text)}
          </span>
        );
      });
    }

    if (typeof data === 'object' && data !== null) {
      const text = data.name || data.disease || JSON.stringify(data);
      return <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">{String(text)}</span>;
    }

    return <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">{String(data)}</span>;
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 transition-colors duration-300">
      
      {/* 👤 COLUMNA IZQUIERDA: RESUMEN DEL PACIENTE */}
      <div className="w-full md:w-1/3 flex flex-col gap-8">
        
        {/* TARJETA DE IDENTIDAD (EXPEDIENTE) */}
        <div className="border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-white dark:bg-[#0a0a0a] flex flex-col">
          <div className="p-6 border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex items-center gap-6">
            <div className="w-20 h-20 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
              <span className="text-4xl font-sans font-bold uppercase tracking-widest">{displayInitial}</span>
            </div>
            
            <div className="flex-1 text-left">
              <h2 className="text-2xl font-sans font-bold tracking-widest text-black dark:text-white uppercase mb-2">
                {displayFullName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                 {patientProfile?.bloodType && (
                   <span className="border border-black dark:border-white px-2 py-1 text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
                     GS: {patientProfile.bloodType}
                   </span>
                 )}
                 {patientProfile?.weightKg && (
                   <span className="border border-black dark:border-white px-2 py-1 text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
                     {patientProfile.weightKg} KG
                   </span>
                 )}
                 {patientProfile?.heightCm && (
                   <span className="border border-black dark:border-white px-2 py-1 text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
                     {patientProfile.heightCm} CM
                   </span>
                 )}
            </div>
          </div>

          {isOfflinePatient && (
              <div className="mt-6 flex items-center justify-center gap-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-[9px] font-bold uppercase tracking-widest w-full">
                <BookOpen className="w-3 h-3" strokeWidth={1.5} />
                <span>{t('local_directory_patient')}</span>
              </div>
            )}
          </div>

          {/* ⚠️ ALERGIAS Y SIGNOS */}
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar max-h-[500px] divide-y divide-gray-200 dark:divide-gray-800">
            
            {!isOfflinePatient && (
              <div className="flex items-center justify-between p-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('qu_score')}</span>
                <span className="text-xl font-bold text-black dark:text-white">
                  {patientProfile?.quScore || '--'}
                </span>
              </div>
            )}

            <div className="p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> {t('allergies')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.allergies, t('no_allergies_registered'))}
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-3 mb-4">
                <ShieldAlert className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> {t('conditions')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.chronicConditions, t('no_chronic_conditions'))}
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-3 mb-4">
                <Pill className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> {t('current_medication')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.currentMedications, t('no_medications_registered'))}
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-3 mb-4">
                <Activity className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> {t('surgical_history')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.surgicalHistory, t('no_surgeries_registered'))}
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-3 mb-4">
                <Users className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} /> {t('family_history')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.familyHistory, t('no_family_history_registered'))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🗂️ COLUMNA DERECHA: EXPEDIENTE Y BÓVEDA */}
      <div className="w-full md:w-2/3 flex flex-col gap-8">
        
        <div className="border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col bg-white dark:bg-[#0a0a0a] flex-1">
          <div className="p-6 md:p-8 border-b border-black dark:border-white flex justify-between items-center bg-gray-50 dark:bg-[#050505] shrink-0">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
              <History className="w-4 h-4" strokeWidth={1.5} />
              {isOfflinePatient ? t('local_consultation_history') : t('vault_title')}
            </h3>
          </div>
          
          <div className="p-0 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {vaultAccessDenied ? (
              <div className="p-12 text-center flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
                <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] mb-6">
                  <ShieldAlert className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-lg text-black dark:text-white uppercase mb-4 tracking-tight">Expediente Privado</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
                  EL PACIENTE MANTIENE SU EXPEDIENTE MÉDICO RESTRINGIDO. PARA VISUALIZAR EL HISTORIAL COMPLETO, ENVÍE UNA SOLICITUD DE ACCESO.
                </p>
                <button 
                  onClick={handleRequestAccess} 
                  disabled={isRequestingAccess}
                  className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors h-14 px-8 text-[10px] font-bold uppercase tracking-widest w-full sm:w-auto"
                >
                  {isRequestingAccess ? 'ENVIANDO SOLICITUD...' : 'SOLICITAR AUTORIZACIÓN'}
                </button>
              </div>
            ) : vaultDocuments.length === 0 ? (
              <div className="p-12 text-center flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
                <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] mb-6">
                  <History className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-lg text-black dark:text-white uppercase mb-4 tracking-tight">{t('no_history')}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto leading-relaxed">
                  {isOfflinePatient 
                    ? t('no_past_consultations_local') 
                    : t('vault_empty')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {vaultDocuments.map(doc => (
                  <div 
                    key={doc.id} 
                    className="flex flex-col sm:flex-row sm:items-center p-6 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer group"
                    onClick={() => {
                      if (doc.documentType === 'CONSULTA_PREVIA') {
                        setSelectedPastConsultation({
                          id: parseInt(doc.id),
                          date: doc.uploadDate
                        });
                      } else if (doc.secureUrl) {
                        window.open(doc.secureUrl, '_blank');
                      }
                    }}
                  >
                    <div className="flex items-center gap-6 flex-1 mb-4 sm:mb-0">
                      <div className="w-12 h-12 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-transparent group-hover:border-white dark:group-hover:border-black transition-colors">
                        <FileCheck className="w-5 h-5 text-black dark:text-white group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm uppercase tracking-widest truncate">{doc.title || doc.fileName || 'DOCUMENTO CLÍNICO'}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 mt-1">
                          {doc.documentType} <span className="mx-2">|</span> {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="border border-black dark:border-white bg-transparent px-6 h-10 text-[9px] font-bold uppercase tracking-widest group-hover:border-white dark:group-hover:border-black shrink-0 transition-colors sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center">
                      {t('view_btn', { defaultValue: 'VISUALIZAR' })}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🚀 BOTÓN PARA AVANZAR AL SIGUIENTE PASO */}
        <div className="flex justify-end pt-2">
          <button 
            onClick={onNext} 
            className="flex items-center justify-center gap-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors h-14 px-10 text-[10px] font-bold uppercase tracking-widest border-0 w-full sm:w-auto"
          >
            {t('continue_to_evaluation')} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* MODAL DE CONSULTA PREVIA */}
      <PastConsultationModal
        isOpen={!!selectedPastConsultation}
        onClose={() => setSelectedPastConsultation(null)}
        appointmentId={selectedPastConsultation?.id || null}
        patientName={displayFullName}
        consultationDate={selectedPastConsultation?.date || ''}
      />
    </div>
  );
};