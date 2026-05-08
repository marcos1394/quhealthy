"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, X, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    setIsReady(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Prioriza la cámara trasera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsReady(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        setError("Permiso denegado. Por favor, habilita el acceso a la cámara en tu navegador.");
      } else {
        setError("No se pudo acceder a la cámara. Asegúrate de que no esté en uso por otra app.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
  };

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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none rounded-3xl">
        <DialogHeader className="absolute top-4 left-4 z-10 p-0">
          <DialogTitle className="text-white flex items-center gap-2 text-sm font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Escáner de Medicamentos IA
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-[3/4] bg-slate-900 flex items-center justify-center">
          {error ? (
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-slate-300 text-sm">{error}</p>
              <Button variant="outline" onClick={startCamera} className="border-white/20 text-white hover:bg-white/10">
                Reintentar
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
              {/* Frame de enfoque */}
              <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center">
                <div className="w-full aspect-square border-2 border-white/50 rounded-3xl shadow-[0_0_0_400px_rgba(0,0,0,0.4)] relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
                </div>
              </div>
            </>
          )}

          {/* Botón de cierre */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/20 hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950 p-8 flex items-center justify-around">
          <div className="w-10" /> {/* Spacer */}
          
          <button 
            onClick={capturePhoto}
            disabled={!isReady}
            className="group relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-transform active:scale-90">
              <div className="w-12 h-12 bg-white rounded-full group-hover:scale-95 transition-transform" />
            </div>
          </button>

          <button 
            onClick={startCamera}
            className="p-3 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
