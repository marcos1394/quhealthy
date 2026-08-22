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
  User,
  Users,
  Check,
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
import { cn } from "@/lib/utils";

export interface ConsumerProfileDto {
  id: number;
  fullName: string;
  relation?: string;
  isPrimary?: boolean;
  avatarUrl?: string;
}

interface PatientDashboardHeaderProps {
  firstName: string;
  profiles: ConsumerProfileDto[];
  selectedProfileId: number | null;
  onProfileChange: (profileId: number) => void;
}

export function PatientDashboardHeader({
  firstName,
  profiles = [],
  selectedProfileId,
  onProfileChange,
}: PatientDashboardHeaderProps) {
  const t = useTranslations("PatientDashboard.Header");
  const router = useRouter();

  // Saludo dinámico según la hora del día
  const currentHour = new Date().getHours();
  const greetingKey =
    currentHour < 12
      ? "morning_greeting"
      : currentHour < 19
      ? "afternoon_greeting"
      : "evening_greeting";

  const selectedProfile =
    profiles.find((p) => p.id === selectedProfileId) ||
    profiles.find((p) => p.isPrimary) ||
    profiles[0];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-gray-800/80 font-sans transition-colors">
      {/* ── SALUDO Y SELECTOR DE PERFILES ───────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            {t(greetingKey, { name: firstName })}
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t("health_vault_secure")}</span>
          </div>
        </div>

        {/* Selector de Dependientes / Expediente Activo */}
        {profiles.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium">{t("profile_selector_title")}:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f0f] hover:bg-gray-50 dark:hover:bg-[#181818] text-gray-800 dark:text-gray-200 font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black">
                    {selectedProfile?.fullName ? selectedProfile.fullName.charAt(0).toUpperCase() : "P"}
                  </div>
                  <span className="truncate max-w-[160px]">
                    {selectedProfile?.fullName || firstName}
                  </span>
                  {selectedProfile?.isPrimary && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ({t("primary_profile")})
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
                  return (
                    <DropdownMenuItem
                      key={profile.id}
                      onClick={() => onProfileChange(profile.id)}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer",
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1c1c1c]"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                          {profile.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="truncate">{profile.fullName}</p>
                          <p className="text-[10px] text-gray-400 font-normal">
                            {profile.isPrimary ? t("primary_profile") : profile.relation || "Dependiente"}
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
                  className="p-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 cursor-pointer"
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
          className="h-11 px-4 sm:px-5 rounded-2xl border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs shadow-2xs transition-all gap-2 cursor-pointer"
        >
          <BrainCircuit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t("btn_copilot")}</span>
        </Button>

        <Button
          onClick={() => router.push("/discover")}
          className="h-11 px-5 sm:px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all gap-2 cursor-pointer border-0"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>{t("btn_book")}</span>
        </Button>
      </div>
    </div>
  );
}
