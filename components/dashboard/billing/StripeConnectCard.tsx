"use client";

import { useStripeConnect } from "@/hooks/useStripeConnect";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Loader2, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function StripeConnectCard() {
  const { status, isLoadingStatus, isRedirecting, handleOnboarding } = useStripeConnect();
  const t = useTranslations('DashboardStripeConnect');

  // --- ESTADO 1: CARGANDO (BLUEPRINT) ---
  if (isLoadingStatus && !status) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col transition-colors">
        <div className="p-6 md:p-8 flex items-start gap-5 animate-pulse">
          <div className="w-14 h-14 border border-black dark:border-white bg-gray-100 dark:bg-gray-800 shrink-0" />
          <div className="space-y-4 flex-1 mt-2">
            <div className="h-4 w-48 bg-black dark:bg-white" />
            <div className="h-2 w-full max-w-md bg-gray-200 dark:bg-gray-800" />
            <div className="h-2 w-3/4 max-w-sm bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  const isReady = status?.ready === true;
  const isPending = status?.status === "PENDING" || (status && !status.ready);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col transition-colors">
        
        {/* CUERPO PRINCIPAL */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            
            <div className="flex items-start gap-5 flex-1">
              
              {/* ICONO DEL ESTADO (Caja Rígida) */}
              <div className={cn(
                "w-14 h-14 border border-black dark:border-white flex items-center justify-center shrink-0 transition-colors",
                isReady 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : isPending 
                    ? "bg-gray-100 dark:bg-[#111] text-black dark:text-white" 
                    : "bg-gray-50 dark:bg-[#050505] text-gray-400"
              )}>
                {isReady ? (
                  <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
                ) : isPending ? (
                  <AlertTriangle className="h-6 w-6 animate-pulse" strokeWidth={1.5} />
                ) : (
                  <AlertCircle className="h-6 w-6" strokeWidth={1.5} />
                )}
              </div>

              {/* CONTENIDO TEXTUAL */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold uppercase tracking-tight text-black dark:text-white">
                    {t('title', { defaultValue: 'MOTOR DE PAGOS' })}
                  </h3>
                  
                  {/* Etiqueta de Estado */}
                  <span className={cn(
                    "border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                    isReady ? "bg-black text-white dark:bg-white dark:text-black" : 
                    isPending ? "bg-white dark:bg-[#0a0a0a] text-black dark:text-white animate-pulse" : 
                    "bg-gray-50 dark:bg-[#050505] text-gray-500"
                  )}>
                    {isReady ? (
                      <><CheckCircle2 className="w-3 h-3" strokeWidth={2} />{t('badge_active', { defaultValue: 'OPERATIVO' })}</>
                    ) : isPending ? (
                      <><AlertTriangle className="w-3 h-3" strokeWidth={2} />{t('badge_pending', { defaultValue: 'ACCIÓN REQUERIDA' })}</>
                    ) : (
                      <>{t('badge_inactive', { defaultValue: 'INACTIVO' })}</>
                    )}
                  </span>
                </div>
                
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed max-w-xl">
                  {isReady
                    ? t('active_desc', { defaultValue: 'INFRAESTRUCTURA DE COBROS Y DEPÓSITOS EN FUNCIONAMIENTO.' })
                    : isPending
                      ? t('pending_desc', { defaultValue: 'STRIPE REQUIERE VALIDACIÓN DE IDENTIDAD O CLABE BANCARIA PARA HABILITAR LAS TRANSFERENCIAS.' })
                      : t('not_configured_desc', { defaultValue: 'VINCULE SU CUENTA BANCARIA PARA HABILITAR EL COBRO DE CONSULTAS Y RECEPCIÓN DE FONDOS.' })}
                </p>

                {/* Sub-estados de Stripe */}
                {isPending && status && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className={cn(
                      "text-[9px] uppercase font-bold tracking-widest px-2 py-1 border border-black dark:border-white",
                      status.charges_enabled ? "bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400" : "bg-white text-black dark:bg-[#0a0a0a] dark:text-white"
                    )}>
                      COBROS: {status.charges_enabled ? "HABILITADOS" : "PENDIENTES"}
                    </span>
                    <span className={cn(
                      "text-[9px] uppercase font-bold tracking-widest px-2 py-1 border border-black dark:border-white",
                      status.payouts_enabled ? "bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-400" : "bg-white text-black dark:bg-[#0a0a0a] dark:text-white"
                    )}>
                      DEPÓSITOS: {status.payouts_enabled ? "HABILITADOS" : "REQUIERE ACCIÓN"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* BOTÓN DE ACCIÓN */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <button 
                onClick={handleOnboarding} 
                disabled={isRedirecting}
                className={cn(
                  "w-full lg:w-auto h-14 px-8 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border border-black dark:border-white disabled:opacity-50",
                  isReady
                    ? "bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]"
                )}
              >
                {isRedirecting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />{t('processing', { defaultValue: 'CONECTANDO...' })}</>
                ) : isReady ? (
                  <>{t('manage', { defaultValue: 'GESTIONAR PORTAL' })}<ExternalLink className="h-4 w-4" strokeWidth={2} /></>
                ) : isPending ? (
                  <><AlertTriangle className="h-4 w-4" strokeWidth={2} />{t('complete_setup', { defaultValue: 'COMPLETAR REGISTRO' })}</>
                ) : (
                  <><CreditCard className="h-4 w-4" strokeWidth={2} />{t('connect_stripe', { defaultValue: 'CONECTAR STRIPE' })}</>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* PIE DE SEGURIDAD TÉCNICO */}
        {!isReady && (
          <div className="bg-gray-50 dark:bg-[#050505] p-4 border-t border-black dark:border-white flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <Shield className="h-3.5 w-3.5 text-black dark:text-white" strokeWidth={2} />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
              {t('security_footer', { defaultValue: 'TODA LA INFORMACIÓN BANCARIA ES CIFRADA Y GESTIONADA EXCLUSIVAMENTE POR STRIPE. QUHEALTHY NO ALMACENA DATOS SENSIBLES.' })}
            </p>
          </div>
        )}
        
      </div>
    </motion.div>
  );
}