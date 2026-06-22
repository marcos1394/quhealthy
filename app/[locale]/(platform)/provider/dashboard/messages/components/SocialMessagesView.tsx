/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Sparkles, Search, MoreVertical, Phone, Video, CheckCheck, RefreshCw, UserPlus, Filter, CheckCircle2, Mail, Instagram, Facebook, MessageCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useSocial } from "@/hooks/useSocial";
import { socialService } from "@/services/social.service";
import { ConversationDTO, MessageDTO, AiSuggestion } from "@/types/social";
import { patientDirectoryService } from "@/services/patientDirectory.service";
import { PatientDirectorySearchResult } from "@/types/patient";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

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
    loading
  } = useSocial();

    const [{ newMessage, searchTerm, suggestedReplies, isSuggesting, platformFilter, statusFilter, isPatientDialogOpen, patientSearchQuery, patientSearchResults, isSearchingPatient, isSyncingEmails }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_NEWMESSAGE': return { ...state, newMessage: typeof action.payload === 'function' ? action.payload(state.newMessage) : action.payload };
      case 'SET_SEARCHTERM': return { ...state, searchTerm: typeof action.payload === 'function' ? action.payload(state.searchTerm) : action.payload };
      case 'SET_SUGGESTEDREPLIES': return { ...state, suggestedReplies: typeof action.payload === 'function' ? action.payload(state.suggestedReplies) : action.payload };
      case 'SET_ISSUGGESTING': return { ...state, isSuggesting: typeof action.payload === 'function' ? action.payload(state.isSuggesting) : action.payload };
      case 'SET_PLATFORMFILTER': return { ...state, platformFilter: typeof action.payload === 'function' ? action.payload(state.platformFilter) : action.payload };
      case 'SET_STATUSFILTER': return { ...state, statusFilter: typeof action.payload === 'function' ? action.payload(state.statusFilter) : action.payload };
      case 'SET_ISPATIENTDIALOGOPEN': return { ...state, isPatientDialogOpen: typeof action.payload === 'function' ? action.payload(state.isPatientDialogOpen) : action.payload };
      case 'SET_PATIENTSEARCHQUERY': return { ...state, patientSearchQuery: typeof action.payload === 'function' ? action.payload(state.patientSearchQuery) : action.payload };
      case 'SET_PATIENTSEARCHRESULTS': return { ...state, patientSearchResults: typeof action.payload === 'function' ? action.payload(state.patientSearchResults) : action.payload };
      case 'SET_ISSEARCHINGPATIENT': return { ...state, isSearchingPatient: typeof action.payload === 'function' ? action.payload(state.isSearchingPatient) : action.payload };
      case 'SET_ISSYNCINGEMAILS': return { ...state, isSyncingEmails: typeof action.payload === 'function' ? action.payload(state.isSyncingEmails) : action.payload };
          default: return state;
        }
      },
      {
        newMessage: "", searchTerm: "", suggestedReplies: [], isSuggesting: false, platformFilter: "ALL", statusFilter: "ALL", isPatientDialogOpen: false, patientSearchQuery: "", patientSearchResults: [], isSearchingPatient: false, isSyncingEmails: false
      }
    );

    const setNewMessage = (val: any) => dispatch({ type: 'SET_NEWMESSAGE', payload: val });
    const setSearchTerm = (val: any) => dispatch({ type: 'SET_SEARCHTERM', payload: val });
    const setSuggestedReplies = (val: any) => dispatch({ type: 'SET_SUGGESTEDREPLIES', payload: val });
    const setIsSuggesting = (val: any) => dispatch({ type: 'SET_ISSUGGESTING', payload: val });
    const setPlatformFilter = (val: any) => dispatch({ type: 'SET_PLATFORMFILTER', payload: val });
    const setStatusFilter = (val: any) => dispatch({ type: 'SET_STATUSFILTER', payload: val });
    const setIsPatientDialogOpen = (val: any) => dispatch({ type: 'SET_ISPATIENTDIALOGOPEN', payload: val });
    const setPatientSearchQuery = (val: any) => dispatch({ type: 'SET_PATIENTSEARCHQUERY', payload: val });
    const setPatientSearchResults = (val: any) => dispatch({ type: 'SET_PATIENTSEARCHRESULTS', payload: val });
    const setIsSearchingPatient = (val: any) => dispatch({ type: 'SET_ISSEARCHINGPATIENT', payload: val });
    const setIsSyncingEmails = (val: any) => dispatch({ type: 'SET_ISSYNCINGEMAILS', payload: val });





  // Filtros



  // Pacientes






  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleSelectConversation = async (convo: ConversationDTO) => {
    setSuggestedReplies([]);
    await loadMessages(convo.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;
    
    const messageToSend = newMessage;
    setNewMessage("");
    setSuggestedReplies([]);
    
    await sendMessage(activeConversationId, { type: 'TEXT', content: messageToSend });
  };

  const handleAISuggestionClick = async () => {
    if (!activeConversationId) return;
    setIsSuggesting(true);
    try {
      const response = await getAiReplySuggestions(activeConversationId);
      setSuggestedReplies(response.suggestions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleApplySuggestion = (reply: string) => {
    setNewMessage(reply);
    setSuggestedReplies([]);
  };

  useEffect(() => {
    if (patientSearchQuery.length > 2) {
      const fetchPatients = async () => {
        setIsSearchingPatient(true);
        try {
          const results = await patientDirectoryService.searchPatients(patientSearchQuery);
          setPatientSearchResults(results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearchingPatient(false);
        }
      };
      const debounce = setTimeout(fetchPatients, 500);
      return () => clearTimeout(debounce);
    } else {
      setPatientSearchResults([]);
    }
  }, [patientSearchQuery]);

  const handleLinkPatient = async (patientId: number) => {
    if (!activeConversationId) return;
    await updateConversation(activeConversationId, { patientDirectoryId: patientId });
    setIsPatientDialogOpen(false);
  };

  const handleToggleStatus = async (currentStatus?: string) => {
    if (!activeConversationId) return;
    const newStatus = currentStatus === "RESOLVED" ? "OPEN" : "RESOLVED";
    await updateConversation(activeConversationId, { status: newStatus });
  };

  const handleSyncEmails = async () => {
    setIsSyncingEmails(true);
    try {
      await socialService.syncEmails();
      toast.success("Sincronización Completada", { theme: "colored" });
      await loadConversations();
    } catch (error) {
      toast.error("Error en sincronización. Compruebe credenciales de integración.", { theme: "colored" });
    } finally {
      setIsSyncingEmails(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) || c.platform?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === "ALL" || c.platform === platformFilter;
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter || (!c.status && statusFilter === "OPEN");
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "WHATSAPP": return <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case "EMAIL": return <Mail className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case "INSTAGRAM": return <Instagram className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case "FACEBOOK": return <Facebook className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 rounded-none overflow-hidden transition-colors">

      {/* --- SIDEBAR (INBOX) --- */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-black/20 dark:border-white/20 flex flex-col bg-gray-50 dark:bg-[#050505] shrink-0">
        
        {/* Header Inbox */}
        <div className="p-6 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Módulo CRM</p>
              <h2 className="text-lg font-semibold uppercase tracking-tight text-black dark:text-white leading-none">{t("title", { defaultValue: 'REDES SOCIALES' })}</h2>
            </div>
            <button 
              onClick={handleSyncEmails}
              disabled={isSyncingEmails}
              className="h-10 px-4 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncingEmails && "animate-spin")} strokeWidth={1.5} />
              <span className="hidden lg:inline">SINC.</span>
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
            <input
              placeholder={t("search_patient", { defaultValue: 'BUSCAR CONTACTO...' })}
              className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {['ALL', 'WHATSAPP', 'EMAIL', 'INSTAGRAM', 'FACEBOOK'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setPlatformFilter(platform)}
                  className={cn(
                    "px-3 h-8 flex items-center justify-center border text-[9px] font-bold uppercase tracking-widest transition-colors shrink-0",
                    platformFilter === platform 
                      ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black" 
                      : "border-black/20 dark:border-white/20 bg-transparent text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {platform === 'ALL' ? 'TODOS' : platform}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              {['ALL', 'OPEN', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "flex-1 h-8 flex items-center justify-center border text-[9px] font-bold uppercase tracking-widest transition-colors",
                    statusFilter === status 
                      ? "border-black dark:border-white bg-gray-200 dark:bg-[#222] text-black dark:text-white" 
                      : "border-black/10 dark:border-white/10 bg-transparent text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {status === 'ALL' ? 'TODOS' : status === 'OPEN' ? 'ACTIVOS' : 'RESUELTOS'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Conversaciones */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
              NO HAY CONVERSACIONES QUE COINCIDAN CON LOS CRITERIOS.
            </div>
          ) : (
            filteredConversations.map(convo => (
              <button key={convo.id} onClick={() => handleSelectConversation(convo)}
                className={cn(
                  "flex items-start gap-4 p-5 text-left border-b border-black/10 dark:border-white/10 transition-colors w-full relative",
                  activeConversation?.id === convo.id 
                    ? "bg-white dark:bg-[#0a0a0a]" 
                    : "hover:bg-white dark:hover:bg-[#111]"
                )}>
                {/* Active Indicator Line */}
                {activeConversation?.id === convo.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white" />
                )}

                <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-black dark:text-white uppercase">
                    {convo.contactName?.charAt(0) || "U"}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "font-semibold uppercase tracking-widest truncate text-xs flex items-center gap-1.5",
                      activeConversation?.id === convo.id ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-300"
                    )}>
                      <span className="text-gray-500">{getPlatformIcon(convo.platform)}</span>
                      {convo.contactName || "USUARIO DESCONOCIDO"}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 shrink-0 ml-2">
                      {new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest truncate">
                      {convo.lastMessage}
                    </p>
                    {!convo.isRead && (
                      <span className="w-2 h-2 bg-black dark:bg-white shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {convo.patientDirectoryId && <span className="border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] text-black dark:text-white px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest">PACIENTE</span>}
                    {convo.status === "RESOLVED" && <span className="border border-gray-500/30 bg-gray-50 dark:bg-[#050505] text-gray-500 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest">RESUELTO</span>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* --- MAIN CHAT --- */}
      <main className="hidden md:flex flex-1 flex-col bg-gray-50 dark:bg-[#050505] relative transition-colors">
        {activeConversation ? (
          <>
            {/* Header del Chat */}
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-start md:items-center justify-between bg-white dark:bg-[#0a0a0a] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-black dark:text-white uppercase">
                    {activeConversation.contactName?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold uppercase tracking-tight text-black dark:text-white leading-none mb-2 flex items-center gap-2">
                    {activeConversation.contactName || "USUARIO"}
                    {activeConversation.status === "RESOLVED" && <span className="border border-gray-500/30 text-gray-500 bg-gray-50 dark:bg-[#111] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">RESUELTO</span>}
                    {activeConversation.patientDirectoryId && <span className="border border-black/20 text-black dark:text-white bg-gray-50 dark:bg-[#111] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">VINCULADO</span>}
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    {getPlatformIcon(activeConversation.platform)}
                    {activeConversation.platform}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleToggleStatus(activeConversation.status)}
                  className="h-10 px-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {activeConversation.status === "RESOLVED" ? "REABRIR CASO" : "MARCAR RESUELTO"}
                </button>

                <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="h-10 px-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {activeConversation.patientDirectoryId ? "REASIGNAR" : "VINCULAR PERFIL"}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-between">
                      <DialogTitle className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white">
                        VINCULACIÓN A DIRECTORIO
                      </DialogTitle>
                      <button onClick={() => setIsPatientDialogOpen(false)} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="p-6 flex flex-col gap-4 bg-white dark:bg-[#0a0a0a]">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        <input 
                          placeholder="INGRESAR CRITERIO DE BÚSQUEDA..." 
                          value={patientSearchQuery}
                          onChange={(e) => setPatientSearchQuery(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400"
                        />
                      </div>
                      
                      {isSearchingPatient ? (
                        <div className="p-8 flex justify-center items-center">
                          <QhSpinner size="sm" className="text-black dark:text-white" />
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto custom-scrollbar border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                          {patientSearchResults.map((p: any) => (
                            <div key={p.id} className="flex justify-between items-center p-4 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors last:border-0">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white mb-1">
                                  {p.firstName} {p.lastName}
                                </p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{p.email}</p>
                              </div>
                              <button 
                                onClick={() => handleLinkPatient(p.id)}
                                className="h-8 px-4 bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                              >
                                VINCULAR
                              </button>
                            </div>
                          ))}
                          {patientSearchQuery.length > 2 && patientSearchResults.length === 0 && (
                            <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                              CERO COINCIDENCIAS.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50 dark:bg-[#050505]">
              <div className="space-y-6">
                {messages.map((msg, i) => {
                  const isOutbound = msg.direction === "OUTBOUND";
                  return (
                    <div key={i} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                      <div className={cn(
                        "flex flex-col max-w-[80%] p-4 text-xs font-semibold uppercase tracking-widest leading-relaxed",
                        isOutbound
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-black/20 dark:border-white/20"
                      )}>
                        <span>{msg.content}</span>
                        {isOutbound && (
                          <div className="flex justify-end mt-2 opacity-50">
                            <CheckCheck className="w-3.5 h-3.5" strokeWidth={2} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isSuggesting && (
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-2">
                    <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                    SINTETIZANDO RESPUESTA...
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            {/* AI Suggestion Panel */}
            <AnimatePresence>
              {(isSuggesting || suggestedReplies.length > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }} 
                  className="bg-white dark:bg-[#0a0a0a] border-t border-black/10 dark:border-white/10 p-6 flex flex-col gap-4 shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Sugerencias de Motor IA
                    </p>
                    {isSuggesting && <QhSpinner size="sm" className="text-black dark:text-white" />}
                  </div>
                  
                  {suggestedReplies.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {suggestedReplies.map((reply: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                          <p className="flex-1 text-xs font-semibold uppercase tracking-widest text-black dark:text-white leading-relaxed">
                            "{reply.text}"
                          </p>
                          <button 
                            onClick={() => handleApplySuggestion(reply.text)}
                            className="h-10 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest shrink-0"
                          >
                            TRANSFERIR A ENTRADA
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Form */}
            <div className="bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 p-6 shrink-0 flex flex-col">
              
              {/* Toolbar */}
              <div className="flex items-center gap-4 mb-4">
                <button 
                  type="button"
                  onClick={handleAISuggestionClick}
                  disabled={isSuggesting}
                  className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                  SINTETIZAR RESPUESTA IA
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-stretch gap-4 relative transition-colors">
                <input 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={t("type_message", { defaultValue: 'INGRESE EL TEXTO DEL MENSAJE...' })}
                  className="flex-1 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 px-6 h-14 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-[#050505]">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
              {t("empty_title", { defaultValue: 'MODO DE ESPERA CRM' })}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm leading-relaxed">
              {t("empty_desc", { defaultValue: 'SELECCIONE UN HILO DE CONVERSACIÓN EN EL PANEL LATERAL PARA INICIAR LA TRANSMISIÓN DE DATOS.' })}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}