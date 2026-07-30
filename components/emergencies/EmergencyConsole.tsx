"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { X, Activity, Save, CheckCircle2, Clock, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

import {
  EmergencyQueueItem,
  emergencyService,
} from "@/services/emergency.service";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface EmergencyConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyQueueItem;
  onUpdate: () => void;
}

export const EmergencyConsole: React.FC<EmergencyConsoleProps> = ({
  isOpen,
  onClose,
  emergency,
  onUpdate,
}) => {
  const t = useTranslations("EmergencyConsole");
  const { user } = useSessionStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [destination, setDestination] = useState("ALTA");

  if (!isOpen) return null;

  const handleAddNote = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      await emergencyService.addHourlyNote(emergency.appointmentId, {
        providerId: user.id,
        clinicalNotes,
      });
      toast.success(t("toast_note_success"));
      setClinicalNotes({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
      });
      onUpdate();
    } catch {
      toast.error(t("toast_note_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await emergencyService.completeEmergency(
        emergency.appointmentId,
        destination
      );
      toast.success(t("toast_complete_success"));
      onUpdate();
      onClose();
    } catch {
      toast.error(t("toast_complete_error"));
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity font-sans">
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 h-full shadow-2xl flex flex-col overflow-hidden"
        >
          {/* ── HEADER CONSOLA ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs shrink-0">
                <Activity className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {t("console_title")}
                </p>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate leading-none">
                  {emergency.patientName}
                </h2>
                {emergency.reasonForEmergency && (
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                    {emergency.reasonForEmergency}
                  </p>
                )}
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

          {/* ── BODY ───────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
            
            {/* TARJETA: NOTA DE EVOLUCIÓN HORARIA (SOAP) */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 rounded-3xl shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("soap_title")}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                  <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("hourly_badge")}</span>
                </span>
              </div>

              <div className="space-y-4">
                {/* Subjetivo */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("subjective_label")}
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalNotes.subjective}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        subjective: e.target.value,
                      })
                    }
                    placeholder={t("subjective_placeholder")}
                    className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-2xs leading-relaxed resize-none"
                  />
                </div>

                {/* Objetivo */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("objective_label")}
                  </label>
                  <textarea
                    rows={2}
                    value={clinicalNotes.objective}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        objective: e.target.value,
                      })
                    }
                    placeholder={t("objective_placeholder")}
                    className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-2xs leading-relaxed resize-none"
                  />
                </div>

                {/* Análisis y Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("assessment_label")}
                    </label>
                    <textarea
                      rows={2}
                      value={clinicalNotes.assessment}
                      onChange={(e) =>
                        setClinicalNotes({
                          ...clinicalNotes,
                          assessment: e.target.value,
                        })
                      }
                      placeholder={t("assessment_placeholder")}
                      className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-2xs leading-relaxed resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("plan_label")}
                    </label>
                    <textarea
                      rows={2}
                      value={clinicalNotes.plan}
                      onChange={(e) =>
                        setClinicalNotes({
                          ...clinicalNotes,
                          plan: e.target.value,
                        })
                      }
                      placeholder={t("plan_placeholder")}
                      className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-2xs leading-relaxed resize-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={isSubmitting}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>{t("btn_saving_note")}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" strokeWidth={2} />
                      <span>{t("btn_save_note")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TARJETA: CIERRE DE URGENCIA */}
            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 sm:p-6 rounded-3xl space-y-4 shadow-2xs">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 tracking-tight">
                  {t("discharge_title")}
                </h3>
                <p className="text-xs font-medium text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
                  {t("discharge_desc")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end pt-1">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <label className="block text-xs font-bold text-rose-900 dark:text-rose-300">
                    {t("destination_label")}
                  </label>
                  <select
                    className="w-full h-11 px-3.5 bg-white dark:bg-[#0a0a0a] border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs cursor-pointer"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    <option value="ALTA">{t("dest_alta")}</option>
                    <option value="HOSPITALIZACIÓN">{t("dest_hospitalizacion")}</option>
                    <option value="TRASLADO">{t("dest_traslado")}</option>
                    <option value="DEFUNCION">{t("dest_defuncion")}</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompleting ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>{t("btn_completing")}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      <span>{t("btn_complete")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};