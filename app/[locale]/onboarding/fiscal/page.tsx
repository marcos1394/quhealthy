"use client";

/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-giant-component */

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UploadCloud,
  CheckCircle2,
  ArrowLeft,
  Building2,
  User,
  Landmark,
  Shield,
  AlertTriangle,
  KeyRound,
  FileKey,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { useFiscalOnboarding } from "@/hooks/useFiscalOnboarding";
import { onboardingService } from "@/services/onboarding.service";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function FiscalPage() {
  const router = useRouter();
  const t = useTranslations("OnboardingFiscal");
  const {
    taxCertificate,
    actaConstitutiva,
    csdCertificate,
    csdKey,
    personType,
    isLoading,
    isUploading,
    uploadDocument,
  } = useFiscalOnboarding();

  const csfInputRef = useRef<HTMLInputElement>(null);
  const actaInputRef = useRef<HTMLInputElement>(null);
  const csdCerInputRef = useRef<HTMLInputElement>(null);
  const csdKeyInputRef = useRef<HTMLInputElement>(null);

  const handleCsfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file, "TAX_CERTIFICATE");
  };

  const handleActaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file, "ACTA_CONSTITUTIVA");
  };

  const handleCsdCerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file, "CSD_CERTIFICATE");
  };

  const handleCsdKeyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file, "CSD_KEY");
  };

  const handleContinue = async () => {
    try {
      await onboardingService.finalizeOnboarding();
    } catch (error) {
      console.error("Error sincronizando estados finales", error);
    } finally {
      router.push("/onboarding");
    }
  };

  const allDone =
    taxCertificate?.verificationStatus === "APPROVED" &&
    csdCertificate?.verificationStatus === "APPROVED" &&
    csdKey?.verificationStatus === "APPROVED" &&
    (personType === "FISICA" ||
      actaConstitutiva?.verificationStatus === "APPROVED");

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center gap-3 transition-colors font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("sync_loading")}
        </p>
      </div>
    );

  // ── ESTADO: ÉXITO (TODOS LOS DOCUMENTOS VALIDADOS) ─────────────────────────
  if (allDone)
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex items-center justify-center p-6 transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
            {/* Success Banner */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
                <Check className="w-8 h-8" strokeWidth={2.5} />
              </div>

              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t("success.badge")}</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight pt-2">
                  {t("success.title")}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  {t("success.desc")}
                </p>
              </div>
            </div>

            {/* Extracted Fiscal Data */}
            {taxCertificate?.extractedData && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t("extracted_data.title")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {taxCertificate.extractedData.rfc && (
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {t("extracted_data.rfc")}
                      </span>
                      <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {taxCertificate.extractedData.rfc}
                      </p>
                    </div>
                  )}

                  {taxCertificate.extractedData.nombre_o_razon_social && (
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {t("extracted_data.business_name")}
                      </span>
                      <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {taxCertificate.extractedData.nombre_o_razon_social}
                      </p>
                    </div>
                  )}

                  {taxCertificate.extractedData.regimen_fiscal && (
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {t("extracted_data.tax_regime")}
                      </span>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">
                        {taxCertificate.extractedData.regimen_fiscal}
                      </p>
                    </div>
                  )}

                  {taxCertificate.extractedData.domicilio_fiscal && (
                    <div className="bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {t("extracted_data.tax_address")}
                      </span>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 line-clamp-1">
                        {taxCertificate.extractedData.domicilio_fiscal}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Final Action Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleContinue}
                className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
              >
                <span>{t("success.complete_btn")}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );

  // ── ESTADO PRINCIPAL: FORMULARIO DE CARGA DE DOCUMENTOS ───────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white pt-28 pb-20 px-6 md:px-12 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Nav */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("back")}</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
            <Shield className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("encrypted_env")}</span>
          </div>
        </div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title").split(" ")[0]}{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                {t("title").split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-sm text-xs font-bold text-gray-700 dark:text-gray-300 self-start sm:self-auto">
              {personType === "FISICA" ? (
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>
                {personType === "FISICA"
                  ? t("person_type.physical")
                  : t("person_type.moral")}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* CARDS DE DOCUMENTOS */}
        <div className="space-y-6">
          {/* 1. Constancia de Situación Fiscal (CSF) */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <Landmark className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("csf.title")}
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  {t("csf.desc")}
                </p>
              </div>
            </div>

            <div>
              {taxCertificate?.verificationStatus === "APPROVED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("csf.status_approved")}
                    </span>
                  </div>

                  {taxCertificate.extractedData?.rfc && (
                    <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-400 uppercase">
                          {t("extracted_data.rfc")}
                        </span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {taxCertificate.extractedData.rfc}
                        </span>
                      </div>
                      {taxCertificate.extractedData.regimen_fiscal && (
                        <div className="flex justify-between items-center text-xs border-t border-gray-100 dark:border-gray-800 pt-2">
                          <span className="font-bold text-gray-400 uppercase">
                            {t("extracted_data.tax_regime")}
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {taxCertificate.extractedData.regimen_fiscal}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : taxCertificate?.verificationStatus === "REJECTED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> {t("csf.status_rejected")}
                    </p>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      {taxCertificate.rejectionReason || t("csf.rejected_fallback")}
                    </p>
                  </div>

                  <UploadZone
                    isUploading={isUploading}
                    inputRef={csfInputRef}
                    onChange={handleCsfUpload}
                    label={t("csf.upload_new")}
                    processingText={t("upload_zones.processing")}
                    formatsHint={t("upload_zones.formats_hint")}
                  />
                </div>
              ) : (
                <UploadZone
                  isUploading={isUploading}
                  inputRef={csfInputRef}
                  onChange={handleCsfUpload}
                  label={t("csf.upload_prompt")}
                  processingText={t("upload_zones.processing")}
                  formatsHint={t("upload_zones.formats_hint")}
                />
              )}
            </div>
          </div>

          {/* 2. Acta Constitutiva (Solo Persona Moral) */}
          {personType === "MORAL" && (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {t("acta.title")}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    {t("acta.desc")}
                  </p>
                </div>
              </div>

              <div>
                {actaConstitutiva?.verificationStatus === "APPROVED" ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("acta.status_approved")}
                    </span>
                  </div>
                ) : actaConstitutiva?.verificationStatus === "REJECTED" ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                      <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> {t("acta.status_rejected")}
                      </p>
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">
                        {actaConstitutiva.rejectionReason || t("acta.rejected_fallback")}
                      </p>
                    </div>

                    <UploadZone
                      isUploading={isUploading}
                      inputRef={actaInputRef}
                      onChange={handleActaUpload}
                      label={t("acta.upload_new")}
                      processingText={t("upload_zones.processing")}
                      formatsHint={t("upload_zones.formats_hint")}
                    />
                  </div>
                ) : (
                  <UploadZone
                    isUploading={isUploading}
                    inputRef={actaInputRef}
                    onChange={handleActaUpload}
                    label={t("acta.upload_prompt")}
                    processingText={t("upload_zones.processing")}
                    formatsHint={t("upload_zones.formats_hint")}
                  />
                )}
              </div>
            </div>
          )}

          {/* 3. CSD - Certificado de Sello Digital (.cer) */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("csd_cer.title")}
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  {t("csd_cer.desc")}
                </p>
              </div>
            </div>

            <div>
              {csdCertificate?.verificationStatus === "APPROVED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("csd_cer.status_approved")}
                    </span>
                  </div>

                  {csdCertificate.extractedData && (
                    <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-2 text-xs font-medium">
                      {csdCertificate.extractedData.serial_number && (
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-400 uppercase">
                            {t("csd_cer.serial_number")}
                          </span>
                          <span className="font-mono text-gray-900 dark:text-white">
                            {csdCertificate.extractedData.serial_number}
                          </span>
                        </div>
                      )}
                      {csdCertificate.extractedData.valid_to && (
                        <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-2">
                          <span className="font-bold text-gray-400 uppercase">
                            {t("csd_cer.valid_until")}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {csdCertificate.extractedData.valid_to}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : csdCertificate?.verificationStatus === "REJECTED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> {t("csd_cer.status_rejected")}
                    </p>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      {csdCertificate.rejectionReason || t("csd_cer.rejected_fallback")}
                    </p>
                  </div>

                  <CsdUploadZone
                    isUploading={isUploading}
                    inputRef={csdCerInputRef}
                    onChange={handleCsdCerUpload}
                    accept=".cer"
                    label={t("csd_cer.upload_new")}
                    processingText={t("upload_zones.validating_csd")}
                    formatHint={t("upload_zones.csd_format_hint", { accept: ".cer" })}
                  />
                </div>
              ) : (
                <CsdUploadZone
                  isUploading={isUploading}
                  inputRef={csdCerInputRef}
                  onChange={handleCsdCerUpload}
                  accept=".cer"
                  label={t("csd_cer.upload_prompt")}
                  processingText={t("upload_zones.validating_csd")}
                  formatHint={t("upload_zones.csd_format_hint", { accept: ".cer" })}
                />
              )}
            </div>
          </div>

          {/* 4. CSD - Llave Privada (.key) */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                <KeyRound className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("csd_key.title")}
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  {t("csd_key.desc")}
                </p>
              </div>
            </div>

            <div>
              {csdKey?.verificationStatus === "APPROVED" ? (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("csd_key.status_approved")}
                  </span>
                </div>
              ) : csdKey?.verificationStatus === "REJECTED" ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> {t("csd_key.status_rejected")}
                    </p>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      {csdKey.rejectionReason || t("csd_key.rejected_fallback")}
                    </p>
                  </div>

                  <CsdUploadZone
                    isUploading={isUploading}
                    inputRef={csdKeyInputRef}
                    onChange={handleCsdKeyUpload}
                    accept=".key"
                    label={t("csd_key.upload_new")}
                    processingText={t("upload_zones.validating_csd")}
                    formatHint={t("upload_zones.csd_format_hint", { accept: ".key" })}
                  />
                </div>
              ) : (
                <CsdUploadZone
                  isUploading={isUploading}
                  inputRef={csdKeyInputRef}
                  onChange={handleCsdKeyUpload}
                  accept=".key"
                  label={t("csd_key.upload_prompt")}
                  processingText={t("upload_zones.validating_csd")}
                  formatHint={t("upload_zones.csd_format_hint", { accept: ".key" })}
                />
              )}
            </div>
          </div>

          {/* Bóveda de Seguridad Informativa */}
          <div className="bg-gray-900 dark:bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <FileKey className="w-4 h-4" />
              <span>{t("vault.title")}</span>
            </div>
            <p className="text-xs font-medium text-gray-300 leading-relaxed">
              {t("vault.desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTES DE CARGA (DROPZONES) ─────────────────────────────────────────

function UploadZone({
  isUploading,
  inputRef,
  onChange,
  label,
  processingText,
  formatsHint,
}: {
  isUploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  processingText: string;
  formatsHint: string;
}) {
  return (
    <>
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          "h-44 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all",
          isUploading
            ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] opacity-60 cursor-not-allowed"
            : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10"
        )}
      >
        {isUploading ? (
          <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400 mb-2" />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-3">
            <UploadCloud className="w-6 h-6" strokeWidth={2} />
          </div>
        )}

        <p className="text-xs font-bold text-gray-900 dark:text-white">
          {isUploading ? processingText : label}
        </p>
        <p className="text-[11px] font-medium text-gray-400 mt-1">
          {formatsHint}
        </p>
      </div>

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept=".pdf,image/png,image/jpeg"
        onChange={onChange}
      />
    </>
  );
}

function CsdUploadZone({
  isUploading,
  inputRef,
  onChange,
  accept,
  label,
  processingText,
  formatHint,
}: {
  isUploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  label: string;
  processingText: string;
  formatHint: string;
}) {
  return (
    <>
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          "h-32 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all",
          isUploading
            ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] opacity-60 cursor-not-allowed"
            : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10"
        )}
      >
        {isUploading ? (
          <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400 mb-1" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-2">
            <UploadCloud className="w-5 h-5" strokeWidth={2} />
          </div>
        )}

        <p className="text-xs font-bold text-gray-900 dark:text-white">
          {isUploading ? processingText : label}
        </p>
        <p className="text-[10px] font-semibold font-mono text-gray-400 mt-0.5">
          {formatHint}
        </p>
      </div>

      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        onChange={onChange}
      />
    </>
  );
}