"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Sparkles,
  AlertCircle,
  X,
  Coffee,
  Utensils,
  Plane,
  Sun,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useTimeBlock } from "@/hooks/useTimeBlock";
import { cn } from "@/lib/utils";

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialDate?: Date;
}

const blockTemplates = [
  { id: "lunch", titleKey: "tmpl_lunch", icon: Utensils, duration: 60 },
  { id: "break", titleKey: "tmpl_break", icon: Coffee, duration: 30 },
  { id: "vacation", titleKey: "tmpl_vacation", icon: Plane, duration: 480 },
  { id: "morning", titleKey: "tmpl_morning", icon: Sun, duration: 120 },
];

interface State {
  formData: {
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  };
  loading: boolean;
  savingStep: "idle" | "saving" | "success";
  validationError: string;
  duration: number;
  selectedTemplate: string | null;
}

type Action =
  | { type: "SET_FORMDATA"; payload: any }
  | { type: "SET_LOADING"; payload: any }
  | { type: "SET_SAVINGSTEP"; payload: any }
  | { type: "SET_VALIDATIONERROR"; payload: any }
  | { type: "SET_DURATION"; payload: any }
  | { type: "SET_SELECTEDTEMPLATE"; payload: any };

function modalReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FORMDATA":
      return {
        ...state,
        formData:
          typeof action.payload === "function"
            ? action.payload(state.formData)
            : action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading:
          typeof action.payload === "function"
            ? action.payload(state.loading)
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
    case "SET_VALIDATIONERROR":
      return {
        ...state,
        validationError:
          typeof action.payload === "function"
            ? action.payload(state.validationError)
            : action.payload,
      };
    case "SET_DURATION":
      return {
        ...state,
        duration:
          typeof action.payload === "function"
            ? action.payload(state.duration)
            : action.payload,
      };
    case "SET_SELECTEDTEMPLATE":
      return {
        ...state,
        selectedTemplate:
          typeof action.payload === "function"
            ? action.payload(state.selectedTemplate)
            : action.payload,
      };
    default:
      return state;
  }
}

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialDate,
}) => {
  const t = useTranslations("DashboardTimeBlock");
  const { createBlock } = useTimeBlock();

  const [
    { formData, loading, savingStep, validationError, selectedTemplate },
    dispatch,
  ] = useReducer(modalReducer, {
    formData: {
      title: t("tmpl_break"),
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    },
    loading: false,
    savingStep: "idle",
    validationError: "",
    duration: 0,
    selectedTemplate: null,
  });

  const setFormData = (val: any) => dispatch({ type: "SET_FORMDATA", payload: val });
  const setSavingStep = (val: any) => dispatch({ type: "SET_SAVINGSTEP", payload: val });
  const setValidationError = (val: any) =>
    dispatch({ type: "SET_VALIDATIONERROR", payload: val });
  const setDuration = (val: any) => dispatch({ type: "SET_DURATION", payload: val });
  const setSelectedTemplate = (val: any) =>
    dispatch({ type: "SET_SELECTEDTEMPLATE", payload: val });

  useEffect(() => {
    if (isOpen) {
      const today = initialDate || new Date();
      const offset = today.getTimezoneOffset() * 60000;
      const localISO = new Date(today.getTime() - offset)
        .toISOString()
        .split("T")[0];
      setFormData({
        title: t("tmpl_break"),
        startDate: localISO,
        startTime: "12:00",
        endDate: localISO,
        endTime: "13:00",
      });
      setSavingStep("idle");
      setValidationError("");
      setSelectedTemplate(null);
    }
  }, [isOpen, initialDate, t]);

  useEffect(() => {
    if (
      formData.startDate &&
      formData.startTime &&
      formData.endDate &&
      formData.endTime
    ) {
      const s = new Date(`${formData.startDate}T${formData.startTime}`);
      const e = new Date(`${formData.endDate}T${formData.endTime}`);
      const diffMins = Math.floor((e.getTime() - s.getTime()) / 60000);
      setDuration(diffMins);
      setValidationError(
        diffMins <= 0 ? t("end_after_start") : ""
      );
    }
  }, [formData, t]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev: any) => {
      const next = { ...prev, [name]: value };

      if (name === "startDate" || name === "startTime") {
        if (
          prev.startDate &&
          prev.startTime &&
          prev.endDate &&
          prev.endTime
        ) {
          const prevStart = new Date(`${prev.startDate}T${prev.startTime}`);
          const prevEnd = new Date(`${prev.endDate}T${prev.endTime}`);
          const prevDiffMins = Math.floor(
            (prevEnd.getTime() - prevStart.getTime()) / 60000
          );

          if (prevDiffMins > 0 && next.startDate && next.startTime) {
            const newStart = new Date(`${next.startDate}T${next.startTime}`);
            const newEnd = new Date(newStart.getTime() + prevDiffMins * 60000);

            if (!isNaN(newEnd.getTime())) {
              next.endDate = newEnd.toISOString().split("T")[0];
              next.endTime = `${String(newEnd.getHours()).padStart(
                2,
                "0"
              )}:${String(newEnd.getMinutes()).padStart(2, "0")}`;
            }
          }
        }
      }

      if (name === "endDate" || name === "endTime") {
        setSelectedTemplate(null);
      }

      return next;
    });
  };

  const applyTemplate = (id: string) => {
    const tmpl = blockTemplates.find((x) => x.id === id);
    if (!tmpl) return;

    const titleText = t(tmpl.titleKey);
    const startStr = formData.startDate || new Date().toISOString().split("T")[0];
    const startTimeStr = formData.startTime || "12:00";
    const startObj = new Date(`${startStr}T${startTimeStr}:00`);
    const endObj = new Date(startObj.getTime() + tmpl.duration * 60000);

    setFormData({
      title: titleText,
      startDate: startStr,
      startTime: startTimeStr,
      endDate: endObj.toISOString().split("T")[0],
      endTime: `${String(endObj.getHours()).padStart(2, "0")}:${String(
        endObj.getMinutes()
      ).padStart(2, "0")}`,
    });
    setSelectedTemplate(id);
    toast.success(t("template_applied", { name: titleText }));
  };

  const handleSave = async () => {
    if (validationError) return;
    setSavingStep("saving");

    const success = await createBlock({
      startDateTime: new Date(
        `${formData.startDate}T${formData.startTime}`
      ).toISOString(),
      endDateTime: new Date(
        `${formData.endDate}T${formData.endTime}`
      ).toISOString(),
      title: formData.title,
      reason: formData.title,
    });

    if (success) {
      setSavingStep("success");
      toast.success(t("success_msg"));
      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1000);
    } else {
      setSavingStep("idle");
    }
  };

  const isValid =
    formData.startDate &&
    formData.startTime &&
    formData.endDate &&
    formData.endTime &&
    formData.title &&
    !validationError;

  const fmtDuration = (m: number) =>
    m < 60
      ? `${m} MIN`
      : m % 60 > 0
      ? `${Math.floor(m / 60)}H ${m % 60}M`
      : `${Math.floor(m / 60)}H`;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !loading && onClose()}
    >
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans transition-colors [&>button]:hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Calendar className="w-6 h-6" strokeWidth={2} />
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

          {!loading && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* ── CUERPO DEL MODAL ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a] flex flex-col p-6 sm:p-8 space-y-6">
          {/* MACROS / PLANTILLAS RÁPIDAS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("templates_label")}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {blockTemplates.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSel = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl.id)}
                    className={cn(
                      "flex flex-col items-start gap-2.5 p-3.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer shadow-2xs group",
                      isSel
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                        : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-2xs",
                        isSel
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold truncate">
                        {t(tmpl.titleKey)}
                      </p>
                      <p className="text-[10px] font-mono font-bold text-gray-400">
                        {fmtDuration(tmpl.duration)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MOTIVO DE BLOQUEO */}
          <div className="space-y-1.5">
            <Label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("event_title_label")}
            </Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInput}
              placeholder={t("event_title_placeholder")}
              className="bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-11 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400"
              disabled={loading}
            />
          </div>

          {/* SELECTORES DE FECHA Y HORA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Inicio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("start")}
              </label>
              <div className="flex flex-col gap-2">
                <DatePicker
                  value={
                    formData.startDate
                      ? new Date(formData.startDate + "T12:00:00")
                      : undefined
                  }
                  onChange={(date) =>
                    handleInput({
                      target: {
                        name: "startDate",
                        value: date ? format(date, "yyyy-MM-dd") : "",
                      },
                    } as any)
                  }
                  disabled={loading ? () => true : undefined}
                  placeholder="DD/MM/AAAA"
                  className="bg-gray-50/50 dark:bg-[#050505] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold shadow-2xs"
                  popoverClassName="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                />
                <Input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInput}
                  className="bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-11 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 shadow-2xs [&::-webkit-calendar-picker-indicator]:dark:invert"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Término */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("end")}
              </label>
              <div className="flex flex-col gap-2">
                <DatePicker
                  value={
                    formData.endDate
                      ? new Date(formData.endDate + "T12:00:00")
                      : undefined
                  }
                  onChange={(date) =>
                    handleInput({
                      target: {
                        name: "endDate",
                        value: date ? format(date, "yyyy-MM-dd") : "",
                      },
                    } as any)
                  }
                  disabled={loading ? () => true : undefined}
                  placeholder="DD/MM/AAAA"
                  className="bg-gray-50/50 dark:bg-[#050505] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold shadow-2xs"
                  popoverClassName="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                />
                <Input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInput}
                  className="bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-11 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 shadow-2xs [&::-webkit-calendar-picker-indicator]:dark:invert"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* BLOQUE DE ERROR DE VALIDACIÓN */}
          {validationError && (
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
              <AlertCircle
                className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <div className="flex-1 text-left space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {t("validation_error")}
                </p>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  {validationError}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER DE COMANDOS ────────────────────────────────────── */}
        <DialogFooter className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto h-11 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold rounded-xl shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !isValid}
            className={cn(
              "w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed",
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
                  <span>{t("created")}</span>
                </motion.div>
              )}
              {savingStep === "idle" && (
                <motion.div
                  key="i"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>{t("block_time")}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};