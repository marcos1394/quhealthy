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
      import('react-toastify').then(({ toast }) => toast.success("SOLICITUD ENVIADA AL PACIENTE."));
    } catch (error) {
      import('react-toastify').then(({ toast }) => toast.error("ERROR AL ENVIAR SOLICITUD."));
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const renderHistoryData = (data: any, fallbackText: string) => {
    if (!data || data === "Ninguno") return <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{fallbackText}</span>;
    
    if (Array.isArray(data)) {
      if (data.length === 0 || data[0] === "Ninguno") {
        return <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{fallbackText}</span>;
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
      return <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{String(text)}</span>;
    }

    return <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{String(data)}</span>;
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 👤 COLUMNA IZQUIERDA: RESUMEN DEL PACIENTE */}
      <div className="w-full md:w-1/3 flex flex-col gap-8">
        
        {/* TARJETA DE IDENTIDAD */}
        <div className="border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-white dark:bg-[#0a0a0a] flex flex-col">
          <div className="h-24 bg-black dark:bg-white border-b border-black dark:border-white"></div>
          <div className="px-6 pb-6 relative pt-0 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex items-center justify-center -mt-12 mb-6">
              <span className="text-4xl font-serif italic font-bold text-black dark:text-white">{displayInitial}</span>
            </div>
            
            <h2 className="text-xl font-serif italic font-bold text-black dark:text-white uppercase mb-4">{displayFullName}</h2>
            
            <div className="flex flex-wrap justify-center items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
               {patientProfile?.bloodType && <span className="border border-gray-300 dark:border-gray-700 px-2 py-1">🩸 {patientProfile.bloodType}</span>}
               {patientProfile?.weightKg && <span className="border border-gray-300 dark:border-gray-700 px-2 py-1">{patientProfile.weightKg} KG</span>}
               {patientProfile?.heightCm && <span className="border border-gray-300 dark:border-gray-700 px-2 py-1">{patientProfile.heightCm} CM</span>}
            </div>

            {isOfflinePatient && (
              <div className="mt-6 flex items-center justify-center gap-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-[9px] font-bold uppercase tracking-widest">
                <BookOpen className="w-3 h-3" strokeWidth={2} />
                <span>{t('local_directory_patient')}</span>
              </div>
            )}
          </div>
        </div>

        {/* ⚠️ ALERGIAS Y SIGNOS */}
        <div className="border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-white dark:bg-[#0a0a0a] flex-1 flex flex-col overflow-y-auto custom-scrollbar max-h-[500px]">
          <div className="p-6 flex flex-col gap-8">
            
            {!isOfflinePatient && (
              <div className="flex items-center justify-between p-4 border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">{t('qu_score')}</span>
                <span className="text-base font-bold text-black dark:text-white border-l border-black dark:border-white pl-4">
                  {patientProfile?.quScore || '--'}
                </span>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-4">
                <AlertTriangle className="w-4 h-4" strokeWidth={1.5} /> {t('allergies')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.allergies, t('no_allergies_registered'))}
              </div>
            </div>

            <div className="border-t border-black dark:border-white" />

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-4">
                <ShieldAlert className="w-4 h-4" strokeWidth={1.5} /> {t('conditions')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.chronicConditions, t('no_chronic_conditions'))}
              </div>
            </div>

            <div className="border-t border-black dark:border-white" />

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-4">
                <Pill className="w-4 h-4" strokeWidth={1.5} /> {t('current_medication')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.currentMedications, t('no_medications_registered'))}
              </div>
            </div>

            <div className="border-t border-black dark:border-white" />

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-4">
                <Activity className="w-4 h-4" strokeWidth={1.5} /> {t('surgical_history')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.surgicalHistory, t('no_surgeries_registered'))}
              </div>
            </div>

            <div className="border-t border-black dark:border-white" />

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3 mb-4">
                <Users className="w-4 h-4" strokeWidth={1.5} /> {t('family_history')}
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
          <div className="p-6 border-b border-black dark:border-white flex justify-between items-center bg-gray-50 dark:bg-[#050505]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
              <History className="w-4 h-4" strokeWidth={1.5} />
              {isOfflinePatient ? t('local_consultation_history') : t('vault_title')}
            </h3>
          </div>
          
          <div className="p-0 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            {vaultAccessDenied ? (
              <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center mb-6">
                  <ShieldAlert className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="font-serif italic font-bold text-xl text-black dark:text-white uppercase mb-4">Expediente Privado</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
                  EL PACIENTE MANTIENE SU EXPEDIENTE MÉDICO RESTRINGIDO. PARA VISUALIZAR EL HISTORIAL COMPLETO, ENVÍALE UNA SOLICITUD DE ACCESO.
                </p>
                <button 
                  onClick={handleRequestAccess} 
                  disabled={isRequestingAccess}
                  className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors px-8 py-4 text-[10px] font-bold uppercase tracking-widest"
                >
                  {isRequestingAccess ? 'ENVIANDO SOLICITUD...' : 'SOLICITAR ACCESO AL EXPEDIENTE'}
                </button>
              </div>
            ) : vaultDocuments.length === 0 ? (
              <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border border-black dark:border-white flex items-center justify-center mb-6">
                  <History className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h4 className="font-serif italic font-bold text-xl text-black dark:text-white uppercase mb-4">{t('no_history')}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm mx-auto leading-relaxed">
                  {isOfflinePatient 
                    ? t('no_past_consultations_local') 
                    : t('vault_empty')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black dark:divide-white">
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
                      <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center shrink-0 group-hover:border-white dark:group-hover:border-black">
                        <FileCheck className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm uppercase tracking-widest truncate">{doc.title || doc.fileName || 'NOTA SIN TÍTULO'}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 mt-2">
                          {doc.documentType} <span className="mx-2">|</span> {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="border border-black dark:border-white bg-transparent px-6 py-3 text-[9px] font-bold uppercase tracking-widest group-hover:border-white dark:group-hover:border-black shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {t('view_btn')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🚀 BOTÓN PARA AVANZAR AL SIGUIENTE PASO */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={onNext} 
            className="flex items-center justify-center gap-4 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors px-10 py-5 text-[10px] font-bold uppercase tracking-widest shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]"
          >
            {t('continue_to_evaluation')} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

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