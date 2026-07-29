"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X, FileHeart } from "lucide-react";
import { BloodType, PatientHealthProfile } from "@/types/healthProfile";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditHealthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PatientHealthProfile | null;
  onSave: (data: Partial<PatientHealthProfile>) => Promise<boolean>;
  isSubmitting?: boolean;
}

const BLOOD_TYPE_OPTIONS: Array<{ value: BloodType; label: string }> = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
  { value: "UNKNOWN", label: "DESCONOCIDO" },
];

export function EditHealthProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  isSubmitting: externalSubmitting = false,
}: EditHealthProfileModalProps) {
  const t = useTranslations("EditHealthProfileModal");
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientHealthProfile>>({
    bloodType: null,
    heightCm: null,
    weightKg: null,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bloodType: initialData?.bloodType ?? null,
        heightCm: initialData?.heightCm ?? null,
        weightKg: initialData?.weightKg ?? null,
      });
    }
  }, [isOpen, initialData]);

  const isSubmitting = localSubmitting || externalSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalSubmitting(true);
    const success = await onSave(formData);
    setLocalSubmitting(false);
    if (success) onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl font-sans transition-colors [&>button]:hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 sm:p-8 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
              <FileHeart className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("description")}
              </DialogDescription>
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white dark:bg-[#0a0a0a]"
        >
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Tipo de Sangre */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("blood_type")}
                </label>
                <Select
                  value={formData.bloodType || "none"}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      bloodType: (val === "none"
                        ? null
                        : val) as BloodType | null,
                    })
                  }
                >
                  <SelectTrigger className="w-full h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer">
                    <SelectValue placeholder={t("not_registered")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl font-sans">
                    <SelectItem
                      value="none"
                      className="text-xs font-semibold focus:bg-gray-50 dark:focus:bg-[#111] rounded-xl cursor-pointer"
                    >
                      {t("not_registered")}
                    </SelectItem>
                    {BLOOD_TYPE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs font-semibold focus:bg-gray-50 dark:focus:bg-[#111] rounded-xl cursor-pointer"
                      >
                        {opt.value === "UNKNOWN" ? t("unknown") : opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estatura */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("height")}
                </label>
                <Input
                  type="number"
                  placeholder={t("height_placeholder")}
                  value={formData.heightCm ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heightCm: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                  className="w-full h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 rounded-xl placeholder:text-gray-400 shadow-2xs"
                />
              </div>

              {/* Peso */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("weight")}
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder={t("weight_placeholder")}
                  value={formData.weightKg ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weightKg: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  className="w-full h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 rounded-xl placeholder:text-gray-400 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* ── FOOTER DE COMANDOS ────────────────────────────────────── */}
          <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold rounded-xl disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 shadow-xs border-0 cursor-pointer"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}