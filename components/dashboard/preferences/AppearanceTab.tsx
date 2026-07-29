"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Eye,
  Sun,
  Monitor,
  Sparkles,
  Check,
  Info,
  Contrast,
  ToggleLeft,
  ShieldCheck,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PreferenceCard } from "./PreferenceCard";

interface AppearanceTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  preferences,
  setPreferences,
  editMode,
}) => {
  const t = useTranslations("DashboardSettings.appearance");
  const [previewTheme, setPreviewTheme] = useState(preferences.appearance.theme);
  const [showPreview, setShowPreview] = useState(false);

  // Sincronizar preview cuando cambian las preferencias externas
  useEffect(() => {
    setPreviewTheme(preferences.appearance.theme);
  }, [preferences.appearance.theme]);

  const updateAppearance = (key: string, value: any) => {
    setPreferences((prev: any) => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value },
    }));

    if (key === "theme") {
      setShowPreview(true);
      setTimeout(() => setShowPreview(false), 2000);
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return <Sun className="w-5 h-5 text-amber-500" strokeWidth={2} />;
      case "dark":
        return <Moon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
      case "system":
        return <Monitor className="w-5 h-5 text-blue-500" strokeWidth={2} />;
      default:
        return <Monitor className="w-5 h-5 text-gray-500" strokeWidth={2} />;
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "light":
        return "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40";
      case "dark":
        return "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40";
      case "system":
        return "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40";
      default:
        return "bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800";
    }
  };

  const getThemeNameLabel = (theme: string) => {
    switch (theme) {
      case "light":
        return t("theme_light");
      case "dark":
        return t("theme_dark");
      default:
        return t("theme_system");
    }
  };

  return (
    <div className="space-y-6 font-sans transition-colors">
      {/* ── SECCIÓN 1: TEMA DE INTERFAZ ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreferenceCard
          icon={Sun}
          title={t("theme_title")}
          description={t("theme_desc")}
        >
          <div className="space-y-5 pt-1">
            {/* Selector Dropdown con Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("color_mode")}
                </h4>
                {preferences.appearance.theme !== "system" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                    <Sparkles className="w-3 h-3" strokeWidth={2} />
                    <span>{t("custom_badge")}</span>
                  </span>
                )}
              </div>

              <Select
                value={preferences.appearance.theme}
                onValueChange={(val) => updateAppearance("theme", val)}
                disabled={!editMode}
              >
                <SelectTrigger
                  className={cn(
                    "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white h-11 rounded-xl text-xs font-semibold focus:ring-emerald-500/20 shadow-2xs transition-all",
                    editMode ? "hover:border-emerald-500/40" : ""
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {getThemeIcon(preferences.appearance.theme)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl font-sans">
                  <SelectItem value="light" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <Sun className="w-4 h-4 text-amber-500" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("theme_light")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("theme_light_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("theme_dark")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("theme_dark_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="system" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <Monitor className="w-4 h-4 text-blue-500" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("theme_system")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("theme_system_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tarjetas de Selección Visual */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["light", "dark", "system"].map((theme) => {
                const isSelected = preferences.appearance.theme === theme;
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => editMode && updateAppearance("theme", theme)}
                    disabled={!editMode}
                    className={cn(
                      "relative p-4 rounded-2xl border transition-all duration-200 select-none cursor-pointer flex flex-col items-center gap-2.5 shadow-2xs",
                      getThemeColor(theme),
                      isSelected
                        ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0a0a0a] border-emerald-500 font-bold"
                        : "opacity-70 hover:opacity-100",
                      !editMode ? "cursor-not-allowed opacity-50" : ""
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs">
                        <Check className="w-3 h-3" strokeWidth={2.5} />
                      </div>
                    )}

                    <div className="p-2 rounded-xl bg-white/80 dark:bg-[#0a0a0a]/80 border border-gray-100 dark:border-gray-800 shadow-2xs">
                      {getThemeIcon(theme)}
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {getThemeNameLabel(theme)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Banner de Feedback de Cambio de Tema */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-center gap-2.5 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {t("theme_updated", {
                      theme: getThemeNameLabel(previewTheme),
                    })}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* ── SECCIÓN 2: ACCESIBILIDAD Y CONFORT VISUAL ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PreferenceCard
          icon={Eye}
          title={t("accessibility_title")}
          description={t("accessibility_desc")}
        >
          <div className="space-y-6 pt-1">
            {/* Reducir Movimiento */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("reduce_motion")}
                    </p>
                    {preferences.appearance.reduceMotion && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                        {t("active_badge")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">
                    {t("reduce_motion_desc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.appearance.reduceMotion}
                  onCheckedChange={(val) =>
                    updateAppearance("reduceMotion", val)
                  }
                  disabled={!editMode}
                  className={cn(!editMode ? "opacity-50 cursor-not-allowed" : "")}
                />
              </div>

              {preferences.appearance.reduceMotion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-2xs"
                >
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {t("reduce_motion_info")}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Alto Contraste */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("high_contrast")}
                    </p>
                    {preferences.appearance.highContrast && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                        {t("active_badge")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">
                    {t("high_contrast_desc")}
                  </p>
                </div>
                <Switch
                  checked={preferences.appearance.highContrast}
                  onCheckedChange={(val) =>
                    updateAppearance("highContrast", val)
                  }
                  disabled={!editMode}
                  className={cn(!editMode ? "opacity-50 cursor-not-allowed" : "")}
                />
              </div>

              {preferences.appearance.highContrast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-2xs">
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      {t("high_contrast_info")}
                    </p>
                  </div>

                  {/* Vista Previa Comparativa de Contraste */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 space-y-1 shadow-2xs">
                      <p className="text-[11px] font-bold text-gray-400 uppercase">
                        {t("sample_normal_contrast")}
                      </p>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t("sample_text")}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-[#000000] border-2 border-gray-900 dark:border-white rounded-xl p-3.5 space-y-1 shadow-2xs">
                      <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase">
                        {t("sample_high_contrast")}
                      </p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("sample_text")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Badge Cumplimiento WCAG 2.1 AA */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3 shadow-2xs">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("wcag_title")}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {preferences.appearance.highContrast
                    ? t("wcag_enhanced")
                    : t("wcag_standard")}
                </p>
              </div>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* ── BANNER MODO SOLO LECTURA ────────────────────────────────────── */}
      {!editMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3 shadow-2xs"
        >
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
              {t("readonly_title")}
            </p>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400/80 leading-relaxed">
              {t("readonly_desc")}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};