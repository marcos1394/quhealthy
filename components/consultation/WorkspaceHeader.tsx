import React from 'react';
import { useTranslations } from "next-intl";
import { ArrowLeft, Stethoscope, Mic, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkspaceHeaderProps {
  appointmentId: number;
  displayFullName: string;
  isOfflinePatient: boolean;
  isRecording: boolean;
  isSubmitting: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  appointmentId,
  displayFullName,
  isOfflinePatient,
  isRecording,
  isSubmitting,
  onComplete,
  onBack
}) => {
  const t = useTranslations('EHR');

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between shadow-sm z-10 shrink-0 gap-3">
      
      {/* Lado Izquierdo: Back & Info */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-4 h-4 md:w-5 md:h-5 text-medical-600 dark:text-medical-500" /> 
            {t('title_consultation')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            Cita #{appointmentId} • {displayFullName}
            {isOfflinePatient && <Badge variant="secondary" className="text-[10px] h-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Offline</Badge>}
          </p>
        </div>
      </div>
      
      {/* Lado Derecho: Acciones */}
      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
        {isRecording && (
           <Badge variant="destructive" className="animate-pulse shadow-sm h-8 md:h-9">
             <Mic className="w-3 h-3 md:mr-1" /> <span className="hidden md:inline">Escuchando...</span>
           </Badge>
        )}
        <Button variant="outline" className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 h-8 md:h-9 hover:bg-slate-50 dark:hover:bg-slate-800">
          <Save className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Guardar Borrador</span>
        </Button>
        <Button 
          onClick={onComplete} 
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 md:h-9 shadow-none"
        >
          <CheckCircle className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Finalizar y Cobrar</span>
        </Button>
      </div>
    </header>
  );
};