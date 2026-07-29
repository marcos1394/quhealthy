"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef, useReducer, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  Sparkles,
  Search,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  Mail,
  Instagram,
  Facebook,
  MessageCircle,
  X,
  Loader2,
  CheckCheck,
  Link2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { useSocial } from "@/hooks/useSocial";
import { socialService } from "@/services/social.service";
import { ConversationDTO } from "@/types/social";
import { patientDirectoryService } from "@/services/patientDirectory.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface State {
  newMessage: string;
  searchTerm: string;
  suggestedReplies: any[];
  isSuggesting: boolean;
  platformFilter: string;
  statusFilter: string;
  isPatientDialogOpen: boolean;
  patientSearchQuery: string;
  patientSearchResults: any[];
  isSearchingPatient: boolean;
  isSyncingEmails: boolean;
}

type Action =
  | { type: "SET_NEWMESSAGE"; payload: string }
  | { type: "SET_SEARCHTERM"; payload: string }
  | { type: "SET_SUGGESTEDREPLIES"; payload: any[] }
  | { type: "SET_ISSUGGESTING"; payload: boolean }
  | { type: "SET_PLATFORMFILTER"; payload: string }
  | { type: "SET_STATUSFILTER"; payload: string }
  | { type: "SET_ISPATIENTDIALOGOPEN"; payload: boolean }
  | { type: "SET_PATIENTSEARCHQUERY"; payload: string }
  | { type: "SET_PATIENTSEARCHRESULTS"; payload: any[] }
  | { type: "SET_ISSEARCHINGPATIENT"; payload: boolean }
  | { type: "SET_ISSYNCINGEMAILS"; payload: boolean };

const initialState: State = {
  newMessage: "",
  searchTerm: "",
  suggestedReplies: [],
  isSuggesting: false,
  platformFilter: "ALL",
  statusFilter: "ALL",
  isPatientDialogOpen: false,
  patientSearchQuery: "",
  patientSearchResults: [],
  isSearchingPatient: false,
  isSyncingEmails: false,
};

function socialReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_NEWMESSAGE":
      return { ...state, newMessage: action.payload };
    case "SET_SEARCHTERM":
      return { ...state, searchTerm: action.payload };
    case "SET_SUGGESTEDREPLIES":
      return { ...state, suggestedReplies: action.payload };
    case "SET_ISSUGGESTING":
      return { ...state, isSuggesting: action.payload };
    case "SET_PLATFORMFILTER":
      return { ...state, platformFilter: action.payload };
    case "SET_STATUSFILTER":
      return { ...state, statusFilter: action.payload };
    case "SET_ISPATIENTDIALOGOPEN":
      return { ...state, isPatientDialogOpen: action.payload };
    case "SET_PATIENTSEARCHQUERY":
      return { ...state, patientSearchQuery: action.payload };
    case "SET_PATIENTSEARCHRESULTS":
      return { ...state, patientSearchResults: action.payload };
    case "SET_ISSEARCHINGPATIENT":
      return { ...state, isSearchingPatient: action.payload };
    case "SET_ISSYNCINGEMAILS":
      return { ...state, isSyncingEmails: action.payload };
    default:
      return state;
  }
}

