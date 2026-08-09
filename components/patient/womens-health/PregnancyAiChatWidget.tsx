"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Send, X, ChevronDown, AlertTriangle, Bot } from "lucide-react";
import { womensHealthService, PregnancyProfileDto, PregnancyAiChatResponseDto } from "@/services/womensHealth.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { ConsumerProfile } from "@/types/consumerProfile";

interface Message {
  role: "user" | "assistant";
  content: string;
  isUrgent?: boolean;
  urgencyReason?: string;
}

const SUGGESTED_QUESTIONS = [
  "¿Qué debo comer esta semana?",
  "¿Cuántos movimientos fetales son normales?",
  "¿Cuándo debo ir a urgencias?",
  "¿Qué actividad física puedo hacer?",
];

interface PregnancyAiChatWidgetProps {
  pregnancy: PregnancyProfileDto;
  consumerId: number;
}

export function PregnancyAiChatWidget({ pregnancy, consumerId }: PregnancyAiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `¡Hola! Soy tu asistente de salud para el embarazo. Estás en la **semana ${pregnancy.currentGestationalWeek}** y puedo responderte dudas sobre nutrición, signos de alarma, actividad física y más. ¿En qué te puedo ayudar hoy?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<ConsumerProfile | null>(null);

  useEffect(() => {
    consumerProfileService.getProfile().then(setProfile).catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const getSuggestedQuestions = () => {
    const questions = [...SUGGESTED_QUESTIONS];
    if (profile?.medicalConditions && profile.medicalConditions.length > 0) {
      const conditionNames = profile.medicalConditions
        .map(c => typeof c === 'string' ? c : c.name?.toLowerCase() || '')
        .join(' ');
      
      if (conditionNames.includes('diabet')) {
        questions[0] = "¿Cómo controlo mi glucosa en el embarazo?";
      }
      if (conditionNames.includes('hiperten') || conditionNames.includes('presi')) {
        questions[2] = "¿Cuándo es peligrosa la presión arterial alta?";
      }
    }
    return questions;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res: PregnancyAiChatResponseDto = await womensHealthService.pregnancyAiChat(consumerId, text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.assistantMessage,
          isUrgent: res.isUrgent,
          urgencyReason: res.urgencyReason,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocurrió un error al conectar con el asistente. Por favor intenta de nuevo." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 rounded-2xl px-5 py-3.5 font-semibold text-sm transition-colors"
            aria-label="Abrir asistente de IA"
          >
            <BrainCircuit className="w-5 h-5" />
            IA — Dudas del Embarazo
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[420px] max-h-[80vh] flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-emerald-600 dark:bg-emerald-700">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white text-sm leading-tight">Asistente de Embarazo</p>
                    {profile?.medicalConditions && profile.medicalConditions.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-500 text-amber-950 text-[10px] font-bold rounded-md" title="Contexto clínico activado">
                        +CLÍNICO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-100">Semana {pregnancy.currentGestationalWeek} · Powered by Gemini</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                    {/* Urgency banner */}
                    {msg.isUrgent && msg.urgencyReason && (
                      <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-3 py-2 w-full">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300">{msg.urgencyReason}</p>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white rounded-tr-sm"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <QhSpinner size="sm" />
                    <span className="text-xs text-gray-500">Consultando con IA...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions (show only when few messages) */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {getSuggestedQuestions().map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-1.5 rounded-xl transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none min-h-[24px] max-h-[120px] leading-6 py-0 disabled:opacity-50"
                  style={{ height: "auto" }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = "auto";
                    t.style.height = `${t.scrollHeight}px`;
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl flex items-center justify-center transition-colors shrink-0 mb-0.5"
                  aria-label="Enviar"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">
                Información orientativa. Siempre consulta con tu médico.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
