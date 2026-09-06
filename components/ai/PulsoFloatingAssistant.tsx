"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Paperclip,
  Maximize2,
  Minimize2,
  ChevronDown,
  EyeOff,
  Move,
} from "lucide-react";

import { PulsoMascot, PulsoState, PulsoPalette } from "@/components/ai/PulsoMascot";
import { healthOSService, AttachmentData } from "@/services/healthOS.service";
import { useSessionStore } from "@/stores/SessionStore";
import { WidgetRenderer } from "@/components/engine/WidgetRenderer";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export interface FloatingChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  response?: any;
  attachment?: {
    base64Data: string;
    mimeType: string;
    fileName?: string;
  };
  audioBase64?: string;
}

export function PulsoFloatingAssistant() {
  const t = useTranslations("PulsoAssistant");
  const pathname = usePathname();
  const { user } = useSessionStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [mascotState, setMascotState] = useState<PulsoState>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [messages, setMessages] = useState<FloatingChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Posicionamiento libre y arrastrable
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const [rawPosition, setRawPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Detección contextual de la tienda o producto actual a partir de la URL
  const isStorePage = Boolean(pathname && /\/store\/[^/?#]+/.test(pathname));
  const rawSlug = isStorePage ? pathname.split("/store/")[1]?.split("/")[0]?.split("?")[0]?.split("#")[0] : null;
  const storeSlug = rawSlug && rawSlug !== "identity" && rawSlug !== "settings" ? rawSlug : null;

  const isItemPage = Boolean(pathname && /\/market\/item\/[^/?#]+/.test(pathname));
  const itemSlug = isItemPage ? pathname.split("/market/item/")[1]?.split("/")[0]?.split("?")[0]?.split("#")[0] : null;

  // Reconocimiento de Voz
  const { isListening, transcript, startListening, stopListening } =
    useVoiceRecognition({
      language: "es-MX",
      onResult: (text) => {
        if (text && text.trim().length > 0) {
          handleSendMessage(text);
        }
      },
    });

  // Carga inicial y persistencia de posición y estado oculto
  useEffect(() => {
    setIsMounted(true);

    const updateDimensions = () => {
      setWindowDimensions({
        width: typeof window !== "undefined" ? window.innerWidth : 1200,
        height: typeof window !== "undefined" ? window.innerHeight : 800,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    try {
      const savedPos = localStorage.getItem("quhealthy_pulso_position");
      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          const maxLeft = -(window.innerWidth - 88);
          const maxTop = -(window.innerHeight - 96);
          const clampedX = Math.max(maxLeft, Math.min(0, parsed.x));
          const clampedY = Math.max(maxTop, Math.min(0, parsed.y));
          dragX.set(clampedX);
          dragY.set(clampedY);
          setRawPosition({ x: clampedX, y: clampedY });
        }
      }

      const savedDismissed = localStorage.getItem("quhealthy_pulso_dismissed");
      if (savedDismissed === "true") {
        setIsDismissed(true);
      }
    } catch (e) {
      console.warn("Error reading Pulso state:", e);
    }

    const handleGlobalOpen = () => {
      setIsDismissed(false);
      setIsOpen(true);
      try {
        localStorage.removeItem("quhealthy_pulso_dismissed");
      } catch {}
    };

    window.addEventListener("open-pulso-assistant", handleGlobalOpen);
    window.addEventListener("restore-pulso", handleGlobalOpen);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("open-pulso-assistant", handleGlobalOpen);
      window.removeEventListener("restore-pulso", handleGlobalOpen);
    };
  }, [dragX, dragY]);

  // Ocultar Pulso con opción de deshacer
  const handleDismissPulso = () => {
    setIsDismissed(true);
    setIsOpen(false);
    try {
      localStorage.setItem("quhealthy_pulso_dismissed", "true");
    } catch {}

    toast.info(
      <div className="flex items-center justify-between gap-3 text-xs">
        <span>{t("pulso_hidden_toast", { defaultValue: "Pulso se ha ocultado. Puedes reactivarlo desde la pestaña lateral." })}</span>
        <button
          type="button"
          onClick={() => handleRestorePulso(false)}
          className="font-bold underline text-[#1D9E75] hover:text-[#178563] shrink-0"
        >
          {t("undo", { defaultValue: "Deshacer" })}
        </button>
      </div>,
      { autoClose: 5000 }
    );
  };

  // Restaurar Pulso
  const handleRestorePulso = (openImmediately = false) => {
    setIsDismissed(false);
    if (openImmediately) {
      setIsOpen(true);
    }
    try {
      localStorage.removeItem("quhealthy_pulso_dismissed");
    } catch {}
  };

  // Restablecer posición a esquina inferior derecha
  const handleResetPosition = () => {
    animate(dragX, 0, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
    animate(dragY, 0, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
    setRawPosition({ x: 0, y: 0 });
    try {
      localStorage.removeItem("quhealthy_pulso_position");
      toast.info(t("position_reset", { defaultValue: "Posición de Pulso restablecida" }), {
        autoClose: 2500,
      });
    } catch {}
  };

  const hasMoved = rawPosition.x !== 0 || rawPosition.y !== 0;
  const isPositionedLeft = rawPosition.x < -(windowDimensions.width / 2);
  const isPositionedTop = rawPosition.y < -(windowDimensions.height * 0.55);

  // Auto-scroll suave
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isProcessing]);

  // Manejo de Estados de Pulso Mascot
  useEffect(() => {
    if (isListening) {
      setMascotState("listening");
    } else if (isProcessing) {
      setMascotState("thinking");
    } else if (messages.length > 0 && messages[messages.length - 1].role === "assistant") {
      setMascotState("success");
      const timer = setTimeout(() => setMascotState("idle"), 3500);
      return () => clearTimeout(timer);
    } else {
      setMascotState("idle");
    }
  }, [isListening, isProcessing, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && attachments.length === 0) return;

    setInputMessage("");
    const currentAttachments = [...attachments];
    setAttachments([]);

    const userMsgId = crypto.randomUUID();
    const newUserMessage: FloatingChatMessage = {
      id: userMsgId,
      role: "user",
      text,
      attachment: currentAttachments.length > 0
        ? {
            base64Data: currentAttachments[0].base64Data,
            mimeType: currentAttachments[0].mimeType,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsProcessing(true);
    setMascotState("thinking");

    // Construir contexto enriquecido
    const patientContext: Record<string, any> = {
      userId: user?.id,
      userName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Invitado",
      currentRoute: pathname,
      isStoreContext: Boolean(storeSlug),
      storeSlug: storeSlug || undefined,
      isItemContext: Boolean(itemSlug),
      itemSlug: itemSlug || undefined,
    };

    try {
      const response = await healthOSService.sendIntent(
        text,
        patientContext,
        currentAttachments
      );

      startTransition(() => {
        const assistantMsgId = crypto.randomUUID();
        const newAssistantMsg: FloatingChatMessage = {
          id: assistantMsgId,
          role: "assistant",
          text: response.text || (response as any).reply || "",
          response: response,
          audioBase64: (response as any).audioBase64,
        };

        setMessages((prev) => [...prev, newAssistantMsg]);
        setIsProcessing(false);

        // Reproducir audio TTS si está activo
        if (ttsEnabled && (response as any).audioBase64) {
          try {
            if (audioPlayerRef.current) {
              audioPlayerRef.current.pause();
            }
            const audioBlob = new Blob(
              [Uint8Array.from(atob((response as any).audioBase64), (c) => c.charCodeAt(0))],
              { type: "audio/mp3" }
            );
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioPlayerRef.current = audio;
            audio.onplay = () => setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
            audio.play();
          } catch (e) {
            console.warn("TTS Playback error:", e);
          }
        }
      });
    } catch (err) {
      console.error("Error al enviar mensaje a Pulso AI:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Disculpa, tuve un problema temporal al conectarme con el servicio de salud. Por favor intenta de nuevo.",
        },
      ]);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setAttachments([
        {
          mimeType: file.type,
          base64Data: base64String,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleResetChat = () => {
    setMessages([]);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  // Sugerencias rápidas según la ruta actual
  const quickPrompts = isStorePage
    ? [
        t("prompt_store_services", { defaultValue: "¿Qué servicios ofrece este especialista?" }),
        t("prompt_store_hours", { defaultValue: "¿Cuáles son sus horarios y ubicación?" }),
        t("prompt_store_book", { defaultValue: "Quiero agendar una cita aquí" }),
        t("prompt_store_prices", { defaultValue: "¿Cuáles son los precios de sus consultas?" }),
      ]
    : [
        t("prompt_find_doctor", { defaultValue: "Buscar especialista por síntoma" }),
        t("prompt_supplies", { defaultValue: "¿Dónde puedo comprar insumos médicos?" }),
        t("prompt_my_appointments", { defaultValue: "Consultar mis próximas citas" }),
        t("prompt_explain_rx", { defaultValue: "Explicar una receta o estudio médico" }),
      ];

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* ── 1. BOTÓN FLOTANTE TRIGGER (PULSO / FAB) ARRASTRABLE ──────── */}
      {!isDismissed && (
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0.08}
          dragConstraints={{
            left: -(windowDimensions.width - 88),
            right: 0,
            top: -(windowDimensions.height - 96),
            bottom: 0,
          }}
          style={{ x: dragX, y: dragY }}
          onDragStart={() => {
            isDraggingRef.current = false;
          }}
          onDrag={(_event, info) => {
            if (Math.hypot(info.offset.x, info.offset.y) > 5) {
              isDraggingRef.current = true;
            }
          }}
          onDragEnd={() => {
            const currentX = dragX.get();
            const currentY = dragY.get();
            setRawPosition({ x: currentX, y: currentY });
            try {
              localStorage.setItem(
                "quhealthy_pulso_position",
                JSON.stringify({ x: currentX, y: currentY })
              );
            } catch {}
            setTimeout(() => {
              isDraggingRef.current = false;
            }, 60);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none touch-none cursor-grab active:cursor-grabbing group/fab"
        >
          {/* Tooltip flotante con aviso cuando está cerrado */}
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.8 }}
              onClick={() => {
                if (isDraggingRef.current) return;
                setIsOpen(true);
              }}
              className="hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/95 dark:bg-[#111]/95 backdrop-blur-md border border-[#5DCAA5]/40 shadow-xl text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:border-[#1D9E75] hover:scale-105 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-[#1D9E75] dark:text-[#5DCAA5] group-hover:rotate-12 transition-transform shrink-0" />
              <span>
                {isStorePage
                  ? t("ask_about_store", { defaultValue: "Preguntar sobre esta tienda" })
                  : t("ask_pulso", { defaultValue: "Pregúntale a Pulso" })}
              </span>
              {/* Botón cerrar / ocultar dentro del tooltip */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismissPulso();
                }}
                className="ml-1 p-0.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={t("hide_pulso", { defaultValue: "Ocultar Pulso" })}
                aria-label={t("hide_pulso", { defaultValue: "Ocultar Pulso" })}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Botón Circular de Pulso con indicador de arrastre y control para ocultar */}
          <div className="relative group/btn">
            {/* Pill informativo de arrastre al hacer hover */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover/fab:flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900/90 dark:bg-black/90 text-white text-[9px] font-medium tracking-wide shadow-md whitespace-nowrap pointer-events-none transition-opacity">
              <Move className="w-2.5 h-2.5" />
              <span>{t("drag_to_move", { defaultValue: "Arrastra para mover" })}</span>
            </div>

            {/* Botón sutil para ocultar Pulso en esquina superior */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDismissPulso();
              }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-800/90 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-10 cursor-pointer"
              title={t("hide_pulso", { defaultValue: "Ocultar Pulso" })}
              aria-label={t("hide_pulso", { defaultValue: "Ocultar Pulso" })}
            >
              <X className="w-3 h-3" />
            </button>

            <motion.button
              type="button"
              onClick={() => {
                if (isDraggingRef.current) return;
                setIsOpen(!isOpen);
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all border-2 bg-white dark:bg-[#111]",
                isOpen
                  ? "border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white"
                  : "border-[#5DCAA5] hover:border-[#1D9E75] shadow-[0_4px_20px_rgba(29,158,117,0.3)]"
              )}
              aria-label="Abrir asistente de salud Pulso AI"
            >
              {/* Anillo de pulso sutil cuando está cerrado */}
              {!isOpen && (
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
                  style={{ backgroundColor: PulsoPalette.body }}
                />
              )}

              {isOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" strokeWidth={2.5} />
              ) : (
                <PulsoMascot state={mascotState} size={42} />
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ── 1b. PESTAÑA LATERAL DISCRETA PARA RESTAURAR PULSO SI ESTÁ OCULTO ────── */}
      <AnimatePresence>
        {isDismissed && (
          <motion.button
            type="button"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 0.95 }}
            exit={{ x: 50, opacity: 0 }}
            whileHover={{ x: -4, opacity: 1, scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRestorePulso(true)}
            className="fixed bottom-6 right-0 z-40 bg-gradient-to-l from-[#178563] to-[#1D9E75] text-white shadow-[0_4px_16px_rgba(29,158,117,0.35)] rounded-l-full pl-3 pr-2.5 py-2 flex items-center gap-2 cursor-pointer border-y border-l border-emerald-300/30 backdrop-blur-md transition-all group"
            title={t("restore_pulso", { defaultValue: "Abrir Pulso AI" })}
            aria-label={t("restore_pulso", { defaultValue: "Abrir Pulso AI" })}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <span className="text-xs font-bold tracking-tight pr-1">Pulso</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── 2. VENTANA DE CHAT EXPANDIDA (ADAPTATIVA SEGÚN POSICIÓN DEL FAB) ──── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed z-50 bg-white dark:bg-[#0d0d0d] border border-gray-200/90 dark:border-gray-800 rounded-[28px] shadow-2xl flex flex-col font-sans transition-all duration-300 overflow-hidden",
              isPositionedTop ? "top-20" : "bottom-24",
              isPositionedLeft ? "left-4 sm:left-6" : "right-4 sm:right-6",
              isExpanded
                ? "w-[calc(100vw-32px)] sm:w-[640px] h-[calc(100vh-120px)] max-h-[820px]"
                : "w-[calc(100vw-32px)] sm:w-[410px] h-[580px] sm:h-[620px] max-h-[85vh]"
            )}
          >
            {/* Cabecera iOS de Pulso */}
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/90 dark:bg-[#141414]/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#5DCAA5]/20 border border-[#5DCAA5]/40 flex items-center justify-center shrink-0 shadow-2xs">
                  <PulsoMascot state={mascotState} size={34} />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                      Pulso
                    </h3>
                    <Badge className="bg-emerald-50 text-[#1D9E75] dark:bg-emerald-950/50 dark:text-[#5DCAA5] border border-[#5DCAA5]/40 rounded-full text-[9px] font-black px-2 py-0">
                      AI COPILOT
                    </Badge>
                  </div>

                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">
                    {isListening
                      ? "Escuchando tu voz..."
                      : isProcessing
                      ? "Pensando respuesta..."
                      : isStorePage
                      ? t("store_mode", { defaultValue: "Modo Tienda Activo" })
                      : t("health_assistant", { defaultValue: "Tu asistente de salud 24/7" })}
                  </p>
                </div>
              </div>

              {/* Botones de Control de Cabecera */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Restablecer posición si fue movido */}
                {hasMoved && (
                  <button
                    type="button"
                    onClick={handleResetPosition}
                    className="p-2 rounded-full text-gray-500 hover:text-[#1D9E75] dark:text-gray-400 dark:hover:text-[#5DCAA5] hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                    title={t("reset_position", { defaultValue: "Restablecer posición" })}
                  >
                    <Move className="w-4 h-4" />
                  </button>
                )}

                {/* Audio TTS Toggle */}
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                  title={ttsEnabled ? "Silenciar voz de Pulso" : "Activar voz de Pulso"}
                >
                  {ttsEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#1D9E75] dark:text-[#5DCAA5]" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

                {/* Reset Chat */}
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                  title="Nueva conversación"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Ocultar Pulso */}
                <button
                  type="button"
                  onClick={handleDismissPulso}
                  className="p-2 rounded-full text-gray-500 hover:text-rose-500 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                  title={t("hide_pulso", { defaultValue: "Ocultar Pulso" })}
                >
                  <EyeOff className="w-4 h-4" />
                </button>

                {/* Expand / Minimize */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors hidden sm:block"
                  title={isExpanded ? "Reducir ventana" : "Expandir ventana"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Minimizar / Cerrar ventana */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── FEED DE MENSAJES (RESPONSIVE SIN OVERFLOW HORIZONTAL) ── */}
            <div className="flex-1 w-full min-w-0 overflow-y-auto overflow-x-hidden p-4 space-y-4 font-sans no-scrollbar">
              {/* Mensaje de Bienvenida Si No Hay Mensajes */}
              {messages.length === 0 && (
                <div className="py-6 px-1 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#5DCAA5]/20 border border-[#5DCAA5]/40 mx-auto flex items-center justify-center shadow-xs">
                    <PulsoMascot state="idle" size={44} />
                  </div>

                  <div className="space-y-1 max-w-xs mx-auto">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {isStorePage
                        ? t("welcome_store_title", { defaultValue: "¡Hola! Conozco toda esta tienda" })
                        : t("welcome_general_title", { defaultValue: "¡Hola! Soy Pulso, tu asistente de salud" })}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {isStorePage
                        ? t("welcome_store_desc", { defaultValue: "Pregúntame sobre los servicios, precios, disponibilidad o pídeme que agende por ti." })
                        : t("welcome_general_desc", { defaultValue: "Puedo ayudarte a buscar médicos, agendar citas, ordenar insumos o responder dudas médicas." })}
                    </p>
                  </div>

                  {/* Chips de Sugerencia Rápida */}
                  <div className="flex flex-col gap-2 pt-2 text-left w-full">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                      {t("suggested_questions", { defaultValue: "Sugerencias Rápidas" })}
                    </span>
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-left text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#161616] hover:bg-[#5DCAA5]/10 hover:text-[#1D9E75] dark:hover:text-[#5DCAA5] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                      >
                        <span className="truncate mr-2">{prompt}</span>
                        <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#1D9E75] transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Mensajes */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "w-full min-w-0 flex flex-col gap-1.5",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3.5 rounded-[22px] text-xs sm:text-sm font-medium leading-relaxed shadow-2xs break-words max-w-[88%]",
                      msg.role === "user"
                        ? "bg-[#1D9E75] text-white rounded-br-xs ml-auto"
                        : "bg-gray-100 dark:bg-[#181818] text-gray-900 dark:text-gray-100 rounded-bl-xs mr-auto border border-gray-200/50 dark:border-gray-800/80"
                    )}
                  >
                    {/* Texto del Mensaje */}
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                    {/* Adjunto de Imagen si Existe */}
                    {msg.attachment && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                        <img
                          src={`data:${msg.attachment.mimeType};base64,${msg.attachment.base64Data}`}
                          alt="Adjunto"
                          className="max-h-48 object-cover w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Render de Widgets Fuera de la Burbuja para Ajuste Perfecto */}
                  {msg.response?.widgets && msg.response.widgets.length > 0 && (
                    <div className="w-full max-w-full min-w-0 overflow-hidden pt-1">
                      <WidgetRenderer widgets={msg.response.widgets} />
                    </div>
                  )}
                </div>
              ))}

              {/* Indicador de Pensando */}
              {isProcessing && (
                <div className="flex items-center gap-2.5 p-3 rounded-[20px] bg-gray-100 dark:bg-[#181818] text-gray-600 dark:text-gray-400 rounded-bl-xs w-fit shadow-2xs">
                  <QhSpinner size="sm" className="text-[#1D9E75]" />
                  <span className="text-xs font-semibold animate-pulse">
                    Pulso está procesando...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── VISUALIZADOR DE ONDA DE VOZ EN TIEMPO REAL (ESTILO IOS 12 BARS) ── */}
            {isListening && (
              <div className="px-4 py-3 bg-[#5DCAA5]/10 border-t border-[#5DCAA5]/30 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center gap-1.5 h-7">
                  {[14, 22, 10, 26, 18, 28, 16, 24, 12, 26, 16, 20].map((height, i) => (
                    <span
                      key={i}
                      className="w-1 bg-[#1D9E75] rounded-full animate-pulse"
                      style={{
                        height: `${height}px`,
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: "0.6s",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-[#04342C] dark:text-[#5DCAA5] text-center truncate max-w-xs">
                  {transcript ? `"${transcript}"` : "Escuchando tu voz..."}
                </p>
              </div>
            )}

            {/* Vista Previa de Archivo Adjunto */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-[#141414] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[#1D9E75]" />
                  1 archivo adjunto listo para enviar
                </span>
                <button
                  type="button"
                  onClick={() => setAttachments([])}
                  className="text-gray-400 hover:text-rose-500 text-xs font-bold"
                >
                  Quitar
                </button>
              </div>
            )}

            {/* ── BARRA DE ENTRADA (ESTILO PILL IOS) ────────────────────── */}
            <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0d0d0d] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-gray-100 dark:bg-[#181818] border border-gray-200/80 dark:border-gray-800/80 rounded-full p-1.5 pl-3 transition-all focus-within:border-[#1D9E75] focus-within:ring-2 focus-within:ring-[#1D9E75]/20"
              >
                {/* Botón Adjuntar */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  title="Adjuntar receta o foto"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Input de Texto */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isListening
                      ? "Escuchando tu voz..."
                      : isStorePage
                      ? t("input_placeholder_store", { defaultValue: "Pregunta sobre esta tienda o especialista..." })
                      : t("input_placeholder_general", { defaultValue: "Escribe o habla con Pulso..." })
                  }
                  className="flex-1 bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none font-medium px-1 min-w-0"
                />

                {/* Botón Micrófono */}
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) stopListening();
                    else startListening();
                  }}
                  className={cn(
                    "p-2 rounded-full transition-all cursor-pointer",
                    isListening
                      ? "bg-rose-500 text-white shadow-md animate-pulse"
                      : "text-gray-400 hover:text-[#1D9E75] hover:bg-gray-200/60 dark:hover:bg-gray-800"
                  )}
                  title={isListening ? "Detener grabación" : "Hablar con Pulso"}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* Botón Enviar */}
                <Button
                  type="submit"
                  disabled={(!inputMessage.trim() && attachments.length === 0) || isProcessing}
                  className="h-8 w-8 p-0 rounded-full bg-[#1D9E75] hover:bg-[#178563] text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
