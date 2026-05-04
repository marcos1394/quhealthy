"use client";

import React, { use } from "react";
import { Lock, FileText, Download, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePublicPrescription } from "@/hooks/usePublicPrescription";

// Next.js 15+ requiere desempaquetar 'params' con React.use()
export default function PublicPrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const appointmentId = Number(unwrappedParams.id);

  const { pin, setPin, isLoading, error, pdfUrl, verifyPinAndLoadPdf } = usePublicPrescription(appointmentId);

  // Manejador para forzar la descarga en móvil
  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Receta_Medica_${appointmentId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      
      {/* 🚀 ESTADO 1: Bóveda de Seguridad (Pidiendo PIN) */}
      {!pdfUrl ? (
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
            Receta Protegida
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
            Para proteger tu información médica, por favor ingresa los <strong>últimos 4 dígitos</strong> de tu número de celular.
          </p>

          <form onSubmit={verifyPinAndLoadPdf} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoFocus
                placeholder="Ej. 2930"
                value={pin}
                onChange={(e) => {
                  // Solo permitir números
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                }}
                className="h-16 text-center text-3xl tracking-[0.5em] font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 placeholder:text-slate-300 placeholder:font-normal"
              />
              {error && (
                <p className="text-sm text-red-500 font-medium text-center animate-in fade-in">
                  {error}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || pin.length !== 4}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-5 h-5 mr-2" />
              )}
              {isLoading ? "Verificando..." : "Desbloquear Receta"}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <p className="text-xs text-slate-400 font-medium">
              Plataforma tecnológica avalada por QuHealthy
            </p>
          </div>
        </div>
      ) : (
        
        /* 🚀 ESTADO 2: Receta Desbloqueada (Visor de PDF) */
        <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
          
          <div className="h-16 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Tu Receta Digital</h2>
            </div>
            
            <Button onClick={handleDownload} variant="outline" className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <Download className="w-4 h-4 mr-2" /> Guardar PDF
            </Button>
          </div>

          <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950">
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full border-0"
              title="Receta Médica"
            />
          </div>
        </div>
      )}
    </div>
  );
}
