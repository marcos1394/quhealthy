"use client";

import { useEffect } from "react";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

export default function StripeConnectCard() {
  const { status, isLoadingStatus, isRedirecting, fetchStatus, handleOnboarding } = useStripeConnect();

  // Cargamos el estado al montar el componente
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // UI: Estado de carga inicial (Skeleton)
  if (isLoadingStatus) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-3 w-32 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  // Determinamos el estado visual
  const isReady = status?.ready === true;
  
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-6 sm:flex sm:items-center sm:justify-between">
        
        {/* Información del Estado */}
        <div className="sm:flex sm:space-x-5">
          <div className="flex-shrink-0 mt-1">
            {isReady ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0 sm:pt-1 text-left">
            <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Cobros y Transferencias
              {isReady ? (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  Pendiente
                </span>
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              {isReady 
                ? "Tu cuenta bancaria está vinculada correctamente. Estás listo para recibir los pagos de tus pacientes directamente en tu cuenta."
                : "Para poder cobrar por tus consultas, necesitas vincular una cuenta bancaria y verificar tu identidad de forma segura con Stripe."}
            </p>
          </div>
        </div>

        {/* Botón de Acción */}
        <div className="mt-5 sm:mt-0 sm:ml-6 flex-shrink-0">
          <button
            onClick={handleOnboarding}
            disabled={isRedirecting}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isReady 
                ? "bg-gray-900 hover:bg-gray-800 focus:ring-gray-900" // Botón oscuro si ya está conectado (Ir al dashboard)
                : "bg-blue-600 hover:bg-blue-500 focus:ring-blue-600" // Botón azul para llamado a la acción principal
            } disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto`}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirigiendo...
              </>
            ) : isReady ? (
              <>
                Ver panel de Stripe
                <ExternalLink className="ml-2 -mr-0.5 h-4 w-4" />
              </>
            ) : (
              <>
                <CreditCard className="mr-2 -ml-0.5 h-4 w-4" />
                Vincular Cuenta Bancaria
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Banner inferior de seguridad (Trust Indicator) */}
      {!isReady && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start">
            🔐 Tus datos financieros están protegidos y procesados de forma segura por Stripe.
          </p>
        </div>
      )}
    </div>
  );
}