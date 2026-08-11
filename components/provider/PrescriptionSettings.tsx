"use client";

/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Palette,
  Image as ImageIcon,
  PenTool,
  FileText,
  Upload,
  Eraser,
  Check,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { onboardingService } from "@/services/onboarding.service";
import { usePrescriptionScanner } from "@/hooks/usePrescriptionScanner";
import { cn } from "@/lib/utils";

interface State {
  formData: {
    prescriptionColor: string;
    prescriptionLogoUrl: string;
    signatureUrl: string;
    prescriptionFooterNote: string;
    prescriptionCustomHtml: string;
  };
  isLoading: boolean;
  isSaving: boolean;
  isUploadingLogo: boolean;
  isUploadingSignature: boolean;
  showSuccess: boolean;
  signatureMode: "upload" | "draw";
  localSignaturePreview: string | null;
}

export const PrescriptionSettings = () => {
  const t = useTranslations("PrescriptionSettings");
  const router = useRouter();

  const [
    {
      formData,
      isLoading,
      isSaving,
      isUploadingLogo,
      isUploadingSignature,
      showSuccess,
      signatureMode,
      localSignaturePreview,
    },
    dispatch,
  ] = React.useReducer(
    (state: State, action: { type: string; payload: any }): State => {
      switch (action.type) {
        case "SET_FORMDATA":
          return {
            ...state,
            formData:
              typeof action.payload === "function"
                ? action.payload(state.formData)
                : action.payload,
          };
        case "SET_ISLOADING":
          return { ...state, isLoading: action.payload };
        case "SET_ISSAVING":
          return { ...state, isSaving: action.payload };
        case "SET_ISUPLOADINGLOGO":
          return { ...state, isUploadingLogo: action.payload };
        case "SET_ISUPLOADINGSIGNATURE":
          return { ...state, isUploadingSignature: action.payload };
        case "SET_SHOWSUCCESS":
          return { ...state, showSuccess: action.payload };
        case "SET_SIGNATUREMODE":
          return { ...state, signatureMode: action.payload };
        case "SET_LOCALSIGNATUREPREVIEW":
          return { ...state, localSignaturePreview: action.payload };
        default:
          return state;
      }
    },
    {
      formData: {
        prescriptionColor: "#059669",
        prescriptionLogoUrl: "",
        signatureUrl: "",
        prescriptionFooterNote: "",
        prescriptionCustomHtml: "",
      },
      isLoading: true,
      isSaving: false,
      isUploadingLogo: false,
      isUploadingSignature: false,
      showSuccess: false,
      signatureMode: "upload",
      localSignaturePreview: null,
    }
  );

  const setFormData = (val: any) =>
    dispatch({ type: "SET_FORMDATA", payload: val });
  const setIsLoading = (val: boolean) =>
    dispatch({ type: "SET_ISLOADING", payload: val });
  const setIsSaving = (val: boolean) =>
    dispatch({ type: "SET_ISSAVING", payload: val });
  const setIsUploadingLogo = (val: boolean) =>
    dispatch({ type: "SET_ISUPLOADINGLOGO", payload: val });
  const setIsUploadingSignature = (val: boolean) =>
    dispatch({ type: "SET_ISUPLOADINGSIGNATURE", payload: val });
  const setShowSuccess = (val: boolean) =>
    dispatch({ type: "SET_SHOWSUCCESS", payload: val });
  const setSignatureMode = (val: "upload" | "draw") =>
    dispatch({ type: "SET_SIGNATUREMODE", payload: val });
  const setLocalSignaturePreview = (val: string | null) =>
    dispatch({ type: "SET_LOCALSIGNATUREPREVIEW", payload: val });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await onboardingService.getOnboardingStatus();
        setFormData({
          prescriptionColor: data.prescriptionColor || "#059669",
          prescriptionLogoUrl: data.prescriptionLogoUrl || "",
          signatureUrl: data.signatureUrl || "",
          prescriptionFooterNote: data.prescriptionFooterNote || "",
          prescriptionCustomHtml: data.prescriptionCustomHtml || "",
        });
      } catch (error) {
        console.error("Error al obtener preferencias:", error);
        toast.error(t("toast_load_error"));
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, [t]);

  const { isScanning, scanResult, scanPrescriptionFile } = usePrescriptionScanner();

  const handleScanPrescription = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await scanPrescriptionFile(file);
      if (result) {
        setFormData((prev: any) => ({
          ...prev,
          prescriptionColor: result.dominantColor || prev.prescriptionColor,
          prescriptionCustomHtml: result.customHtmlTemplate || prev.prescriptionCustomHtml,
        }));
        toast.success("Receta escaneada exitosamente");
      }
    } catch (error) {
      toast.error("Ocurrió un error al escanear la receta");
    } finally {
      e.target.value = "";
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({ ...prev, prescriptionColor: e.target.value }));
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const response = await onboardingService.uploadPrescriptionMedia(
        file,
        "LOGO"
      );
      setFormData((prev: any) => ({
        ...prev,
        prescriptionLogoUrl: response.url,
      }));
      toast.success(t("toast_logo_success"));
    } catch (error) {
      console.error("Error subiendo logo:", error);
      toast.error(t("toast_logo_error"));
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  };

  const processSignatureFile = async (file: File) => {
    setIsUploadingSignature(true);
    try {
      const response = await onboardingService.uploadPrescriptionMedia(
        file,
        "SIGNATURE"
      );
      setFormData((prev: any) => ({ ...prev, signatureUrl: response.url }));
      setLocalSignaturePreview(URL.createObjectURL(file));
      toast.success(t("toast_signature_success"));
    } catch (error) {
      console.error("Error subiendo firma:", error);
      toast.error(t("toast_signature_error"));
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleSignatureUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSignatureFile(file);
    e.target.value = "";
  };

  // ── LÓGICA DEL CANVAS TÁCTIL ──────────────────────────────────────────
  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    draw(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const coords = getCanvasCoordinates(e);
    if (!ctx || !coords) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#059669";

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error(t("toast_canvas_empty"));
        return;
      }
      const file = new File([blob], `signature-${Date.now()}.png`, {
        type: "image/png",
      });
      processSignatureFile(file);
    }, "image/png");
  };

  // ── GUARDAR PREFERENCIAS GLOBALES ──────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    setShowSuccess(false);
    try {
      await onboardingService.updatePrescriptionPreferences(formData);
      toast.success(t("toast_save_success"));
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/provider/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error guardando:", error);
      toast.error(t("toast_save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 shadow-2xs flex flex-col justify-center items-center min-h-[350px] gap-3 font-sans select-none">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto font-sans select-none transition-colors">
      {/* ── PANEL DE CONTROLES (IZQUIERDA) ───────────────────────────── */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
        <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-start gap-3.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/provider/dashboard")}
            className="w-9 h-9 shrink-0 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Button>

          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("description")}
            </p>
          </div>
        </div>

        {/* AI Scanner */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" strokeWidth={2} />
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Escáner de Receta con IA
            </Label>
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleScanPrescription}
              disabled={isScanning}
              className="cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 dark:file:bg-purple-950/30 dark:file:text-purple-400 hover:file:bg-purple-100 dark:hover:file:bg-purple-950/50 transition-all text-xs font-medium text-gray-500 dark:text-gray-400 rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11"
            />
            {isScanning && (
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <QhSpinner size="sm" className="text-purple-600 dark:text-purple-400" />
                <span>Analizando diseño con Gemini Vision...</span>
              </p>
            )}
          </div>
        </div>

        {/* Color Principal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("primary_color")}
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              name="prescriptionColor"
              value={formData.prescriptionColor}
              onChange={handleColorChange}
              className="h-10 w-16 p-1 cursor-pointer rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent transition-all shadow-2xs"
            />
            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-[#050505] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs">
              {formData.prescriptionColor}
            </span>
          </div>
        </div>

        {/* Logotipo */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" strokeWidth={2} />
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("logo_label")}
            </Label>
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo}
              className="cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 dark:file:bg-sky-950/30 dark:file:text-sky-400 hover:file:bg-sky-100 dark:hover:file:bg-sky-950/50 transition-all text-xs font-medium text-gray-500 dark:text-gray-400 rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11"
            />
            {isUploadingLogo && (
              <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <QhSpinner size="sm" className="text-sky-600 dark:text-sky-400" />
                <span>{t("logo_uploading")}</span>
              </p>
            )}
          </div>
        </div>

        {/* Firma Digital (Pestañas Subir vs Dibujar) */}
        <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("digital_signature")}
            </Label>
          </div>

          <div className="space-y-3">
            {/* Toggle de Pestañas */}
            <div className="flex bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 p-1 rounded-2xl w-full">
              <button
                type="button"
                onClick={() => setSignatureMode("upload")}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer",
                  signatureMode === "upload"
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-2xs"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("signature_upload_tab")}</span>
              </button>

              <button
                type="button"
                onClick={() => setSignatureMode("draw")}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer",
                  signatureMode === "draw"
                    ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-2xs"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <PenTool className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{t("signature_draw_tab")}</span>
              </button>
            </div>

            {/* Panel de Subida */}
            {signatureMode === "upload" && (
              <div className="space-y-2 animate-in fade-in-0 duration-200">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  disabled={isUploadingSignature}
                  className="cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950/30 dark:file:text-emerald-400 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-950/50 transition-all text-xs font-medium text-gray-500 dark:text-gray-400 rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11"
                />
                {isUploadingSignature && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                    <span>{t("signature_uploading")}</span>
                  </p>
                )}
              </div>
            )}

            {/* Panel de Dibujo */}
            {signatureMode === "draw" && (
              <div className="space-y-3 animate-in fade-in-0 duration-200">
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-[#050505] relative shadow-2xs">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full h-40 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {isUploadingSignature && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-[#0a0a0a]/60 flex items-center justify-center backdrop-blur-xs">
                      <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearCanvas}
                    disabled={isUploadingSignature}
                    className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all cursor-pointer shadow-2xs"
                  >
                    <Eraser className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                    <span>{t("canvas_clear")}</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={saveDrawnSignature}
                    disabled={isUploadingSignature}
                    className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                    <span>{t("canvas_use_drawing")}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nota al Pie */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2} />
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("footer_note")}
            </Label>
          </div>

          <Textarea
            name="prescriptionFooterNote"
            value={formData.prescriptionFooterNote}
            onChange={handleChange}
            placeholder={t("footer_note_placeholder")}
            rows={3}
            className="rounded-2xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white p-3.5 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all resize-none shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>

        {/* Botón Guardar */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || showSuccess}
            className={cn(
              "w-full h-11 text-white text-xs font-bold rounded-xl transition-all shadow-xs border-0 cursor-pointer flex items-center justify-center gap-2",
              showSuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            )}
            style={{
              backgroundColor: showSuccess
                ? "#059669"
                : formData.prescriptionColor || "#059669",
            }}
          >
            {isSaving ? (
              <>
                <QhSpinner size="sm" className="text-white" />
                <span>{t("btn_saving")}</span>
              </>
            ) : showSuccess ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_saved")}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_save")}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── LIVE PREVIEW (DERECHA) ────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-gray-50/60 dark:bg-[#050505] rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 overflow-hidden space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 self-start">
          {t("preview_title")}
        </h3>

        <div
          className="w-full max-w-[380px] aspect-[1/1.414] bg-white dark:bg-[#0a0a0a] shadow-xl rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative border border-gray-100 dark:border-gray-800 overflow-hidden"
          style={{ borderTop: `8px solid ${formData.prescriptionColor || "#059669"}` }}
        >
          {/* Header de la Receta */}
          <div className="flex justify-between items-start border-b pb-4 border-gray-100 dark:border-gray-800">
            <div className="space-y-2">
              <div
                className="w-28 h-5 rounded-md transition-colors duration-300"
                style={{
                  backgroundColor: formData.prescriptionColor || "#059669",
                  opacity: 0.25,
                }}
              />
              <div className="w-36 h-3 bg-gray-100 dark:bg-gray-800 rounded-md" />
            </div>

            {/* Logo Preview */}
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden shadow-2xs">
              {formData.prescriptionLogoUrl ? (
                <img
                  src={formData.prescriptionLogoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {t("preview_logo_placeholder")}
                </span>
              )}
            </div>
          </div>

          {/* Cuerpo de la Receta (Simulación de Trazo) */}
          <div className="flex-1 py-6 space-y-3.5">
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800/80 rounded-md" />
            <div className="w-11/12 h-3 bg-gray-100 dark:bg-gray-800/80 rounded-md" />
            <div className="w-9/12 h-3 bg-gray-100 dark:bg-gray-800/80 rounded-md" />

            <div className="pt-6 space-y-2.5">
              <div className="w-8/12 h-3 bg-gray-100 dark:bg-gray-800/80 rounded-md" />
              <div className="w-10/12 h-3 bg-gray-100 dark:bg-gray-800/80 rounded-md" />
            </div>
          </div>

          {/* Pie de la Receta */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center">
            {/* Firma Preview */}
            <div className="w-32 h-14 mb-2 border-b border-gray-200 dark:border-gray-800 flex items-end justify-center overflow-hidden">
              {localSignaturePreview ? (
                <img
                  src={localSignaturePreview}
                  alt="Firma"
                  className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white rounded-md p-1"
                />
              ) : formData.signatureUrl ? (
                <div className="flex flex-col items-center justify-end h-full pb-1 text-emerald-600 dark:text-emerald-400 opacity-90">
                  <ShieldCheck className="w-5 h-5 mb-0.5" strokeWidth={2} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    {t("preview_signature_protected")}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-semibold text-gray-300 dark:text-gray-600 pb-1">
                  {t("preview_signature_placeholder")}
                </span>
              )}
            </div>

            {/* Nota Preview */}
            {formData.prescriptionFooterNote ? (
              <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center max-w-full truncate px-2 mt-1">
                {formData.prescriptionFooterNote}
              </p>
            ) : (
              <div className="w-40 h-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1" />
            )}
          </div>
        </div>

        {formData.prescriptionCustomHtml && (
          <div className="w-full mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Diseño Generado por IA</h3>
            <iframe 
              srcDoc={formData.prescriptionCustomHtml
                .replace(/{{PHONE}}/g, scanResult?.detectedText?.phone || "55 1234 5678")
                .replace(/{{EMAIL}}/g, "dr@ejemplo.com")
                .replace(/{{WEBSITE}}/g, "www.ejemplo.com")
                .replace(/{{ADDRESS}}/g, scanResult?.detectedText?.address || "Consultorio 123, Ciudad")
                .replace(/{{SPECIALTY}}/g, scanResult?.detectedText?.specialty || "Especialidad Médica")
                .replace(/{{PROFESSIONAL_LICENSE}}/g, scanResult?.detectedText?.professionalLicense || "CED123456")
                .replace(/{{INSTITUTION_NAME}}/g, scanResult?.detectedText?.clinicName || "Universidad de Ejemplo")
                .replace(/{{PATIENT_NAME}}/g, "Nombre del Paciente")
                .replace(/{{PATIENT_AGE}}/g, "30")
                .replace(/{{DATE}}/g, new Date().toLocaleDateString())
                .replace(/{{PRESCRIPTION_CONTENT}}/g, "1. Paracetamol 500mg cada 8 horas por 3 días.<br/>2. Reposo relativo.")
                .replace(/{{DOCTOR_NAME}}/g, scanResult?.detectedText?.doctorName || "Dr. Nombre Apellido")
                .replace(/{{SIGNATURE}}/g, formData.signatureUrl ? `<img src="${formData.signatureUrl}" style="max-height: 60px;" />` : "Firma Digital")
                .replace(/{{LOGO}}/g, formData.prescriptionLogoUrl ? `<img src="${formData.prescriptionLogoUrl}" style="max-height: 60px;" />` : "Logotipo")
                .replace(/{{PRIMARY_COLOR}}/g, formData.prescriptionColor || "#059669")
              }
              title="Vista previa del diseño IA"
              className="w-full bg-white dark:bg-white shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800"
              style={{ minHeight: '600px', border: 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};