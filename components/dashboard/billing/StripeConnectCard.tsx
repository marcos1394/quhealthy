"use client";

import { useEffect } from "react";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

export default function StripeConnectCard() {
  const { status, isLoadingStatus, isRedirecting, fetchStatus, handleOnboarding } = useStripeConnect();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (isLoadingStatus) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-slate-100" />
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-slate-100" />
            <div className="h-3 w-32 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  const isReady = status?.ready === true;
  
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-6 sm:flex sm:items-center sm:justify-between">
        
        {/* Información del Estado */}
        <div className="sm:flex sm:space-x-5 items-center">
          <div className="flex-shrink-0 mt-1 sm:mt-0">
            {isReady ? (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
                <AlertCircle className="h-7 w-7 text-amber-500" />
              </div>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0 text-left">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Cobros y Transferencias
              </h3>
              {isReady ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  Pendiente
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              {isReady 
                ? "Tu cuenta bancaria está vinculada correctamente. Estás listo para recibir los pagos de tus consultas directamente en tu cuenta."
                : "Para poder cobrar por tus servicios, necesitas vincular una cuenta bancaria y verificar tu identidad de forma segura."}
            </p>
          </div>
        </div>

        {/* Botón de Acción */}
        <div className="mt-6 sm:mt-0 sm:ml-6 flex-shrink-0">
          <button
            onClick={handleOnboarding}
            disabled={isRedirecting}
            className={`inline-flex items-center justify-center w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isReady 
                ? "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-sky-700 focus:ring-slate-200" 
                : "bg-gradient-to-r from-sky-600 to-teal-600 text-white hover:from-sky-700 hover:to-teal-700 focus:ring-sky-600 border border-transparent hover:shadow-md"
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo...
              </>
            ) : isReady ? (
              <>
                Ver panel financiero
                <ExternalLink className="ml-2 -mr-1 h-4 w-4 text-slate-400" />
              </>
            ) : (
              <>
                <CreditCard className="mr-2 -ml-1 h-4 w-4" />
                Vincular Cuenta
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Footer de seguridad */}
      {!isReady && (
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100">
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start">
            <span className="mr-2">🔒</span> Tus datos están protegidos y encriptados por Stripe.
          </p>
        </div>
      )}
    </div>
  );
}