"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import {
  Calendar,
  Clock,
  Search,
  ArrowRight,
  User,
  Video,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";

import { Appointment } from "@/types/appointments";

interface NextAppointmentHeroProps {
  appointment: Appointment | null;
  onNavigate: (id: number) => void;
  onSearch: () => void;
  locale?: string;
}

export function NextAppointmentHero({
  appointment,
  onNavigate,
  onSearch,
  locale = "es",
}: NextAppointmentHeroProps) {
  const t = useTranslations("PatientDashboard.Hero");
  const dateLocale = locale === "en" ? enUS : es;

  const isOnline =
    appointment?.appointmentType === "ONLINE" ||
    appointment?.serviceNameSnapshot?.toLowerCase().includes("online") ||
    appointment?.serviceNameSnapshot?.toLowerCase().includes("video");

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-[#062419] to-[#02130d] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-emerald-800/50 font-sans transition-all select-none">
      {/* ── Ambient Radial Glows ────────────────────────────────────── */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {appointment ? (
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 h-full">
          <div className="space-y-6 flex-1 w-full">
            {/* Top Badge & Modality */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 rounded-full px-3.5 py-1 text-xs font-bold text-emerald-300 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span>{t("next_badge")}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 text-xs font-medium text-emerald-100">
                {isOnline ? <Video className="w-3.5 h-3.5 text-emerald-300" /> : <MapPin className="w-3.5 h-3.5 text-emerald-300" />}
                <span>{isOnline ? t("modality_online") : t("modality_in_person")}</span>
              </div>
            </div>

            {/* Service Title */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight max-w-2xl text-white">
                {(() => {
                  const title =
                    appointment.serviceNameSnapshot || appointment.serviceName || "";
                  if (title === "IN_PERSON") return t("modality_in_person");
                  if (title === "ONLINE") return t("modality_online");
                  if (title === "HOME_VISIT") return t("modality_home");
                  return title || t("modality_in_person");
                })()}
              </h2>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 border-t border-emerald-800/60 pt-6 w-full">
              {/* Doctor / Especialista */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-2xl border-2 border-emerald-500/60 flex items-center justify-center shrink-0 bg-emerald-900/60 overflow-hidden shadow-md">
                  {appointment.provider?.image ? (
                    <img
                      src={appointment.provider.image}
                      alt={appointment.providerNameSnapshot || t("specialist_default")}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-emerald-300" strokeWidth={2} />
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-emerald-950 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-extrabold text-white truncate">
                    {appointment.providerNameSnapshot || t("specialist_default")}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-300/90 truncate">
                    {appointment.provider?.specialty || t("specialty_default")}
                  </p>
                </div>
              </div>

              {/* Fecha */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl border border-emerald-700/60 bg-emerald-900/40 flex items-center justify-center shrink-0 text-emerald-300 shadow-sm">
                  <Calendar className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                    {t("scheduled_date")}
                  </p>
                  <p className="text-xs font-bold font-mono text-white">
                    {format(new Date(appointment.startTime), "EEEE, d MMMM", {
                      locale: dateLocale,
                    })}
                  </p>
                </div>
              </div>

              {/* Hora */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl border border-emerald-700/60 bg-emerald-900/40 flex items-center justify-center shrink-0 text-emerald-300 shadow-sm">
                  <Clock className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
                    {t("scheduled_time")}
                  </p>
                  <p className="text-xs font-bold font-mono text-white">
                    {format(new Date(appointment.startTime), "HH:mm", {
                      locale: dateLocale,
                    })}{" "}
                    {t("hrs")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="relative z-10 w-full lg:w-auto shrink-0 lg:pl-8 lg:border-l border-emerald-800/60 flex flex-col sm:flex-row lg:flex-col gap-3">
            {isOnline && appointment.meetLink && (
              <Button
                asChild
                className="h-12 px-7 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-emerald-950 font-black text-xs shadow-lg shadow-emerald-400/30 hover:scale-102 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-0"
              >
                <a href={appointment.meetLink} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4" />
                  <span>{t("join_call")}</span>
                </a>
              </Button>
            )}

            <button
              type="button"
              onClick={() => onNavigate(appointment.id)}
              className="w-full lg:w-auto h-12 px-7 rounded-2xl bg-white/95 hover:bg-white text-emerald-950 font-extrabold text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border-0 hover:scale-102"
            >
              <span>{t("btn_details")}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center py-10 text-center space-y-5 w-full text-white">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-md">
            <Sparkles className="w-8 h-8" strokeWidth={2} />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {t("empty_title")}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-emerald-200/80 leading-relaxed">
              {t("empty_desc")}
            </p>
          </div>

          <button
            type="button"
            onClick={onSearch}
            className="h-12 px-7 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer border-0 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t("btn_search")}</span>
          </button>
        </div>
      )}
    </div>
  );
}