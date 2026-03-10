"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Send, Loader2, Sparkles, CheckCircle2,
  MessageCircle, Clock, ChevronRight, X,
} from "lucide-react";
import { useSocial } from "@/hooks/useSocial";
import type { ConversationDTO, MessageDTO, AiSuggestionTone } from "@/types/social";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateStr));
  } catch { return ""; }
}

function formatRelativeDate(dateStr: string): string {
  try {
    const d        = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(d);
  } catch { return ""; }
}

// ── Tone style map ─────────────────────────────────────────────────────────────

const TONE_COLORS: Record<AiSuggestionTone, string> = {
  friendly:     "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300",
  professional: "bg-medical-50 dark:bg-medical-900/20 border-medical-200 dark:border-medical-800 text-medical-700 dark:text-medical-300",
  promotional:  "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function SocialInbox() {
  const t  = useTranslations("DashboardMarketing");
  const ti = useTranslations("DashboardMarketing.inbox");

  const {
    conversations,
    messages,
    loadConversations,
    loadMessages,
    sendMessage,           // ✅ era sendCrmMessage
    getAiReplySuggestions,
  } = useSocial();

  // ── Estado local ───────────────────────────────────────────────────────────
  const [selectedConversation, setSelectedConversation] = useState<ConversationDTO | null>(null); // ✅ era ConversationResponse
  const [inputText,   setInputText]   = useState("");
  const [sendingMsg,  setSendingMsg]  = useState(false);

  // Sugerencias IA
  const [suggestions,       setSuggestions]       = useState<Array<{ tone: AiSuggestionTone; text: string }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions,   setShowSuggestions]   = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Init ───────────────────────────────────────────────────────────────────

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!selectedConversation) return;
    loadMessages(selectedConversation.id);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── AI Suggestions ─────────────────────────────────────────────────────────

  async function handleGetSuggestions() {
    if (!selectedConversation) return;
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    try {
      const result = await getAiReplySuggestions(selectedConversation.id);
      setSuggestions(result.suggestions ?? []);
    } catch {
      // Fallback si el endpoint falla
      setSuggestions([
        { tone: "friendly",     text: "¡Hola! Con gusto te ayudo. ¿Puedes contarme más sobre lo que necesitas?" },
        { tone: "professional", text: "Buenos días. Para orientarte correctamente, necesito algunos datos adicionales." },
        { tone: "promotional",  text: "Tenemos disponibilidad esta semana. ¿Te gustaría agendar una consulta?" },
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  function applySuggestion(text: string) {
    setInputText(text);
    setShowSuggestions(false);
  }

  // ── Send Message ───────────────────────────────────────────────────────────

  async function handleSend() {
    if (!inputText.trim() || !selectedConversation || sendingMsg) return;
    setSendingMsg(true);
    try {
      // ✅ SendMessageRequest usa 'type', no 'messageType'
      await sendMessage(selectedConversation.id, {
        type: "TEXT",
        content: inputText.trim(),
      });
      setInputText("");
    } finally {
      setSendingMsg(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

      {/* ── Sidebar: Conversaciones ─────────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={16} className="text-medical-600" />
            {t("inbox_title")}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageCircle className="text-slate-300 dark:text-slate-600 mb-2" size={32} />
              <p className="text-sm text-slate-400 dark:text-slate-500">{t("inbox_empty")}</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  selectedConversation?.id === conv.id
                    ? "bg-medical-50 dark:bg-medical-900/10 border-l-2 border-l-medical-600"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* ✅ contactName / externalContactId — no patientName / platformUserId */}
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {conv.contactName || conv.externalContactId}
                    </p>
                    {/* ✅ lastMessage — no lastMessagePreview */}
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {conv.lastMessage ?? t("inbox_empty")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-slate-400">
                      {conv.lastMessageAt ? formatRelativeDate(conv.lastMessageAt) : ""}
                    </span>
                    {/* ✅ unreadCount es opcional — guardamos con ?? 0 */}
                    {(conv.unreadCount ?? 0) > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-medical-600 text-white text-xs font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Main: Chat ─────────────────────────────────────────────────────── */}
      {!selectedConversation ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <ChevronRight className="text-slate-300 dark:text-slate-600" size={28} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t("select_chat")}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header del chat */}
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {selectedConversation.contactName || selectedConversation.externalContactId}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {selectedConversation.platform}
              </p>
            </div>

            {/* Botón sugerencias IA */}
            <button
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors disabled:opacity-50"
            >
              {loadingSuggestions
                ? <Loader2 size={12} className="animate-spin" />
                : <Sparkles size={12} />
              }
              {ti("ai_suggest_btn")}
            </button>
          </div>

          {/* Panel de sugerencias IA */}
          {showSuggestions && (
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles size={12} className="text-teal-500" />
                  {ti("ai_suggest_title")}
                </p>
                <button onClick={() => setShowSuggestions(false)}>
                  <X size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                </button>
              </div>

              {loadingSuggestions ? (
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 flex-1 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => applySuggestion(s.text)}
                      className={`flex-1 min-w-[200px] text-left text-xs p-3 rounded-xl border transition-all hover:scale-[1.02] ${TONE_COLORS[s.tone]}`}
                    >
                      {/* ✅ etiquetas de tono desde i18n */}
                      <span className="font-semibold block mb-1">
                        {ti(`ai_suggest_tone_${s.tone}`)}
                      </span>
                      <span className="leading-relaxed line-clamp-3">{s.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg: MessageDTO) => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.direction === "OUTBOUND"
                      ? "bg-medical-600 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                  <p className={`text-xs mt-1 ${msg.direction === "OUTBOUND" ? "text-medical-200" : "text-slate-400"}`}>
                    {/* ✅ createdAt — no sentAt */}
                    {formatTime(msg.createdAt)}
                    {msg.direction === "OUTBOUND" && (
                      <CheckCircle2 size={10} className="inline ml-1" />
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-end gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={t("type_message")}
                className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition max-h-32"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sendingMsg}
                className="p-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {sendingMsg
                  ? <Loader2 size={18} className="animate-spin" />
                  : <Send size={18} />
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}