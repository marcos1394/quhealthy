import React from 'react';
import { useTranslations } from "next-intl";
import { User, ShieldAlert, History, FileCheck, AlertTriangle, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PatientClinicalProfile, VaultDocument } from '@/types/ehr';

interface PatientProfileStepProps {
  patientProfile: PatientClinicalProfile | null;
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

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 👤 COLUMNA IZQUIERDA: RESUMEN DEL PACIENTE */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className={`h-24 ${isOfflinePatient ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-medical-100 dark:bg-medical-900/30'}`}></div>
          <CardContent className="px-6 pb-6 relative pt-0 text-center">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full mx-auto flex items-center justify-center -mt-12 mb-4 border-4 border-white dark:border-slate-900 shadow-sm">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${isOfflinePatient ? 'bg-amber-50 dark:bg-amber-900/50 text-amber-600' : 'bg-medical-50 dark:bg-medical-900/50 text-medical-600'}`}>
                <span className="text-3xl font-bold">{displayInitial}</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{displayFullName}</h2>
            
            {isOfflinePatient ? (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800">
                <BookOpen className="w-3.5 h-3.5" />
                Paciente de Directorio Local
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {patientProfile?.gender} • {patientProfile?.bloodType || 'Sangre N/D'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ⚠️ ALERGIAS Y SIGNOS (Visible para ambos, pero mockeado si es offline por ahora) */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-1">
          <CardContent className="p-5 space-y-5">
            {!isOfflinePatient && (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase">QuScore</span>
                <Badge variant="outline" className="border-medical-200 text-medical-700 font-bold text-base">
                  {patientProfile?.quScore || '--'}
                </Badge>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> {t('allergies')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {!isOfflinePatient && patientProfile?.allergies?.length ? (
                  patientProfile.allergies.map(a => <Badge key={a} variant="secondary" className="bg-red-50 text-red-700">{a}</Badge>)
                ) : (
                  <span className="text-sm text-slate-400 italic">No hay alergias registradas.</span>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-blue-500" /> {t('conditions')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {!isOfflinePatient && patientProfile?.chronicConditions?.length ? (
                  patientProfile.chronicConditions.map(c => <Badge key={c} variant="outline">{c}</Badge>)
                ) : (
                  <span className="text-sm text-slate-400 italic">Sin condiciones crónicas registradas.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🗂️ COLUMNA DERECHA: EXPEDIENTE Y BÓVEDA */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <History className="w-5 h-5 text-medical-500" />
              {isOfflinePatient ? 'Historial de Consultas Locales' : t('vault_title')}
            </h3>
          </div>
          
          <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
            {isOfflinePatient ? (
              // 🚀 VISTA PARA PACIENTES OFFLINE (Listos para consumir tu API de ProviderMedicalHistoryController)
              <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                <BookOpen className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Expediente Interno</h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Este paciente pertenece a tu directorio privado. Aquí se mostrarán las consultas pasadas que has tenido con él. 
                  (Conectando con ID: {patientDirectoryId}).
                </p>
                <Button variant="outline" className="mt-6 border-amber-200 text-amber-700 hover:bg-amber-50">
                  Ver Historial Completo
                </Button>
              </div>
            ) : vaultDocuments.length === 0 ? (
              <div className="p-12 text-center text-slate-500">{t('vault_empty')}</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {vaultDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center mr-4 group-hover:bg-medical-100 transition-colors">
                      <FileCheck className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.fileName}</p>
                      <p className="text-xs text-slate-500 mt-1">{doc.documentType} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Ver</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🚀 BOTÓN PARA AVANZAR AL SIGUIENTE PASO */}
        <div className="flex justify-end pt-2">
          <Button onClick={onNext} className="bg-medical-600 hover:bg-medical-700 text-white h-12 px-8 rounded-xl text-base shadow-lg shadow-medical-600/20">
            Continuar a Evaluación Clínica <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};