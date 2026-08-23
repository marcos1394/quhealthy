"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
  Stethoscope,
  ShoppingBag,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";

import { useHealthOSStore, Message } from "@/stores/useHealthOSStore";
import { healthOSService, AttachmentData } from "@/services/healthOS.service";
import { useSessionStore } from "@/stores/SessionStore";
import { WidgetRenderer } from "@/components/engine/WidgetRenderer";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// ── 1. TIPOS Y MASCOTA "QU" / PULSO ──────────────────────────────────────────
type MascotState = "idle" | "attending" | "thinking" | "searching" | "success" | "wink";

interface QuMascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
  onClick?: () => void;
}

function QuMascot({
  state = "idle",
  size = 28,
  className = "",
  onClick,
}: QuMascotProps) {
  const [internalState, setInternalState] = useState<MascotState>(state);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setInternalState(state);
  }, [state]);

  const activeState = isHovered && internalState === "idle" ? "wink" : internalState;

  const getMouthPoints = () => {
    switch (activeState) {
      case "thinking":
      case "searching":
        return { leftY: 16.2, centerY: 16.2, rightY: 16.2 };
      case "attending":
        return { leftY: 15.6, centerY: 18.2, rightY: 15.6 };
      case "success":
      case "wink":
        return { leftY: 14.8, centerY: 18.8, rightY: 14.8 };
      case "idle":
      default:
        return { leftY: 16.2, centerY: 18.0, rightY: 16.2 };
    }
  };

  const { leftY, centerY, rightY } = getMouthPoints();

  return (
    <svg
      className={cn(
        "cursor-pointer transition-transform duration-200 active:scale-90",
        className
      )}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setInternalState("wink");
        setTimeout(() => setInternalState(state), 1200);
        if (onClick) onClick();
      }}
    >
      <defs>
        <linearGradient id="pulsoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Bisel Exterior */}
      <rect
        x="1.2"
        y="1.2"
        width="21.6"
        height="21.6"
        rx="6"
        className="fill-emerald-600 dark:fill-emerald-500 stroke-emerald-700 dark:stroke-emerald-400"
        strokeWidth="0.8"
      />

      {/* Matriz LED Exterior */}
      <circle cx="3.5" cy="3.5" r="0.75" className="fill-white/80" />
      <circle cx="12" cy="3.5" r="0.75" className="fill-white/80" />
      <circle cx="20.5" cy="3.5" r="0.75" className="fill-white/80" />
      <circle cx="3.5" cy="12" r="0.75" className="fill-white/80" />
      <circle cx="20.5" cy="12" r="0.75" className="fill-white/80" />
      <circle cx="3.5" cy="20.5" r="0.75" className="fill-white/80" />
      <circle cx="12" cy="20.5" r="0.75" className="fill-white/80" />
      <circle cx="20.5" cy="20.5" r="0.75" className="fill-white/80" />

      {/* Ojo Izquierdo */}
      {activeState === "wink" ? (
        <path d="M 6.5 10 Q 8.5 8 10.5 10" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ) : activeState === "thinking" ? (
        <circle cx="8.5" cy="9.5" r="1.5" className="fill-white" />
      ) : (
        <circle cx="8.5" cy="9.5" r="1.8" className="fill-white" />
      )}

      {/* Ojo Derecho */}
      {activeState === "thinking" ? (
        <circle cx="15.5" cy="9.5" r="1.5" className="fill-white" />
      ) : (
        <circle cx="15.5" cy="9.5" r="1.8" className="fill-white" />
      )}

      {/* Sonrisa Dinámica */}
      <path
        d={`M 7.5 ${leftY} Q 12 ${centerY} 16.5 ${rightY}`}
        stroke="white"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── 2. COMPONENTE PRINCIPAL FLOTANTE DE PULSO ────────────────────────────────
