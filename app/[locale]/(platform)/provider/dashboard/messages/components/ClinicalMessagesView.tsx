"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, WifiOff, Lock, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";

import { useSessionStore } from "@/stores/SessionStore";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { formatMessageDateDivider } from "@/lib/formatMessageTime";

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
      <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] gap-3 bg-white dark:bg-[#111b21] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // 2. Render Principal (Diseño WhatsApp Web)
  return (
    <div className="bg-white dark:bg-[#111b21] flex flex-col flex-1 min-h-0 overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-500">
      
      {/* Contenedor Principal del Chat */}
      <div className="flex-1 flex min-h-0 relative bg-white dark:bg-[#111b21]">
        
        {/* Alerta de Reconexión / Desconexión */}
        {!isConnected && !isLoading && (
          <div className="absolute top-0 left-0 right-0 bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 text-xs font-semibold py-1.5 px-4 z-50 flex items-center justify-center gap-2 border-b border-amber-500/20 shadow-xs backdrop-blur-xs">
            <WifiOff className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>{t("reconnecting")}</span>
          </div>
        )}

        {/* Columna Izquierda: Lista de Conversaciones (Sidebar WhatsApp) */}
        <div
          className={cn(
            "flex flex-col min-h-0 border-r border-[#e9edef] dark:border-[#222d34] bg-white dark:bg-[#111b21] transition-all duration-300",
            selectedConversation
              ? "hidden md:flex md:w-80 lg:w-[380px] shrink-0"
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
            "flex-1 flex flex-col min-h-0 relative",
            !selectedConversation ? "hidden md:flex bg-[#f0f2f5] dark:bg-[#222e35]" : "flex w-full bg-[#efeae2]/30 dark:bg-[#0b141a]"
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

              {/* Historial de Mensajes con Fondo WhatsApp y Divisores de Fecha */}
              <div className="flex-1 overflow-y-auto px-4 py-3 md:px-8 md:py-4 space-y-2.5 custom-scrollbar">
                
                {/* Indicador de Privacidad NOM-024 */}
                <div className="flex justify-center mb-4 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#182229]/90 text-[11px] font-medium text-[#54656f] dark:text-[#8696a0] shadow-xs backdrop-blur-xs">
                    <ShieldCheck
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                    <span>{t("privacy_notice")}</span>
                  </span>
                </div>

                {messages.map((msg, index) => {
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const showDateDivider =
                    !prevMsg ||
                    new Date(msg.createdAt).toDateString() !==
                      new Date(prevMsg.createdAt).toDateString();

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateDivider && (
                        <div className="flex justify-center my-3 sticky top-2 z-10">
                          <span className="px-3 py-1 rounded-lg bg-white/90 dark:bg-[#182229]/95 text-[#54656f] dark:text-[#8696a0] text-[11px] font-semibold shadow-xs backdrop-blur-xs border border-black/5 dark:border-white/5 tracking-wide">
                            {formatMessageDateDivider(msg.createdAt, {
                              today: t("today"),
                              yesterday: t("yesterday"),
                            })}
                          </span>
                        </div>
                      )}
                      <ChatMessageBubble
                        message={msg}
                        isOwn={msg.senderId === user?.id}
                        providerInitial={(
                          selectedConversation.otherParticipantName || "P"
                        ).charAt(0)}
                      />
                    </React.Fragment>
                  );
                })}

                {/* Indicador "Escribiendo..." estilo WhatsApp */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-4 py-1">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                    </span>
                    <span className="text-[12px] font-medium">{t("typing")}</span>
                  </div>
                )}
                
                {/* Ancla para Auto-scroll */}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Formulario de Envío de Mensaje */}
              <div className="shrink-0">
                <ChatInput
                  onSendMessage={(content) => sendMessage(content)}
                  onTyping={sendTypingEvent}
                />
              </div>
            </>
          ) : (
            /* Estado Vacío Estilo WhatsApp Web Desktop */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f0f2f5] dark:bg-[#222e35] select-none border-b-[6px] border-[#00a884]">
              <div className="max-w-md flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-[#111b21] border border-black/5 dark:border-white/5 flex items-center justify-center text-[#54656f] dark:text-[#8696a0] shadow-sm mb-6">
                  <MessageSquare className="w-9 h-9 text-[#00a884]" strokeWidth={1.75} />
                </div>
                <h2 className="text-xl md:text-2xl font-light text-[#41525d] dark:text-[#e9edef] tracking-tight mb-3">
                  {t("welcome_title")}
                </h2>
                <p className="text-xs md:text-sm font-normal text-[#667781] dark:text-[#8696a0] leading-relaxed mb-8">
                  {t("welcome_desc")}
                </p>

                <div className="inline-flex items-center gap-2 text-[11px] font-medium text-[#8696a0] dark:text-[#667781]">
                  <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("encrypted_badge")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}