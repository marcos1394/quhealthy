"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { AlertCircle, BarChart2, CheckCircle, Users, RefreshCw, Crown, Clock, Store, ArrowRight, CalendarDays, Video, MapPin, Check, FileSignature, Timer, PlayCircle, Activity, XCircle, CalendarCheck, UserCheck, PlusCircle, Calendar, MessageSquare, ShoppingBag, Wallet } from "lucide-react";
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
import { useProviderRole } from "@/hooks/useProviderRole";
import { useSessionStore } from "@/stores/SessionStore";

export default function DashboardPage() {
 const router = useRouter();
 const t = useTranslations('DashboardProviderHome');
 const locale = useLocale();
 const dateLocale = locale === 'es' ? es : enUS;
 const [dateRange, setDateRange] = useState("this_month");

 const { data, isLoading, refetch } = useDashboardData(dateRange);
 const { appointments: allAppointments } = useProviderAppointments();

 const { isStaff, roleLabel } = useProviderRole();
 const { user } = useSessionStore();

 // 🚀 ESTADO: ¿Necesita configurar su receta? (solo aplica a PROVIDER)
 const [needsPrescriptionSetup, setNeedsPrescriptionSetup] = useState(false);

 // 🚀 EFECTO: Verificar si ya tiene logo o color — omitir para STAFF
 useEffect(() => {
 if (isStaff) return; // Staff no tiene preferencias de receta propias
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
 }, [isStaff]);

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

  // ─── STAFF: Vista diferenciada ───────────────────────────────────────────
  if (isStaff) {
    const today = new Date().toDateString();
    const todayAppts = allAppointments
      .filter(a => new Date(a.startTime).toDateString() === today)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const upcomingStaffAppts = allAppointments
      .filter(a => new Date(a.startTime) >= new Date() && a.status !== 'CANCELED_BY_CONSUMER' && a.status !== 'CANCELED_BY_PROVIDER')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6);

    const staffActions = [
      { label: 'Nueva Cita', icon: PlusCircle, href: `/${locale}/provider/dashboard/appointments`, permission: 'APPOINTMENTS' },
      { label: 'Calendario', icon: Calendar, href: `/${locale}/provider/dashboard/calendar`, permission: 'CALENDAR' },
      { label: 'Pacientes', icon: UserCheck, href: `/${locale}/provider/dashboard/patients`, permission: 'PATIENTS' },
      { label: 'Órdenes', icon: ShoppingBag, href: `/${locale}/provider/dashboard/orders`, permission: 'ORDERS' },
      { label: 'Mensajes', icon: MessageSquare, href: `/${locale}/provider/dashboard/messages`, permission: 'MESSAGES' },
      { label: 'Caja', icon: Wallet, href: `/${locale}/provider/dashboard/cash-register`, permission: 'CASH_REGISTER' },
    ] as const;

    const getStatusBadgeStaff = (status: string) => {
      const base = "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-none";
      switch (status) {
        case 'CONFIRMED': case 'SCHEDULED': return <span className={cn(base, 'bg-[#166534] border-[#14532d] text-white')}><CheckCircle className="w-3 h-3" strokeWidth={1.5}/>CONFIRMADA</span>;
        case 'PENDING_PAYMENT': case 'PENDING': return <span className={cn(base, 'bg-[#b45309] border-[#78350f] text-white')}><Clock className="w-3 h-3" strokeWidth={1.5}/>PENDIENTE</span>;
        case 'IN_PROGRESS': return <span className={cn(base, 'bg-[#1e3a8a] border-[#1e3a8a] text-white animate-pulse')}><Activity className="w-3 h-3" strokeWidth={1.5}/>EN CURSO</span>;
        case 'COMPLETED': return <span className={cn(base, 'bg-gray-200 border-gray-300 text-black dark:bg-[#222] dark:border-gray-700 dark:text-white')}><Check className="w-3 h-3" strokeWidth={1.5}/>COMPLETADA</span>;
        default: return <span className={cn(base, 'bg-gray-100 border-gray-300 text-black dark:bg-[#111] dark:text-white')}>{status}</span>;
      }
    };

    return (
      <div className="space-y-8 pb-16 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">

        {/* HEADER */}
        <div className="pb-6 border-b border-black/20 dark:border-white/20">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">{roleLabel}</p>
          <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
            Bienvenida, {user?.firstName ?? 'equipo'}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
            AGENDA DEL DÍA · {new Date().toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
          </p>
        </div>

        {/* STATS RÁPIDOS: citas del día */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Citas hoy', value: todayAppts.length, icon: CalendarCheck },
            { label: 'Completadas', value: todayAppts.filter(a => a.status === 'COMPLETED').length, icon: Check },
            { label: 'Pendientes', value: todayAppts.filter(a => ['SCHEDULED','CONFIRMED','PENDING','PENDING_PAYMENT'].includes(a.status)).length, icon: Clock },
            { label: 'En curso', value: todayAppts.filter(a => a.status === 'IN_PROGRESS').length, icon: Activity },
          ].map(stat => (
            <div key={stat.label} className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-5 flex flex-col gap-3">
              <div className="w-9 h-9 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-black dark:text-white">{stat.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-5">Acceso Rápido</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {staffActions.map(action => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-3 p-4 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all group"
              >
                <action.icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-widest">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AGENDA DEL DÍA (próximas citas) */}
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <div className="p-6 border-b border-black dark:border-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Monitoreo en Tiempo Real</p>
                <h4 className="text-lg font-semibold tracking-tight uppercase text-black dark:text-white leading-none">AGENDA OPERATIVA (24H)</h4>
              </div>
            </div>
            <button
              onClick={() => router.push(`/${locale}/provider/dashboard/appointments`)}
              className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-black dark:border-white hover:opacity-50 transition-opacity pb-0.5 hidden sm:block"
            >
              VER AGENDA COMPLETA
            </button>
          </div>

          <div className="overflow-y-auto max-h-[400px] custom-scrollbar bg-gray-50 dark:bg-[#050505]">
            {upcomingStaffAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center min-h-[200px]">
                <CalendarDays className="w-8 h-8 text-gray-300 mb-4" strokeWidth={1.5} />
                <h4 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">AGENDA DESPEJADA</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs mx-auto leading-relaxed">
                  NO HAY CITAS PRÓXIMAS PROGRAMADAS.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/10 dark:divide-white/10">
                {upcomingStaffAppts.map(appt => {
                  const dateObj = new Date(appt.startTime);
                  const formattedDate = format(dateObj, locale === 'es' ? 'EEE d MMM' : 'EEE, MMM d', { locale: dateLocale });
                  const formattedTime = format(dateObj, 'HH:mm');
                  return (
                    <div
                      key={appt.id}
                      onClick={() => router.push(`/${locale}/provider/dashboard/appointments`)}
                      className="p-5 bg-white dark:bg-[#0a0a0a] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <p className="font-semibold text-sm uppercase tracking-widest">{appt.consumer.name}</p>
                          {getStatusBadgeStaff(appt.status)}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 mb-3">{appt.service.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                          <span className="flex items-center gap-1.5 border border-black/20 dark:border-white/20 px-2 py-1 bg-gray-50 dark:bg-[#050505] group-hover:border-white/30 group-hover:bg-transparent">
                            <Clock className="w-3 h-3" strokeWidth={1.5}/>
                            <span className="text-black dark:text-white group-hover:text-white dark:group-hover:text-black">{formattedDate} | {formattedTime}</span>
                          </span>
                          <span className="flex items-center gap-1.5 border border-black/20 dark:border-white/20 px-2 py-1 group-hover:border-white/30">
                            {appt.service.serviceDeliveryType === 'ONLINE' ? <Video className="w-3 h-3" strokeWidth={1.5}/> : <MapPin className="w-3 h-3" strokeWidth={1.5}/>}
                            {appt.service.serviceDeliveryType === 'ONLINE' ? 'TELEMEDICINA' : 'PRESENCIAL'}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 border border-black dark:border-white group-hover:border-white dark:group-hover:border-black px-5 h-10 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                        GESTIONAR <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  // ─── Fin vista STAFF ──────────────────────────────────────────────────────


 const getStatusBadge = (status: string) => {
 // Etiqueta Técnica Blueprint
 const baseClass = "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap shrink-0 flex items-center gap-1.5 rounded-none";
 
 switch (status) {
 case "CONFIRMED":
 case "SCHEDULED": 
 return <span className={cn(baseClass, "bg-[#166534] border-[#14532d] text-white")}>
 <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
 {t('status_confirmed', { defaultValue: 'CONFIRMADA' })}
 </span>;
 case "PENDING_PAYMENT": 
 case "PENDING":
 return <span className={cn(baseClass, "bg-[#b45309] border-[#78350f] text-white")}>
 <Clock className="w-3 h-3" strokeWidth={1.5} />
 {t('status_pending_payment', { defaultValue: 'PEND. PAGO' })}
 </span>;
 case "IN_PROGRESS": 
 return <span className={cn(baseClass, "bg-[#1e3a8a] border-[#1e3a8a] text-white animate-pulse")}>
 <Activity className="w-3 h-3" strokeWidth={1.5} />
 {t('status_in_progress', { defaultValue: 'EN CURSO' })}
 </span>;
 case "CANCELLED":
 case "CANCELED":
 return <span className={cn(baseClass, "bg-[#991b1b] border-[#7f1d1d] text-white")}>
 <XCircle className="w-3 h-3" strokeWidth={1.5} />
 {t('status_cancelled', { defaultValue: 'ANULADA' })}
 </span>;
 case "COMPLETED":
 return <span className={cn(baseClass, "bg-[#1e3a8a] border-[#1e3a8a] text-white")}>
 <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
 {t('status_completed', { defaultValue: 'COMPLETADA' })}
 </span>;
 default: 
 return <span className={cn(baseClass, "bg-gray-100 border-gray-300 text-black dark:bg-[#111] dark:border-gray-800 dark:text-white")}>
 <CalendarDays className="w-3 h-3" strokeWidth={1.5} />
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
 onClick={() => router.push(`/${locale}/provider/dashboard/settings#subscription`)}
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
 {(() => {
    // Preparar desglose (Breakdown)
    const totalRev = analytics.monthlyRevenue || 0;
    const formatCurrency = (val: number) => val.toLocaleString(locale === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'MXN' });
    const getPercent = (val: number) => totalRev > 0 ? Math.round((val / totalRev) * 100) + '%' : '0%';
    
    const breakdown = [];
    if (analytics.revenueByItemType) {
      if (analytics.revenueByItemType.SERVICE) breakdown.push({ label: t('revenue_appointments', { defaultValue: 'Citas' }), value: formatCurrency(analytics.revenueByItemType.SERVICE), percentage: getPercent(analytics.revenueByItemType.SERVICE) });
      if (analytics.revenueByItemType.PRODUCT) breakdown.push({ label: t('revenue_products', { defaultValue: 'Productos' }), value: formatCurrency(analytics.revenueByItemType.PRODUCT), percentage: getPercent(analytics.revenueByItemType.PRODUCT) });
      if (analytics.revenueByItemType.COURSE) breakdown.push({ label: t('revenue_courses', { defaultValue: 'Cursos' }), value: formatCurrency(analytics.revenueByItemType.COURSE), percentage: getPercent(analytics.revenueByItemType.COURSE) });
      if (analytics.revenueByItemType.PACKAGE) breakdown.push({ label: t('revenue_packages', { defaultValue: 'Paquetes' }), value: formatCurrency(analytics.revenueByItemType.PACKAGE), percentage: getPercent(analytics.revenueByItemType.PACKAGE) });
    }

    return (
      <SummaryCard 
        title={t('revenue_title', { defaultValue: 'Ingresos Brutos' })} 
        value={formatCurrency(totalRev)}
        icon={BarChart2} 
        trend={{ value: Math.abs(analytics.revenueGrowth || 0), isPositive: (analytics.revenueGrowth || 0) >= 0, period: t('previous_month', { defaultValue: 'mes anterior' }) }} 
        breakdown={breakdown}
      />
    );
  })()}
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
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

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