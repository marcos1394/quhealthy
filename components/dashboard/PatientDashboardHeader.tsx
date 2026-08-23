"use client";

/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CalendarPlus,
  BrainCircuit,
  ShieldCheck,
  ChevronDown,
  Users,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PulsoMascot } from "@/components/ai/PulsoMascot";
import { cn } from "@/lib/utils";

export interface ConsumerProfileDto {
  id: number;
  name?: string;
  fullName?: string;
  relation?: string;
  type?: string;
  isPrimary?: boolean;
  avatarUrl?: string;
}

interface PatientDashboardHeaderProps {
  firstName: string;
  profiles: ConsumerProfileDto[];
  selectedProfileId: number | null;
  onProfileChange: (profileId: number) => void;
}

const getProfileName = (profile?: ConsumerProfileDto, fallback = "Paciente"): string => {
  if (!profile) return fallback;
  return (profile.name || profile.fullName || fallback).trim();
};

const getProfileInitial = (profile?: ConsumerProfileDto, fallback = "P"): string => {
  const name = getProfileName(profile, fallback);
  return name.length > 0 ? name.charAt(0).toUpperCase() : fallback;
};

export function PatientDashboardHeader({
  firstName,
  profiles = [],
  selectedProfileId,
  onProfileChange,
}: PatientDashboardHeaderProps) {
  const t = useTranslations("PatientDashboard.Header");
  const router = useRouter();

  const currentHour = new Date().getHours();
  const greetingKey =
    currentHour < 12
      ? "morning_greeting"
      : currentHour < 19
      ? "afternoon_greeting"
      : "evening_greeting";

  const safeFirstName = firstName || "Paciente";

  const selectedProfile =
    profiles.find((p) => p.id === selectedProfileId) ||
    profiles.find((p) => p.isPrimary) ||
    profiles[0];

  const selectedDisplayName = getProfileName(selectedProfile, safeFirstName);
  const selectedInitial = getProfileInitial(selectedProfile, safeFirstName.charAt(0) || "P");

  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-transparent border border-emerald-100/80 dark:border-emerald-900/30 p-6 sm:p-7 backdrop-blur-xl shadow-2xs font-sans transition-all select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* ── SALUDO Y SELECTOR DE PERFILES ───────────────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {t(greetingKey, { name: safeFirstName })}
            </h1>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("health_vault_secure")}</span>
            </div>
          </div>

          {/* Selector de Dependientes / Expediente Activo */}
          {profiles && profiles.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                {t("profile_selector_title")}:
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white/90 dark:bg-[#0f0f0f]/90 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-gray-800 dark:text-gray-200 font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                      {selectedInitial}
                    </div>
                    <span className="truncate max-w-[160px]">
                      {selectedDisplayName}
                    </span>
                    {selectedProfile?.isPrimary && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                        {t("primary_profile")}
                      </span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-64 p-1.5 rounded-2xl bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-800 shadow-xl z-50"
                >
                  <DropdownMenuLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                    {t("profile_selector_title")}
                  </DropdownMenuLabel>

                  {profiles.map((profile) => {
                    const isSelected = profile.id === selectedProfile?.id;
                    const profileName = getProfileName(profile, safeFirstName);
                    const profileInitial = getProfileInitial(profile, "P");
                    const profileType = profile.isPrimary
                      ? t("primary_profile")
                      : profile.relation || profile.type || "Dependiente";

                    return (
                      <DropdownMenuItem
                        key={profile.id}
                        onClick={() => onProfileChange(profile.id)}
                        className={cn(
                          "flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1c1c1c]"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 border border-emerald-200 dark:border-emerald-800/60">
                            {profileInitial}
                          </div>
                          <div className="truncate">
                            <p className="truncate font-bold">{profileName}</p>
                            <p className="text-[10px] text-gray-400 font-normal">
                              {profileType}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />

                  <DropdownMenuItem
                    onClick={() => router.push("/patient/dashboard/family")}
                    className="p-2.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>{t("manage_family")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* ── ACCIONES RÁPIDAS PRINCIPALES ────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => router.push("/copilot")}
            variant="outline"
            className="h-12 px-5 rounded-2xl border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 dark:bg-[#0a0a0a]/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs shadow-xs hover:shadow-md transition-all gap-2.5 cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-full bg-[#5DCAA5]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PulsoMascot state="idle" size={20} />
            </div>
            <span>{t("btn_copilot")}</span>
          </Button>

          <Button
            onClick={() => router.push("/discover")}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all gap-2 cursor-pointer border-0"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>{t("btn_book")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
