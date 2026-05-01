import React from 'react';
import { useTranslations } from "next-intl";
import { 
  User, ShieldAlert, History, FileCheck, AlertTriangle, 
  ArrowRight, BookOpen, Activity, Pill, Users 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VaultDocument } from '@/types/ehr';

interface PatientProfileStepProps {
  patientProfile: any; // Usamos any temporalmente para aceptar los nuevos campos
  vaultDocuments: VaultDocument[];
  isOfflinePatient: boolean;
  displayFullName: string;
  patientDirectoryId: number | null;
  onNext: () => void;
}

export const PatientProfileStep: React.FC<PatientProfileStepProps> = ({
  patientProfile,
  vaultDocuments,
  isOfflinePatient,
  displayFullName,
  patientDirectoryId,
  onNext
}) => {
  const t = useTranslations('EHR');
  const displayInitial = displayFullName.charAt(0).toUpperCase();

  // Función auxiliar para renderizar arrays o texto de historial
  const renderHistoryData = (data: any, fallbackText: string) => {
    if (!data || data === "Ninguno") return <span className="text-sm text-slate-500 dark:text-slate-400 italic">{fallbackText}</span>;
    if (Array.isArray(data)) {
      return data.length && data[0] !== "Ninguno" ? (
        data.map((item, idx) => <Badge key={idx} variant="outline" className="dark:border-slate-700 dark:text-slate-300">{item}</Badge>)
      ) : <span className="text-sm text-slate-500 dark:text-slate-400 italic">{fallbackText}</span>;
    }
    return <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{data}</span>;
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 👤 COLUMNA IZQUIERDA: RESUMEN DEL PACIENTE */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <div className={`h-24 ${isOfflinePatient ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-medical-100 dark:bg-medical-900/30'}`}></div>
          <CardContent className="px-6 pb-6 relative pt-0 text-center">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full mx-auto flex items-center justify-center -mt-12 mb-4 border-4 border-white dark:border-slate-900 shadow-sm">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${isOfflinePatient ? 'bg-amber-50 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 'bg-medical-50 dark:bg-medical-900/50 text-medical-600 dark:text-medical-400'}`}>
                <span className="text-3xl font-bold">{displayInitial}</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{displayFullName}</h2>
            
            {/* 🚀 FIX: Datos antropométricos y de sangre precisos */}
            <div className="flex flex-wrap justify-center items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
               {patientProfile?.bloodType && <span>🩸 {patientProfile.bloodType}</span>}
               {patientProfile?.weightKg && <span>• {patientProfile.weightKg} kg</span>}
               {patientProfile?.heightCm && <span>• {patientProfile.heightCm} cm</span>}
            </div>

            {isOfflinePatient && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800">
                <BookOpen className="w-3.5 h-3.5" />
                {t('local_directory_patient')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ⚠️ ALERGIAS Y SIGNOS (Enriquecido) */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-1 bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar max-h-[500px]">
          <CardContent className="p-5 space-y-5">
            
            {!isOfflinePatient && (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t('qu_score')}</span>
                <Badge variant="outline" className="border-medical-200 text-medical-700 dark:border-medical-800 dark:text-medical-400 font-bold text-base bg-white dark:bg-slate-900">
                  {patientProfile?.quScore || '--'}
                </Badge>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> {t('allergies')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.allergies, t('no_allergies_registered'))}
              </div>
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-medical-500" /> {t('conditions')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.chronicConditions, t('no_chronic_conditions'))}
              </div>
            </div>

            {/* 🚀 NUEVAS SECCIONES DEL ENDPOINT */}
            <Separator className="bg-slate-100 dark:bg-slate-800" />

            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <Pill className="w-4 h-4 text-indigo-500" /> {t('current_medication')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {renderHistoryData(patientProfile?.currentMedications, t('no_medications_registered'))}
              </div>
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-teal-500" /> {t('surgical_history')}
              </h4>
              {renderHistoryData(patientProfile?.surgicalHistory, t('no_surgeries_registered'))}
            </div>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-medical-500" /> {t('family_history')}
              </h4>
              {renderHistoryData(patientProfile?.familyHistory, t('no_family_history_registered'))}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* 🗂️ COLUMNA DERECHA: EXPEDIENTE Y BÓVEDA */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col bg-white dark:bg-slate-900">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <History className="w-5 h-5 text-medical-500" />
              {isOfflinePatient ? t('local_consultation_history') : t('vault_title')}
            </h3>
          </div>
          
          <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
            {vaultDocuments.length === 0 ? (
              <div className="p-8 text-center h-full flex flex-col items-center justify-center text-slate-500">
                <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t('no_history')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {isOfflinePatient 
                    ? t('no_past_consultations_local') 
                    : t('vault_empty')}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {vaultDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center mr-4 group-hover:bg-medical-100 dark:group-hover:bg-medical-900/50 transition-colors">
                      <FileCheck className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.fileName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{doc.documentType} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity dark:text-medical-400 dark:hover:bg-medical-900/20">{t('view_btn')}</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🚀 BOTÓN PARA AVANZAR AL SIGUIENTE PASO */}
        <div className="flex justify-end pt-2">
          <Button onClick={onNext} className="bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white h-12 px-8 rounded-xl text-base shadow-lg shadow-medical-600/20">
            {t('continue_to_evaluation')} <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};