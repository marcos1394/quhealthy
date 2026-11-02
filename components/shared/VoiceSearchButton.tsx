"use client";

import React, { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { healthOSService } from "@/services/healthOS.service";
import { cn } from "@/lib/utils";

interface VoiceSearchButtonProps {
  onSearch: (transcript: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onSearch,
  className,
  size = "md",
  disabled = false,
}) => {

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupRecording = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    cleanupRecording();
  };

  const handleStartRecording = async () => {
    if (disabled || isTranscribing) return;

    if (isRecording) {
      handleStopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size < 100) {
          setIsTranscribing(false);
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(",")[1];
          if (!base64Audio) {
            setIsTranscribing(false);
            return;
          }

          try {
            setIsTranscribing(true);
            const response = await healthOSService.transcribeAudio({
              audioBase64: base64Audio,
              mode: "smart",
              mimeType: "audio/webm",
            });

            if (response && response.transcribedText) {
              const cleanedText = response.transcribedText
                .replace(/[.,;!?]+$/, "")
                .trim();
              if (cleanedText) {
                onSearch(cleanedText);
                toast.success(`Buscando: "${cleanedText}"`);
              }
            } else {
              toast.info("No se detectó voz. Por favor intenta de nuevo.");
            }
          } catch (error) {
            console.error("Error transcribiendo búsqueda por voz:", error);
            toast.error("No se pudo completar la búsqueda por voz.");
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop tras 8 segundos de grabación máxima
      timeoutRef.current = setTimeout(() => {
        handleStopRecording();
      }, 8000);
    } catch (err) {
      console.error("Acceso a micrófono denegado:", err);
      toast.warn("Por favor permite el acceso al micrófono para buscar por voz.");
      cleanupRecording();
    }
  };

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleStartRecording}
      disabled={disabled || isTranscribing}
      className={cn(
        "relative rounded-full transition-all shrink-0 flex items-center justify-center",
        sizeClasses,
        isRecording
          ? "bg-red-500 hover:bg-red-600 text-white shadow-md animate-pulse ring-2 ring-red-400/50"
          : isTranscribing
          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          : "text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30",
        className
      )}
      title={
        isRecording
          ? "Grabando... Haz clic para detener"
          : isTranscribing
          ? "Transcribiendo con Gemini 3.5..."
          : "Búsqueda por voz con IA"
      }
      aria-label="Búsqueda por voz con IA"
    >
      {isTranscribing ? (
        <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
      ) : isRecording ? (
        <Square className={cn(iconSizes, "fill-current")} />
      ) : (
        <Mic className={iconSizes} strokeWidth={2} />
      )}
    </Button>
  );
};
