import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, BrainCircuit, ShieldAlert, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiConsentModalProps {
  onSubmit: (preferences: {
    audioProcessingAccepted: boolean;
    clinicalNoteAccepted: boolean;
    dataStorageAccepted: boolean;
    consentVersion: string;
  }) => void;
  isSubmitting?: boolean;
}

export const AiConsentModal: React.FC<AiConsentModalProps> = ({ onSubmit, isSubmitting }) => {
  const t = useTranslations("Teleconsultation");
  
  const [audioAccepted, setAudioAccepted] = useState(false);
  const [clinicalNoteAccepted, setClinicalNoteAccepted] = useState(false);
  const [storageAccepted, setStorageAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      audioProcessingAccepted: audioAccepted,
      clinicalNoteAccepted: clinicalNoteAccepted,
      dataStorageAccepted: storageAccepted,
      consentVersion: "v1.0" // Constante definida para la primera versión de la política
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-center h-full min-h-[500px] overflow-y-auto py-6">
      <div className="bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-6 md:p-10 relative overflow-hidden group my-auto">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-bl-full pointer-events-none -z-10 transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-6 right-6 w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center pointer-events-none">
          <BrainCircuit className="w-6 h-6 text-white dark:text-black" strokeWidth={1.5} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-black dark:text-white mb-3 leading-none">
            {t("ai_consent_title", { defaultValue: "Asistente Médico con IA" })}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
            {t("ai_consent_desc", { defaultValue: "Para brindarte una mejor atención, tu médico puede utilizar inteligencia artificial durante la consulta. Por favor, selecciona qué usos autorizas." })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <label className={cn(
            "flex items-start gap-4 p-5 border cursor-pointer transition-all duration-200",
            audioAccepted 
              ? "border-black bg-black/5 dark:border-white dark:bg-white/5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] -translate-y-1" 
              : "border-black/20 dark:border-white/20 hover:border-black/50 dark:hover:border-white/50 bg-white dark:bg-[#0a0a0a]"
          )}>
            <div className={cn(
              "w-6 h-6 shrink-0 mt-0.5 border flex items-center justify-center transition-colors",
              audioAccepted ? "bg-black border-black dark:bg-white dark:border-white" : "border-black/30 dark:border-white/30"
            )}>
              {audioAccepted && <Check className="w-4 h-4 text-white dark:text-black" strokeWidth={3} />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={audioAccepted}
              onChange={(e) => setAudioAccepted(e.target.checked)}
            />
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white leading-none mb-1">
                Procesamiento de Audio
              </h3>
              <p className="text-xs text-gray-500">
                Permito que la IA escuche y transcriba en tiempo real lo hablado en la consulta para ayudar al médico.
              </p>
            </div>
          </label>

          <label className={cn(
            "flex items-start gap-4 p-5 border cursor-pointer transition-all duration-200",
            clinicalNoteAccepted 
              ? "border-black bg-black/5 dark:border-white dark:bg-white/5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] -translate-y-1" 
              : "border-black/20 dark:border-white/20 hover:border-black/50 dark:hover:border-white/50 bg-white dark:bg-[#0a0a0a]"
          )}>
            <div className={cn(
              "w-6 h-6 shrink-0 mt-0.5 border flex items-center justify-center transition-colors",
              clinicalNoteAccepted ? "bg-black border-black dark:bg-white dark:border-white" : "border-black/30 dark:border-white/30"
            )}>
              {clinicalNoteAccepted && <Check className="w-4 h-4 text-white dark:text-black" strokeWidth={3} />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={clinicalNoteAccepted}
              onChange={(e) => setClinicalNoteAccepted(e.target.checked)}
            />
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white leading-none mb-1">
                Generación de Nota Clínica
              </h3>
              <p className="text-xs text-gray-500">
                Permito que la IA redacte un borrador de la nota médica (SOAP) para el expediente, basándose en la transcripción.
              </p>
            </div>
          </label>

          <label className={cn(
            "flex items-start gap-4 p-5 border cursor-pointer transition-all duration-200",
            storageAccepted 
              ? "border-black bg-black/5 dark:border-white dark:bg-white/5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] -translate-y-1" 
              : "border-black/20 dark:border-white/20 hover:border-black/50 dark:hover:border-white/50 bg-white dark:bg-[#0a0a0a]"
          )}>
            <div className={cn(
              "w-6 h-6 shrink-0 mt-0.5 border flex items-center justify-center transition-colors",
              storageAccepted ? "bg-black border-black dark:bg-white dark:border-white" : "border-black/30 dark:border-white/30"
            )}>
              {storageAccepted && <Check className="w-4 h-4 text-white dark:text-black" strokeWidth={3} />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={storageAccepted}
              onChange={(e) => setStorageAccepted(e.target.checked)}
            />
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-widest text-black dark:text-white leading-none mb-1">
                Almacenamiento Seguro
              </h3>
              <p className="text-xs text-gray-500">
                Permito el almacenamiento encriptado temporal de estos datos generados por IA en mi expediente de salud.
              </p>
            </div>
          </label>

          <div className="flex items-start gap-3 p-4 mt-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-400 font-medium">
              Nota: Puedes ingresar a la consulta sin marcar estas opciones. Si no aceptas, el médico llevará a cabo la consulta sin asistencia de IA. Esta configuración solo aplica para esta cita.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "h-12 px-8 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest transition-all duration-300",
                "bg-black text-white dark:bg-white dark:text-black hover:bg-transparent hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white border-2 border-transparent disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Continuar a la sala
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