export function PulsoFloatingAssistant() {
  const t = useTranslations("PulsoAssistant");
  const pathname = usePathname();
  const { user } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const {
    conversation,
    addUserMessage,
    updateAssistantStream,
    finalizeStream,
    resetConversation,
    streamingState,
  } = useHealthOSStore();

  // Detección contextual de la tienda actual a partir de la URL
  const isStorePage = pathname?.includes("/store/");
  const storeSlug = isStorePage ? pathname.split("/store/")[1]?.split("/")[0] : null;

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

  // Auto-scroll al final de la conversación
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, isOpen, streamingState]);

  // Manejo de Mascot State
  useEffect(() => {
    if (isListening) {
      setMascotState("attending");
    } else if (streamingState === "processing") {
      setMascotState("thinking");
    } else if (conversation.length > 0 && conversation[conversation.length - 1].role === "assistant") {
      setMascotState("success");
      const timer = setTimeout(() => setMascotState("idle"), 3000);
      return () => clearTimeout(timer);
    } else {
      setMascotState("idle");
    }
  }, [isListening, streamingState, conversation]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && attachments.length === 0) return;

    setInputMessage("");
    const currentAttachments = [...attachments];
    setAttachments([]);

    // Añadir mensaje a store local
    addUserMessage(
      text,
      currentAttachments.length > 0
        ? {
            base64Data: currentAttachments[0].base64Data,
            mimeType: currentAttachments[0].mimeType,
          }
        : undefined
    );

    setMascotState("thinking");

    // Construir contexto enriquecido
    const patientContext: Record<string, any> = {
      userId: user?.id,
      userName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Invitado",
      currentRoute: pathname,
      isStoreContext: isStorePage,
      storeSlug: storeSlug || undefined,
    };

    try {
      const response = await healthOSService.sendIntent(
        text,
        patientContext,
        currentAttachments
      );

      startTransition(() => {
        updateAssistantStream(response);
        finalizeStream();

        // Reproducir audio TTS si está habilitado y el backend devuelve audio
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
      updateAssistantStream({
        text: "Disculpa, tuve un problema temporal al conectarme con el servicio de salud. Por favor intenta de nuevo.",
      });
      finalizeStream();
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

  // Sugerencias rápidas basadas en el contexto
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

  return (
    <>
      {/* ── BOTÓN FLOTANTE TRIGGER (PULSO / QU MASCOT) ────────────────── */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none">
        {/* Tooltip flotante con aviso cuando está cerrado */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1 }}
            onClick={() => setIsOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border border-emerald-500/20 shadow-lg text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:border-emerald-500/40 transition-all group"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>{isStorePage ? t("ask_about_store", { defaultValue: "Preguntar sobre esta tienda" }) : t("ask_pulso", { defaultValue: "¿En qué te puedo ayudar hoy?" })}</span>
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className={cn(
            "relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-xl transition-all border-2 cursor-pointer",
            isOpen
              ? "bg-gray-900 border-gray-700 text-white dark:bg-white dark:border-gray-200 dark:text-black"
              : "bg-emerald-600 border-emerald-400/60 text-white hover:shadow-emerald-500/30 hover:shadow-2xl"
          )}
          aria-label="Abrir asistente de salud Pulso AI"
        >
          {/* Anillo de pulso animado */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25 pointer-events-none" />
          )}

          {isOpen ? (
            <X className="w-6 h-6" strokeWidth={2.5} />
          ) : (
            <QuMascot state={mascotState} size={36} />
          )}
        </motion.button>
      </div>

      {/* ── VENTANA DE CHAT EXPANDIDA ────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "fixed bottom-24 right-4 sm:right-6 z-50 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-all duration-300",
              isExpanded
                ? "w-[calc(100vw-32px)] sm:w-[680px] h-[calc(100vh-120px)] max-h-[820px]"
                : "w-[calc(100vw-32px)] sm:w-[420px] h-[580px] sm:h-[620px] max-h-[85vh]"
            )}
          >
            {/* Header del Asistente */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-[#111]/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-center shrink-0 shadow-2xs">
                  <QuMascot state={mascotState} size={28} />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                      Pulso AI
                    </h3>
                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 rounded-full text-[9px] font-black px-2 py-0">
                      ONLINE
                    </Badge>
                  </div>

                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {isStorePage ? t("store_mode", { defaultValue: "Modo Tienda Activo" }) : t("health_assistant", { defaultValue: "Copiloto Clínico & Marketplace" })}
                  </p>
                </div>
              </div>

              {/* Botones de Control en Header */}
              <div className="flex items-center gap-1">
                {/* Toggle TTS */}
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={ttsEnabled ? "Silenciar respuestas de voz" : "Activar respuestas de voz"}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Reset Chat */}
                <button
                  type="button"
                  onClick={() => resetConversation()}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Nueva conversación"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Expand / Minimize */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block"
                  title={isExpanded ? "Reducir ventana" : "Expandir ventana"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Cerrar */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── FEED DE MENSAJES ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans no-scrollbar">
              {/* Mensaje de Bienvenida Si No Hay Mensajes */}
              {conversation.length === 0 && (
                <div className="py-6 px-2 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 mx-auto flex items-center justify-center shadow-xs">
                    <QuMascot state="attending" size={40} />
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
                  <div className="flex flex-col gap-2 pt-2 text-left">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                      {t("suggested_questions", { defaultValue: "Sugerencias Rápidas" })}
                    </span>
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-left text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#161616] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <span>{prompt}</span>
                        <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de Mensajes */}
              {conversation.map((msg: Message) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1.5 max-w-[88%]",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3.5 rounded-3xl text-xs sm:text-sm font-medium leading-relaxed shadow-2xs",
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-xs"
                        : "bg-gray-100 dark:bg-[#181818] text-gray-900 dark:text-gray-100 rounded-bl-xs border border-gray-200/60 dark:border-gray-800"
                    )}
                  >
                    {/* Contenido de Texto */}
                    {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                    {/* Respuesta estructurada del Backend */}
                    {msg.response && (
                      <div className="space-y-3">
                        {msg.response.text && (
                          <p className="whitespace-pre-wrap">{msg.response.text}</p>
                        )}

                        {/* Render de Widgets Nativos */}
                        {msg.response.widgets && msg.response.widgets.length > 0 && (
                          <div className="w-full pt-2">
                            <WidgetRenderer widgets={msg.response.widgets} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Adjuntos */}
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
                </div>
              ))}

              {/* Indicador de Pensando / Streaming */}
              {streamingState === "processing" && (
                <div className="flex items-center gap-2 p-3.5 rounded-3xl bg-gray-100 dark:bg-[#181818] text-gray-500 rounded-bl-xs w-fit shadow-2xs">
                  <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold animate-pulse">
                    Pulso está procesando tu solicitud...
                  </span>
                </div>
              )}

              {/* Indicador de Escuchando Voz */}
              {isListening && (
                <div className="flex items-center gap-2 p-3.5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50 rounded-bl-xs w-fit shadow-2xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold">
                    Escuchando tu voz... {transcript ? `"${transcript}"` : ""}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Vista Previa de Archivo Adjunto */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-[#141414] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
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

            {/* ── BARRA DE ENTRADA (VOZ Y TEXTO) ──────────────────────── */}
            <div className="p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0c0c0c] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-gray-50 dark:bg-[#141414] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-1.5 transition-all focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
              >
                {/* Botón Adjuntar Archivo */}
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
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
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
                  className="flex-1 bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none px-2 font-medium"
                />

                {/* Botón de Voz / Micrófono */}
                <button
                  type="button"
                  onClick={() => {
                    if (isListening) stopListening();
                    else startListening();
                  }}
                  className={cn(
                    "p-2.5 rounded-xl transition-all cursor-pointer",
                    isListening
                      ? "bg-rose-500 text-white shadow-md animate-pulse"
                      : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
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
                  disabled={(!inputMessage.trim() && attachments.length === 0) || streamingState === "processing"}
                  className="h-9 w-9 p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
