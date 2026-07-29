"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Building2,
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

import { appointmentService } from "@/services/appointment.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CheckinPage() {
  const t = useTranslations("ProviderCheckin");
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = Number(params?.id);
  const token = searchParams.get("token");

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(t("error_token_invalid"));
      setLoading(false);
      return;
    }

    const fetchAppointment = async () => {
      try {
        const data = await appointmentService.getAppointmentById(id);
        setAppointment(data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching appointment for check-in:", err);
        setError(t("error_fetch_appointment"));
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, token, t]);

  const handleConfirmCheckin = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      await appointmentService.processCheckIn(id, token);
      toast.success(t("toast_success"));
      router.push("/provider/dashboard");
    } catch (err: any) {
      console.error("Error processing check-in:", err);
      toast.error(
        err.response?.data?.message || t("toast_error")
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 text-center bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 mb-6 flex items-center justify-center border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <AlertTriangle className="w-8 h-8" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          {t("error_title")}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          {error}
        </p>
        <Button
          onClick={() => router.push("/provider/dashboard")}
          className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_return")}</span>
        </Button>
      </div>
    );
  }

  const startDate = new Date(appointment.startTime);
  const dateLocale = locale === "en" ? enUS : es;
  const formattedDate = format(startDate, "EEEE d 'de' MMMM", {
    locale: dateLocale,
  });
  const formattedTime = format(startDate, "h:mm a");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      {/* Header Sticky Glassmorphism */}
      <header className="sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/provider/dashboard")}
            className="flex items-center gap-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white text-xs font-bold h-9 px-3"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            <span>{t("header_cancel")}</span>
          </Button>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-3 py-1 rounded-full shadow-sm">
            <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("title")}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-10 sm:py-12 space-y-8">
        {/* Encabezado Principal */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
            <User className="h-8 w-8" strokeWidth={2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("welcome_title")}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            {t("welcome_subtitle")}
          </p>
        </div>

        {/* Tarjeta de Detalles de Cita */}
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-800 pb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("appointment_details", { id: appointment.id })}
            </span>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {appointment.status}
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t("label_patient")}
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {appointment.consumerName || t("fallback_patient")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50 dark:border-gray-800/50">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  {t("label_date")}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                  <Calendar
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2}
                  />
                  <span className="capitalize">{formattedDate}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  {t("label_time")}
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
                  <Clock
                    className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2}
                  />
                  <span>{formattedTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <Button
          onClick={handleConfirmCheckin}
          disabled={processing || appointment.status === "WAITING_ROOM"}
          className={cn(
            "w-full rounded-2xl h-12 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2",
            appointment.status === "WAITING_ROOM"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-default"
              : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          )}
        >
          {processing ? (
            <>
              <QhSpinner size="sm" />
              <span>{t("btn_confirming")}</span>
            </>
          ) : appointment.status === "WAITING_ROOM" ? (
            <>
              <CheckCircle2
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2}
              />
              <span>{t("btn_already_waiting")}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
              <span>{t("btn_confirm")}</span>
            </>
          )}
        </Button>
      </main>
    </div>
  );
}