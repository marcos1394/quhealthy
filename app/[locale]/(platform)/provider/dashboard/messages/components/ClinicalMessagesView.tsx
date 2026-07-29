"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MessageCircle, ShieldCheck, WifiOff } from "lucide-react";
import { toast } from "react-toastify";

import { useSessionStore } from "@/stores/SessionStore";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

// Componentes modulares
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function ClinicalMessagesView() {
  const t = useTranslations("PatientMessages");
  const { user } = useSessionStore();
  
  // Estado del Buscador Local
  const [searchQuery, setSearchQuery] = useState("");
  
  // Referencia para Auto-Scroll al último mensaje
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook de Producción (REST + STOMP)
  const {
    conversations,
    messages,
    selectedConversation,
    setSelectedConversation,
    isLoading,
    isConnected,
    isTyping,
    sendMessage,
    sendTypingEvent,
  } = useChat();

  // Auto-scroll al fondo cuando llegan mensajes nuevos
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleVoiceCall = () => toast.info(t("toast_voice"));
  const handleVideoCall = () => toast.info(t("toast_video"));
  const handleBackToInbox = () => setSelectedConversation(null);

  // 1. Pantalla de Carga Inicial
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] gap-3 bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // 2. Render Principal
  return (
    <div className="bg-white dark:bg-[#0a0a0a] flex flex-col flex-1 min-h-0 overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-500">
      
      {/* Header del Módulo (Oculto en móvil cuando hay un chat activo) */}
      <div
        className={cn(
          "p-4 md:px-6 md:py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0",
          selectedConversation
            ? "hidden lg:flex items-center justify-between"
            : "hidden md:flex items-center justify-between"
        )}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <MessageCircle className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white leading-tight">
              {t("title")}
            </h1>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor Principal del Chat */}
      <div className="flex-1 flex min-h-0 relative bg-white dark:bg-[#0a0a0a]">
        
        {/* Alerta de Reconexión / Desconexión */}
        {!isConnected && !isLoading && (
          <div className="absolute top-0 left-0 right-0 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold py-2 px-4 z-50 flex items-center justify-center gap-2 border-b border-amber-200/60 dark:border-amber-900/40 shadow-sm">
            <WifiOff className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>{t("reconnecting")}</span>
          </div>
        )}

        {/* Columna Izquierda: Lista de Conversaciones (Inbox) */}
        <div
          className={cn(
            "flex flex-col min-h-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all duration-300",
            selectedConversation
              ? "hidden md:flex md:w-80 lg:w-96 shrink-0"
              : "flex w-full"
          )}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ChatSidebar
              conversations={conversations}
              selectedId={selectedConversation?.id}
              onSelect={setSelectedConversation}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Columna Derecha: Área del Chat Activo */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-0 bg-gray-50/50 dark:bg-[#050505] relative",
            !selectedConversation ? "hidden md:flex" : "flex w-full"
          )}
        >
          {selectedConversation ? (
            <>
              {/* Header de Conversación */}
              <ChatHeader
                conversation={selectedConversation}
                onBack={handleBackToInbox}
                onVoiceCall={handleVoiceCall}
                onVideoCall={handleVideoCall}
              />

              {/* Historial de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                
                {/* Indicador de Privacidad */}
                <div className="flex justify-center mb-6 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-gray-200/60 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-[11px] font-bold text-gray-500 dark:text-gray-400 shadow-sm">
                    <ShieldCheck
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                    <span>{t("privacy_notice")}</span>
                  </span>
                </div>

                {messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === user?.id}
                    providerInitial={(
                      selectedConversation.otherParticipantName || "P"
                    ).charAt(0)}
                  />
                ))}

                {/* Indicador "Escribiendo..." */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 ml-12 animate-pulse">
                    <Loader2
                      className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                    <span>{t("typing")}</span>
                  </div>
                )}
                
                {/* Ancla para Auto-scroll */}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Formulario de Envío de Mensaje */}
              <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <ChatInput
                  onSendMessage={(content) => sendMessage(content)}
                  onTyping={sendTypingEvent}
                />
              </div>
            </>
          ) : (
            /* Estado Vacío (Sin Chat Seleccionado) */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 dark:bg-[#050505] gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                <MessageCircle className="w-7 h-7" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                {t("select_conversation")}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {t("select_conversation_desc")}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}