export function SocialMessagesView() {
  const t = useTranslations("DashboardMessages");

  const {
    conversations,
    messages,
    activeConversationId,
    loadConversations,
    loadMessages,
    sendMessage,
    getAiReplySuggestions,
    updateConversation,
  } = useSocial();

  const [state, dispatch] = useReducer(socialReducer, initialState);

  const {
    newMessage,
    searchTerm,
    suggestedReplies,
    isSuggesting,
    platformFilter,
    statusFilter,
    isPatientDialogOpen,
    patientSearchQuery,
    patientSearchResults,
    isSearchingPatient,
    isSyncingEmails,
  } = state;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const handleSelectConversation = async (convo: ConversationDTO) => {
    dispatch({ type: "SET_SUGGESTEDREPLIES", payload: [] });
    await loadMessages(convo.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const messageToSend = newMessage;
    dispatch({ type: "SET_NEWMESSAGE", payload: "" });
    dispatch({ type: "SET_SUGGESTEDREPLIES", payload: [] });

    await sendMessage(activeConversationId, {
      type: "TEXT",
      content: messageToSend,
    });
  };

  const handleAISuggestionClick = async () => {
    if (!activeConversationId) return;
    dispatch({ type: "SET_ISSUGGESTING", payload: true });
    try {
      const response = await getAiReplySuggestions(activeConversationId);
      dispatch({
        type: "SET_SUGGESTEDREPLIES",
        payload: response.suggestions || [],
      });
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.ai_error"));
    } finally {
      dispatch({ type: "SET_ISSUGGESTING", payload: false });
    }
  };

  const handleApplySuggestion = (reply: string) => {
    dispatch({ type: "SET_NEWMESSAGE", payload: reply });
    dispatch({ type: "SET_SUGGESTEDREPLIES", payload: [] });
  };

  useEffect(() => {
    if (patientSearchQuery.length > 2) {
      const fetchPatients = async () => {
        dispatch({ type: "SET_ISSEARCHINGPATIENT", payload: true });
        try {
          const results = await patientDirectoryService.searchPatients(
            patientSearchQuery
          );
          dispatch({ type: "SET_PATIENTSEARCHRESULTS", payload: results });
        } catch (e) {
          console.error(e);
        } finally {
          dispatch({ type: "SET_ISSEARCHINGPATIENT", payload: false });
        }
      };
      const debounce = setTimeout(fetchPatients, 400);
      return () => clearTimeout(debounce);
    } else {
      dispatch({ type: "SET_PATIENTSEARCHRESULTS", payload: [] });
    }
  }, [patientSearchQuery]);

  const handleLinkPatient = async (patientId: number) => {
    if (!activeConversationId) return;
    await updateConversation(activeConversationId, {
      patientDirectoryId: patientId,
    });
    dispatch({ type: "SET_ISPATIENTDIALOGOPEN", payload: false });
    toast.success(t("toasts.patient_linked"));
  };

  const handleToggleStatus = async (currentStatus?: string) => {
    if (!activeConversationId) return;
    const newStatus = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
    await updateConversation(activeConversationId, { status: newStatus });
    toast.info(
      newStatus === "RESOLVED"
        ? t("toasts.case_resolved")
        : t("toasts.case_reopened")
    );
  };

  const handleSyncEmails = useCallback(async () => {
    dispatch({ type: "SET_ISSYNCINGEMAILS", payload: true });
    try {
      await socialService.syncEmails();
      toast.success(t("toasts.sync_success"));
      await loadConversations();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.sync_error"));
    } finally {
      dispatch({ type: "SET_ISSYNCINGEMAILS", payload: false });
    }
  }, [loadConversations, t]);

  const filteredConversations = conversations.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.contactName?.toLowerCase().includes(q) ||
      c.platform?.toLowerCase().includes(q);
    const matchesPlatform =
      platformFilter === "ALL" || c.platform === platformFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      c.status === statusFilter ||
      (!c.status && statusFilter === "OPEN");
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "WHATSAPP":
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={2} />;
      case "EMAIL":
        return <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" strokeWidth={2} />;
      case "INSTAGRAM":
        return <Instagram className="w-3.5 h-3.5 text-pink-500 shrink-0" strokeWidth={2} />;
      case "FACEBOOK":
        return <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={2} />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />;
    }
  };

  return (
    <div className="flex flex-1 min-h-0 w-full bg-white dark:bg-[#0a0a0a] overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-500">

      {/* ── BARRA LATERAL (INBOX) ────────────────────────────────────────── */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0a0a0a] shrink-0">
        
        {/* Header Inbox */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                {t("crm_badge")}
              </p>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                {t("title")}
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={handleSyncEmails}
              disabled={isSyncingEmails}
              className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
            >
              <RefreshCw
                className={cn(
                  "w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1.5",
                  isSyncingEmails && "animate-spin"
                )}
                strokeWidth={2}
              />
              <span className="hidden lg:inline">
                {isSyncingEmails ? t("btn_syncing") : t("btn_sync")}
              </span>
            </Button>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder={t("search_patient")}
              className="w-full h-10 pl-10 pr-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 placeholder:font-normal shadow-sm"
              value={searchTerm}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCHTERM", payload: e.target.value })
              }
            />
          </div>
          
          <div className="space-y-2">
            {/* Filtro por Plataformas */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {["ALL", "WHATSAPP", "EMAIL", "INSTAGRAM", "FACEBOOK"].map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SET_PLATFORMFILTER", payload: platform })
                  }
                  className={cn(
                    "px-3 h-7 flex items-center justify-center rounded-xl border text-[10px] font-bold transition-all shrink-0 shadow-sm",
                    platformFilter === platform
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  {platform === "ALL"
                    ? t("filters.platforms.all")
                    : t(`filters.platforms.${platform.toLowerCase()}`)}
                </button>
              ))}
            </div>
            
            {/* Filtro por Estado */}
            <div className="flex gap-1.5">
              {["ALL", "OPEN", "RESOLVED"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SET_STATUSFILTER", payload: status })
                  }
                  className={cn(
                    "flex-1 h-7 flex items-center justify-center rounded-xl border text-[10px] font-bold transition-all shadow-sm",
                    statusFilter === status
                      ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 text-gray-900 dark:text-white"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  {status === "ALL"
                    ? t("filters.all")
                    : status === "OPEN"
                    ? t("filters.active")
                    : t("filters.resolved")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Conversaciones */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("conversation.no_matches")}
            </div>
          ) : (
            filteredConversations.map((convo) => {
              const isSelected = activeConversation?.id === convo.id;

              return (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => handleSelectConversation(convo)}
                  className={cn(
                    "flex items-start gap-3.5 p-4 text-left transition-colors w-full relative group",
                    isSelected
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "hover:bg-gray-50/50 dark:hover:bg-[#111]/50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 dark:bg-emerald-500 rounded-r-full" />
                  )}

                  <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase">
                      {convo.contactName?.charAt(0) || "U"}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span
                        className={cn(
                          "font-bold text-xs truncate flex items-center gap-1.5",
                          isSelected
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {getPlatformIcon(convo.platform)}
                        <span className="truncate">
                          {convo.contactName || t("conversation.unknown_user")}
                        </span>
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0 ml-2">
                        {new Date(convo.lastMessageAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-2 mb-1.5">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                        {convo.lastMessage}
                      </p>
                      {!convo.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {convo.patientDirectoryId && (
                        <span className="border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {t("conversation.badge_record")}
                        </span>
                      )}
                      {convo.status === "RESOLVED" && (
                        <span className="border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {t("conversation.badge_resolved")}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL DEL CHAT ───────────────────────────────────────── */}
      <main className="hidden md:flex flex-1 flex-col bg-gray-50/50 dark:bg-[#050505] relative transition-colors">
        {activeConversation ? (
          <>
            {/* Header del Chat */}
            <div className="p-4 md:px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#0a0a0a] shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                    {activeConversation.contactName?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight truncate flex items-center gap-2">
                    <span>
                      {activeConversation.contactName ||
                        t("conversation.unknown_user")}
                    </span>
                    {activeConversation.status === "RESOLVED" && (
                      <span className="border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {t("conversation.badge_resolved")}
                      </span>
                    )}
                    {activeConversation.patientDirectoryId && (
                      <span className="border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Link2 className="w-3 h-3" strokeWidth={2} />
                        {t("conversation.badge_linked")}
                      </span>
                    )}
                  </h3>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                    {getPlatformIcon(activeConversation.platform)}
                    <span>
                      {t("conversation.channel_label", {
                        platform: activeConversation.platform,
                      })}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => handleToggleStatus(activeConversation.status)}
                  className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1.5"
                    strokeWidth={2}
                  />
                  <span>
                    {activeConversation.status === "RESOLVED"
                      ? t("conversation.btn_reopen")
                      : t("conversation.btn_mark_resolved")}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    dispatch({ type: "SET_ISPATIENTDIALOGOPEN", payload: true })
                  }
                  className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                >
                  <UserPlus
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1.5"
                    strokeWidth={2}
                  />
                  <span>
                    {activeConversation.patientDirectoryId
                      ? t("conversation.btn_reassign_patient")
                      : t("conversation.btn_link_patient")}
                  </span>
                </Button>
              </div>
            </div>

            {/* Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-gray-50/50 dark:bg-[#050505]">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg, i) => {
                  const isOutbound = msg.direction === "OUTBOUND";
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex w-full",
                        isOutbound ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "flex flex-col max-w-[80%] md:max-w-[70%] p-4 rounded-3xl shadow-sm text-xs font-medium leading-relaxed",
                          isOutbound
                            ? "bg-emerald-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-tl-none"
                        )}
                      >
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                        {isOutbound && (
                          <div className="flex justify-end mt-1.5 opacity-80">
                            <CheckCheck className="w-3.5 h-3.5" strokeWidth={2} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isSuggesting && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 ml-2 animate-pulse">
                    <Loader2
                      className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                    <span>{t("ai_assistant.generating")}</span>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            {/* Panel de Sugerencias IA */}
            <AnimatePresence>
              {(isSuggesting || suggestedReplies.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-emerald-50/60 dark:bg-emerald-950/20 border-t border-emerald-100 dark:border-emerald-900/30 p-4 md:px-6 flex flex-col gap-3 shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                      <Sparkles
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={2}
                      />
                      <span>{t("ai_assistant.title")}</span>
                    </p>
                    {isSuggesting && <QhSpinner size="sm" />}
                  </div>

                  {suggestedReplies.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                      {suggestedReplies.map((reply: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#0a0a0a] border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl shadow-sm"
                        >
                          <p className="flex-1 text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                            "{reply.text}"
                          </p>
                          <Button
                            onClick={() => handleApplySuggestion(reply.text)}
                            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white transition-all rounded-xl text-xs font-bold shrink-0 shadow-sm border-0"
                          >
                            {t("ai_assistant.btn_use_reply")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formulario Input */}
            <div className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 p-4 md:p-5 shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAISuggestionClick}
                  disabled={isSuggesting}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  <span>{t("ai_assistant.btn_synthesize")}</span>
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) =>
                    dispatch({ type: "SET_NEWMESSAGE", payload: e.target.value })
                  }
                  placeholder={t("type_message")}
                  className="flex-1 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 px-4 h-11 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 placeholder:font-normal rounded-xl shadow-sm"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-11 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 shadow-sm border-0"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Estado Vacío */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 dark:bg-[#050505] gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
              <MessageSquare className="w-7 h-7" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
              {t("empty_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              {t("empty_desc")}
            </p>
          </div>
        )}
      </main>

      {/* ── MODAL VINCULACIÓN DE PACIENTE ────────────────────────────────── */}
      <Dialog
        open={isPatientDialogOpen}
        onOpenChange={(open) =>
          dispatch({ type: "SET_ISPATIENTDIALOGOPEN", payload: open })
        }
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
          
          <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <UserPlus className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                  {t("modal_link.header_category")}
                </p>
                <DialogTitle className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  {t("modal_link.title")}
                </DialogTitle>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_ISPATIENTDIALOGOPEN", payload: false })
              }
              className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4 bg-white dark:bg-[#0a0a0a]">
            <DialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-[#050505] p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
              {t("modal_link.description")}
            </DialogDescription>

            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder={t("modal_link.search_placeholder")}
                value={patientSearchQuery}
                onChange={(e) =>
                  dispatch({
                    type: "SET_PATIENTSEARCHQUERY",
                    payload: e.target.value,
                  })
                }
                className="w-full h-11 pl-10 pr-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
              />
            </div>
            
            {isSearchingPatient ? (
              <div className="p-8 flex justify-center items-center">
                <QhSpinner size="sm" />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                {patientSearchResults.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-3.5 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate mb-0.5">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-[11px] font-semibold text-gray-400 truncate">
                        {p.email || "Sin correo registrado"}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleLinkPatient(p.id)}
                      className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm border-0"
                    >
                      {t("modal_link.btn_link")}
                    </Button>
                  </div>
                ))}
                {patientSearchQuery.length > 2 &&
                  patientSearchResults.length === 0 && (
                    <div className="p-6 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("modal_link.no_results")}
                    </div>
                  )}
              </div>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}