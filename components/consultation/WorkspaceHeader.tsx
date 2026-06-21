import React from 'react';
import { useTranslations } from "next-intl";
import { ArrowLeft, Stethoscope, Mic, Save, CheckCircle } from "lucide-react";

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
    <header className="bg-white dark:bg-[#0a0a0a] border-b border-black dark:border-white px-6 py-4 flex flex-wrap items-center justify-between shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)] z-10 shrink-0 gap-4">
      
      {/* Lado Izquierdo: Back & Info */}
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={onBack} 
          className="w-10 h-10 border border-black dark:border-white flex justify-center items-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-serif italic font-bold text-black dark:text-white flex items-center gap-3 uppercase">
            <Stethoscope className="w-5 h-5" strokeWidth={1.5} /> 
            {t('title_consultation')}
          </h1>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1 flex flex-wrap items-center gap-3">
            <span>CITA #{appointmentId}</span>
            <span className="hidden sm:inline">|</span>
            <span>{displayFullName}</span>
            {isOfflinePatient && (
              <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 ml-2">
                OFFLINE
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Lado Derecho: Acciones */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-end mt-4 md:mt-0">
        {isRecording && (
          <div className="border border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 text-[9px] font-bold uppercase tracking-widest flex items-center animate-pulse shadow-[4px_4px_0_0_#dc2626]">
            <Mic className="w-3 h-3 md:mr-2" strokeWidth={2} /> <span className="hidden md:inline">ESCUCHANDO...</span>
          </div>
        )}
        <button 
          className="flex items-center gap-2 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
        >
          <Save className="w-4 h-4" strokeWidth={1.5} /> <span className="hidden lg:inline">GUARDAR BORRADOR</span>
        </button>
        <button 
          onClick={onComplete} 
          disabled={isSubmitting}
          className="flex items-center gap-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" strokeWidth={1.5} /> <span className="hidden md:inline">FINALIZAR Y COBRAR</span>
        </button>
      </div>
    </header>
  );
};