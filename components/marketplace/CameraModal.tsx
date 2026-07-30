"use client";

/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const t = useTranslations("CameraModal");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsReady(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsReady(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Prioriza la cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsReady(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        setError(t("permission_denied_error"));
      } else {
        setError(t("access_error"));
      }
    }
  }, [t]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(base64);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none rounded-3xl font-sans shadow-2xl transition-colors select-none [&>button]:hidden">
        {/* ── HEADER OVERLAY ─────────────────────────────────────────── */}
        <DialogHeader className="absolute top-4 left-4 z-20 p-0">
          <DialogTitle className="text-white flex items-center gap-2 text-xs font-bold bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
            <span>{t("title")}</span>
          </DialogTitle>
        </DialogHeader>

        {/* ── VISOR DE CÁMARA & MARCO DE ENFOQUE ─────────────────────── */}
        <div className="relative aspect-[3/4] bg-[#050505] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-8 text-center space-y-4 max-w-xs">
              <div className="mx-auto w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/30 shadow-2xs">
                <AlertCircle className="w-7 h-7" strokeWidth={2} />
              </div>
              <p className="text-gray-300 text-xs font-medium leading-relaxed">
                {error}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={startCamera}
                className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-bold h-10 px-6 cursor-pointer shadow-2xs"
              >
                {t("retry")}
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Frame de enfoque inteligente */}
              <div className="absolute inset-0 border-[32px] sm:border-[40px] border-black/50 flex items-center justify-center pointer-events-none">
                <div className="w-full aspect-square border-2 border-white/40 rounded-3xl shadow-[0_0_0_400px_rgba(0,0,0,0.5)] relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />
                </div>
              </div>
            </>
          )}

          {/* Botón de cierre */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-black/80 transition-all cursor-pointer shadow-2xs z-20"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── FOOTER DE DISPARO Y ACCIONES ───────────────────────────── */}
        <div className="bg-[#0a0a0a] p-6 sm:p-8 flex items-center justify-around border-t border-white/10">
          <div className="w-10" /> {/* Espaciador simétrico */}
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!isReady}
            className="group relative flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-90 shadow-lg">
              <div className="w-12 h-12 bg-white rounded-full group-hover:scale-95 transition-transform" />
            </div>
          </button>
          <button
            type="button"
            onClick={startCamera}
            className="p-3 text-gray-400 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-white/5"
          >
            <RefreshCw className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}