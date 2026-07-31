"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import { useTranslations } from "next-intl";
import { User, HeartPulse, Sparkles } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionStore } from "@/stores/SessionStore";
import { ConsumerProfile } from "@/types/consumerProfile";

const SECTIONS = [
  { id: 0, value: "personal", titleKey: "section_personal", icon: User },
  { id: 1, value: "medical", titleKey: "section_medical", icon: HeartPulse },
  { id: 2, value: "preferences", titleKey: "section_preferences", icon: Sparkles },
];

function calculateProgress(form?: ConsumerProfile): number {
  if (!form) return 0;

  const checks = [
    // Sección 1: Identidad y Contacto (5 campos)
    !!form.fullName?.trim(),
    !!form.birthDate?.trim(),
    !!form.gender?.trim(),
    !!form.phoneNumber?.trim(),
    !!form.location?.trim(),
    // Sección 2: Expediente Clínico (3 campos)
    (form.medicalConditions?.length ?? 0) > 0,
    (form.allergies?.length ?? 0) > 0,
    (form.currentMedications?.length ?? 0) > 0,
    // Sección 3: Preferencias (2 campos)
    (form.healthGoals?.length ?? 0) > 0,
    !!form.preferredModality?.trim(),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

interface ProfileHeaderProps {
  currentSection: number;
  setCurrentSection: (id: number) => void;
  form: ConsumerProfile;
}

export function ProfileSidebar({
  currentSection,
  setCurrentSection,
  form,
}: ProfileHeaderProps) {
  const t = useTranslations("PatientProfile");
  const { user } = useSessionStore();

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const email = user?.email || "";
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
  const fullName =
    `${firstName} ${lastName}`.trim() || t("title");

  const progressPercentage = calculateProgress(form);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── TARJETA DE AVATAR Y USUARIO ──────────────────────────────── */}
      <div className="flex items-center gap-4">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={fullName}
            className="w-14 h-14 rounded-2xl object-cover border border-gray-200 dark:border-gray-800 shadow-2xs shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-0.5">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate">
            {fullName}
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 font-mono truncate">
            {email || t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── BARRA DE PROGRESO DE COMPLETITUD ─────────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-800 dark:text-gray-200">
            {t("progress")}
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {progressPercentage}%
          </span>
        </div>

        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-2xs">
          <div
            className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* ── PESTAÑAS DE NAVEGACIÓN ───────────────────────────────────── */}
      <Tabs
        value={SECTIONS[currentSection]?.value || "personal"}
        onValueChange={(value) => {
          const section = SECTIONS.find((s) => s.value === value);
          if (section) setCurrentSection(section.id);
        }}
        className="w-full pt-2"
      >
        <TabsList className="grid w-full grid-cols-3 bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 h-12 p-1 rounded-2xl">
          {SECTIONS.map((section) => (
            <TabsTrigger
              key={section.value}
              value={section.value}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-2xs text-gray-500 dark:text-gray-400 h-full rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <section.icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline truncate">
                {t(section.titleKey)}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}