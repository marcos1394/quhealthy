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
      <div className="min-h-[70vh] flex flex-col justify-center items-center bg-white dark:bg-[#0a0a0a] transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
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
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-6 bg-white dark:bg-[#0a0a0a] transition-colors selection:bg-gray-200 dark:selection:bg-white/20">
        <div className="w-16 h-16 border-2 border-red-500 bg-red-50 dark:bg-red-900/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
        </div>
        <div className="space-y-4 max-w-md flex flex-col items-center">
          <h3 className="text-xl font-bold uppercase tracking-widest text-black dark:text-white">
            {t('error_title', { defaultValue: 'ERROR DE CONEXIÓN' })}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
            {t('error_desc', { defaultValue: 'NO SE PUDO ESTABLECER CONEXIÓN CON EL SERVIDOR DE DATOS. COMPRUEBE SU RED Y REINTENTE.' })}
          </p>
          <Button 
            onClick={() => refetch()} 
            className="mt-4 rounded-none bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-3" strokeWidth={2} />{t('error_retry', { defaultValue: 'REINTENTAR CONEXIÓN' })}
          </Button>
        </div>
      </div>
    );
  }

  const { plan, hasConfiguredStore, analytics, upcomingAppointments } = data;

  const getStatusBadge = (status: string) => {
    // Base brutalista pero con fondos de color
    const baseClass = "border border-black dark:border-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0";
    
    switch (status) {
      case "SCHEDULED": 
        return <span className={cn(baseClass, "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300")}>
          {t('status_confirmed', { defaultValue: 'Confirmada' })}
        </span>;
      case "PENDING_PAYMENT": 
        return <span className={cn(baseClass, "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300")}>
          {t('status_pending_payment', { defaultValue: 'Pendiente de pago' })}
        </span>;
      case "IN_PROGRESS": 
        return <span className={cn(baseClass, "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 animate-pulse")}>
          {t('status_in_progress', { defaultValue: 'En curso' })}
        </span>;
      default: 
        return <span className={cn(baseClass, "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400")}>
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
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-black dark:border-white">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black dark:text-white mb-2">
            {t('welcome', { defaultValue: 'PANEL DE CONTROL GENERAL' })}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            {t('welcome_desc', { defaultValue: 'TELEMETRÍA, CITAS Y GESTIÓN OPERATIVA.' })}
          </p>
        </div>
        
        {/* Etiqueta de Plan (Neo-Brutalista) */}
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transition-colors bg-white dark:bg-[#0a0a0a]",
          plan.status === "EXPIRED" ? "border-red-500" : "border-black dark:border-white"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 border flex items-center justify-center shrink-0",
              plan.status === "EXPIRED" ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-black dark:border-white bg-gray-50 dark:bg-[#050505]"
            )}>
              <Crown className={cn("w-5 h-5", plan.status === "EXPIRED" ? "text-red-500" : "text-black dark:text-white")} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-1">PLAN: {plan.name}</p>
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
                <Clock className="w-3 h-3 text-gray-400" strokeWidth={2} />
                <span className={cn(plan.daysLeft <= 3 ? "text-red-500" : "text-gray-500")}>
                  {plan.daysLeft} {t('days_remaining', { defaultValue: 'DÍAS RESTANTES' })}
                </span>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/provider/settings/subscription")}
            className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-10 px-4 text-[9px] font-bold uppercase tracking-widest border-0 transition-colors w-full sm:w-auto"
          >
            {t('upgrade_plan', { defaultValue: 'ACTUALIZAR LICENCIA' })}
          </Button>
        </div>
      </div>

      {/* --- CTAS REQUERIDOS (CONFIGURACIÓN) --- */}
      <div className="space-y-6">
        <AnimatePresence>
          {needsPrescriptionSetup && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                    <FileSignature className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                      {t('setup_prescription_title', { fallback: 'MÓDULO DE RECETA INCOMPLETO' })}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-2xl leading-relaxed">
                      {t('setup_prescription_desc', { fallback: 'REQUIERE CONFIGURAR FIRMA DIGITAL, LOGOTIPO Y CÓDIGO CROMÁTICO PARA EMISIÓN DE DOCUMENTOS OFICIALES.' })}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push("/provider/settings/prescription")}
                  className="w-full md:w-auto shrink-0 bg-transparent text-black dark:text-white border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  {t('setup_prescription_cta', { fallback: 'INICIALIZAR CONFIGURACIÓN' })} <ArrowRight className="w-4 h-4 ml-3" strokeWidth={2} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!hasConfiguredStore && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                      {t('empty_store_title', { defaultValue: 'ESCAPARATE DIGITAL INACTIVO' })}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-2xl leading-relaxed">
                      {t('empty_store_desc', { defaultValue: 'SU DIRECTORIO PÚBLICO Y CATÁLOGO DE SERVICIOS AÚN NO HAN SIDO CONFIGURADOS.' })}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push("/provider/store")}
                  className="w-full md:w-auto shrink-0 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border border-black dark:border-white rounded-none h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  {t('setup_store', { defaultValue: 'HABILITAR ESCAPARATE' })} <ArrowRight className="w-4 h-4 ml-3" strokeWidth={2} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MÉTRICAS CLAVE Y TIEMPOS UNIFICADOS --- */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6">
        {/* KPI 1 */}
        <div className="col-span-2 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            {t('revenue_title', { defaultValue: 'Ingresos Brutos' })}
          </p>
          <p className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white">
            {analytics.monthlyRevenue.toLocaleString(locale === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'MXN' })}
          </p>
          <p className={`text-xs font-bold mt-2 ${(analytics.revenueGrowth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {(analytics.revenueGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics.revenueGrowth || 0)}% vs mes anterior
          </p>
        </div>

        {/* KPI 2 y 3 */}
        <div className="col-span-1 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            {t('completed_appointments', { defaultValue: 'Citas' })}
          </p>
          <p className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white">
            {analytics.completedAppointments.toString()}
          </p>
          <p className={`text-xs font-bold mt-2 ${(analytics.appointmentsGrowth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {(analytics.appointmentsGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics.appointmentsGrowth || 0)}%
          </p>
        </div>

        <div className="col-span-1 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            {t('new_patients', { defaultValue: 'Pacientes' })}
          </p>
          <p className="text-3xl md:text-4xl font-black tracking-tight text-black dark:text-white">
            {analytics.newClients.toString()}
          </p>
          <p className={`text-xs font-bold mt-2 ${(analytics.clientsGrowth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {(analytics.clientsGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics.clientsGrowth || 0)}%
          </p>
        </div>

        {/* Tiempos (Dentro del mismo grid) */}
        <div className="col-span-1 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">T/P Espera</p>
          <p className="text-3xl font-black tracking-tight text-black dark:text-white">
            {avgWaitTime} <span className="text-sm font-bold text-gray-500">MIN</span>
          </p>
        </div>

        <div className="col-span-1 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">T/P Consulta</p>
          <p className="text-3xl font-black tracking-tight text-black dark:text-white">
            {avgConsultationTime} <span className="text-sm font-bold text-gray-500">MIN</span>
          </p>
        </div>
      </div>

      {/* --- GRID PRINCIPAL: GRÁFICO & REPUTACIÓN --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

        {/* Gráfico Financiero */}
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] min-h-[350px] flex flex-col transition-colors">
          <div className="p-6 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart2 className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                {t('financial_summary', { defaultValue: 'HISTÓRICO FINANCIERO' })}
              </h4>
            </div>
            <div className={cn(
              "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-black dark:border-white",
              (analytics.revenueGrowth || 0) >= 0 
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            )}>
              {(analytics.revenueGrowth || 0) > 0 ? '+' : ''}{analytics.revenueGrowth || 0}% TOP
            </div>
          </div>
          <div className="p-6 flex-1">
            <RevenueChart />
          </div>
        </div>

        {/* 🚀 TARJETA DE REPUTACIÓN DEL PROVEEDOR (Neo-Brutalista Integrada) */}
        <ProviderReputationCard />

      </div>

      {/* --- PRÓXIMAS CITAS (AGENDA OPERATIVA) --- */}
      <div className="border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-sm overflow-hidden">
        <div className="p-6 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              {t('upcoming_title', { defaultValue: 'AGENDA OPERATIVA (PRÓXIMAS 24H)' })}
            </h4>
          </div>
          {upcomingAppointments.length > 0 && (
            <button 
              onClick={() => router.push("/provider/appointments")}
              className="text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white border-b border-transparent hover:border-black dark:hover:border-white transition-colors pb-0.5"
            >
              {t('view_all', { defaultValue: 'VER AGENDA COMPLETA' })}
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
          {upcomingAppointments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center min-h-[250px] bg-gray-50 dark:bg-[#050505]">
              <div className="w-12 h-12 border border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center mb-4">
                <CalendarDays className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">
                {t('no_appointments_title', { defaultValue: 'AGENDA DESPEJADA' })}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 max-w-xs mx-auto leading-relaxed">
                {t('no_appointments_desc', { defaultValue: 'NO EXISTEN REGISTROS DE CONSULTA PROGRAMADOS A CORTO PLAZO.' })}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {upcomingAppointments.map((appt) => {
                const dateObj = parseISO(appt.startTime);
                const formattedDate = format(dateObj, locale === 'es' ? "EEE d 'de' MMM" : "EEE, MMM d", { locale: dateLocale });
                const formattedTime = format(dateObj, "HH:mm");
                return (
                  <div 
                    key={appt.id} 
                    onClick={() => router.push(`/provider/appointments/${appt.id}`)}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <p className="font-bold text-sm text-black dark:text-white">
                          {appt.consumerName}
                        </p>
                        {getStatusBadge(appt.status)}
                      </div>
                      <p className="text-xs font-medium text-gray-500 mb-3">
                        {appt.serviceName}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-gray-500">
                        <div className="flex items-center gap-1.5 border border-gray-300 dark:border-gray-700 px-2 py-0.5 rounded-sm bg-white dark:bg-[#0a0a0a]">
                          <Clock className="w-3 h-3" strokeWidth={2} />
                          <span className="text-black dark:text-white">{formattedDate} | {formattedTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {appt.modality === "ONLINE" ? <Video className="w-3.5 h-3.5" strokeWidth={2} /> : <MapPin className="w-3.5 h-3.5" strokeWidth={2} />}
                          <span>{appt.modality === "ONLINE" ? 'Telemedicina' : 'Presencial'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botón siempre visible pero que no ocupa espacio innecesario */}
                    <div className="shrink-0 self-end sm:self-center">
                      <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black dark:text-white group-hover:underline">
                        Gestionar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
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