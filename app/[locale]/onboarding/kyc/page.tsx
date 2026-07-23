"use client";

/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  ScanFace,
  Camera,
  ArrowLeft,
  Lock,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Shield,
  Check,
  Sparkles,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useKycOnboarding } from "@/hooks/useKycOnboarding";
import { KycDocumentType, KycVerificationStatus } from "@/types/onboarding";
import { useTranslations } from "next-intl";
import { handleApiError } from "@/lib/handleApiError";
import { QhSpinner } from "@/components/ui/QhSpinner";

type UiDocType = "ine" | "passport" | "acta";

export default function KycPage() {
  const router = useRouter();
  const t = useTranslations("OnboardingKyc");
  const {
    documents,
    uploadingState,
    uploadDocument,
    isKycComplete,
    isLoading: isInitialLoading,
    personType,
  } = useKycOnboarding();

  const [activeTab, setActiveTab] = useState<UiDocType>("ine");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeCaptureType, setActiveCaptureType] =
    useState<KycDocumentType | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ineFrontInput = useRef<HTMLInputElement>(null);
  const ineBackInput = useRef<HTMLInputElement>(null);
  const passportInput = useRef<HTMLInputElement>(null);
  const selfieInput = useRef<HTMLInputElement>(null);
  const actaInput = useRef<HTMLInputElement>(null);

  const startCamera = async (docType: KycDocumentType) => {
    setActiveCaptureType(docType);
    setIsCameraOpen(true);
    try {
      const isSelfie = docType === "SELFIE";
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isSelfie ? "user" : "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (e) {
      handleApiError(e);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setActiveCaptureType(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !activeCaptureType) return;
    const v = videoRef.current,
      c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (ctx) {
      if (activeCaptureType === "SELFIE") {
        ctx.translate(c.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(v, 0, 0, c.width, c.height);
      c.toBlob(
        (blob) => {
          if (blob) {
            const f = new File([blob], `${activeCaptureType}_capture.jpg`, {
              type: "image/jpeg",
            });
            handleUpload(f, activeCaptureType);
            stopCamera();
          }
        },
        "image/jpeg",
        0.9,
      );
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: KycDocumentType,
  ) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f, type);
  };

  const handleUpload = async (file: File, type: KycDocumentType) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.warning("El archivo excede el límite de 10MB.");
      return;
    }
    await uploadDocument(file, type);
  };

  // Badges de Estado Estilizados
  const getStatusBadge = (status?: KycVerificationStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
            <Check className="w-3 h-3" strokeWidth={2.5} />
            <span>{t("approved", { defaultValue: "Aprobado" })}</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-900/40">
            <AlertCircle className="w-3 h-3" strokeWidth={2} />
            <span>{t("rejected", { defaultValue: "Rechazado" })}</span>
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-900/40 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2} />
            <span>{t("verifying", { defaultValue: "Verificando..." })}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-700">
            <span>{t("pending", { defaultValue: "Pendiente" })}</span>
          </span>
        );
    }
  };

  const renderUploadZone = ({
    type,
    label,
    description,
    inputRef,
  }: {
    type: KycDocumentType;
    label: string;
    description?: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => {
    const docData = documents[type];
    const isUp = uploadingState[type];
    const isApproved = docData?.verificationStatus === "APPROVED";
    const isRejected = docData?.verificationStatus === "REJECTED";
    const isProcessing = docData?.verificationStatus === "PROCESSING";

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white dark:bg-[#0a0a0a] border rounded-3xl p-6 sm:p-7 shadow-sm transition-all space-y-4",
          isApproved && "border-emerald-500/40 dark:border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10",
          isRejected && "border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10",
          isProcessing && "border-blue-200 dark:border-blue-900/40",
          !isApproved && !isRejected && !isProcessing && "border-gray-100 dark:border-gray-800"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-bold text-gray-900 dark:text-white block">
              {label}
            </Label>
            {description && (
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <div>{getStatusBadge(docData?.verificationStatus)}</div>
        </div>

        <AnimatePresence>
          {isRejected && docData?.rejectionReason && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 font-medium space-y-1"
            >
              <p className="font-bold uppercase tracking-wider text-[10px]">Motivo del rechazo:</p>
              <p>{docData.rejectionReason}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {docData?.fileUrl ? (
          <div className="relative h-52 w-full rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 overflow-hidden group/preview flex items-center justify-center p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={docData.fileUrl}
              alt="Vista previa del documento"
              className="w-full h-full object-contain"
            />
            {!isApproved && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all duration-300">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="h-10 px-5 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{t("change_image", { defaultValue: "Cambiar Imagen" })}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => !isUp && inputRef.current?.click()}
              className="h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 flex flex-col items-center justify-center gap-2.5 p-4 transition-all group/upload"
            >
              {isUp ? (
                <>
                  <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("uploading", { defaultValue: "Subiendo..." })}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover/upload:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      {t("upload_image", { defaultValue: "Subir Archivo" })}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400">
                      {t("file_hint", { defaultValue: "PNG, JPG • Máx 10MB" })}
                    </span>
                  </div>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => !isUp && startCamera(type)}
              className="h-32 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] hover:border-emerald-500/50 flex flex-col items-center justify-center gap-2.5 p-4 transition-all shadow-sm group/cam"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover/cam:scale-105 transition-transform">
                <Camera className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                  {t("camera", { defaultValue: "Usar Cámara" })}
                </span>
                <span className="text-[10px] font-semibold text-gray-400">
                  Captura directa en vivo
                </span>
              </div>
            </button>
          </div>
        )}

        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg"
          onChange={(e) => handleFileChange(e, type)}
        />
      </motion.div>
    );
  };

  const handleFinishStep = () => {
    if (isKycComplete()) {
      toast.success(t("success_toast", { defaultValue: "¡Verificación completada con éxito!" }));
      router.push("/onboarding");
      router.refresh();
    } else {
      toast.warn(t("pending_toast", { defaultValue: "Por favor completa todos los documentos requeridos." }));
    }
  };

  const calculateProgress = () => {
    let completed = 0;
    let total = personType === "MORAL" ? 3 : 2;
    const isIdApproved =
      (documents["INE_FRONT"]?.verificationStatus === "APPROVED" &&
        documents["INE_BACK"]?.verificationStatus === "APPROVED") ||
      documents["PASSPORT"]?.verificationStatus === "APPROVED";
    if (isIdApproved) completed++;
    if (documents["SELFIE"]?.verificationStatus === "APPROVED") completed++;
    if (
      personType === "MORAL" &&
      documents["ACTA_CONSTITUTIVA"]?.verificationStatus === "APPROVED"
    )
      completed++;
    return (completed / total) * 100;
  };

  if (isInitialLoading)
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 bg-gray-50/50 dark:bg-[#050505] selection:bg-emerald-100 font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 animate-pulse">
          {t("loading", { defaultValue: "Cargando expediente de verificación..." })}
        </p>
      </div>
    );

  const isIdentityApproved =
    (documents["INE_FRONT"]?.verificationStatus === "APPROVED" &&
      documents["INE_BACK"]?.verificationStatus === "APPROVED") ||
    documents["PASSPORT"]?.verificationStatus === "APPROVED";
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white pt-28 pb-20 px-6 md:px-12 selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 font-sans">
      
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

              {/* Guía Visual / Overlay */}
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
                  className={cn(
                    "border-2 border-emerald-400 rounded-3xl relative shadow-2xl bg-emerald-500/5",
                    activeCaptureType === "SELFIE" ? "w-64 h-80 rounded-full" : "w-[380px] h-[240px]",
                  )}
                />

                <div className="mt-6 bg-black/80 backdrop-blur-md border border-gray-800 px-4 py-2 rounded-full shadow-lg">
                  <p className="text-white text-xs font-bold flex items-center gap-2">
                    <ScanFace className="w-4 h-4 text-emerald-400" />
                    {activeCaptureType === "SELFIE"
                      ? t("camera_selfie_hint", { defaultValue: "Centra tu rostro dentro del círculo" })
                      : t("camera_doc_hint", { defaultValue: "Alinea tu documento dentro del marco" })}
                  </p>
                </div>
              </div>

              {/* Controles Inferiores */}
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

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header de Navegación */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("back", { defaultValue: "Volver" })}</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Validación Biométrica KYC</span>
          </div>
        </div>

        {/* Hero Title & Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title", { defaultValue: "Verificación de Identidad" })}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
              {t("desc", { defaultValue: "Sube una identificación oficial vigente y una prueba de vida (selfie) para verificar tu cuenta en cumplimiento con normativas de seguridad médica." })}
            </p>
          </div>

          {/* Barra de Progreso */}
          <div className="max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-400 uppercase tracking-wider">
                {t("progress", { defaultValue: "Progreso de Verificación" })}
              </span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: ZONAS DE CARGA */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Card Documento de Identidad */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                  <FileCheck className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {t("id_title", { defaultValue: "Documento de Identificación" })}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    {t("id_desc", { defaultValue: "Selecciona tu tipo de documento oficial y sube ambas caras." })}
                  </p>
                </div>
              </div>

              {/* Tabs de Documentos */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as UiDocType)}
                className="w-full space-y-6"
              >
                <TabsList className="flex w-full bg-gray-50/50 dark:bg-[#050505] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <TabsTrigger
                    value="ine"
                    disabled={isIdentityApproved}
                    className="flex-1 rounded-xl text-xs font-bold py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-gray-600 dark:text-gray-400"
                  >
                    {t("ine_tab", { defaultValue: "Credencial INE / IFE" })}
                  </TabsTrigger>
                  <TabsTrigger
                    value="passport"
                    disabled={isIdentityApproved}
                    className="flex-1 rounded-xl text-xs font-bold py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-gray-600 dark:text-gray-400"
                  >
                    {t("passport_tab", { defaultValue: "Pasaporte" })}
                  </TabsTrigger>
                  {personType === "MORAL" && (
                    <TabsTrigger
                      value="acta"
                      className="flex-1 rounded-xl text-xs font-bold py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all text-gray-600 dark:text-gray-400"
                    >
                      Acta Constitutiva
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>

              {activeTab === "ine" && (
                <div className="space-y-6">
                  {renderUploadZone({
                    type: "INE_FRONT",
                    label: t("ine_front", { defaultValue: "INE / IFE (Frente)" }),
                    description: t("ine_front_desc", { defaultValue: "Fotografía frontal clara del documento oficial." }),
                    inputRef: ineFrontInput,
                  })}
                  {renderUploadZone({
                    type: "INE_BACK",
                    label: t("ine_back", { defaultValue: "INE / IFE (Reverso)" }),
                    description: t("ine_back_desc", { defaultValue: "Reverso del documento con código de barras visible." }),
                    inputRef: ineBackInput,
                  })}
                </div>
              )}

              {activeTab === "passport" &&
                renderUploadZone({
                  type: "PASSPORT",
                  label: t("passport_label", { defaultValue: "Pasaporte Vigente" }),
                  description: t("passport_desc", { defaultValue: "Página de datos personales con fotografía." }),
                  inputRef: passportInput,
                })}

              {activeTab === "acta" &&
                personType === "MORAL" &&
                renderUploadZone({
                  type: "ACTA_CONSTITUTIVA",
                  label: "Acta Constitutiva",
                  description: "Documento legal de constitución corporativa",
                  inputRef: actaInput,
                })}
            </div>

            {/* Card Prueba de Vida (Selfie) */}
            <div className={cn(
              "bg-white dark:bg-[#0a0a0a] border rounded-3xl p-6 sm:p-8 shadow-sm transition-all space-y-6",
              isIdentityApproved ? "border-gray-100 dark:border-gray-800" : "border-gray-100 dark:border-gray-800 opacity-60 pointer-events-none"
            )}>
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                  <ScanFace className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {t("selfie_title", { defaultValue: "Prueba de Vida Biométrica" })}
                  </h3>
                  <p className="text-xs font-medium text-gray-500">
                    {t("selfie_desc", { defaultValue: "Selfie facial para validar coincidencia con tu identificación." })}
                  </p>
                </div>
              </div>

              <div>
                {isIdentityApproved ? (
                  renderUploadZone({
                    type: "SELFIE",
                    label: t("selfie_label", { defaultValue: "Fotografía Selfie" }),
                    description: t("selfie_hint", { defaultValue: "Asegúrate de tener buena iluminación y mirar al frente." }),
                    inputRef: selfieInput,
                  })
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {t("step_locked", { defaultValue: "Paso Bloqueado Temporalmente" })}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400">
                        {t("step_locked_desc", { defaultValue: "Primero debes aprobar tu documento de identidad para proceder con la selfie." })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: PANEL DE ESTADO Y RESUMEN */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              
              <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("status_title", { defaultValue: "Estado del Proceso" })}
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    done: isIdentityApproved,
                    icon: ShieldCheck,
                    label: t("identification", { defaultValue: "Identificación Oficial" }),
                  },
                  {
                    done: documents["SELFIE"]?.verificationStatus === "APPROVED",
                    icon: ScanFace,
                    label: t("proof_of_life", { defaultValue: "Prueba Biométrica" }),
                  },
                  ...(personType === "MORAL"
                    ? [
                        {
                          done: documents["ACTA_CONSTITUTIVA"]?.verificationStatus === "APPROVED",
                          icon: FileCheck,
                          label: "Acta Constitutiva",
                        },
                      ]
                    : []),
                ].map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            item.done
                              ? "bg-emerald-600 text-white"
                              : "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-400",
                          )}
                        >
                          {item.done ? (
                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          ) : (
                            <ItemIcon className="w-3.5 h-3.5" strokeWidth={2} />
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinishStep}
                  disabled={!isKycComplete()}
                  className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{t("confirm_continue", { defaultValue: "Continuar con Siguiente Paso" })}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>

                {!isKycComplete() && (
                  <p className="text-[11px] font-medium text-gray-400 text-center pt-3">
                    {t("complete_docs_hint", { defaultValue: "Completa la validación de todos los documentos requeridos para continuar." })}
                  </p>
                )}
              </div>

              {/* Data Protection Note */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1.5">
                <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("data_protected_title", { defaultValue: "Privacidad Garantizada" })}</span>
                </p>
                <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                  {t("data_protected_desc", { defaultValue: "Tus datos biométricos e identificaciones se procesan bajo protocolos de cifrado de extremo a extremo." })}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}