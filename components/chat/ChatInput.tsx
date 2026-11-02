"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Send, Paperclip, Upload, FolderHeart, Mic, Square, X, Check } from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useHealthVault } from "@/hooks/useHealthVault";
import { healthOSService } from "@/services/healthOS.service";
import { cn } from "@/lib/utils";
import { ChatVaultModal } from "./ChatVaultModal";

interface ChatInputProps {
  onSendMessage: (content: string, vaultDocumentId?: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export function ChatInput({ onSendMessage, onTyping }: ChatInputProps) {
  const t = useTranslations("PatientMessages");
  const [message, setMessage] = useState("");
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument } = useHealthVault();

  // Estados de grabación de voz con Gemini 3.5 Transcribe
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    cleanupRecording();
  };

  const handleStopAndTranscribe = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleStartRecording = async () => {
    if (isRecording || isTranscribing) return;

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
        cleanupRecording();

        if (audioBlob.size < 100) {
          return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string)?.split(",")[1];
          if (!base64Audio) return;

          try {
            setIsTranscribing(true);
            const response = await healthOSService.transcribeAudio({
              audioBase64: base64Audio,
              mode: "smart",
              mimeType: "audio/webm",
            });

            if (response && response.transcribedText) {
              const cleanedText = response.transcribedText.trim();
              if (cleanedText) {
                setMessage((prev) => (prev ? `${prev} ${cleanedText}` : cleanedText));
                onTyping(true);
                toast.success(t("voice_transcribed_toast"));
              }
            } else {
              toast.info("No se detectó audio con voz.");
            }
          } catch (error) {
            console.error("Error transcribiendo nota de voz:", error);
            toast.error("No se pudo transcribir la nota de voz.");
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Límite de 60 segundos por nota de voz
      autoStopTimeoutRef.current = setTimeout(() => {
        handleStopAndTranscribe();
      }, 60000);
    } catch (err) {
      console.error("Acceso al micrófono denegado:", err);
      toast.warn("Por favor permite el acceso al micrófono para grabar mensajes de voz.");
      cleanupRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message.trim());
    setMessage("");
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      cleanupRecording();
    };
  }, []);

  const handleAttachDocument = (document: any) => {
    onSendMessage(
      t("attached_doc_msg", { name: document.fileName }),
      document.id
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedDocs = await uploadDocument(file, "GENERAL");
      if (uploadedDocs && uploadedDocs.length > 0) {
        const newDoc = uploadedDocs[0];
        onSendMessage(
          t("attached_doc_msg", { name: newDoc.fileName || "" }),
          newDoc.id
        );
        toast.success(t("doc_attached_toast"));
      } else {
        toast.error(t("sync_error_toast"));
      }
    } catch (error) {
      console.error("Error subiendo el archivo:", error);
      toast.error(t("upload_error_toast"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.png,.jpg,.jpeg"
      />

      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-4 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2.5 shrink-0 font-sans transition-colors"
      >
        {/* Dropdown de Archivos Adjuntos */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isUploading || isRecording || isTranscribing}
              className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 w-11 h-11 p-0 flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Paperclip className="w-5 h-5 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" strokeWidth={2} />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-56 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-1.5 shadow-xl font-sans"
          >
            <DropdownMenuItem
              className="rounded-xl px-3.5 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] focus:bg-gray-50 dark:focus:bg-[#111] flex items-center gap-3 transition-colors text-xs font-bold text-gray-800 dark:text-gray-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Upload className="w-4 h-4" strokeWidth={2} />
              </div>
              <span>{t("upload_file")}</span>
            </DropdownMenuItem>

            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full my-1" />

            <DropdownMenuItem
              className="rounded-xl px-3.5 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] focus:bg-gray-50 dark:focus:bg-[#111] flex items-center gap-3 transition-colors text-xs font-bold text-gray-800 dark:text-gray-200"
              onClick={() => setIsVaultModalOpen(true)}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FolderHeart className="w-4 h-4" strokeWidth={2} />
              </div>
              <span>{t("health_vault")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Input de Mensaje O Barra de Grabación de Voz */}
        {isRecording ? (
          <div className="flex-1 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 h-11 px-4 flex items-center justify-between text-xs font-medium text-red-700 dark:text-red-300 shadow-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold">{t("voice_recording")}</span>
              <span className="font-mono text-xs opacity-80">({formatTimer(recordingSeconds)} / 1:00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelRecording}
                className="h-8 px-2.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl"
                title={t("voice_cancel")}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                <span>{t("voice_cancel")}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleStopAndTranscribe}
                className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs flex items-center gap-1 font-bold"
                title={t("voice_finish")}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t("voice_finish")}</span>
              </Button>
            </div>
          </div>
        ) : isTranscribing ? (
          <div className="flex-1 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 h-11 px-4 flex items-center gap-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs">
            <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
            <span>{t("voice_transcribing")}</span>
          </div>
        ) : (
          <div className="flex-1 relative flex items-center">
            <Input
              value={message}
              onChange={handleChange}
              placeholder={t("input_placeholder")}
              className="w-full rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-11 pl-4 pr-11 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs transition-all"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleStartRecording}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-all flex items-center justify-center cursor-pointer"
              title={t("voice_record")}
            >
              <Mic className="w-4 h-4" strokeWidth={2} />
            </Button>
          </div>
        )}

        {/* Botón Enviar */}
        <Button
          type="submit"
          disabled={!message.trim() || isRecording || isTranscribing}
          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 text-xs font-bold border-0 transition-all shadow-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">{t("btn_send")}</span>
        </Button>
      </form>

      {/* Modal Bóveda */}
      <ChatVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onAttach={handleAttachDocument}
      />
    </>
  );
}