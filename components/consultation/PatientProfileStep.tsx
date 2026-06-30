"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

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
    if (!data || data === "Ninguno") return <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">SIN REGISTRO</span>;
    
    if (Array.isArray(data)) {
      if (data.length === 0 || data[0] === "Ninguno") {
        return <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">SIN REGISTRO</span>;
      }
      return data.map((item, idx) => {
        const text = typeof item === 'object' && item !== null ? (item.name || item.disease || JSON.stringify(item)) : item;
        return (
          <span key={idx} className="border border-black/20 dark:border-white/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
            {String(text)}
          </span>
        );
      });
    }

    if (typeof data === 'object' && data !== null) {
      const text = data.name || data.disease || JSON.stringify(data);
      return <span className="border border-black/20 dark:border-white/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-50 dark:bg-[#050505]">{String(text)}</span>;
    }

    return <span className="border border-black/20 dark:border-white/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-50 dark:bg-[#050505]">{String(data)}</span>;
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 transition-colors duration-300">
      
      {/* 👤 COLUMNA IZQUIERDA: RESUMEN DEL PACIENTE */}
      <div className="w-full lg:w-1/3 flex flex-col border border-black dark:border-white bg-white dark:bg-[#0a0a0a] rounded-none">
        
        {/* TARJETA DE IDENTIDAD */}
        <div className="p-4 md:p-6 border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white flex items-center justify-center shrink-0">
            <span className="text-xl font-semibold tracking-tight uppercase">{displayInitial}</span>
          </div>
          
          <div className="flex-1 text-left min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              Perfil Biométrico
            </p>
            <h2 className="text-lg md:text-xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2 truncate">
              {displayFullName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                {patientProfile?.bloodType && (
                  <span className="border border-black/20 dark:border-white/20 px-2 py-0.5 text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
                    GS: {patientProfile.bloodType}
                  </span>
                )}
                {patientProfile?.weightKg && (
                  <span className="border border-black/20 dark:border-white/20 px-2 py-0.5 text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
                    {patientProfile.weightKg} KG
                  </span>
                )}
                {patientProfile?.heightCm && (
                  <span className="border border-black/20 dark:border-white/20 px-2 py-0.5 text-black dark:text-white bg-gray-50 dark:bg-[#050505]">
                    {patientProfile.heightCm} CM
                  </span>
                )}
            </div>
          </div>
        </div>

        {isOfflinePatient && (
          <div className="flex items-center justify-center gap-2 border-b border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-4 py-3 text-[9px] font-bold uppercase tracking-widest w-full shrink-0">
            <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{t('local_directory_patient')}</span>
          </div>
        )}

        {/* ⚠️ CUADRÍCULA DE HISTORIAL (BLUEPRINT) */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505]">
          <div className="grid grid-cols-1 gap-0 border-b border-black/10 dark:border-white/10">
            
            {!isOfflinePatient && (
              <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('qu_score')}</span>
                <span className="text-xl font-semibold tracking-tight text-black dark:text-white">
                  {patientProfile?.quScore || '--'}
                </span>
              </div>
            )}

            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
                  <AlertTriangle className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t('allergies')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-11">
                {renderHistoryData(patientProfile?.allergies, t('no_allergies_registered'))}
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
                  <ShieldAlert className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t('conditions')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-11">
                {renderHistoryData(patientProfile?.chronicConditions, t('no_chronic_conditions'))}
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
                  <Pill className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t('current_medication')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-11">
                {renderHistoryData(patientProfile?.currentMedications, t('no_medications_registered'))}
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
                  <Activity className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t('surgical_history')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-11">
                {renderHistoryData(patientProfile?.surgicalHistory, t('no_surgeries_registered'))}
              </div>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
                  <Users className="w-3.5 h-3.5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {t('family_history')}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-11">
                {renderHistoryData(patientProfile?.familyHistory, t('no_family_history_registered'))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🗂️ COLUMNA DERECHA: EXPEDIENTE Y BÓVEDA */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        
        <div className="border border-black dark:border-white flex flex-col bg-white dark:bg-[#0a0a0a] flex-1 rounded-none overflow-hidden">
          <div className="p-4 md:p-6 border-b border-black dark:border-white flex justify-between items-center bg-white dark:bg-[#0a0a0a] shrink-0">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
                <History className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
              {isOfflinePatient ? t('local_consultation_history') : t('vault_title')}
            </h3>
          </div>
          
          <div className="p-0 flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505]">
            {vaultAccessDenied ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
                <div className="w-12 h-12 border border-black/20 dark:border-white/20 flex items-center justify-center bg-gray-50 dark:bg-[#050505] mb-4">
                  <ShieldAlert className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="text-lg font-semibold text-black dark:text-white uppercase mb-3 tracking-tight">Expediente Restringido</h4>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                  EL PACIENTE MANTIENE SU EXPEDIENTE MÉDICO BAJO PRIVACIDAD. PARA VISUALIZAR EL HISTORIAL COMPLETO, REQUIERE EMITIR UNA SOLICITUD DE ACCESO.
                </p>
                <button 
                  onClick={handleRequestAccess} 
                  disabled={isRequestingAccess}
                  className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors h-10 px-6 text-[9px] font-bold uppercase tracking-widest w-full sm:w-auto border-0 rounded-none"
                >
                  {isRequestingAccess ? 'ENVIANDO PROTOCOLO...' : 'SOLICITAR AUTORIZACIÓN'}
                </button>
              </div>
            ) : vaultDocuments.length === 0 ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a]">
                <div className="w-12 h-12 border border-black/20 dark:border-white/20 flex items-center justify-center bg-gray-50 dark:bg-[#050505] mb-4">
                  <History className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="text-lg font-semibold text-black dark:text-white uppercase mb-3 tracking-tight">{t('no_history')}</h4>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto leading-relaxed">
                  {isOfflinePatient 
                    ? t('no_past_consultations_local') 
                    : t('vault_empty')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-0 border-b border-black/10 dark:border-white/10">
                {vaultDocuments.map(doc => (
                  <div 
                    key={doc.id} 
                    className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between"
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
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-transparent group-hover:border-white/50 dark:group-hover:border-black/50 transition-colors">
                        <FileCheck className="w-4 h-4 text-black dark:text-white group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs uppercase tracking-widest truncate mb-1">
                          {doc.title || doc.fileName || 'DOCUMENTO CLÍNICO'}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400">
                          {doc.documentType} <span className="mx-1">|</span> {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (doc.documentType === 'CONSULTA_PREVIA') {
                          setSelectedPastConsultation({
                            id: parseInt(doc.id),
                            date: doc.uploadDate
                          });
                        } else if (doc.secureUrl) {
                          window.open(doc.secureUrl, '_blank');
                        }
                      }}
                      className="border border-black dark:border-white px-6 h-10 text-[9px] font-bold uppercase tracking-widest shrink-0 transition-colors sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center rounded-none bg-transparent text-black dark:text-white group-hover:bg-white group-hover:text-black group-hover:border-transparent dark:group-hover:bg-black dark:group-hover:text-white dark:group-hover:border-transparent hover:scale-105"
                    >
                      {t('view_btn', { defaultValue: 'VISUALIZAR' })}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🚀 BOTÓN PARA AVANZAR AL SIGUIENTE PASO */}
        <div className="flex justify-end pt-1 shrink-0">
          <button 
            onClick={onNext} 
            className="flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors h-12 px-10 text-[10px] font-bold uppercase tracking-widest border-0 rounded-none w-full sm:w-auto"
          >
            {t('continue_to_evaluation')} <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
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