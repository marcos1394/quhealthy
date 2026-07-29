"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  DollarSign,
  Clock,
  Check,
  Info,
  Sparkles,
  Calendar,
  MapPin,
  Sparkle,
} from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PreferenceCard } from "./PreferenceCard";

const languages = [
  { code: "es", label: "Español", flag: "🇲🇽", nativeName: "Español" },
  { code: "en", label: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "pt", label: "Português", flag: "🇧🇷", nativeName: "Português" },
  { code: "fr", label: "Français", flag: "🇫🇷", nativeName: "Français" },
];

const currencies = [
  { code: "MXN", label: "Peso Mexicano", symbol: "$", example: "1,234.56" },
  { code: "USD", label: "US Dollar", symbol: "$", example: "1,234.56" },
  { code: "EUR", label: "Euro", symbol: "€", example: "1.234,56" },
  { code: "BRL", label: "Real Brasileiro", symbol: "R$", example: "1.234,56" },
];

const timeFormats = [
  { code: "12", label: "12 horas (AM/PM)", example: "3:45 PM" },
  { code: "24", label: "24 horas (Militar)", example: "15:45" },
];

interface LanguageTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const LanguageTab: React.FC<LanguageTabProps> = ({
  preferences,
  setPreferences,
  editMode,
}) => {
  const t = useTranslations("DashboardSettings.language");
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const updatePref = (key: string, value: string) => {
    setPreferences((prev: any) => ({ ...prev, [key]: value }));

    setShowPreview(key);
    setTimeout(() => setShowPreview(null), 2000);
  };

  const getCurrentLanguage = () =>
    languages.find((l) => l.code === preferences.language);
  const getCurrentCurrency = () =>
    currencies.find((c) => c.code === preferences.currency);
  const getCurrentTimeFormat = () =>
    timeFormats.find((t) => t.code === preferences.timeFormat);

  const getCurrentTime = (format: string) => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: format === "12",
    };
    return now.toLocaleTimeString("es-MX", options);
  };

  return (
    <div className="space-y-6 font-sans transition-colors">
      {/* ── SECCIÓN 1: IDIOMA DE INTERFAZ ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreferenceCard
          icon={Globe}
          title={t("lang_title")}
          description={t("lang_desc")}
        >
          <div className="space-y-4 pt-1">
            {/* Selector de Idioma */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("current_lang")}
                </h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                  <Globe className="w-3 h-3" strokeWidth={2} />
                  <span>{getCurrentLanguage()?.nativeName}</span>
                </span>
              </div>

              <Select
                value={preferences.language}
                onValueChange={(val) => updatePref("language", val)}
                disabled={!editMode}
              >
                <SelectTrigger
                  className={cn(
                    "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white h-11 rounded-xl text-xs font-semibold focus:ring-emerald-500/20 shadow-2xs transition-all",
                    editMode ? "hover:border-emerald-500/40" : ""
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">
                      {getCurrentLanguage()?.flag}
                    </span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl font-sans">
                  {languages.map((l) => (
                    <SelectItem
                      key={l.code}
                      value={l.code}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <span className="text-base leading-none">{l.flag}</span>
                        <div className="flex flex-col text-left">
                          <span className="font-bold">{l.label}</span>
                          <span className="text-[11px] font-medium text-gray-400">
                            {l.nativeName}
                          </span>
                        </div>
                        {preferences.language === l.code && (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 ml-auto" strokeWidth={2.5} />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banner de Feedback de Cambio */}
            <AnimatePresence>
              {showPreview === "language" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-center gap-2.5 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {t("lang_updated", {
                      lang: getCurrentLanguage()?.label ?? "",
                    })}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nota Informativa */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-2xs">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                {t("lang_info")}
              </p>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* ── SECCIÓN 2: MONEDA PRINCIPAL ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PreferenceCard
          icon={DollarSign}
          title={t("currency_title")}
          description={t("currency_desc")}
        >
          <div className="space-y-4 pt-1">
            {/* Selector de Moneda */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("current_currency")}
                </h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                  <DollarSign className="w-3 h-3" strokeWidth={2} />
                  <span>{getCurrentCurrency()?.code}</span>
                </span>
              </div>

              <Select
                value={preferences.currency}
                onValueChange={(val) => updatePref("currency", val)}
                disabled={!editMode}
              >
                <SelectTrigger
                  className={cn(
                    "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white h-11 rounded-xl text-xs font-semibold focus:ring-emerald-500/20 shadow-2xs transition-all",
                    editMode ? "hover:border-emerald-500/40" : ""
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl font-sans">
                  {currencies.map((c) => (
                    <SelectItem
                      key={c.code}
                      value={c.code}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {c.symbol}
                        </div>
                        <div className="flex flex-col text-left flex-1">
                          <span className="font-bold">
                            {c.label} ({c.code})
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 font-mono">
                            Ejemplo: {c.symbol}
                            {c.example}
                          </span>
                        </div>
                        {preferences.currency === c.code && (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banner Feedback Moneda */}
            <AnimatePresence>
              {showPreview === "currency" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-center gap-2.5 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {t("currency_updated", {
                      currency: getCurrentCurrency()?.code ?? "",
                    })}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vista Previa de Precios */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("price_preview_title")}
                </p>
                <Sparkle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-[#0a0a0a] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1 shadow-2xs">
                  <p className="text-[11px] font-bold text-gray-400">
                    {t("consultation_label")}
                  </p>
                  <p className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                    {getCurrentCurrency()?.symbol}500.00
                  </p>
                </div>
                <div className="bg-white dark:bg-[#0a0a0a] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1 shadow-2xs">
                  <p className="text-[11px] font-bold text-gray-400">
                    {t("subscription_label")}
                  </p>
                  <p className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                    {getCurrentCurrency()?.symbol}1,250.00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* ── SECCIÓN 3: FORMATO DE HORA ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <PreferenceCard
          icon={Clock}
          title={t("time_title")}
          description={t("time_desc")}
        >
          <div className="space-y-4 pt-1">
            {/* Selector de Formato de Hora */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("current_time_format")}
                </h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs font-mono">
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  <span>{getCurrentTimeFormat()?.code}h</span>
                </span>
              </div>

              <Select
                value={preferences.timeFormat}
                onValueChange={(val) => updatePref("timeFormat", val)}
                disabled={!editMode}
              >
                <SelectTrigger
                  className={cn(
                    "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white h-11 rounded-xl text-xs font-semibold focus:ring-emerald-500/20 shadow-2xs transition-all",
                    editMode ? "hover:border-emerald-500/40" : ""
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl font-sans">
                  {timeFormats.map((tf) => (
                    <SelectItem
                      key={tf.code}
                      value={tf.code}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Clock className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div className="flex flex-col text-left flex-1">
                          <span className="font-bold">{tf.label}</span>
                          <span className="text-[11px] font-medium text-gray-400 font-mono">
                            Ejemplo: {tf.example}
                          </span>
                        </div>
                        {preferences.timeFormat === tf.code && (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banner Feedback Formato Hora */}
            <AnimatePresence>
              {showPreview === "timeFormat" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-3.5 flex items-center gap-2.5 shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {t("time_updated", {
                      format: getCurrentTimeFormat()?.label ?? "",
                    })}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vista Previa de Hora en Vivo */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("live_time_title")}</span>
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                  {t("live_badge")}
                </span>
              </div>
              <div className="text-center py-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 dark:text-white tabular-nums tracking-tight">
                  {getCurrentTime(preferences.timeFormat)}
                </p>
                <p className="text-[11px] font-semibold text-gray-400 mt-1">
                  Formato: {getCurrentTimeFormat()?.label}
                </p>
              </div>
            </div>

            {/* Información de Zona Horaria */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-2xs">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
              <div className="flex-1 space-y-0.5">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("timezone_title")}
                </p>
                <p className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
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