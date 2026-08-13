"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  User,
  ShieldAlert,
  History,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Activity,
  Pill,
  Users,
  Eye,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";

import { VaultDocument } from "@/types/ehr";
import { PastConsultationModal } from "@/components/consultation/PastConsultationModal";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface PatientProfileStepProps {
  patientProfile: any;
  vaultDocuments: VaultDocument[];
  vaultAccessDenied?: boolean;
  consumerId?: number | null;
  isOfflinePatient: boolean;
  displayFullName: string;
  patientDirectoryId: number | null;
  onNext: () => void;
}

export const PatientProfileStep: React.FC<PatientProfileStepProps> = ({
  patientProfile,
  vaultDocuments,
  vaultAccessDenied,
  consumerId,
  isOfflinePatient,
  displayFullName,
  onNext,
}) => {
  const t = useTranslations("EHR");
  const displayInitial = displayFullName.charAt(0).toUpperCase();

  const [selectedPastConsultation, setSelectedPastConsultation] = useState<{
    id: number;
    date: string;
  } | null>(null);
  const [selectedNote, setSelectedNote] = useState<VaultDocument | null>(null);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [showVaultList, setShowVaultList] = useState(false);

  const handleRequestAccess = async () => {
    if (!consumerId) return;
    try {
      setIsRequestingAccess(true);
      const axiosInstance = (await import("@/lib/axios")).default;
      await axiosInstance.post(
        `/api/onboarding/provider/vault/permissions/request/${consumerId}`
      );
      toast.success(t("request_sent_success"));
    } catch (error) {
      console.error("Error requesting vault access:", error);
      toast.error(t("request_sent_error"));
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const renderHistoryData = (data: any, fallbackText: string) => {
    if (!data || data === "Ninguno") {
      return (
        <span className="text-xs font-medium text-gray-400 italic">
          {fallbackText}
        </span>
      );
    }

    if (Array.isArray(data)) {
      if (data.length === 0 || data[0] === "Ninguno") {
        return (
          <span className="text-xs font-medium text-gray-400 italic">
            {fallbackText}
          </span>
        );
      }
      return data.map((item, idx) => {
        const text =
          typeof item === "object" && item !== null
            ? item.name || item.disease || JSON.stringify(item)
            : item;
        return (
          <span
            key={idx}
            className="inline-flex items-center px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 text-xs font-semibold shadow-2xs"
          >
            {String(text)}
          </span>
        );
      });
    }

    if (typeof data === "object" && data !== null) {
      const text = data.name || data.disease || JSON.stringify(data);
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 text-xs font-semibold shadow-2xs">
          {String(text)}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 text-xs font-semibold shadow-2xs">
        {String(data)}
      </span>
    );
  };

  const handleViewDocument = async (
    doc: VaultDocument,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();

    if (doc.documentType === "CONSULTA_PREVIA") {
      setSelectedPastConsultation({
        id: parseInt(doc.id),
        date: doc.uploadDate,
      });
    } else if (doc.documentType === "NOTE" || doc.noteContent) {
      setSelectedNote(doc);
    } else {
      if (doc.secureUrl) {
        window.open(doc.secureUrl, "_blank");
      } else if (consumerId) {
        try {
          const { ehrService } = await import("@/services/ehr.service");
          const url = await ehrService.getPatientDocumentUrl(consumerId, doc.id);
          if (url) {
            window.open(url, "_blank");
          } else {
            toast.error(t("doc_unavailable"));
          }
        } catch (error) {
          console.error("Error opening document:", error);
          toast.error(t("doc_open_error"));
        }
      } else {
        toast.error(t("doc_local_error"));
      }
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 font-sans transition-colors">
      {/* ── COLUMNA IZQUIERDA: RESUMEN Y ANTECEDENTES ─────────────────── */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
        {/* Tarjeta de Identidad */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold font-mono text-lg shrink-0 shadow-sm">
            {displayInitial}
          </div>

          <div className="flex-1 text-left min-w-0 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("biometric_profile")}
            </p>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight truncate">
              {displayFullName}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {patientProfile?.bloodType && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-gray-800 shadow-2xs font-mono">
                  GS: {patientProfile.bloodType}
                </span>
              )}
              {patientProfile?.weightKg && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-gray-800 shadow-2xs font-mono">
                  {patientProfile.weightKg} KG
                </span>
              )}
              {patientProfile?.heightCm && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 text-[10px] font-bold border border-gray-200 dark:border-gray-800 shadow-2xs font-mono">
                  {patientProfile.heightCm} CM
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badge Paciente Directorio Local */}
        {isOfflinePatient && (
          <div className="flex items-center justify-center gap-2 border-b border-gray-100 dark:border-gray-800 bg-amber-50/80 dark:bg-amber-950/20 px-4 py-3 text-amber-700 dark:text-amber-400 text-xs font-bold w-full shrink-0">
            <BookOpen className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>{t("local_directory_patient")}</span>
          </div>
        )}

        {/* Lista de Antecedentes */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 bg-gray-50/40 dark:bg-[#050505]">
          {!isOfflinePatient && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between shadow-2xs">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                {t("qu_score")}
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {patientProfile?.quScore || "--"}
              </span>
            </div>
          )}

          {/* Alergias */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("allergies")}
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {renderHistoryData(
                patientProfile?.allergies,
                t("no_allergies_registered")
              )}
            </div>
          </div>

          {/* Condiciones Crónicas */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("conditions")}
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {renderHistoryData(
                patientProfile?.chronicConditions,
                t("no_chronic_conditions")
              )}
            </div>
          </div>

          {/* Medicamentos Actuales */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Pill className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("current_medication")}
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {renderHistoryData(
                patientProfile?.currentMedications,
                t("no_medications_registered")
              )}
            </div>
          </div>

          {/* Quirúrgicos */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Activity className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("surgical_history")}
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {renderHistoryData(
                patientProfile?.surgicalHistory,
                t("no_surgeries_registered")
              )}
            </div>
          </div>

          {/* Heredofamiliares */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Users className="w-3.5 h-3.5" strokeWidth={2} />
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                {t("family_history")}
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {renderHistoryData(
                patientProfile?.familyHistory,
                t("no_family_history_registered")
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── COLUMNA DERECHA: EXPEDIENTE Y BÓVEDA ──────────────────────── */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        <div className="border border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0a0a0a] flex-1 rounded-3xl overflow-hidden shadow-sm transition-colors">
          {/* Header Bóveda */}
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/60 dark:bg-[#050505] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
                <History className="w-4 h-4" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {isOfflinePatient
                  ? t("local_consultation_history")
                  : t("vault_title")}
              </h3>
            </div>
          </div>

          {/* Lista de Documentos o Estados Especiales */}
          <div className="p-5 flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a]">
            {vaultAccessDenied ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center rounded-3xl bg-gray-50/50 dark:bg-[#050505] border border-dashed border-gray-200 dark:border-gray-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                  <Lock className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("vault_restricted_title")}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("vault_restricted_desc")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRequestAccess}
                  disabled={isRequestingAccess}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 mt-2"
                >
                  {isRequestingAccess ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>{t("btn_sending_request")}</span>
                    </>
                  ) : (
                    <span>{t("btn_request_access")}</span>
                  )}
                </button>
              </div>
            ) : !showVaultList ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center rounded-3xl bg-gray-50/50 dark:bg-[#050505] border border-dashed border-gray-200 dark:border-gray-800 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <History className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("vault_title")}
                  </h4>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("vault_hidden_desc", { fallback: "El historial clínico está disponible. Haz clic abajo para visualizarlo." })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVaultList(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-6 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 mt-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t("btn_view_history", { fallback: "Ver Historial" })}</span>
                </button>
              </div>
            ) : vaultDocuments.length === 0 ? (
              <div className="p-8 text-center flex-1 flex flex-col items-center justify-center rounded-3xl bg-gray-50/50 dark:bg-[#050505] border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <History className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t("no_history")}
                  </h4>
                  <p className="text-xs font-medium text-gray-400 leading-relaxed">
                    {isOfflinePatient
                      ? t("no_past_consultations_local")
                      : t("vault_empty")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVaultList(false)}
                  className="mt-4 px-4 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {t("btn_hide_history", { fallback: "Ocultar Historial" })}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={() => setShowVaultList(false)}
                    className="px-4 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {t("btn_hide_history", { fallback: "Ocultar Historial" })}
                  </button>
                </div>
                {vaultDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleViewDocument(doc, e)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleViewDocument(doc)
                    }
                    className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#050505] hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                        <FileCheck className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {doc.title || doc.fileName || t("clinical_document")}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-400 font-mono">
                          {doc.documentType} <span className="mx-1">•</span>{" "}
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleViewDocument(doc, e)}
                      className="px-4 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-emerald-600 text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{t("view_btn")}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🚀 BOTÓN CONTINUAR */}
        <div className="flex justify-end shrink-0">
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <span>{t("continue_to_evaluation")}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* MODAL DE CONSULTA PREVIA */}
      <PastConsultationModal
        isOpen={!!selectedPastConsultation}
        onClose={() => setSelectedPastConsultation(null)}
        appointmentId={selectedPastConsultation?.id || null}
        patientName={displayFullName}
        consultationDate={selectedPastConsultation?.date || ""}
      />

      {/* MODAL DE NOTA CLÍNICA */}
      <Dialog
        open={!!selectedNote}
        onOpenChange={(open) => {
          if (!open) setSelectedNote(null);
        }}
      >
        <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white sm:max-w-2xl p-0 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl font-sans">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <FileCheck className="w-4 h-4" strokeWidth={2} />
              <span>{t("note_modal_title")}</span>
            </p>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {selectedNote?.title || t("text_document")}
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold text-gray-400 font-mono">
              {t("registered_on", {
                date: selectedNote
                  ? new Date(selectedNote.uploadDate).toLocaleDateString()
                  : "",
              })}
            </DialogDescription>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 whitespace-pre-wrap text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-[#0a0a0a]">
            {selectedNote?.noteContent || t("no_content")}
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedNote(null)}
              className="h-10 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {t("close_viewer")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};