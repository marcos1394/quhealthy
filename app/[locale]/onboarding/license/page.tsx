/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/click-events-have-key-events */
"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  FileText,
  Clock,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  Store,
  Sparkles,
  Shield,
  Info,
  Check,
  Camera,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLicenseOnboarding } from "@/hooks/useLicenseOnboarding";
import { toast } from "react-toastify";
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
    title: sector === "HEALTH" ? t("health_title") : t("beauty_title"),
    icon: sector === "HEALTH" ? GraduationCap : Store,
    description: sector === "HEALTH" ? t("health_desc") : t("beauty_desc"),
    infoText: sector === "HEALTH" ? t("health_info") : t("beauty_info"),
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
    if (selectedFile.size > 20 * 1024 * 1024) return;
    if (!selectedFile.type.startsWith("image/")) return;
    await processFile(selectedFile);
  };

  const removeFile = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };
  const handleSkip = () => {
    if (!config.isSalud) {
      toast.info(t("skip"));
      router.push("/onboarding");
    }
  };

  const handleSaveAndContinue = async () => {
    // Validate
    const isValid = manualLicenses.every(
      (l) =>
        l.licenseNumber.trim() !== "" &&
        l.institution.trim() !== "" &&
        l.type.trim() !== "",
    );
    if (!isValid) {
      toast.error("Por favor completa todos los campos de las cédulas");
      return;
    }
    const hasPrimary = manualLicenses.some((l) => l.isPrimary);
    if (!hasPrimary) {
      toast.error("Debes seleccionar una cédula como principal");
      return;
    }

    const success = await saveLicenses(manualLicenses);
    if (success) {
      toast.success("Cédulas guardadas. Redirigiendo a tu panel...");
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
    // Si eliminamos la principal, hacer la primera principal
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

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (pageLoading)
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 transition-colors">
        <QhSpinner size="lg" label="Validando Credenciales..." />
      </div>
    );

  const IconComponent = config.icon;

  // ---------------------------------------------------------------------------
  // MAIN UPLOAD FORM
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center pt-24 pb-12 px-6 md:pt-32 md:pb-24 md:px-12 transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 md:p-12"
          >
            <div className="relative w-full max-w-5xl aspect-video bg-black border border-gray-800">
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
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={cn("border border-white/60 relative", "w-96 h-60")}
                >
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-red-500" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-red-500" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-red-500" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-red-500" />
                </motion.div>
                <div className="mt-8 bg-black border border-white px-4 py-2">
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Alinea tu documento
                  </p>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-12 z-10">
                <Button
                  variant="ghost"
                  onClick={stopCamera}
                  className="rounded-none bg-black text-white hover:bg-white hover:text-black border border-white h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Cancelar
                </Button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-none border border-white bg-black hover:bg-white hover:text-black transition-colors flex items-center justify-center group"
                >
                  <Camera className="w-6 h-6 text-white group-hover:text-black" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10 space-y-8 my-auto"
      >
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <Button
            variant="ghost"
            className="rounded-none hover:bg-gray-50 dark:hover:bg-gray-900 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500"
            onClick={() => router.push("/onboarding")}
          >
            <ArrowLeft className="mr-3 h-4 w-4" />
            {t("back")}
          </Button>
          {!config.isSalud && (
            <div className="border border-gray-300 dark:border-gray-700 px-3 py-1 bg-gray-50 dark:bg-[#050505]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Info className="w-3 h-3" /> {t("optional_step")}
              </span>
            </div>
          )}
        </div>

        <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          {/* Form Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 p-8 md:p-12 bg-gray-50 dark:bg-[#050505] text-center">
            <div className="w-16 h-16 mx-auto border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black mb-6">
              <IconComponent
                className="w-6 h-6 text-black dark:text-white"
                strokeWidth={1.5}
              />
            </div>
            <h1 className="text-3xl font-semibold text-black dark:text-white tracking-tight mb-3">
              {config.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-light max-w-md mx-auto">
              {config.description}
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            {/* Rejection Alert */}
            <AnimatePresence>
              {license?.verificationStatus === "REJECTED" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10 mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />{" "}
                      {t("rejected_title")}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300 font-light leading-relaxed">
                      {license.rejectionReason || t("rejected_desc")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Assistant Upload Section */}
            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white block flex justify-between">
                <span>Asistente de Auto-llenado (Opcional)</span>
                <span className="text-blue-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> IA
                </span>
              </Label>

              {preview ? (
                <div className="relative group h-40 w-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#050505] p-2 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                      onClick={removeFile}
                      className="rounded-none bg-white text-black hover:bg-gray-200 h-10 px-4 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <X className="w-4 h-4 mr-2" /> {t("change_image")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="h-32 w-full border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-[#0a0a0a] flex flex-col items-center justify-center cursor-pointer transition-colors group"
                  >
                    <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white mb-2 transition-colors" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      Subir Archivo
                    </p>
                  </div>
                  <div
                    onClick={startCamera}
                    className="h-32 w-full border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-[#0a0a0a] flex flex-col items-center justify-center cursor-pointer transition-colors group"
                  >
                    <Camera className="w-5 h-5 text-gray-400 group-hover:text-black dark:group-hover:text-white mb-2 transition-colors" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      Tomar Foto
                    </p>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-8" />

            {/* Manual Form Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white block">
                  Cédulas Profesionales
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addManualLicense}
                  className="rounded-none border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-8 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  <Plus className="w-3 h-3 mr-2" /> Agregar Otra
                </Button>
              </div>

              {manualLicenses.map((lic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "border p-6 bg-gray-50 dark:bg-[#050505] space-y-4",
                    lic.isPrimary
                      ? "border-black dark:border-white"
                      : "border-gray-200 dark:border-gray-800",
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateLicense(index, "isPrimary", true)}
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                          lic.isPrimary
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-400",
                        )}
                      >
                        {lic.isPrimary && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          lic.isPrimary ? "text-blue-500" : "text-gray-500",
                        )}
                      >
                        {lic.isPrimary
                          ? "Cédula Principal"
                          : "Marcar como principal"}
                      </span>
                    </div>
                    {manualLicenses.length > 1 && (
                      <button
                        onClick={() => removeManualLicense(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500">
                        Número de Cédula *
                      </Label>
                      <Input
                        value={lic.licenseNumber}
                        onChange={(e) =>
                          updateLicense(index, "licenseNumber", e.target.value)
                        }
                        className="rounded-none bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700 font-mono"
                        placeholder="Ej. 1234567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500">
                        Tipo *
                      </Label>
                      <Input
                        value={lic.type}
                        onChange={(e) =>
                          updateLicense(index, "type", e.target.value)
                        }
                        className="rounded-none bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700"
                        placeholder="Ej. Licenciatura, Especialidad"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-gray-500">
                      Institución Emisora *
                    </Label>
                    <Input
                      value={lic.institution}
                      onChange={(e) =>
                        updateLicense(index, "institution", e.target.value)
                      }
                      className="rounded-none bg-white dark:bg-[#0a0a0a] border-gray-300 dark:border-gray-700"
                      placeholder="Ej. Universidad Nacional..."
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
              {!config.isSalud && (
                <Button
                  variant="outline"
                  className="sm:flex-1 h-14 rounded-none border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors"
                  onClick={handleSkip}
                >
                  {t("skip")}
                </Button>
              )}
              <Button
                className={cn(
                  "h-14 rounded-none text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
                  !config.isSalud ? "sm:flex-1" : "w-full",
                  "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200",
                )}
                onClick={handleSaveAndContinue}
                disabled={isUploading || isSaving}
              >
                {isUploading || isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-3" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-3" />
                    {config.buttonText}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-3">
          <Shield className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
            {t("security_footer")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
