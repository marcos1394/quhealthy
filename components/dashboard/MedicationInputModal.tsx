"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Pill, Clock } from "lucide-react";

import {
  AddMedicationRequest,
  MedicationTaskDto,
} from "@/services/eldercare.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface MedicationInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: MedicationTaskDto | null;
  onSave: (data: AddMedicationRequest, taskId?: number) => Promise<void>;
}

export function MedicationInputModal({
  isOpen,
  onClose,
  medicationToEdit,
  onSave,
}: MedicationInputModalProps) {
  const t = useTranslations("Eldercare.MedicationModal");

  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("EVERY_8_HOURS");
  const [durationDays, setDurationDays] = useState("30");
  const [instructions, setInstructions] = useState("");
  const [startsNow, setStartsNow] = useState(true);
  const [firstDoseTime, setFirstDoseTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!medicationToEdit;

  const frequencyOptions = [
    { value: "EVERY_4_HOURS", label: t("freq_every_4") },
    { value: "EVERY_6_HOURS", label: t("freq_every_6") },
    { value: "EVERY_8_HOURS", label: t("freq_every_8") },
    { value: "EVERY_12_HOURS", label: t("freq_every_12") },
    { value: "ONCE_DAILY", label: t("freq_once_daily") },
    { value: "AS_NEEDED", label: t("freq_as_needed") },
  ];

  useEffect(() => {
    if (isOpen) {
      if (medicationToEdit) {
        setMedicationName(medicationToEdit.medicationName || "");
        setDosage(medicationToEdit.dosage || "");
        setFrequency(medicationToEdit.frequency || "EVERY_8_HOURS");
        setDurationDays(
          medicationToEdit.durationDays
            ? medicationToEdit.durationDays.toString()
            : "30"
        );
        setInstructions(medicationToEdit.instructions || "");
        setStartsNow(false);

        if (medicationToEdit.nextDueTime) {
          try {
            const dateStr = medicationToEdit.nextDueTime.slice(0, 16);
            setFirstDoseTime(dateStr);
          } catch {
            setFirstDoseTime("");
          }
        }
      } else {
        setMedicationName("");
        setDosage("");
        setFrequency("EVERY_8_HOURS");
        setDurationDays("30");
        setInstructions("");
        setStartsNow(true);
        setFirstDoseTime("");
      }
    }
  }, [isOpen, medicationToEdit]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!medicationName || !dosage || !frequency) return;

    try {
      setIsSubmitting(true);

      let finalFirstDoseTime: string | undefined = undefined;
      if (!isEditMode) {
        if (!startsNow && firstDoseTime) {
          finalFirstDoseTime = new Date(firstDoseTime).toISOString();
        } else if (startsNow) {
          finalFirstDoseTime = new Date().toISOString();
        }
      } else {
        if (firstDoseTime) {
          finalFirstDoseTime = new Date(firstDoseTime).toISOString();
        }
      }

      await onSave(
        {
          medicationName,
          dosage,
          frequency,
          durationDays: durationDays ? parseInt(durationDays, 10) : undefined,
          instructions,
          firstDoseTime: finalFirstDoseTime,
        },
        medicationToEdit?.id
      );
      onClose();
    } catch (error) {
      console.error("Error saving medication:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans transition-colors">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0 flex justify-between items-start">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Pill className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {isEditMode ? t("title_edit") : t("title_add")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── BODY ───────────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 bg-white dark:bg-[#0a0a0a] flex-1">
          {/* Nombre del Medicamento */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("name_label")} *
            </label>
            <input
              type="text"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder={t("name_placeholder")}
              className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400 px-3.5"
            />
          </div>

          {/* Dosis */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("dosage_label")} *
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder={t("dosage_placeholder")}
              className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400 px-3.5"
            />
          </div>

          {/* Frecuencia */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("frequency_label")} *
            </label>
            <Select
              value={frequency}
              onValueChange={(val) => setFrequency(val)}
            >
              <SelectTrigger className="w-full h-11 px-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                {frequencyOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primera Toma */}
          <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("first_dose_question")}
            </label>

            {!isEditMode && (
              <div className="grid grid-cols-2 gap-2 bg-gray-50/60 dark:bg-[#050505] p-1 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setStartsNow(true)}
                  className={cn(
                    "h-9 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    startsNow
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {t("starts_now")}
                </button>
                <button
                  type="button"
                  onClick={() => setStartsNow(false)}
                  className={cn(
                    "h-9 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    !startsNow
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {t("schedule_time")}
                </button>
              </div>
            )}

            {(!startsNow || isEditMode) && (
              <div className="relative pt-1">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
                <input
                  type="datetime-local"
                  value={firstDoseTime}
                  onChange={(e) => setFirstDoseTime(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
            )}
          </div>

          {/* Duración */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("duration_label")}
            </label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder={t("duration_placeholder")}
              className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400 px-3.5"
            />
          </div>

          {/* Instrucciones Adicionales */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("instructions_label")}
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t("instructions_placeholder")}
              className="w-full h-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400 px-3.5 leading-relaxed"
            />
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {t("btn_cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!medicationName || !dosage || !frequency || isSubmitting}
            className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <QhSpinner size="sm" className="text-white" />
                <span>{t("btn_saving")}</span>
              </>
            ) : (
              <span>{t("btn_save")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}