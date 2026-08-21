"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  RotateCcw,
  Check,
  X,
  SwitchCamera,
  AlertCircle,
  Sparkles,
  Upload,
  Loader2,
  FileText,
  Scan,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CameraCaptureMode = "selfie" | "document" | "product" | "general";

export interface UniversalCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, base64: string) => void;
  mode?: CameraCaptureMode;
  title?: string;
  description?: string;
  allowGalleryUpload?: boolean;
}

export const UniversalCameraModal: React.FC<UniversalCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  mode = "general",
  title,
  description,
  allowGalleryUpload = true,
}) => {
  const isSelfieMode = mode === "selfie";
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    isSelfieMode ? "user" : "environment"
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFlashActive, setIsFlashActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputFallbackRef = useRef<HTMLInputElement>(null);

  // Determinar título y descripción por defecto según el modo
  const computedTitle =
    title ||
    (mode === "selfie"
      ? "Foto de Perfil & Selfie"
      : mode === "document"
      ? "Capturar Documento"
      : mode === "product"
      ? "Fotografiar Producto"
      : "Captura de Fotografía");

  const computedDescription =
    description ||
    (mode === "selfie"
      ? "Enfoca tu rostro dentro del marco guía"
      : mode === "document"
      ? "Alinea el documento dentro del recuadro"
      : mode === "product"
      ? "Centra el producto en el visor para análisis de IA"
      : "Apunta la cámara y presiona el obturador");

  // Iniciar la cámara
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);

    // Detener stream anterior si existe
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta acceso directo a la cámara.");
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setHasMultipleCameras(videoDevices.length > 1);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Error al acceder a la cámara:", err);
      let errorMsg = "No se pudo acceder a la cámara.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Permiso de cámara denegado. Por favor autoriza el acceso en tu navegador.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errorMsg = "No se encontró ningún dispositivo de cámara conectado.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        errorMsg = "La cámara está siendo utilizada por otra aplicación.";
      }
      setCameraError(errorMsg);
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode]);

  // Detener la cámara al cerrar
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Capturar Foto
  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Efecto de flash visual
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Si es selfie y cámara frontal, invertimos para efecto espejo natural
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedImage(dataUrl);
    }
  };

  // Confirmar foto tomada
  const handleConfirm = () => {
    if (!canvasRef.current || !capturedImage) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const file = new File(
            [blob],
            `capture-${mode}-${Date.now()}.jpg`,
            { type: "image/jpeg" }
          );
          onCapture(file, capturedImage);
          onClose();
        }
      },
      "image/jpeg",
      0.92
    );
  };

  // Repetir foto
  const handleRetake = () => {
    setCapturedImage(null);
  };

  // Alternar cámara frontal / trasera
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Fallback nativo de cámara mobile / selección de archivo
  const handleFallbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onCapture(file, base64);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4 sm:space-y-5 relative overflow-hidden font-sans text-gray-900 dark:text-white">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
              {mode === "selfie" ? (
                <Camera className="w-4 h-4" />
              ) : mode === "document" ? (
                <FileText className="w-4 h-4" />
              ) : mode === "product" ? (
                <Package className="w-4 h-4" />
              ) : (
                <Scan className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                {computedTitle}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                {computedDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor de Cámara / Preview */}
        <div
          className={cn(
            "relative w-full bg-black rounded-3xl overflow-hidden shadow-inner flex items-center justify-center",
            mode === "selfie" ? "aspect-square" : "aspect-[4/3]"
          )}
        >
          {/* Flash Effect */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Canvas oculto para renderizado */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Error de Cámara */}
          {cameraError ? (
            <div className="p-6 text-center space-y-4 text-white max-w-xs">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-gray-300 leading-relaxed">
                {cameraError}
              </p>
              {allowGalleryUpload && (
                <div className="pt-2 space-y-2">
                  <Button
                    type="button"
                    onClick={() => fileInputFallbackRef.current?.click()}
                    className="w-full h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2 border-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Usar Cámara Nativa / Archivo</span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    capture={isSelfieMode ? "user" : "environment"}
                    ref={fileInputFallbackRef}
                    onChange={handleFallbackFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          ) : isInitializing ? (
            <div className="flex flex-col items-center justify-center gap-3 text-white">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="text-xs font-bold text-gray-400 animate-pulse">
                Iniciando cámara...
              </span>
            </div>
          ) : capturedImage ? (
            /* Vista previa de foto capturada */
            <img
              src={capturedImage}
              alt="Captura"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Feed de Video en Vivo */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  facingMode === "user" && "scale-x-[-1]"
                )}
              />

              {/* Guía Facial Circular / Oval (Modo Selfie) */}
              {mode === "selfie" && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-72 border-2 border-dashed border-white/60 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex flex-col items-center justify-between py-4">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      Centra tu rostro
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-400 opacity-80" />
                  </div>
                </div>
              )}

              {/* Guía Documental con Esquineros (Modo Documento) */}
              {mode === "document" && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  <div className="w-full flex justify-between">
                    <div className="w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg shadow-sm" />
                    <div className="w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg shadow-sm" />
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                      Encuadra el documento en las esquinas
                    </span>
                  </div>
                  <div className="w-full flex justify-between">
                    <div className="w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg shadow-sm" />
                    <div className="w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br-lg shadow-sm" />
                  </div>
                </div>
              )}

              {/* Guía de Producto (Modo Producto / General) */}
              {mode === "product" && (
                <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between items-center">
                  <div className="w-full h-full border border-dashed border-white/40 rounded-2xl flex flex-col justify-between p-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 bg-black/60 px-2.5 py-0.5 rounded-full self-center backdrop-blur-xs">
                      Enfoque de Producto
                    </span>
                    <Package className="w-6 h-6 text-emerald-400/70 self-center" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Botón Switch Camera (si hay más de una cámara y no se ha congelado la foto) */}
          {hasMultipleCameras && !capturedImage && !cameraError && (
            <button
              type="button"
              onClick={handleToggleCamera}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all border border-white/20 shadow-md cursor-pointer z-30"
              title="Cambiar cámara (Frontal / Trasera)"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controles y Botones Inferiores */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {capturedImage ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleRetake}
                className="flex-1 h-11 sm:h-12 rounded-2xl border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repetir Foto</span>
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                className="flex-1 h-11 sm:h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                <Check className="w-4 h-4" />
                <span>Usar esta Foto</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              {/* Botón de subida manual como alternativa rápida */}
              {allowGalleryUpload ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputFallbackRef.current?.click()}
                    className="p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    title="Subir archivo existente"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Galería / Archivo</span>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputFallbackRef}
                    onChange={handleFallbackFileChange}
                    className="hidden"
                  />
                </>
              ) : (
                <div className="w-16" />
              )}

              {/* Botón Central de Disparo (Shutter) */}
              <button
                type="button"
                disabled={isInitializing || !!cameraError}
                onClick={handleSnap}
                className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-white p-1 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Tomar foto"
              >
                <div className="w-full h-full rounded-full bg-emerald-600 group-hover:bg-emerald-500 transition-colors flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>

              <div className="w-16" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
