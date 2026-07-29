"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Settings2,
  CalendarDays,
  X,
  Copy,
  Zap,
  AlertTriangle,
  Sun,
  Calendar,
  Moon,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { useOperatingHours, UIDaySchedule } from "@/hooks/useOperatingHours";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface OperatingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  locationId: number;
}

const daysOfWeek = [
  { id: 1, key: "monday" },
  { id: 2, key: "tuesday" },
  { id: 3, key: "wednesday" },
  { id: 4, key: "thursday" },
  { id: 5, key: "friday" },
  { id: 6, key: "saturday" },
  { id: 0, key: "sunday" },
];

const scheduleTemplates = [
  {
    id: "standard",
    titleKey: "tmpl_standard_name",
    descKey: "tmpl_standard_desc",
    icon: Sun,
    apply: (s: UIDaySchedule[]) =>
      s.map((d) => ({
        ...d,
        isActive: d.dayOfWeek >= 1 && d.dayOfWeek <= 5,
        openTime: "09:00",
        closeTime: "18:00",
      })),
  },
  {
    id: "extended",
    titleKey: "tmpl_extended_name",
    descKey: "tmpl_extended_desc",
    icon: Zap,
    apply: (s: UIDaySchedule[]) =>
      s.map((d) => ({
        ...d,
        isActive: d.dayOfWeek >= 1 && d.dayOfWeek <= 6,
        openTime: "08:00",
        closeTime: "20:00",
      })),
  },
  {
    id: "allweek",
    titleKey: "tmpl_allweek_name",
    descKey: "tmpl_allweek_desc",
    icon: Calendar,
    apply: (s: UIDaySchedule[]) =>
      s.map((d) => ({
        ...d,
        isActive: true,
        openTime: "09:00",
        closeTime: "17:00",
      })),
  },
];

interface State {
  schedules: UIDaySchedule[];
  originalSchedules: UIDaySchedule[];
  savingStep: "idle" | "saving" | "success";
  validationErrors: Record<number, string>;
  copiedFromDay: number | null;
}

type Action =
  | { type: "SET_SCHEDULES"; payload: any }
  | { type: "SET_ORIGINALSCHEDULES"; payload: any }
  | { type: "SET_SAVINGSTEP"; payload: any }
  | { type: "SET_VALIDATIONERRORS"; payload: any }
  | { type: "SET_COPIEDFROMDAY"; payload: any };

function modalReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SCHEDULES":
      return {
        ...state,
        schedules:
          typeof action.payload === "function"
            ? action.payload(state.schedules)
            : action.payload,
      };
    case "SET_ORIGINALSCHEDULES":
      return {
        ...state,
        originalSchedules:
          typeof action.payload === "function"
            ? action.payload(state.originalSchedules)
            : action.payload,
      };
    case "SET_SAVINGSTEP":
      return {
        ...state,
        savingStep:
          typeof action.payload === "function"
            ? action.payload(state.savingStep)
            : action.payload,
      };
    case "SET_VALIDATIONERRORS":
      return {
        ...state,
        validationErrors:
          typeof action.payload === "function"
            ? action.payload(state.validationErrors)
            : action.payload,
      };
    case "SET_COPIEDFROMDAY":
      return {
        ...state,
        copiedFromDay:
          typeof action.payload === "function"
            ? action.payload(state.copiedFromDay)
            : action.payload,
      };
    default:
      return state;
  }
}

