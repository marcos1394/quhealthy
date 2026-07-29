"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  ClipboardList,
  Stethoscope,
  BriefcaseMedical,
  FileDown,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { ehrService } from "@/services/ehr.service";
import { appointmentService } from "@/services/appointment.service";
import { ClinicalNotesDto } from "@/types/ehr";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface PastConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number | null;
  patientName: string;
  consultationDate: string;
}

export const PastConsultationModal = ({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  consultationDate,
}: PastConsultationModalProps) => {
  const t = useTranslations("PastConsultationModal");
  const [notes, setNotes] = useState<ClinicalNotesDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !appointmentId) {
      setNotes(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const fetchNotes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ehrService.getClinicalNotes(appointmentId);
        if (isMounted) setNotes(data);
      } catch (err) {
        console.error("Error fetching clinical notes", err);
        if (isMounted) {
          setError(t("error_load"));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
    };
  }, [isOpen, appointmentId, t]);

  const handleDownloadPrescription = async () => {
    if (!appointmentId) return;
    try {
      const blob = await appointmentService.downloadPrescriptionPdf(appointmentId);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error("Error downloading prescription", err);
      toast.error(t("toast_prescription_error"));
    }
  };

  if (!isOpen || !mounted) return null;

  const dateFormatted = consultationDate
    ? new Date(consultationDate).toLocaleDateString()
    : "";

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 w-full max-w-5xl flex flex-col max-h-[90vh] min-h-[60vh] rounded-3xl overflow-hidden shadow-2xl transition-colors"
        >
          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-xs">
                <FileText className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t("subtitle")}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("title")}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 font-mono pt-0.5">
                  <span>{patientName}</span>
                  {dateFormatted && (
                    <>
                      <span>•</span>
                      <span>{dateFormatted}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* ── BODY PRINCIPAL ─────────────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 custom-scrollbar bg-gray-50/40 dark:bg-[#050505]/50 p-6 sm:p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-3">
                <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-semibold text-gray-400">
                  {t("loading")}
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 rounded-3xl border border-dashed border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" strokeWidth={2} />
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 max-w-md leading-relaxed">
                  {error}
                </p>
              </div>
            ) : notes ? (
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
                  {t("soap_title")}
                </h4>

                {/* Grid S.O.A.P. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* S - Subjetivo */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-3 shadow-xs min-h-[180px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ClipboardList className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("subjective_title")}
                      </h4>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {notes.subjective || (
                        <span className="text-gray-400 italic">
                          {t("no_record")}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* O - Objetivo */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-3 shadow-xs min-h-[180px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Stethoscope className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("objective_title")}
                      </h4>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {notes.objective || (
                        <span className="text-gray-400 italic">
                          {t("no_record")}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* A - Análisis */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-3 shadow-xs min-h-[180px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <BriefcaseMedical className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("assessment_title")}
                      </h4>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {notes.assessment || (
                        <span className="text-gray-400 italic">
                          {t("no_record")}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* P - Plan */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-3 shadow-xs min-h-[180px]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <FileText className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("plan_title")}
                      </h4>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {notes.plan || (
                        <span className="text-gray-400 italic">
                          {t("no_record")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-gray-400">
                  <FileText className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("empty_record_title")}
                </h3>
                <p className="text-xs font-medium text-gray-400 max-w-xs">
                  {t("empty_record_desc")}
                </p>
              </div>
            )}
          </div>

          {/* ── FOOTER DE COMANDOS ────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
            {notes ? (
              <button
                type="button"
                onClick={handleDownloadPrescription}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <FileDown className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_view_prescription")}</span>
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {t("btn_close")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};