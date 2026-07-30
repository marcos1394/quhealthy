"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { UserPlus, X, Search } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { emergencyService } from "@/services/emergency.service";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RegisterEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterEmergencyModal: React.FC<RegisterEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const t = useTranslations("RegisterEmergencyModal");
  const { user } = useSessionStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientId, setPatientId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !patientId) return;

    setIsSubmitting(true);
    try {
      // Registrar cita de emergencia
      const appt = await emergencyService.registerEmergencyWalkIn(
        user.id,
        Number(patientId)
      );

      // Detonar triage inmediatamente (inicia el reloj de triage)
      await emergencyService.startTriage(appt.id);

      setPatientId("");
      onSuccess();
    } catch {
      toast.error(t("error_toast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-colors [&>button]:hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs shrink-0">
              <UserPlus className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {t("subtitle")}
              </p>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("title")}
              </DialogTitle>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── CUERPO & FORMULARIO ───────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 space-y-5 bg-white dark:bg-[#0a0a0a]">
            <DialogDescription className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-4 rounded-2xl text-xs font-medium text-rose-800 dark:text-rose-300 leading-relaxed shadow-2xs">
              {t("description")}
            </DialogDescription>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("patient_id_label")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder={t("patient_id_placeholder")}
                  className="w-full h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pt-1">
                <Search className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" strokeWidth={2} />
                <span>{t("search_hint")}</span>
              </p>
            </div>
          </div>

          {/* ── FOOTER DE COMANDOS ────────────────────────────────────── */}
          <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !patientId}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("submitting_button")}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" strokeWidth={2} />
                  <span>{t("submit_button")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};