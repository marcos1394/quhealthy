"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { User, CalendarCheck, Calendar, MapPin, FileText, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  t?: any;
  appointment: any;
  formattedDateTime: string;
}

export function AppointmentSummary({
  appointment,
  formattedDateTime,
}: Props) {
  const t = useTranslations("AppointmentConfirmation");

  const providerName = appointment?.providerNameSnapshot || t("default_provider");
  const serviceName = appointment?.serviceNameSnapshot || appointment?.serviceName || "";
  const durationText = appointment?.durationMinutes
    ? t("duration_min", { minutes: appointment.durationMinutes })
    : t("duration_standard");
  const modalityText =
    appointment?.type === "ONLINE" ? t("modality_online") : t("modality_presencial");

  const formattedPrice = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: appointment?.currency || "MXN",
  }).format(appointment?.totalPrice || appointment?.price || 0);

  return (
    <div className="space-y-4 font-sans">
      {/* ── HEADER DEL RESUMEN ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
          <FileText className="w-5 h-5" strokeWidth={2} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {t("cart_summary")}
        </h2>
      </div>

      {/* ── CONTENEDOR PRINCIPAL TIPO TARJETA ────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
        {/* GRID FILA 1: ESPECIALISTA Y SERVICIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
          {/* Especialista */}
          <div className="p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <User className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("label_provider")}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {providerName}
              </p>
              {appointment?.providerPhoneSnapshot && (
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 pt-0.5">
                  {t("label_phone")}: {appointment.providerPhoneSnapshot}
                </p>
              )}
            </div>
          </div>

          {/* Servicio */}
          <div className="p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <CalendarCheck className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("label_service")}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {serviceName}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5">
                {durationText} · {modalityText}
              </p>
            </div>
          </div>
        </div>

        {/* GRID FILA 2: FECHA Y UBICACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
          {/* Fecha */}
          <div className="p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("label_date")}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                {formattedDateTime}
              </p>
            </div>
          </div>

          {/* Ubicación */}
          <div className="p-6 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <MapPin className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("label_location")}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                {appointment?.type === "ONLINE"
                  ? t("location_online")
                  : appointment?.locationAddress || t("location_by_confirm")}
              </p>
            </div>
          </div>
        </div>

        {/* ── RESUMEN FINANCIERO & BADGE ESTADO ───────────────────────────── */}
        <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {t("label_price")}
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tracking-tight">
              {formattedPrice}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
            <span>{t("status_approved")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}