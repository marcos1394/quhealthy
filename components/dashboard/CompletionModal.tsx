"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  X,
  AlertCircle,
  Info,
  Calendar,
  User,
  Sparkles,
  Mail,
  Star,
  Clock,
  FileText,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface Appointment {
  id: number;
  consumer?: { name: string; email?: string };
  service?: { name: string; duration?: string };
  date?: string;
  time?: string;
}

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  appointment: Appointment | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onComplete,
}) => {
  const t = useTranslations("DashboardAppointments.CompletionModal");

  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completionStep, setCompletionStep] = useState<
    "idle" | "processing" | "success"
  >("idle");

  // Reset del formulario cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setCompletionStep("idle");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!appointment) return;
    setIsLoading(true);
    setCompletionStep("processing");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setCompletionStep("success");
      toast.success(t("toast_success"));

      setTimeout(() => {
        onComplete();
        onClose();
      }, 1000);
    } catch {
      setCompletionStep("idle");
      setIsLoading(false);
    }
  };

  if (!appointment) return null;

  const charCount = notes.length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && onClose()}
    >
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl p-0 overflow-hidden rounded-3xl font-sans transition-colors">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="space-y-0.5">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                    {t("title")}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("subtitle")}
                  </DialogDescription>
                </div>
              </div>

              {!isLoading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* ── BODY ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
          {/* Resumen de la Cita */}
          <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t("summary_title")}
              </p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                <span>{t("badge_to_complete")}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {appointment.consumer && (
                <div className="flex items-center gap-2.5 bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {t("patient")}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {appointment.consumer.name}
                    </p>
                    {appointment.consumer.email && (
                      <p className="text-[10px] font-medium text-gray-400 truncate flex items-center gap-1 pt-0.5">
                        <Mail className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{appointment.consumer.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {appointment.service && (
                <div className="flex items-center gap-2.5 bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {t("service")}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {appointment.service.name}
                    </p>
                    {appointment.service.duration && (
                      <p className="text-[10px] font-medium text-gray-400 truncate flex items-center gap-1 pt-0.5 font-mono">
                        <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{appointment.service.duration}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(appointment.date || appointment.time) && (
                <div className="flex items-center gap-2.5 bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs sm:col-span-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {t("date_time")}
                    </p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                      {appointment.date}{" "}
                      {appointment.time && `• ${appointment.time}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Flujo Posterior */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
              <span>{t("what_happens_title")}</span>
            </div>
            <ul className="space-y-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed pl-6 list-disc">
              <li>{t("step1")}</li>
              <li>{t("step2")}</li>
              <li>{t("step3")}</li>
              <li>{t("step4")}</li>
            </ul>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Notas Privadas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="notes"
                className="text-xs font-bold text-gray-800 dark:text-gray-200"
              >
                {t("notes_label")}
              </label>
              <span
                className={cn(
                  "text-[11px] font-mono font-bold",
                  charCount > 500 ? "text-red-500" : "text-gray-400"
                )}
              >
                {charCount}/500
              </span>
            </div>

            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              placeholder={t("notes_placeholder")}
              className={cn(
                "bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 min-h-[100px] resize-none transition-all rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs leading-relaxed",
                charCount > 500 ? "border-red-500" : ""
              )}
              disabled={isLoading}
            />

            <div className="flex items-start gap-2 bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-xl p-3 shadow-2xs">
              <AlertCircle
                className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="font-bold text-gray-900 dark:text-white mr-1">
                  {t("notes_privacy_title")}
                </span>
                {t("notes_privacy_desc")}
              </p>
            </div>
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 shrink-0">
          <DialogFooter className="flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {t("btn_cancel")}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={cn(
                "w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50",
                completionStep === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
            >
              <AnimatePresence mode="wait">
                {completionStep === "processing" && (
                  <motion.div
                    key="p"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("btn_processing")}</span>
                  </motion.div>
                )}
                {completionStep === "success" && (
                  <motion.div
                    key="s"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    <span>{t("btn_completed")}</span>
                  </motion.div>
                )}
                {completionStep === "idle" && (
                  <motion.div
                    key="i"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    <span>{t("btn_confirm")}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};