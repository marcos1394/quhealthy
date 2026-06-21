"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Settings, Link as LinkIcon, CheckCircle2, RefreshCcw, CalendarDays, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { OperatingHoursModal } from "@/components/dashboard/OperatingHours";
import { TimeBlockModal } from "@/components/dashboard/TimeBlockModal";
import { useCalendarIntegration } from "@/hooks/useCalendarIntegration";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { QhSpinner } from '@/components/ui/QhSpinner';

function CalendarLoading() {
  const t = useTranslations('DashboardCalendar');
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors">
      <QhSpinner size="lg" className="text-black dark:text-white" />
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-6 animate-pulse">
        {t('loading', { defaultValue: 'SINCRONIZANDO AGENDA...' })}
      </p>
    </div>
  );
}

function CalendarContent() {
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasConfiguredHours, setHasConfiguredHours] = useState<boolean | null>(null);
  
  const { isGoogleConnected, isCheckingGoogle, handleGoogleConnect } = useCalendarIntegration();
  const { fetchSchedules } = useOperatingHours();
  const t = useTranslations('DashboardCalendar');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get("calendar_status");
    const code = searchParams.get("code");

    if (status === "error") {
      toast.error(
        code === "AUTH_FAILED" 
          ? t('toast_auth_failed', { defaultValue: "ERROR DE AUTENTICACIÓN: VERIFIQUE PERMISOS DE GOOGLE." })
          : t('toast_auth_error', { defaultValue: "ERROR AL VINCULAR PROTOCOLO DE CALENDARIO." })
      );
      router.replace("/provider/dashboard/calendar", { scroll: false });
    } else if (status === "success") {
      toast.success(t('toast_auth_success', { defaultValue: "VINCULACIÓN EXTERNA ESTABLECIDA." }));
      router.replace("/provider/dashboard/calendar", { scroll: false });
    }
  }, [searchParams, router, t]);

  useEffect(() => {
    const loadHours = async () => {
      const data = await fetchSchedules(1);
      setHasConfiguredHours(data.length > 0 && data.some(d => d.isActive));
    };
    loadHours();
  }, [fetchSchedules, refreshKey]);

  return (
    <div className="space-y-12 pb-16 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto space-y-12 px-6 md:px-10">

        {/* HEADER ARQUITECTÓNICO */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-black dark:border-white">
          <div className="space-y-3">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                <CalendarDays className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black dark:text-white">
                {t('title', { defaultValue: 'AGENDA OPERATIVA' })}
              </h1>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
              {t('subtitle', { defaultValue: 'CONTROL DE DISPONIBILIDAD Y BLOQUEOS HORARIOS.' })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setIsHoursModalOpen(true)}
              className="flex items-center justify-center gap-2 h-14 px-8 border border-black dark:border-white bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none font-bold text-[10px] uppercase tracking-widest transition-colors w-full sm:w-auto"
            >
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              {t('operating_hours', { defaultValue: 'MATRIZ HORARIA' })}
            </button>
            <button 
              onClick={() => setIsBlockModalOpen(true)}
              className="flex items-center justify-center gap-2 h-14 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none font-bold text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] border border-black dark:border-white transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              {t('block_time', { defaultValue: 'BLOQUEAR TURNO' })}
            </button>
          </div>
        </div>

        {/* ALERTA DE HORARIOS NO CONFIGURADOS */}
        <AnimatePresence>
          {hasConfiguredHours === false && (
            <motion.div 
              layout 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-red-500 bg-red-50 dark:bg-red-900/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors shadow-[8px_8px_0_0_#ef4444]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center shrink-0 border border-red-500">
                    <AlertCircle className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-2">
                      {t('missing_hours_title', { fallback: 'ESCAPARATE DESHABILITADO' })}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-2xl leading-relaxed">
                      {t('missing_hours_desc', { fallback: 'LA AGENDA PÚBLICA PERMANECERÁ BLOQUEADA HASTA ESTABLECER LA MATRIZ DE DISPONIBILIDAD OPERATIVA.' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHoursModalOpen(true)}
                  className="w-full md:w-auto h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-none shadow-[4px_4px_0_0_#b91c1c] text-[10px] border border-red-700 transition-colors shrink-0 flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" strokeWidth={1.5} />
                  {t('btn_configure_hours', { fallback: 'CONFIGURAR MATRIZ' })}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BANNER DE INTEGRACIÓN GOOGLE */}
        <AnimatePresence>
          <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <div className="border border-black dark:border-white p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] bg-white dark:bg-[#0a0a0a]">
              
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M3 10.5v27C3 41.085 5.915 44 9.5 44h29c3.585 0 6.5-2.915 6.5-6.5v-27H3z" />
                    <path fill="#1666D5" d="M3 10.5v12h42v-12H3z" />
                    <path fill="#E8EAED" d="M3 10.5h42V20H3z" />
                    <text x="24" y="34" fill="#1666D5" fontFamily="Arial" fontSize="16" fontWeight="bold" textAnchor="middle">31</text>
                    <path fill="#EA4335" d="M9.5 4h5v9h-5z" />
                    <path fill="#FBBC04" d="M33.5 4h5v9h-5z" />
                  </svg>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
                      {t('sync_title', { defaultValue: 'VÍNCULO GOOGLE CALENDAR' })}
                    </h3>
                    {isGoogleConnected ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-black dark:text-white bg-gray-50 dark:bg-[#050505] px-2 py-1 border border-black dark:border-white">
                        <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                        {t('sync_active', { defaultValue: 'SINCRONIZADO' })}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-black dark:text-white bg-gray-50 dark:bg-[#050505] px-2 py-1 border border-black dark:border-white">
                        <AlertCircle className="w-3 h-3" strokeWidth={2} />
                        {t('sync_recommended', { defaultValue: 'RECOMENDADO' })}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 max-w-2xl leading-relaxed">
                    {isGoogleConnected
                      ? t('sync_connected_desc', { defaultValue: 'LECTURA DE DISPONIBILIDAD EXTERNA ACTIVA PARA PREVENIR CONFLICTOS DE AGENDA.' })
                      : t('sync_disconnected_desc', { defaultValue: 'VINCULE SU CUENTA PARA BLOQUEAR AUTOMÁTICAMENTE HORARIOS OCUPADOS.' })}
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                {isCheckingGoogle ? (
                  <div className="h-12 w-48 bg-gray-100 dark:bg-gray-800 animate-pulse border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]" />
                ) : isGoogleConnected ? (
                  <button className="w-full md:w-auto flex items-center justify-center gap-2 h-12 px-8 border border-black dark:border-white text-black dark:text-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none font-bold uppercase tracking-widest text-[10px] transition-colors">
                    <Settings className="w-4 h-4" strokeWidth={1.5} />
                    {t('settings', { defaultValue: 'GESTIONAR VÍNCULO' })}
                  </button>
                ) : (
                  <button 
                    onClick={handleGoogleConnect}
                    className="w-full md:w-auto flex items-center justify-center gap-2 h-12 px-8 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold uppercase tracking-widest rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] text-[10px] border border-black dark:border-white transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" strokeWidth={1.5} />
                    {t('connect_google', { defaultValue: 'VINCULAR CUENTA' })}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ÁREA DEL CALENDARIO */}
        <div className="bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transition-colors">
          <div className="h-[80vh] min-h-[700px] w-full relative">
            <CalendarView key={refreshKey} />
          </div>
        </div>

        {/* MÉTRICAS DE ESTADO OPERATIVO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { label: t('metrics.operating_hours', { defaultValue: 'MATRIZ HORARIA' }), value: t('metrics.configured', { defaultValue: 'CONFIGURADA' }), icon: Clock },
            { label: t('metrics.sync', { defaultValue: 'SINCRONIZACIÓN' }), value: isGoogleConnected ? t('metrics.real_time', { defaultValue: 'TIEMPO REAL' }) : t('metrics.manual', { defaultValue: 'MANUAL' }), icon: RefreshCcw },
            { label: t('metrics.booking_engine', { defaultValue: 'MOTOR DE RESERVAS' }), value: t('metrics.active', { defaultValue: 'ACTIVO' }), icon: Sparkles },
          ].map((metric, i) => (
            <div key={i} className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none p-6 flex flex-col justify-between shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] dark:hover:shadow-[4px_4px_0_0_#fff] transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                  <metric.icon className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {metric.label}
                </span>
              </div>
              <p className="text-xl md:text-2xl font-black uppercase tracking-tighter text-black dark:text-white">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        {/* MODALES OPERATIVOS */}
        <OperatingHoursModal isOpen={isHoursModalOpen} onClose={() => setIsHoursModalOpen(false)} onSaveSuccess={() => setRefreshKey(p => p + 1)} />
        <TimeBlockModal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)} onSaveSuccess={() => setRefreshKey(p => p + 1)} />
      
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarContent />
    </Suspense>
  );
}