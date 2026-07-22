"use client"
/* eslint-disable react-doctor/button-has-type */;

import { useStripeConnect } from "@/hooks/useStripeConnect";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Loader2, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function StripeConnectCard() {
    const { status, isLoadingStatus, isRedirecting, handleOnboarding } = useStripeConnect();
    const t = useTranslations('DashboardStripeConnect');

    if (isLoadingStatus && !status) {
        return (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col transition-colors rounded-3xl shadow-sm">
                <div className="p-8 flex items-start gap-5 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] shrink-0" />
                    <div className="space-y-4 flex-1 mt-2">
                        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-2 w-full max-w-md rounded bg-gray-100 dark:bg-[#111]" />
                        <div className="h-2 w-3/4 max-w-sm rounded bg-gray-100 dark:bg-[#111]" />
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
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden">
                
                {/* CUERPO PRINCIPAL */}
                <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        
                        <div className="flex items-start gap-5 flex-1">
                            
                            {/* ICONO DEL ESTADO */}
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors border shadow-sm",
                                isReady 
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                                    : isPending 
                                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-500" 
                                    : "bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-gray-800 text-gray-500"
                            )}>
                                {isReady ? (
                                    <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
                                ) : isPending ? (
                                    <AlertTriangle className="h-6 w-6 animate-pulse" strokeWidth={2} />
                                ) : (
                                    <AlertCircle className="h-6 w-6" strokeWidth={2} />
                                )}
                            </div>

                            {/* CONTENIDO TEXTUAL */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-4 mb-2">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-0.5">
                                            Configuración Financiera
                                        </p>
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                            {t('title', { defaultValue: 'Motor de Pagos' })}
                                        </h3>
                                    </div>
                                    
                                    {/* Etiqueta de Estado */}
                                    <span className={cn(
                                        "px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 mt-2 sm:mt-0 shadow-sm border",
                                        isReady ? "bg-emerald-100 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50" : 
                                        isPending ? "bg-amber-100 text-amber-700 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" : 
                                        "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                    )}>
                                        {isReady ? (
                                            <><CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />{t('badge_active', { defaultValue: 'Operativo' })}</>
                                        ) : isPending ? (
                                            <><AlertTriangle className="w-3.5 h-3.5 animate-pulse" strokeWidth={2} />{t('badge_pending', { defaultValue: 'Acción Requerida' })}</>
                                        ) : (
                                            <>{t('badge_inactive', { defaultValue: 'Inactivo' })}</>
                                        )}
                                    </span>
                                </div>
                                
                                <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-xl">
                                    {isReady
                                        ? t('active_desc', { defaultValue: 'Infraestructura de cobros y depósitos en funcionamiento.' })
                                        : isPending
                                        ? t('pending_desc', { defaultValue: 'Stripe requiere validación de identidad o CLABE bancaria para habilitar las transferencias.' })
                                        : t('not_configured_desc', { defaultValue: 'Vincule su cuenta bancaria para habilitar el cobro de consultas y recepción de fondos.' })}
                                </p>

                                {/* Sub-estados de Stripe en Bloques */}
                                {isPending && status && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <span className={cn(
                                            "text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm",
                                            status.charges_enabled ? "bg-gray-50 border-gray-200 text-gray-600 dark:bg-[#111] dark:border-gray-800 dark:text-gray-400" : "bg-white border-gray-200 text-gray-900 dark:bg-[#0a0a0a] dark:border-gray-800 dark:text-white"
                                        )}>
                                            Cobros: {status.charges_enabled ? "Habilitados" : "Pendientes"}
                                        </span>
                                        <span className={cn(
                                            "text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm",
                                            status.payouts_enabled ? "bg-gray-50 border-gray-200 text-gray-600 dark:bg-[#111] dark:border-gray-800 dark:text-gray-400" : "bg-white border-gray-200 text-gray-900 dark:bg-[#0a0a0a] dark:border-gray-800 dark:text-white"
                                        )}>
                                            Depósitos: {status.payouts_enabled ? "Habilitados" : "Requiere Acción"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* BOTÓN DE ACCIÓN SÓLIDO */}
                        <div className="flex-shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                            <button 
                                onClick={handleOnboarding} 
                                disabled={isRedirecting}
                                className={cn(
                                    "w-full lg:w-auto h-12 px-6 flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed",
                                    isReady
                                        ? "bg-white text-gray-700 border border-gray-200 dark:bg-[#0a0a0a] dark:text-gray-300 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111]"
                                        : "bg-emerald-600 text-white hover:bg-emerald-700 border border-transparent"
                                )}
                            >
                                {isRedirecting ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />{t('processing', { defaultValue: 'Conectando...' })}</>
                                ) : isReady ? (
                                    <>{t('manage', { defaultValue: 'Gestionar Portal' })}<ExternalLink className="h-4 w-4" strokeWidth={2} /></>
                                ) : isPending ? (
                                    <><AlertTriangle className="h-4 w-4" strokeWidth={2} />{t('complete_setup', { defaultValue: 'Completar Registro' })}</>
                                ) : (
                                    <><CreditCard className="h-4 w-4" strokeWidth={2} />{t('connect_stripe', { defaultValue: 'Conectar Stripe' })}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PIE DE SEGURIDAD */}
                {!isReady && (
                    <div className="bg-gray-50/50 dark:bg-[#111]/30 p-5 border-t border-gray-100 dark:border-gray-800 flex items-start sm:items-center gap-4 shrink-0">
                        <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 shadow-sm">
                            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">
                            {t('security_footer', { defaultValue: 'Toda la información bancaria es cifrada y gestionada exclusivamente por Stripe. Quhealthy no almacena datos sensibles.' })}
                        </p>
                    </div>
                )}
                
            </div>
        </motion.div>
    );
}