"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/click-events-have-key-events */

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  UploadCloud,
  X,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Store,
  Sparkles,
  Shield,
  Info,
  Camera,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLicenseOnboarding } from "@/hooks/useLicenseOnboarding";
import { useTranslations } from "next-intl";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { UniversalCameraModal } from "@/components/ui/UniversalCameraModal";

export default function LicensePage() {
  const router = useRouter();
  const t = useTranslations("OnboardingLicense");
  const {
    license,
    sector,
    isLoading: pageLoading,
    isUploading,
    isSaving,
    uploadLicense,
    manualLicenses,
    setManualLicenses,
    saveLicenses,
  } = useLicenseOnboarding();

  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startCamera = () => {
    setIsCameraOpen(true);
  };

  const config = {
    isSalud: sector === "HEALTH",
    title: sector === "HEALTH" ? t("health_title") : t("beauty_title"),
    icon: sector === "HEALTH" ? GraduationCap : Store,
    description: sector === "HEALTH" ? t("health_desc") : t("beauty_desc"),
    infoText: sector === "HEALTH" ? t("health_info") : t("beauty_info"),
    buttonText: t("save_continue"),
  };

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    await uploadLicense(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.warning(t("toasts.file_too_large"));
      return;
    }
    if (!selectedFile.type.startsWith("image/") && !selectedFile.type.endsWith("pdf")) {
      toast.warning(t("toasts.invalid_file_type"));
      return;
    }
    await processFile(selectedFile);
  };

  const removeFile = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSkip = () => {
    if (!config.isSalud) {
      toast.info(t("skip_toast"));
      router.push("/onboarding");
    }
  };

  const handleSaveAndContinue = async () => {
    const isValid = manualLicenses.every(
      (l) =>
        l.licenseNumber.trim() !== "" &&
        l.institution.trim() !== "" &&
        l.type.trim() !== ""
    );
    if (!isValid) {
      toast.error(t("toasts.validation_required"));
      return;
    }
    const hasPrimary = manualLicenses.some((l) => l.isPrimary);
    if (!hasPrimary) {
      toast.error(t("toasts.primary_required"));
      return;
    }

    const success = await saveLicenses(manualLicenses);
    if (success) {
      toast.success(t("toasts.save_success"));
      router.push("/provider/dashboard");
    }
  };

  const addManualLicense = () => {
    setManualLicenses([
      ...manualLicenses,
      {
        licenseNumber: "",
        type: "Especialidad",
        institution: "",
        isPrimary: false,
      },
    ]);
  };

  const removeManualLicense = (index: number) => {
    const newLicenses = manualLicenses.filter((_, i) => i !== index);
    if (newLicenses.length > 0 && !newLicenses.some((l) => l.isPrimary)) {
      newLicenses[0].isPrimary = true;
    }
    setManualLicenses(newLicenses);
  };

  const updateLicense = (index: number, field: string, value: any) => {
    setManualLicenses((prev) => {
      const newLicenses = [...prev];
      if (field === "isPrimary" && value === true) {
        newLicenses.forEach((l) => (l.isPrimary = false));
      }
      newLicenses[index] = { ...newLicenses[index], [field]: value };
      return newLicenses;
    });
  };

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (pageLoading)
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center justify-center gap-3 transition-colors font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center pt-28 pb-20 px-6 md:pt-36 md:px-12 transition-colors duration-500 selection:bg-emerald-100 dark:selection:bg-emerald-950/30 font-sans">
      {/* ── MODAL DE CÁMARA ──────────────────────────────────────────────── */}
      {/* ── MODAL UNIVERSAL DE CÁMARA & CÉDULAS ──────────────────────────── */}
      <UniversalCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        mode="document"
        title="Capturar Cédula Profesional"
        description="Alinea la cédula o título dentro de las esquinas guía"
        onCapture={(file) => {
          processFile(file);
          setIsCameraOpen(false);
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10 space-y-6"
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("back")}</span>
          </button>

          {!config.isSalud && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300">
              <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("optional_step")}</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          {/* Form Header */}
          <div className="text-center space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-sm">
              <IconComponent className="w-6 h-6" strokeWidth={2} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {config.title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              {config.description}
            </p>
          </div>

          <div className="space-y-8">
            {/* Rejection Alert */}
            <AnimatePresence>
              {license?.verificationStatus === "REJECTED" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> {t("rejected_title")}
                    </p>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300 leading-relaxed">
                      {license.rejectionReason || t("rejected_desc")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Asistente IA Upload Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("ai_assistant.title")}
                </Label>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                  <Sparkles className="w-3 h-3" />
                  <span>{t("ai_assistant.badge")}</span>
                </span>
              </div>

              {preview ? (
                <div className="relative group h-44 w-full rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 overflow-hidden flex items-center justify-center p-2 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Vista previa de cédula"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      type="button"
                      onClick={removeFile}
                      className="h-10 px-5 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      <span>{t("change_image")}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-2 group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("ai_assistant.upload_prompt")}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                      {t("ai_assistant.upload_hint")}
                    </p>
                  </div>

                  <div
                    onClick={startCamera}
                    className="h-32 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] hover:border-emerald-500/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all shadow-sm group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-2 group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {t("ai_assistant.camera_prompt")}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                      {t("ai_assistant.camera_hint")}
                    </p>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-6" />

            {/* Sección de Cédulas Manuales */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("manual_section.title")}
                </Label>
                <button
                  type="button"
                  onClick={addManualLicense}
                  className="h-9 px-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>{t("manual_section.add_btn")}</span>
                </button>
              </div>

              <div className="space-y-4">
                {manualLicenses.map((lic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-6 rounded-3xl border transition-all space-y-4 shadow-sm",
                      lic.isPrimary
                        ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-950/10"
                        : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]"
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => updateLicense(index, "isPrimary", true)}
                        className="flex items-center gap-2.5 text-left group"
                      >
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                            lic.isPrimary
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-gray-300 dark:border-gray-700 group-hover:border-emerald-500"
                          )}
                        >
                          {lic.isPrimary && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            lic.isPrimary
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-gray-500"
                          )}
                        >
                          {lic.isPrimary
                            ? t("manual_section.primary_badge")
                            : t("manual_section.set_primary")}
                        </span>
                      </button>

                      {manualLicenses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeManualLicense(index)}
                          className="w-8 h-8 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {t("manual_section.license_number_label")} *
                        </Label>
                        <Input
                          value={lic.licenseNumber}
                          onChange={(e) =>
                            updateLicense(index, "licenseNumber", e.target.value)
                          }
                          className="h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold font-mono text-gray-900 dark:text-white shadow-sm focus-visible:ring-emerald-500/20"
                          placeholder={t("manual_section.license_number_placeholder")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {t("manual_section.degree_type_label")} *
                        </Label>
                        <Input
                          value={lic.type}
                          onChange={(e) =>
                            updateLicense(index, "type", e.target.value)
                          }
                          className="h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white shadow-sm focus-visible:ring-emerald-500/20"
                          placeholder={t("manual_section.degree_type_placeholder")}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {t("manual_section.institution_label")} *
                      </Label>
                      <Input
                        value={lic.institution}
                        onChange={(e) =>
                          updateLicense(index, "institution", e.target.value)
                        }
                        className="h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white shadow-sm focus-visible:ring-emerald-500/20"
                        placeholder={t("manual_section.institution_placeholder")}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              {!config.isSalud && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="sm:flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-bold shadow-sm"
                >
                  {t("skip")}
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={isUploading || isSaving}
                className={cn(
                  "h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50",
                  !config.isSalud ? "sm:flex-1" : "w-full"
                )}
              >
                {isUploading || isSaving ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("saving")}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" strokeWidth={2} />
                    <span>{config.buttonText}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("security_footer")}</span>
        </div>
      </motion.div>
    </div>
  );
}