/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/click-events-have-key-events */
"use client";

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
  Check,
  Camera,
  Plus,
  Trash2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLicenseOnboarding } from "@/hooks/useLicenseOnboarding";
import { useTranslations } from "next-intl";
import { QhSpinner } from "@/components/ui/QhSpinner";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (e) {
      console.error(e);
      setIsCameraOpen(false);
      toast.error("No se pudo acceder a la cámara");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current,
      c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob(
        (blob) => {
          if (blob) {
            const f = new File([blob], `license_capture.jpg`, {
              type: "image/jpeg",
            });
            processFile(f);
            stopCamera();
          }
        },
        "image/jpeg",
        0.9,
      );
    }
  };

  const config = {
    isSalud: sector === "HEALTH",
    title: sector === "HEALTH" ? t("health_title", { defaultValue: "Cédula Profesional Médica" }) : t("beauty_title", { defaultValue: "Licencia Comercial" }),
    icon: sector === "HEALTH" ? GraduationCap : Store,
    description: sector === "HEALTH" ? t("health_desc", { defaultValue: "Registra tu título y cédula profesional para validar tu práctica clínica en QuHealthy." }) : t("beauty_desc", { defaultValue: "Registra los permisos de operación de tu establecimiento." }),
    infoText: sector === "HEALTH" ? t("health_info", { defaultValue: "Verificación obligatoria para profesionales de la salud." }) : t("beauty_info", { defaultValue: "Paso opcional." }),
    buttonText: "Guardar y Continuar",
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
      toast.warning("El archivo excede los 20MB permitidos.");
      return;
    }
    if (!selectedFile.type.startsWith("image/")) {
      toast.warning("Por favor selecciona un archivo de imagen válido.");
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
      toast.info(t("skip", { defaultValue: "Paso omitido temporalmente" }));
      router.push("/onboarding");
    }
  };

  const handleSaveAndContinue = async () => {
    const isValid = manualLicenses.every(
      (l) =>
        l.licenseNumber.trim() !== "" &&
        l.institution.trim() !== "" &&
        l.type.trim() !== "",
    );
    if (!isValid) {
      toast.error("Por favor completa todos los campos requeridos en las cédulas.");
      return;
    }
    const hasPrimary = manualLicenses.some((l) => l.isPrimary);
    if (!hasPrimary) {
      toast.error("Debes seleccionar una cédula como principal.");
      return;
    }

    const success = await saveLicenses(manualLicenses);
    if (success) {
      toast.success("Cédulas guardadas. Redirigiendo...");
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
          Validando credenciales profesionales...
        </p>
      </div>
    );

  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col items-center pt-28 pb-20 px-6 md:pt-36 md:px-12 transition-colors duration-500 selection:bg-emerald-100 dark:selection:bg-emerald-950/30 font-sans">
      
      {/* ── MODAL DE CÁMARA ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-12"
          >
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <motion.div
                  animate={{ scale: [1, 1.01, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-[380px] h-[240px] border-2 border-emerald-400 rounded-2xl relative shadow-2xl bg-emerald-500/5"
                />
                <div className="mt-6 bg-black/80 backdrop-blur-md border border-gray-800 px-4 py-2 rounded-full shadow-lg">
                  <p className="text-white text-xs font-bold flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    Alinea tu título o cédula dentro del marco
                  </p>
                </div>
              </div>

              <div className="absolute bottom-6 inset-x-0 flex justify-center items-center gap-6 z-10">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="h-11 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors text-xs font-bold shadow-sm"
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center text-white shadow-lg"
                >
                  <Camera className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <span>{t("back", { defaultValue: "Volver" })}</span>
          </button>

          {!config.isSalud && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300">
              <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("optional_step", { defaultValue: "Paso opcional" })}</span>
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
                      <AlertTriangle className="w-4 h-4" /> {t("rejected_title", { defaultValue: "Cédula Rechazada" })}
                    </p>
                    <p className="text-xs font-medium text-red-700 dark:text-red-300 leading-relaxed">
                      {license.rejectionReason || t("rejected_desc", { defaultValue: "Por favor verifica la validez del documento e intenta de nuevo." })}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Asistente IA Upload Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Asistente de Auto-llenado (IA)
                </Label>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                  <Sparkles className="w-3 h-3" />
                  <span>Extracción Automática</span>
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
                      <span>{t("change_image", { defaultValue: "Cambiar Archivo" })}</span>
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
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Subir Título / Cédula</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">PDF o Imagen • Máx 20MB</p>
                  </div>

                  <div
                    onClick={startCamera}
                    className="h-32 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] hover:border-emerald-500/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all shadow-sm group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-2 group-hover:scale-105 transition-transform">
                      <Camera className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">Tomar Foto con Cámara</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Captura en vivo</p>
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
                  Cédulas Profesionales Registradas
                </Label>
                <button
                  type="button"
                  onClick={addManualLicense}
                  className="h-9 px-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Agregar Cédula</span>
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
                        : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]",
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
                              : "border-gray-300 dark:border-gray-700 group-hover:border-emerald-500",
                          )}
                        >
                          {lic.isPrimary && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          lic.isPrimary ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"
                        )}>
                          {lic.isPrimary ? "Cédula Principal" : "Establecer como principal"}
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
                          Número de Cédula *
                        </Label>
                        <Input
                          value={lic.licenseNumber}
                          onChange={(e) =>
                            updateLicense(index, "licenseNumber", e.target.value)
                          }
                          className="h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold font-mono text-gray-900 dark:text-white shadow-sm focus-visible:ring-emerald-500/20"
                          placeholder="Ej. 1234567"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Tipo de Título / Grado *
                        </Label>
                        <Input
                          value={lic.type}
                          onChange={(e) =>
                            updateLicense(index, "type", e.target.value)
                          }
                          className="h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white shadow-sm focus-visible:ring-emerald-500/20"
                          placeholder="Ej. Licenciatura, Especialidad Médica"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Institución Emisora *
                      </Label>
                      <Input
                        value={lic.institution}
                        onChange={(e) =>
                          updateLicense(index, "institution", e.target.value)
                        }
                        className="h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white shadow-sm focus-visible:ring-emerald-500/20"
                        placeholder="Ej. Universidad Nacional Autónoma de México"
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
                  {t("skip", { defaultValue: "Omitir por ahora" })}
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={isUploading || isSaving}
                className={cn(
                  "h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50",
                  !config.isSalud ? "sm:flex-1" : "w-full",
                )}
              >
                {isUploading || isSaving ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>Procesando credenciales...</span>
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
          <span>{t("security_footer", { defaultValue: "Validación oficial ante el Registro Nacional de Profesionistas." })}</span>
        </div>

      </motion.div>
    </div>
  );
}