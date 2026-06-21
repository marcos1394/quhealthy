"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Loader2, Settings, Link as LinkIcon, CheckCircle, RefreshCcw, CalendarDays, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center">
      <QhSpinner size="md" />
      <p className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white mt-4 animate-pulse">{t('loading')}</p>
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
          ? t('toast_auth_failed', { defaultValue: "No pudimos conectar con Google. Verifica tus permisos y vuelve a intentarlo." })
          : t('toast_auth_error', { defaultValue: "Ocurrió un error al intentar vincular tu calendario." })
      );
      router.replace("/provider/dashboard/calendar", { scroll: false });
    } else if (status === "success") {
      toast.success(t('toast_auth_success', { defaultValue: "¡Calendario vinculado exitosamente!" }));
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
    <div className="space-y-10 pb-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10 max-w-7xl mx-auto px-4 md:px-0">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b-2 border-black dark:border-white">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="p-3 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
                <CalendarDays className="w-8 h-8" strokeWidth={2} />
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-black dark:text-white uppercase tracking-widest">{t('title')}</h1>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => setIsHoursModalOpen(true)} variant="outline"
              className="h-12 px-6 border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none font-bold text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-colors">
              <Clock className="w-4 h-4 mr-2" strokeWidth={2} />{t('operating_hours')}
            </Button>
            <Button onClick={() => setIsBlockModalOpen(true)}
              className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none font-bold text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] border-2 border-black dark:border-white transition-colors">
              <Plus className="w-4 h-4 mr-2" strokeWidth={2} />{t('block_time')}
            </Button>
          </div>
        </div>

        {/* Warning Banner if hours not configured */}
        <AnimatePresence>
          {hasConfiguredHours === false && (
            <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="border-2 border-red-600 dark:border-red-500 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-[4px_4px_0_0_#dc2626] rounded-none">
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-3 bg-red-600 text-white shrink-0 border-2 border-red-600 shadow-[2px_2px_0_0_#dc2626]">
                  <AlertCircle className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-red-600 dark:text-red-500 uppercase tracking-widest mb-1">
                    {t('missing_hours_title', { fallback: 'Configura tu Horario Laboral' })}
                  </h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">
                    {t('missing_hours_desc', { fallback: 'Los pacientes no podrán agendar citas contigo hasta que definas qué días y horas trabajas.' })}
                  </p>
                </div>
              </div>
              <div className="shrink-0 relative z-10 w-full md:w-auto">
                <Button onClick={() => setIsHoursModalOpen(true)}
                  className="w-full md:w-auto h-12 px-8 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-none shadow-[2px_2px_0_0_#dc2626] text-[10px] border-2 border-red-600 transition-colors">
                  <Clock className="w-4 h-4 mr-2" strokeWidth={2} />
                  {t('btn_configure_hours', { fallback: 'Configurar ahora' })}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Integration Banner */}
        <AnimatePresence>
          <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className={cn("border-2 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all rounded-none",
              isGoogleConnected
                ? "bg-white dark:bg-[#0a0a0a] border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
                : "bg-white dark:bg-[#0a0a0a] border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
            )}>
            <div className="flex items-center gap-5 relative z-10">
              <div className="p-3 bg-gray-50 dark:bg-[#111] shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] border-2 border-black dark:border-white shrink-0 flex items-center justify-center w-14 h-14">
                <svg className="w-8 h-8" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M3 10.5v27C3 41.085 5.915 44 9.5 44h29c3.585 0 6.5-2.915 6.5-6.5v-27H3z" />
                  <path fill="#1666D5" d="M3 10.5v12h42v-12H3z" />
                  <path fill="#E8EAED" d="M3 10.5h42V20H3z" />
                  <text x="24" y="34" fill="#1666D5" fontFamily="Arial" fontSize="16" fontWeight="bold" textAnchor="middle">31</text>
                  <path fill="#EA4335" d="M9.5 4h5v9h-5z" />
                  <path fill="#FBBC04" d="M33.5 4h5v9h-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-black dark:text-white flex flex-wrap items-center gap-3 mb-1 uppercase tracking-widest">
                  {t('sync_title')}
                  {isGoogleConnected ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-black dark:text-white bg-white dark:bg-[#0a0a0a] px-3 py-1 border-2 border-black dark:border-white">
                      <CheckCircle className="w-3 h-3" strokeWidth={2} />{t('sync_active')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-black dark:text-white bg-white dark:bg-[#0a0a0a] px-3 py-1 border-2 border-black dark:border-white animate-pulse">
                      <AlertCircle className="w-3 h-3" strokeWidth={2} />{t('sync_recommended')}
                    </span>
                  )}
                </h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                  {isGoogleConnected
                    ? t('sync_connected_desc')
                    : t('sync_disconnected_desc')}
                </p>
              </div>
            </div>
            <div className="shrink-0 relative z-10 w-full md:w-auto">
              {isCheckingGoogle ? (
                <div className="h-12 w-40 bg-black dark:bg-white animate-pulse border-2 border-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]" />
              ) : isGoogleConnected ? (
                <Button variant="outline" className="w-full md:w-auto h-12 px-6 border-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none font-bold uppercase tracking-widest text-[10px] shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] transition-colors">
                  <Settings className="w-4 h-4 mr-2" strokeWidth={2} />{t('settings')}
                </Button>
              ) : (
                <Button onClick={handleGoogleConnect}
                  className="w-full md:w-auto h-12 px-8 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold uppercase tracking-widest rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] text-[10px] border-2 border-black dark:border-white transition-colors">
                  <LinkIcon className="w-4 h-4 mr-2" strokeWidth={2} />{t('connect_google')}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Calendar Area */}
        <Card className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] overflow-hidden rounded-none">
          <CardContent className="p-0">
            <div className="h-[75vh] min-h-[700px] w-full relative">
              <CalendarView key={refreshKey} />
            </div>
          </CardContent>
        </Card>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: t('metrics.operating_hours'), value: t('metrics.configured'), icon: Clock },
            { label: t('metrics.sync'), value: isGoogleConnected ? t('metrics.real_time') : t('metrics.manual'), icon: RefreshCcw },
            { label: t('metrics.booking_engine'), value: t('metrics.active'), icon: Sparkles },
          ].map((metric, i) => (
            <div key={i} className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white rounded-none p-6 flex items-center gap-5 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-shadow">
              <div className="p-3 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black">
                <metric.icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{metric.label}</p>
                <p className="text-xl font-serif font-bold uppercase tracking-widest text-black dark:text-white">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modals */}
        <OperatingHoursModal isOpen={isHoursModalOpen} onClose={() => setIsHoursModalOpen(false)} onSaveSuccess={() => setRefreshKey(p => p + 1)} />
        <TimeBlockModal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)} onSaveSuccess={() => setRefreshKey(p => p + 1)} />
      </motion.div>
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