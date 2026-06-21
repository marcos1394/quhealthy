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
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex flex-col transition-colors rounded-none">
        <div className="p-6 md:p-8 flex items-start gap-5 animate-pulse">
          <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0" />
          <div className="space-y-4 flex-1 mt-2">
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800" />
            <div className="h-2 w-full max-w-md bg-gray-100 dark:bg-[#111]" />
            <div className="h-2 w-3/4 max-w-sm bg-gray-100 dark:bg-[#111]" />
          </div>
        </div>
      </div>
    );
  }

  const isReady = status?.ready === true;
  const isPending = status?.status === "PENDING" || (status && !status.ready);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex flex-col transition-colors rounded-none">
        
        {/* CUERPO PRINCIPAL */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            
            <div className="flex items-start gap-5 flex-1">
              
              {/* ICONO DEL ESTADO TÉCNICO (Caja Rígida) */}
              <div className={cn(
                "w-14 h-14 border flex items-center justify-center shrink-0 transition-colors",
                isReady 
                  ? "border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white" 
                  : isPending 
                    ? "border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500" 
                    : "border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-gray-400"
              )}>
                {isReady ? (
                  <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
                ) : isPending ? (
                  <AlertTriangle className="h-6 w-6 animate-pulse" strokeWidth={1.5} />
                ) : (
                  <AlertCircle className="h-6 w-6" strokeWidth={1.5} />
                )}
              </div>

              {/* CONTENIDO TEXTUAL BLUEPRINT */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                      Configuración Financiera
                    </p>
                    <h3 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                      {t('title', { defaultValue: 'MOTOR DE PAGOS' })}
                    </h3>
                  </div>
                  
                  {/* Etiqueta de Estado Estricta */}
                  <span className={cn(
                    "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-2 sm:mt-0",
                    isReady ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400" : 
                    isPending ? "border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400" : 
                    "border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-gray-500"
                  )}>
                    {isReady ? (
                      <><CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />{t('badge_active', { defaultValue: 'OPERATIVO' })}</>
                    ) : isPending ? (
                      <><AlertTriangle className="w-3 h-3 animate-pulse" strokeWidth={1.5} />{t('badge_pending', { defaultValue: 'ACCIÓN REQUERIDA' })}</>
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

                {/* Sub-estados de Stripe en Bloques */}
                {isPending && status && (
                  <div className="flex flex-wrap gap-0 border border-black/20 dark:border-white/20 mt-5 w-fit">
                    <span className={cn(
                      "text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 border-r border-black/20 dark:border-white/20",
                      status.charges_enabled ? "bg-gray-50 dark:bg-[#050505] text-gray-500" : "bg-white dark:bg-[#0a0a0a] text-black dark:text-white"
                    )}>
                      COBROS: {status.charges_enabled ? "HABILITADOS" : "PENDIENTES"}
                    </span>
                    <span className={cn(
                      "text-[9px] uppercase font-bold tracking-widest px-3 py-1.5",
                      status.payouts_enabled ? "bg-gray-50 dark:bg-[#050505] text-gray-500" : "bg-white dark:bg-[#0a0a0a] text-black dark:text-white"
                    )}>
                      DEPÓSITOS: {status.payouts_enabled ? "HABILITADOS" : "REQUIERE ACCIÓN"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* BOTÓN DE ACCIÓN SÓLIDO */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <button 
                onClick={handleOnboarding} 
                disabled={isRedirecting}
                className={cn(
                  "w-full lg:w-auto h-14 px-8 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-colors border border-black dark:border-white disabled:opacity-50 rounded-none",
                  isReady
                    ? "bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-0"
                )}
              >
                {isRedirecting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />{t('processing', { defaultValue: 'CONECTANDO...' })}</>
                ) : isReady ? (
                  <>{t('manage', { defaultValue: 'GESTIONAR PORTAL' })}<ExternalLink className="h-4 w-4" strokeWidth={1.5} /></>
                ) : isPending ? (
                  <><AlertTriangle className="h-4 w-4" strokeWidth={1.5} />{t('complete_setup', { defaultValue: 'COMPLETAR REGISTRO' })}</>
                ) : (
                  <><CreditCard className="h-4 w-4" strokeWidth={1.5} />{t('connect_stripe', { defaultValue: 'CONECTAR STRIPE' })}</>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* PIE DE SEGURIDAD TÉCNICO */}
        {!isReady && (
          <div className="bg-gray-50 dark:bg-[#050505] p-5 border-t border-black/20 dark:border-white/20 flex items-start sm:items-center gap-4 shrink-0">
            <div className="w-8 h-8 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed pt-0.5 sm:pt-0">
              {t('security_footer', { defaultValue: 'TODA LA INFORMACIÓN BANCARIA ES CIFRADA Y GESTIONADA EXCLUSIVAMENTE POR STRIPE. QUHEALTHY NO ALMACENA DATOS SENSIBLES.' })}
            </p>
          </div>
        )}
        
      </div>
    </motion.div>
  );
}