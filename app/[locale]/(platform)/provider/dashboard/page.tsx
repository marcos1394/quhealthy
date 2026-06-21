"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { AlertCircle, BarChart2, CheckCircle, Users, RefreshCw, Crown, Clock, Store, ArrowRight, CalendarDays, Video, MapPin, Check, FileSignature, Timer, PlayCircle } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { onboardingService } from "@/services/onboarding.service";

import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProviderReputationCard } from "@/components/dashboard/ProviderReputationCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProviderAppointments } from "@/hooks/useProviderAppointments";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations('DashboardProviderHome');
  const locale = useLocale();
  const dateLocale = locale === 'es' ? es : enUS;
  const [dateRange, setDateRange] = useState("this_month");

  const { data, isLoading, refetch } = useDashboardData(dateRange);
  const { appointments: allAppointments } = useProviderAppointments();

  // 🚀 ESTADO: ¿Necesita configurar su receta?
  const [needsPrescriptionSetup, setNeedsPrescriptionSetup] = useState(false);

  // 🚀 EFECTO: Verificar si ya tiene logo o color
  useEffect(() => {
    const checkPrescriptionSetup = async () => {
      try {
        const status = await onboardingService.getOnboardingStatus();
        if (
          (!status.prescriptionColor || status.prescriptionColor.toUpperCase() === '#8B5CF6' || status.prescriptionColor.toUpperCase() === '#10B981') &&
          !status.prescriptionLogoUrl
        ) {
          setNeedsPrescriptionSetup(true);
        }
      } catch (error) {
        console.error("Fallo de lectura en configuración de receta", error);
      }
    };
    checkPrescriptionSetup();
  }, []);

  // --- ESTADO 1: CARGANDO (BLUEPRINT) ---
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center bg-gray-50 dark:bg-[#050505] transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
        <QhSpinner size="lg" />
        <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
          {t('loading_title', { defaultValue: 'EXTRAYENDO TELEMETRÍA DEL SISTEMA...' })}
        </p>
      </div>
    );
  }

  // --- ESTADO 2: ERROR ---
  if (!data) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-6 bg-gray-50 dark:bg-[#050505] transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
        <div className="w-16 h-16 border border-red-500/50 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6 shrink-0">
          <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={1.5} />
        </div>
        <div className="space-y-4 max-w-md flex flex-col items-center">
          <h3 className="text-xl font-semibold uppercase tracking-tight text-black dark:text-white">
            {t('error_title', { defaultValue: 'ERROR DE CONEXIÓN' })}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
            {t('error_desc', { defaultValue: 'NO SE PUDO ESTABLECER CONEXIÓN CON EL SERVIDOR DE DATOS. COMPRUEBE SU RED Y REINTENTE.' })}
          </p>
          <Button 
            onClick={() => refetch()} 
            className="mt-4 rounded-none bg-black text-white dark:bg-white dark:text-black border-0 hover:bg-gray-800 dark:hover:bg-gray-200 h-14 px-10 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-3"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={1.5} />{t('error_retry', { defaultValue: 'REINTENTAR CONEXIÓN' })}
          </Button>
        </div>
      </div>
    );
  }

  const { plan, hasConfiguredStore, analytics, upcomingAppointments } = data;

  const getStatusBadge = (status: string) => {
    // Etiqueta Técnica Blueprint
    const baseClass = "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-none";
    
    switch (status) {
      case "SCHEDULED": 
        return <span className={cn(baseClass, "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400")}>
          <span className="w-1.5 h-1.5 bg-emerald-500 shrink-0" />
          {t('status_confirmed', { defaultValue: 'CONFIRMADA' })}
        </span>;
      case "PENDING_PAYMENT": 
        return <span className={cn(baseClass, "border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400")}>
          <span className="w-1.5 h-1.5 bg-amber-500 shrink-0" />
          {t('status_pending_payment', { defaultValue: 'PEND. PAGO' })}
        </span>;
      case "IN_PROGRESS": 
        return <span className={cn(baseClass, "border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 animate-pulse")}>
          <span className="w-1.5 h-1.5 bg-blue-500 shrink-0" />
          {t('status_in_progress', { defaultValue: 'EN CURSO' })}
        </span>;
      default: 
        return <span className={cn(baseClass, "border-gray-500/30 bg-gray-50/50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400")}>
          <span className="w-1.5 h-1.5 bg-gray-500 shrink-0" />
          {status}
        </span>;
    }
  };

  // 🚀 Lógica de métricas de tiempo promedio del día
  const todayCompletedAppointments = allAppointments.filter(appt => {
    const apptDate = new Date(appt.startTime).toDateString();
    const today = new Date().toDateString();
    return apptDate === today && (appt.status === "COMPLETED" || appt.status.toUpperCase() === "COMPLETED");
  });

  const getDiffMinutes = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return null;
    try {
      const cleanStart = startStr.replace(/\.\d+/, '');
      const cleanEnd = endStr.replace(/\.\d+/, '');
      const s = new Date(cleanStart).getTime();
      const e = new Date(cleanEnd).getTime();
      if (isNaN(s) || isNaN(e)) return null;
      const diff = Math.floor((e - s) / 60000);
      return diff > 0 ? diff : 0;
    } catch {
      return null;
    }
  };

  const waitTimes = todayCompletedAppointments.map(a => getDiffMinutes(a.arrivedAt, a.startedAt)).filter(v => v !== null) as number[];
  const avgWaitTime = waitTimes.length ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;

  const consultationTimes = todayCompletedAppointments.map(a => getDiffMinutes(a.startedAt, a.completedAt)).filter(v => v !== null) as number[];
  const avgConsultationTime = consultationTimes.length ? Math.round(consultationTimes.reduce((a, b) => a + b, 0) / consultationTimes.length) : 0;

  return (
    <div className="space-y-8 pb-16 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">

      {/* --- HEADER TÉCNICO & BANNER DE SUSCRIPCIÓN --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
            {t('welcome', { defaultValue: 'PANEL DE CONTROL GENERAL' })}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {t('welcome_desc', { defaultValue: 'TELEMETRÍA, CITAS Y GESTIÓN OPERATIVA.' })}
          </p>
        </div>
        
        {/* Etiqueta de Plan (Plana y Geométrica) */}
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 border bg-white dark:bg-[#0a0a0a] rounded-none",
          plan.status === "EXPIRED" ? "border-red-500/50" : "border-black/20 dark:border-white/20"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 border flex items-center justify-center shrink-0",
              plan.status === "EXPIRED" ? "border-red-500/30 bg-red-50 dark:bg-red-900/10" : "border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]"
            )}>
              <Crown className={cn("w-5 h-5", plan.status === "EXPIRED" ? "text-red-500" : "text-black dark:text-white")} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                PLAN: <span className="text-black dark:text-white">{plan.name}</span>
              </p>
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
                <span className={cn(plan.daysLeft <= 3 ? "text-red-500" : "text-gray-500")}>
                  {plan.daysLeft} {t('days_remaining', { defaultValue: 'DÍAS RESTANTES' })}
                </span>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/provider/settings/subscription")}
            className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-6 text-[9px] font-bold uppercase tracking-widest border-0 transition-colors w-full sm:w-auto"
          >
            {t('upgrade_plan', { defaultValue: 'ACTUALIZAR LICENCIA' })}
          </Button>
        </div>
      </div>

      {/* --- CTAS REQUERIDOS (ONBOARDING) --- */}
      <div className="space-y-0 border-t border-l border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
        <AnimatePresence>
          {needsPrescriptionSetup && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                    <FileSignature className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                      {t('setup_prescription_title', { fallback: 'MÓDULO DE RECETA INCOMPLETO' })}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                      {t('setup_prescription_desc', { fallback: 'Requiere configurar firma digital, logotipo y código cromático para emisión de documentos oficiales.' })}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push("/provider/settings/prescription")}
                  className="w-full md:w-auto shrink-0 bg-transparent text-black dark:text-white border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  {t('setup_prescription_cta', { fallback: 'INICIALIZAR CONFIGURACIÓN' })} <ArrowRight className="w-4 h-4 ml-3" strokeWidth={1.5} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!hasConfiguredStore && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                      {t('empty_store_title', { defaultValue: 'ESCAPARATE DIGITAL INACTIVO' })}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                      {t('empty_store_desc', { defaultValue: 'Su directorio público y catálogo de servicios aún no han sido configurados.' })}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push("/provider/store")}
                  className="w-full md:w-auto shrink-0 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-0 rounded-none h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  {t('setup_store', { defaultValue: 'HABILITAR ESCAPARATE' })} <ArrowRight className="w-4 h-4 ml-3" strokeWidth={1.5} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MÉTRICAS CLAVE Y TIEMPOS UNIFICADOS --- */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
        {/* KPI 1 */}
        <div className="col-span-2">
          <SummaryCard 
            title={t('revenue_title', { defaultValue: 'Ingresos Brutos' })} 
            value={analytics.monthlyRevenue.toLocaleString(locale === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'MXN' })}
            icon={BarChart2} 
            trend={{ value: Math.abs(analytics.revenueGrowth || 0), isPositive: (analytics.revenueGrowth || 0) >= 0, period: t('previous_month', { defaultValue: 'mes anterior' }) }} 
          />
        </div>

        {/* KPI 2 y 3 */}
        <div className="col-span-1">
          <SummaryCard 
            title={t('completed_appointments', { defaultValue: 'Citas' })} 
            value={analytics.completedAppointments.toString()}
            icon={CheckCircle} 
            trend={{ value: Math.abs(analytics.appointmentsGrowth || 0), isPositive: (analytics.appointmentsGrowth || 0) >= 0 }} 
          />
        </div>

        <div className="col-span-1">
          <SummaryCard 
            title={t('new_patients', { defaultValue: 'Pacientes' })} 
            value={analytics.newClients.toString()}
            icon={Users} 
            trend={{ value: Math.abs(analytics.clientsGrowth || 0), isPositive: (analytics.clientsGrowth || 0) >= 0 }} 
          />
        </div>

        {/* Tiempos (Dentro del mismo grid) */}
        <div className="col-span-1">
          <SummaryCard 
            title="T/P Espera"
            value={`${avgWaitTime} MIN`}
            icon={Timer} 
          />
        </div>

        <div className="col-span-1">
          <SummaryCard 
            title="T/P Consulta"
            value={`${avgConsultationTime} MIN`}
            icon={PlayCircle} 
          />
        </div>
      </div>

      {/* --- GRID PRINCIPAL: GRÁFICO & REPUTACIÓN --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Gráfico Financiero (Plano) */}
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-none">
          <div className="p-6 md:p-8 border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  Telemetría de Ingresos
                </p>
                <h4 className="text-lg font-semibold tracking-tight uppercase text-black dark:text-white leading-none">
                  {t('financial_summary', { defaultValue: 'HISTÓRICO FINANCIERO' })}
                </h4>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 dark:bg-[#050505]">
            <RevenueChart />
          </div>
        </div>

        {/* 🚀 TARJETA DE REPUTACIÓN DEL PROVEEDOR */}
        <ProviderReputationCard />

      </div>

      {/* --- PRÓXIMAS CITAS (AGENDA OPERATIVA) --- */}
      <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-none overflow-hidden">
        <div className="p-6 md:p-8 border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Monitoreo en Tiempo Real
              </p>
              <h4 className="text-lg font-semibold tracking-tight uppercase text-black dark:text-white leading-none">
                {t('upcoming_title', { defaultValue: 'AGENDA OPERATIVA (24H)' })}
              </h4>
            </div>
          </div>
          {upcomingAppointments.length > 0 && (
            <button 
              onClick={() => router.push("/provider/appointments")}
              className="hidden sm:block text-[9px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-black dark:border-white hover:opacity-50 transition-opacity pb-0.5"
            >
              {t('view_all', { defaultValue: 'VER AGENDA COMPLETA' })}
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px] bg-gray-50 dark:bg-[#050505]">
          {upcomingAppointments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center min-h-[250px]">
              <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
                <CalendarDays className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                {t('no_appointments_title', { defaultValue: 'AGENDA DESPEJADA' })}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs mx-auto leading-relaxed">
                {t('no_appointments_desc', { defaultValue: 'NO EXISTEN REGISTROS DE CONSULTA PROGRAMADOS A CORTO PLAZO.' })}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0 border-t border-black/10 dark:border-white/10">
              {upcomingAppointments.map((appt) => {
                const dateObj = parseISO(appt.startTime);
                const formattedDate = format(dateObj, locale === 'es' ? "EEE d MMM" : "EEE, MMM d", { locale: dateLocale });
                const formattedTime = format(dateObj, "HH:mm");
                return (
                  <div 
                    key={appt.id} 
                    onClick={() => {
                      if (appt.status === 'IN_PROGRESS') {
                        router.push(`/provider/consultation/${appt.id}`);
                      } else {
                        router.push('/provider/dashboard/appointments');
                      }
                    }}
                    className="p-6 bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-black/10 dark:border-white/10 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <p className="font-semibold text-sm uppercase tracking-widest">
                          {appt.consumerName}
                        </p>
                        {getStatusBadge(appt.status)}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 mb-4">
                        {appt.serviceName}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400">
                        <div className="flex items-center gap-2 border border-black/20 dark:border-white/20 group-hover:border-white/30 dark:group-hover:border-black/30 px-2 py-1 bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          <span className="text-black dark:text-white group-hover:text-white dark:group-hover:text-black">{formattedDate} | {formattedTime}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 border border-black/20 dark:border-white/20 group-hover:border-white/30 dark:group-hover:border-black/30">
                          {appt.modality === "ONLINE" ? <Video className="w-3 h-3" strokeWidth={1.5} /> : <MapPin className="w-3 h-3" strokeWidth={1.5} />}
                          <span>{appt.modality === "ONLINE" ? 'TELEMEDICINA' : 'PRESENCIAL'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0 sm:self-center border border-black dark:border-white group-hover:border-white dark:group-hover:border-black px-6 h-12 flex items-center justify-center">
                      <span className="inline-flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest">
                        GESTIONAR <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- FLOTADOR DE COMANDOS RÁPIDOS --- */}
      <QuickActions />
    </div>
  );
}