export const OperatingHoursModal: React.FC<OperatingHoursModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  locationId,
}) => {
  const t = useTranslations("DashboardOperatingHours");
  const { fetchSchedules, saveSchedules, isLoading, isSaving } =
    useOperatingHours();

  const [
    { schedules, originalSchedules, savingStep, validationErrors, copiedFromDay },
    dispatch,
  ] = useReducer(modalReducer, {
    schedules: [],
    originalSchedules: [],
    savingStep: "idle",
    validationErrors: {},
    copiedFromDay: null,
  });

  const setSchedules = (val: any) =>
    dispatch({ type: "SET_SCHEDULES", payload: val });
  const setOriginalSchedules = (val: any) =>
    dispatch({ type: "SET_ORIGINALSCHEDULES", payload: val });
  const setSavingStep = (val: any) =>
    dispatch({ type: "SET_SAVINGSTEP", payload: val });
  const setValidationErrors = (val: any) =>
    dispatch({ type: "SET_VALIDATIONERRORS", payload: val });
  const setCopiedFromDay = (val: any) =>
    dispatch({ type: "SET_COPIEDFROMDAY", payload: val });

  useEffect(() => {
    if (isOpen && locationId) {
      const loadData = async () => {
        const data = await fetchSchedules(locationId);
        const merged = daysOfWeek.map(
          (d) =>
            data.find((h) => h.dayOfWeek === d.id) || {
              dayOfWeek: d.id,
              isActive: false,
              openTime: "09:00",
              closeTime: "17:00",
            }
        );
        setSchedules(merged);
        setOriginalSchedules(merged);
        setSavingStep("idle");
        setValidationErrors({});
      };
      loadData();
    }
  }, [isOpen, fetchSchedules, locationId]);

  useEffect(() => {
    const errors: Record<number, string> = {};
    schedules.forEach((d) => {
      if (d.isActive) {
        const [oh, om] = d.openTime.split(":").map(Number);
        const [ch, cm] = d.closeTime.split(":").map(Number);
        if (ch * 60 + cm <= oh * 60 + om) {
          errors[d.dayOfWeek] = t("error_close_after_open");
        }
      }
    });
    setValidationErrors(errors);
  }, [schedules, t]);

  const handleChange = (
    dayId: number,
    field: keyof UIDaySchedule,
    value: string | boolean
  ) => {
    setSchedules((c: UIDaySchedule[]) =>
      c.map((d) => (d.dayOfWeek === dayId ? { ...d, [field]: value } : d))
    );
  };

  const handleCopy = (srcId: number) => {
    const src = schedules.find((s) => s.dayOfWeek === srcId);
    if (!src) return;
    setSchedules((c: UIDaySchedule[]) =>
      c.map((d) =>
        d.dayOfWeek !== srcId
          ? {
              ...d,
              openTime: src.openTime,
              closeTime: src.closeTime,
              isActive: src.isActive,
            }
          : d
      )
    );
    setCopiedFromDay(srcId);
    setTimeout(() => setCopiedFromDay(null), 2000);
    toast.success(t("copied_toast"));
  };

  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) return;
    setSavingStep("saving");
    const success = await saveSchedules(locationId, schedules);
    if (success) {
      setSavingStep("success");
      toast.success(t("save_success"));
      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1000);
    } else {
      setSavingStep("idle");
    }
  };

  const activeCount = schedules.filter((s) => s.isActive).length;
  const hasChanges =
    JSON.stringify(schedules) !== JSON.stringify(originalSchedules);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white sm:max-w-4xl p-0 overflow-hidden rounded-3xl shadow-2xl flex flex-col max-h-[90vh] font-sans transition-colors [&>button]:hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Clock className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t("subtitle")}
              </p>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("title")}
              </DialogTitle>
            </div>
          </div>

          {!isSaving && !isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* ── CUERPO O CARGANDO ─────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[350px] gap-3 bg-white dark:bg-[#0a0a0a]">
            <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-semibold text-gray-400">{t("loading")}</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
              {/* PLANTILLAS RÁPIDAS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("templates_label")}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {scheduleTemplates.map((tmpl) => {
                    const Icon = tmpl.icon;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setSchedules(tmpl.apply(schedules));
                          toast.success(
                            t("macro_applied", { name: t(tmpl.titleKey) })
                          );
                        }}
                        className="flex items-center gap-3 p-4 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:bg-white dark:hover:bg-[#111] hover:border-emerald-500/30 rounded-2xl transition-all duration-200 text-left shadow-2xs cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {t(tmpl.titleKey)}
                          </p>
                          <p className="text-[11px] font-mono font-medium text-gray-400 truncate">
                            {tmpl.descKey}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DÍAS Y HORARIOS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("your_week")}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-gray-400 bg-gray-50 dark:bg-[#050505] px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-800">
                    {t("timezone_prefix")}{" "}
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {schedules.map((day) => {
                    const info = daysOfWeek.find((d) => d.id === day.dayOfWeek);
                    const hasError = validationErrors[day.dayOfWeek];
                    const isCopied = copiedFromDay === day.dayOfWeek;

                    return (
                      <div
                        key={day.dayOfWeek}
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 sm:py-3.5 rounded-2xl border transition-all duration-200 shadow-2xs select-none",
                          day.isActive
                            ? "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800"
                            : "bg-gray-50/50 dark:bg-[#050505] border-gray-100 dark:border-gray-800/60 opacity-60",
                          isCopied
                            ? "border-emerald-500 ring-2 ring-emerald-500/20"
                            : ""
                        )}
                      >
                        {/* Switch y Día */}
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <Switch
                            checked={day.isActive}
                            onCheckedChange={(v) =>
                              handleChange(day.dayOfWeek, "isActive", v)
                            }
                          />
                          <span
                            className={cn(
                              "font-bold text-xs font-mono",
                              day.isActive
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-400"
                            )}
                          >
                            {info ? t(`days_short.${info.key}`) : ""}
                          </span>
                        </div>

                        {/* Entradas de Horario */}
                        <div className="flex flex-1 items-center justify-start sm:justify-end gap-2.5">
                          {day.isActive ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <div
                                className={cn(
                                  "relative rounded-xl overflow-hidden shadow-2xs border transition-colors",
                                  hasError
                                    ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20"
                                    : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]"
                                )}
                              >
                                <Input
                                  type="time"
                                  value={day.openTime}
                                  onChange={(e) =>
                                    handleChange(
                                      day.dayOfWeek,
                                      "openTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-[110px] h-9 border-0 bg-transparent text-xs font-mono font-bold text-center focus-visible:ring-0 text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert"
                                />
                              </div>

                              <span className="font-bold text-xs text-gray-400 font-mono">
                                {t("to")}
                              </span>

                              <div
                                className={cn(
                                  "relative rounded-xl overflow-hidden shadow-2xs border transition-colors",
                                  hasError
                                    ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20"
                                    : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]"
                                )}
                              >
                                <Input
                                  type="time"
                                  value={day.closeTime}
                                  onChange={(e) =>
                                    handleChange(
                                      day.dayOfWeek,
                                      "closeTime",
                                      e.target.value
                                    )
                                  }
                                  className="w-[110px] h-9 border-0 bg-transparent text-xs font-mono font-bold text-center focus-visible:ring-0 text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCopy(day.dayOfWeek)}
                                title={t("copy_all")}
                                className={cn(
                                  "h-9 w-9 rounded-xl flex items-center justify-center transition-all shrink-0 border cursor-pointer shadow-2xs",
                                  isCopied
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-500"
                                )}
                              >
                                {isCopied ? (
                                  <Check className="w-4 h-4" strokeWidth={2.5} />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400 h-9 px-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                              <Moon className="w-3.5 h-3.5" strokeWidth={2} />
                              <span className="text-xs font-semibold">
                                {t("closed")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Error de validación */}
                        {hasError && (
                          <div className="w-full sm:w-auto flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-3 py-1 shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                            <span>{hasError}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AVISO DE DÍAS CERO */}
              {activeCount === 0 && (
                <div className="p-4 border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 flex items-center gap-3 rounded-2xl shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={2} />
                  <p className="text-xs font-bold leading-relaxed">
                    {t("warning_no_days")}
                  </p>
                </div>
              )}
            </div>

            {/* ── FOOTER DE COMANDOS ────────────────────────────────────── */}
            <DialogFooter className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="w-full sm:w-auto text-left">
                {hasChanges && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <span>{t("unsaved_changes")}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving || isLoading}
                  className="w-full sm:w-auto h-11 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold rounded-xl shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {t("cancel")}
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={
                    isSaving ||
                    isLoading ||
                    Object.keys(validationErrors).length > 0 ||
                    !hasChanges
                  }
                  className={cn(
                    "w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                    savingStep === "success"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {savingStep === "saving" && (
                      <motion.div
                        key="s"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <QhSpinner size="sm" className="text-white" />
                        <span>{t("saving")}</span>
                      </motion.div>
                    )}
                    {savingStep === "success" && (
                      <motion.div
                        key="ok"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                        <span>{t("saved")}</span>
                      </motion.div>
                    )}
                    {savingStep === "idle" && (
                      <motion.div
                        key="i"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span>{t("save")}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};