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
    <div className="w-full relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-[#04150e] text-white rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col justify-center min-h-[260px] shadow-sm border border-emerald-800/40 font-sans transition-colors select-none">
      {appointment ? (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 h-full">
          <div className="space-y-5 flex-1 w-full">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full px-3.5 py-1 text-xs font-bold text-emerald-300 shadow-2xs">
              <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("next_badge")}</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight max-w-2xl text-white">
                {(() => {
                  const title =
                    appointment.serviceNameSnapshot || appointment.serviceName || "";
                  if (title === "IN_PERSON") return t("modality_in_person");
                  if (title === "ONLINE") return t("modality_online");
                  if (title === "HOME_VISIT") return t("modality_home");
                  return title || t("modality_in_person");
                })()}
              </h2>
              <p className="text-xs text-emerald-300/80 font-medium">
                {isOnline ? t("modality_online") : t("modality_in_person")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 border-t border-emerald-800/60 pt-5 w-full">
              {/* Doctor / Especialista */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl border border-emerald-700/50 flex items-center justify-center shrink-0 bg-emerald-950/60 overflow-hidden shadow-2xs">
                  {appointment.provider?.image ? (
                    <img
                      src={appointment.provider.image}
                      alt={appointment.providerNameSnapshot || t("specialist_default")}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                  )}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {appointment.providerNameSnapshot || t("specialist_default")}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-300/80 truncate">
                    {appointment.provider?.specialty || t("specialty_default")}
                  </p>
                </div>
              </div>

              {/* Fecha */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl border border-emerald-700/50 flex items-center justify-center shrink-0 bg-emerald-950/60 shadow-2xs text-emerald-400">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
                    {t("scheduled_date")}
                  </p>
                  <p className="text-xs font-bold font-mono text-white">
                    {format(new Date(appointment.startTime), "d MMM, yyyy", {
                      locale: dateLocale,
                    })}
                  </p>
                </div>
              </div>

              {/* Hora */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl border border-emerald-700/50 flex items-center justify-center shrink-0 bg-emerald-950/60 shadow-2xs text-emerald-400">
                  <Clock className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
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

          <div className="w-full lg:w-auto shrink-0 lg:pl-8 lg:border-l border-emerald-800/60 flex flex-col sm:flex-row lg:flex-col gap-2.5">
            {isOnline && appointment.meetLink && (
              <Button
                asChild
                className="h-11 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
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
              className="w-full lg:w-auto h-11 px-6 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <span>{t("btn_details")}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 w-full text-white">
          <div className="w-14 h-14 rounded-3xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shadow-2xs">
            <Search className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              {t("empty_title")}
            </h3>
            <p className="text-xs font-medium text-emerald-200/80 max-w-sm mx-auto leading-relaxed">
              {t("empty_desc")}
            </p>
          </div>
          <button
            type="button"
            onClick={onSearch}
            className="mt-2 h-11 px-6 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs transition-all shadow-xs cursor-pointer border-0"
          >
            {t("btn_search")}
          </button>
        </div>
      )}
    </div>
  );
}