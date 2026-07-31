"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import {
  AlertCircle,
  BarChart2,
  CheckCircle,
  Users,
  RefreshCw,
  Crown,
  Clock,
  Store,
  ArrowRight,
  CalendarDays,
  Video,
  MapPin,
  Check,
  FileSignature,
  Timer,
  PlayCircle,
  Activity,
  XCircle,
  CalendarCheck,
  UserCheck,
  PlusCircle,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { onboardingService } from "@/services/onboarding.service";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProviderReputationCard } from "@/components/dashboard/ProviderReputationCard";
import { RetentionWidget } from "@/components/dashboard/RetentionWidget";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useProviderAppointments } from "@/hooks/useProviderAppointments";
import { cn } from "@/lib/utils";
import { useProviderRole } from "@/hooks/useProviderRole";
import { useSessionStore } from "@/stores/SessionStore";

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations("DashboardProviderHome");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;
  const [dateRange, setDateRange] = useState("this_month");

  const { data, visitsData, isLoading, refetch } = useDashboardData(dateRange);
  const { appointments: allAppointments } = useProviderAppointments();

  const { isStaff, roleLabel } = useProviderRole();
  const { user } = useSessionStore();

  // Estado: ¿Necesita configurar su receta? (solo aplica a PROVIDER)
  const [needsPrescriptionSetup, setNeedsPrescriptionSetup] = useState(false);

  // Verificar si ya tiene logo o color — omitir para STAFF
  useEffect(() => {
    if (isStaff) return;
    const checkPrescriptionSetup = async () => {
      try {
        const status = await onboardingService.getOnboardingStatus();
        if (
          (!status.prescriptionColor ||
            status.prescriptionColor.toUpperCase() === "#8B5CF6" ||
            status.prescriptionColor.toUpperCase() === "#10B981") &&
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

  // ─── ESTADO 1: CARGANDO ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center bg-gray-50/50 dark:bg-[#050505] transition-colors selection:bg-emerald-200 dark:selection:bg-emerald-900/30">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="mt-6 text-xs font-bold tracking-wider text-gray-500 animate-pulse uppercase">
          {t("loading_system", { defaultValue: "Preparando tu espacio de trabajo..." })}
        </p>
      </div>
    );
  }

  // ─── ESTADO 2: ERROR ───────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-6 bg-gray-50/50 dark:bg-[#050505] transition-colors selection:bg-emerald-200 dark:selection:bg-emerald-900/30">
        <div className="w-16 h-16 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center mb-6 shrink-0 shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500" strokeWidth={2} />
        </div>
        <div className="space-y-4 max-w-md flex flex-col items-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
            {t("error_title")}
          </h3>
          <p className="text-xs font-medium text-gray-500 leading-relaxed">
            {t("error_desc")}
          </p>
          <Button
            onClick={() => refetch()}
            className="mt-4 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-0 hover:bg-gray-800 dark:hover:bg-gray-200 h-11 px-8 text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
            <span>{t("error_retry")}</span>
          </Button>
        </div>
      </div>
    );
  }

  const { plan, hasConfiguredStore, analytics, upcomingAppointments } = data;

  // ─── VISTA PARA EQUIPO / STAFF ─────────────────────────────────────────
  if (isStaff) {
    const today = new Date().toDateString();
    const todayAppts = allAppointments
      .filter((a) => new Date(a.startTime).toDateString() === today)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    const upcomingStaffAppts = allAppointments
      .filter(
        (a) =>
          new Date(a.startTime) >= new Date() &&
          a.status !== "CANCELED_BY_CONSUMER" &&
          a.status !== "CANCELED_BY_PROVIDER"
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
      .slice(0, 6);

    const staffActions = [
      {
        label: "Nueva cita",
        icon: PlusCircle,
        href: `/${locale}/provider/dashboard/appointments`,
      },
      {
        label: "Calendario",
        icon: Calendar,
        href: `/${locale}/provider/dashboard/calendar`,
      },
      {
        label: "Pacientes",
        icon: UserCheck,
        href: `/${locale}/provider/dashboard/patients`,
      },
      {
        label: "Órdenes",
        icon: ShoppingBag,
        href: `/${locale}/provider/dashboard/orders`,
      },
      {
        label: "Mensajes",
        icon: MessageSquare,
        href: `/${locale}/provider/dashboard/messages`,
      },
      {
        label: "Caja",
        icon: Wallet,
        href: `/${locale}/provider/dashboard/cash-register`,
      },
    ] as const;

    const getStatusBadgeStaff = (status: string) => {
      const base =
        "px-2.5 py-0.5 text-[10px] font-bold shrink-0 flex items-center gap-1.5 rounded-full border";
      switch (status) {
        case "CONFIRMED":
        case "SCHEDULED":
          return (
            <span className={cn(base, "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40")}>
              <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("status_confirmed")}</span>
            </span>
          );
        case "PENDING_PAYMENT":
        case "PENDING":
          return (
            <span className={cn(base, "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40")}>
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("status_pending_payment")}</span>
            </span>
          );
        case "IN_PROGRESS":
          return (
            <span className={cn(base, "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40 animate-pulse")}>
              <Activity className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("status_in_progress")}</span>
            </span>
          );
        case "COMPLETED":
          return (
            <span className={cn(base, "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-800")}>
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("status_completed")}</span>
            </span>
          );
        default:
          return (
            <span className={cn(base, "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-800")}>
              {status}
            </span>
          );
      }
    };

    return (
      <div className="space-y-8 pb-24 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
        {/* HEADER STAFF */}
        <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            {roleLabel}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            Hola, {user?.firstName ?? "equipo"} 👋
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
            {t("operational_schedule")} ·{" "}
            {new Date().toLocaleDateString(
              locale === "es" ? "es-MX" : "en-US",
              { weekday: "long", day: "numeric", month: "long" }
            )}
          </p>
        </div>

        {/* STATS RÁPIDOS STAFF */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Citas hoy", value: todayAppts.length, icon: CalendarCheck },
            {
              label: "Completadas",
              value: todayAppts.filter((a) => a.status === "COMPLETED").length,
              icon: Check,
            },
            {
              label: "Pendientes",
              value: todayAppts.filter((a) =>
                ["SCHEDULED", "CONFIRMED", "PENDING", "PENDING_PAYMENT"].includes(
                  a.status
                )
              ).length,
              icon: Clock,
            },
            {
              label: "En curso",
              value: todayAppts.filter((a) => a.status === "IN_PROGRESS").length,
              icon: Activity,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 flex flex-col gap-3 rounded-3xl shadow-sm"
            >
              <div className="w-10 h-10 border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-2xl">
                <stat.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ACCIONES RÁPIDAS STAFF */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {t("quick_access")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {staffActions.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-all group"
              >
                <div className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-[#050505] flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-colors border border-gray-100 dark:border-gray-800">
                  <action.icon
                    className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                    strokeWidth={2}
                  />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AGENDA DEL DÍA STAFF */}
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#050505]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm shrink-0">
                <CalendarDays className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t("realtime_monitoring")}
                </p>
                <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  {t("operational_schedule")}
                </h4>
              </div>
            </div>
            <button
              onClick={() =>
                router.push(`/${locale}/provider/dashboard/appointments`)
              }
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors hidden sm:block"
            >
              {t("full_schedule")} &rarr;
            </button>
          </div>

          <div className="overflow-y-auto max-h-[400px] custom-scrollbar bg-white dark:bg-[#0a0a0a]">
            {upcomingStaffAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center min-h-[220px] gap-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 mb-1">
                  <CalendarDays className="w-6 h-6" strokeWidth={2} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("no_appointments_title")}
                </h4>
                <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
                  {t("no_appointments_desc")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {upcomingStaffAppts.map((appt) => {
                  const dateObj = new Date(appt.startTime);
                  const formattedDate = format(
                    dateObj,
                    locale === "es" ? "EEE d MMM" : "EEE, MMM d",
                    { locale: dateLocale }
                  );
                  const formattedTime = format(dateObj, "HH:mm");
                  return (
                    <div
                      key={appt.id}
                      onClick={() =>
                        router.push(`/${locale}/provider/dashboard/appointments`)
                      }
                      className="p-6 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-bold text-sm text-gray-900 dark:text-white">
                            {appt.consumer.name}
                          </p>
                          {getStatusBadgeStaff(appt.status)}
                        </div>
                        <p className="text-xs font-medium text-gray-500">
                          {appt.service.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1.5 bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-2.5 py-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                            <span>
                              {formattedDate} | {formattedTime}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-2.5 py-1">
                            {appt.service.serviceDeliveryType === "ONLINE" ? (
                              <Video className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                            )}
                            <span>
                              {appt.service.serviceDeliveryType === "ONLINE"
                                ? t("video_call")
                                : t("in_person")}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 sm:self-center">
                        <div className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:border-emerald-200 dark:group-hover:border-emerald-900/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-sm">
                          <ArrowRight className="w-4 h-4" strokeWidth={2} />
                        </div>
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

  // ─── HELPER BADGE ESTADOS PROVIDER ─────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const baseClass =
      "px-2.5 py-0.5 text-[10px] font-bold shrink-0 flex items-center gap-1.5 rounded-full border";

    switch (status) {
      case "CONFIRMED":
      case "SCHEDULED":
        return (
          <span className={cn(baseClass, "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40")}>
            <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_confirmed")}</span>
          </span>
        );
      case "PENDING_PAYMENT":
      case "PENDING":
        return (
          <span className={cn(baseClass, "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40")}>
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_pending_payment")}</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className={cn(baseClass, "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40 animate-pulse")}>
            <Activity className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_in_progress")}</span>
          </span>
        );
      case "CANCELLED":
      case "CANCELED":
        return (
          <span className={cn(baseClass, "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40")}>
            <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_cancelled")}</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className={cn(baseClass, "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-800")}>
            <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_completed")}</span>
          </span>
        );
      default:
        return (
          <span className={cn(baseClass, "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-800")}>
            <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{status}</span>
          </span>
        );
    }
  };

  // Cálculo de tiempos de espera y consulta
  const todayCompletedAppointments = allAppointments.filter((appt) => {
    const apptDate = new Date(appt.startTime).toDateString();
    const today = new Date().toDateString();
    return (
      apptDate === today &&
      (appt.status === "COMPLETED" || appt.status.toUpperCase() === "COMPLETED")
    );
  });

  const getDiffMinutes = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return null;
    try {
      const cleanStart = startStr.replace(/\.\d+/, "");
      const cleanEnd = endStr.replace(/\.\d+/, "");
      const s = new Date(cleanStart).getTime();
      const e = new Date(cleanEnd).getTime();
      if (isNaN(s) || isNaN(e)) return null;
      const diff = Math.floor((e - s) / 60000);
      return diff > 0 ? diff : 0;
    } catch {
      return null;
    }
  };

  const waitTimes = todayCompletedAppointments
    .map((a) => getDiffMinutes(a.arrivedAt, a.startedAt))
    .filter((v) => v !== null) as number[];
  const avgWaitTime = waitTimes.length
    ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
    : 0;

  const consultationTimes = todayCompletedAppointments
    .map((a) => getDiffMinutes(a.startedAt, a.completedAt))
    .filter((v) => v !== null) as number[];
  const avgConsultationTime = consultationTimes.length
    ? Math.round(consultationTimes.reduce((a, b) => a + b, 0) / consultationTimes.length)
    : 0;

  return (
    <div className="space-y-8 pb-24 font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── HEADER Y TARJETA DE PLAN ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1 leading-tight">
            {t("welcome")}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("welcome_desc")}
          </p>
        </div>

        {/* Banner de Suscripción */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 border bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm transition-all",
            plan.status === "EXPIRED"
              ? "border-rose-200 dark:border-rose-900/40"
              : "border-gray-100 dark:border-gray-800"
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                plan.status === "EXPIRED"
                  ? "border-rose-100 bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400"
                  : "border-emerald-100 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-400"
              )}
            >
              <Crown className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-0.5">
                Plan: <span className="text-gray-900 dark:text-white font-bold">{plan.name}</span>
              </p>
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                <span className={cn(plan.daysLeft <= 3 ? "text-rose-500 font-bold" : "text-gray-500 dark:text-gray-400")}>
                  {plan.daysLeft} {t("days_remaining")}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() =>
              router.push(`/${locale}/provider/dashboard/settings#subscription`)
            }
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white h-11 px-6 text-xs font-bold border-0 transition-all w-full sm:w-auto shadow-sm"
          >
            {t("upgrade_plan")}
          </Button>
        </div>
      </div>

      {/* ── AVISOS DE CONFIGURACIÓN (ONBOARDING CTAS) ───────────────────────── */}
      <div className="space-y-4">
        <AnimatePresence>
          {needsPrescriptionSetup && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="border border-amber-200/80 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 shadow-sm flex items-center justify-center shrink-0">
                    <FileSignature className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-0.5">
                      {t("setup_prescription_title")}
                    </h3>
                    <p className="text-xs font-medium text-amber-800/80 dark:text-amber-200/70 max-w-2xl leading-relaxed">
                      {t("setup_prescription_desc")}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/provider/settings/prescription")}
                  className="w-full md:w-auto shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0 rounded-xl h-11 px-6 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{t("setup_prescription_cta")}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!hasConfiguredStore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="border border-sky-200/80 bg-sky-50/60 dark:bg-sky-950/20 dark:border-sky-900/40 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-sky-200 dark:border-sky-900/40 text-sky-600 dark:text-sky-400 shadow-sm flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-sky-900 dark:text-sky-300 mb-0.5">
                      {t("empty_store_title")}
                    </h3>
                    <p className="text-xs font-medium text-sky-800/80 dark:text-sky-200/70 max-w-2xl leading-relaxed">
                      {t("empty_store_desc")}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/provider/store")}
                  className="w-full md:w-auto shrink-0 bg-sky-600 hover:bg-sky-700 text-white border-0 rounded-xl h-11 px-6 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{t("setup_store")}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MÉTRICAS Y TIEMPOS DE ATENCIÓN ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* KPI Ingresos */}
        <div className="col-span-2">
          {(() => {
            const totalRev = analytics.monthlyRevenue || 0;
            const formatCurrency = (val: number) =>
              val.toLocaleString(locale === "es" ? "es-MX" : "en-US", {
                style: "currency",
                currency: "MXN",
              });
            const getPercent = (val: number) =>
              totalRev > 0 ? Math.round((val / totalRev) * 100) + "%" : "0%";

            const breakdown = [];
            if (analytics.revenueByItemType) {
              if (analytics.revenueByItemType.SERVICE)
                breakdown.push({
                  label: t("revenue_appointments"),
                  value: formatCurrency(analytics.revenueByItemType.SERVICE),
                  percentage: getPercent(analytics.revenueByItemType.SERVICE),
                });
              if (analytics.revenueByItemType.PRODUCT)
                breakdown.push({
                  label: t("revenue_products"),
                  value: formatCurrency(analytics.revenueByItemType.PRODUCT),
                  percentage: getPercent(analytics.revenueByItemType.PRODUCT),
                });
              if (analytics.revenueByItemType.COURSE)
                breakdown.push({
                  label: t("revenue_courses"),
                  value: formatCurrency(analytics.revenueByItemType.COURSE),
                  percentage: getPercent(analytics.revenueByItemType.COURSE),
                });
              if (analytics.revenueByItemType.PACKAGE)
                breakdown.push({
                  label: t("revenue_packages"),
                  value: formatCurrency(analytics.revenueByItemType.PACKAGE),
                  percentage: getPercent(analytics.revenueByItemType.PACKAGE),
                });
            }

            return (
              <SummaryCard
                title={t("revenue_title")}
                value={formatCurrency(totalRev)}
                icon={BarChart2}
                trend={{
                  value: Math.abs(analytics.revenueGrowth || 0),
                  isPositive: (analytics.revenueGrowth || 0) >= 0,
                  period: t("previous_month"),
                }}
                breakdown={breakdown}
              />
            );
          })()}
        </div>

        {/* KPI Citas Completadas */}
        <div className="col-span-1">
          <SummaryCard
            title={t("completed_appointments")}
            value={analytics.completedAppointments.toString()}
            icon={CheckCircle}
            trend={{
              value: Math.abs(analytics.appointmentsGrowth || 0),
              isPositive: (analytics.appointmentsGrowth || 0) >= 0,
            }}
          />
        </div>

        {/* KPI Pacientes Nuevos */}
        <div className="col-span-1">
          <SummaryCard
            title={t("new_patients")}
            value={analytics.newClients.toString()}
            icon={Users}
            trend={{
              value: Math.abs(analytics.clientsGrowth || 0),
              isPositive: (analytics.clientsGrowth || 0) >= 0,
            }}
          />
        </div>

        {/* KPI Tiempo Promedio de Espera */}
        <div className="col-span-1">
          <SummaryCard
            title={t("wait_time_title")}
            value={`${avgWaitTime} MIN`}
            icon={Timer}
          />
        </div>

        {/* KPI Tiempo Promedio de Consulta */}
        <div className="col-span-1">
          <SummaryCard
            title={t("consultation_time_title")}
            value={`${avgConsultationTime} MIN`}
            icon={PlayCircle}
          />
        </div>
      </div>

      {/* ── GRÁFICO FINANCIERO Y TARJETA DE REPUTACIÓN ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Gráfico Financiero */}
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <BarChart2 className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t("revenue_telemetry")}
                </p>
                <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  {t("financial_summary")}
                </h4>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-[#0a0a0a] p-2">
            <RevenueChart />
          </div>
        </div>

        {/* Tarjeta de Reputación y Top Artículos */}
        <div className="flex flex-col gap-6">
          {analytics.topSellingItems && analytics.topSellingItems.length > 0 && (
            <div className="border border-emerald-200/50 bg-emerald-50/30 dark:bg-emerald-950/10 dark:border-emerald-900/30 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    Artículos más vendidos
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70">
                    Top 5 del mes
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {analytics.topSellingItems.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 text-gray-400 font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">
                          {item.type} • {item.quantity} ud.
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {item.revenue.toLocaleString(locale === "es" ? "es-MX" : "en-US", {
                          style: "currency",
                          currency: "MXN",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ProviderReputationCard />
          <RetentionWidget />
        </div>
      </div>

      {/* ── AGENDA DEL DÍA (PRÓXIMAS CITAS) ────────────────────────────────── */}
      <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <CalendarDays className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("realtime_monitoring")}
              </p>
              <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                {t("upcoming_title")}
              </h4>
            </div>
          </div>

          {upcomingAppointments.length > 0 && (
            <button
              onClick={() => router.push("/provider/appointments")}
              className="hidden sm:block text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
            >
              {t("view_all")} &rarr;
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px] bg-white dark:bg-[#0a0a0a]">
          {upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[220px] gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 mb-1">
                <CalendarDays className="w-6 h-6" strokeWidth={2} />
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("no_appointments_title")}
              </h4>
              <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
                {t("no_appointments_desc")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {upcomingAppointments.map((appt) => {
                const dateObj = parseISO(appt.startTime);
                const formattedDate = format(
                  dateObj,
                  locale === "es" ? "EEE d MMM" : "EEE, MMM d",
                  { locale: dateLocale }
                );
                const formattedTime = format(dateObj, "HH:mm");
                return (
                  <div
                    key={appt.id}
                    onClick={() => {
                      if (appt.status === "IN_PROGRESS") {
                        router.push(`/provider/consultation/${appt.id}`);
                      } else {
                        router.push("/provider/dashboard/appointments");
                      }
                    }}
                    className="p-6 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          {appt.consumerName}
                        </p>
                        {getStatusBadge(appt.status)}
                      </div>
                      <p className="text-xs font-medium text-gray-500">
                        {appt.serviceName}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5 bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-2.5 py-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                          <span>
                            {formattedDate} | {formattedTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-2.5 py-1">
                          {appt.modality === "ONLINE" ? (
                            <Video className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                          )}
                          <span>
                            {appt.modality === "ONLINE"
                              ? t("video_call")
                              : t("in_person")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 sm:self-center">
                      <div className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:border-emerald-200 dark:group-hover:border-emerald-900/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-sm">
                        <ArrowRight className="w-4 h-4" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MÉTRICAS DE VISITAS A LA TIENDA ────────────────────────────────── */}
      {visitsData && visitsData.visitsByDate && (
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden mt-8">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-sky-100 dark:border-sky-900/40 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-sm">
              <Store className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Rendimiento de Tienda
              </p>
              <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Tráfico y Demografía
              </h4>
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white dark:bg-[#0a0a0a]">
            {/* Total Visitas */}
            <div className="col-span-1 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm bg-gray-50/50 dark:bg-[#050505]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Visitas Totales
              </p>
              <p className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                {visitsData.visitsByDate.reduce((acc: number, item: any) => acc + (item.visits || 0), 0)}
              </p>
            </div>

            {/* Búsquedas Populares */}
            <div className="col-span-1 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm bg-gray-50/50 dark:bg-[#050505]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Términos Buscados
              </p>
              <div className="flex flex-wrap gap-2">
                {visitsData.topSearchQueries && visitsData.topSearchQueries.length > 0 ? (
                  visitsData.topSearchQueries.slice(0, 3).map((query: any, idx: number) => (
                    <span key={idx} className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md">
                      {query.query} ({query.count})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Sin datos</span>
                )}
              </div>
            </div>

            {/* Demografía: Edad */}
            <div className="col-span-1 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm bg-gray-50/50 dark:bg-[#050505]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Edades (Top 3)
              </p>
              <div className="space-y-2">
                {visitsData.demographicsAge ? (
                  Object.entries(visitsData.demographicsAge)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 3)
                    .map(([age, count], idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{age} años</span>
                        <span className="font-bold text-gray-900 dark:text-white">{count as number}</span>
                      </div>
                    ))
                ) : (
                  <span className="text-xs text-gray-500">Sin datos</span>
                )}
              </div>
            </div>

            {/* Demografía: Género */}
            <div className="col-span-1 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm bg-gray-50/50 dark:bg-[#050505]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Género
              </p>
              <div className="space-y-2">
                {visitsData.demographicsGender ? (
                  Object.entries(visitsData.demographicsGender)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 3)
                    .map(([gender, count], idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{gender}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{count as number}</span>
                      </div>
                    ))
                ) : (
                  <span className="text-xs text-gray-500">Sin datos</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flotador de Acciones Rápida */}
      <QuickActions />
    </div>
  );
}