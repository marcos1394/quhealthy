/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Sparkles, Search, MoreVertical, Phone, Video, CheckCheck, RefreshCw, UserPlus, Filter, CheckCircle, Mail, Instagram, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useSocial } from "@/hooks/useSocial";
import { socialService } from "@/services/social.service";
import { ConversationDTO, MessageDTO, AiSuggestion } from "@/types/social";
import { patientDirectoryService } from "@/services/patientDirectory.service";
import { PatientDirectorySearchResult } from "@/types/patient";

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

  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedReplies, setSuggestedReplies] = useState<AiSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Filtros
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Pacientes
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState<PatientDirectorySearchResult[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [isSyncingEmails, setIsSyncingEmails] = useState(false);

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
      toast.success("Correos sincronizados correctamente");
      await loadConversations();
    } catch (error) {
      toast.error("Error al sincronizar correos. Revisa tu conexión en Mi Tienda > Integraciones.");
      console.error(error);
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
      case "WHATSAPP": return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case "EMAIL": return <Mail className="w-4 h-4 text-red-500" />;
      case "INSTAGRAM": return <Instagram className="w-4 h-4 text-pink-500" />;
      case "FACEBOOK": return <Facebook className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">

      {/* SIDEBAR */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t("title")}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSyncEmails}
              disabled={isSyncingEmails}
              className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-200"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 ${isSyncingEmails ? 'animate-spin' : ''}`} />
              Sincronizar Correos
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t("search_patient") || "Buscar..."}
              className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10 focus:border-medical-500 rounded-xl transition-all shadow-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            <Badge variant="outline" className={`cursor-pointer shrink-0 ${platformFilter === "ALL" ? "bg-medical-100 text-medical-800" : ""}`} onClick={() => setPlatformFilter("ALL")}>Todos</Badge>
            <Badge variant="outline" className={`cursor-pointer shrink-0 ${platformFilter === "WHATSAPP" ? "bg-emerald-100 text-emerald-800" : ""}`} onClick={() => setPlatformFilter("WHATSAPP")}>WhatsApp</Badge>
            <Badge variant="outline" className={`cursor-pointer shrink-0 ${platformFilter === "EMAIL" ? "bg-red-100 text-red-800" : ""}`} onClick={() => setPlatformFilter("EMAIL")}>Correo</Badge>
            <Badge variant="outline" className={`cursor-pointer shrink-0 ${platformFilter === "INSTAGRAM" ? "bg-pink-100 text-pink-800" : ""}`} onClick={() => setPlatformFilter("INSTAGRAM")}>Instagram</Badge>
            <Badge variant="outline" className={`cursor-pointer shrink-0 ${platformFilter === "FACEBOOK" ? "bg-blue-100 text-blue-800" : ""}`} onClick={() => setPlatformFilter("FACEBOOK")}>Facebook</Badge>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className={`cursor-pointer ${statusFilter === "ALL" ? "bg-slate-300" : ""}`} onClick={() => setStatusFilter("ALL")}>Todos</Badge>
            <Badge variant="secondary" className={`cursor-pointer ${statusFilter === "OPEN" ? "bg-amber-100 text-amber-800" : ""}`} onClick={() => setStatusFilter("OPEN")}>Pendientes</Badge>
            <Badge variant="secondary" className={`cursor-pointer ${statusFilter === "RESOLVED" ? "bg-medical-100 text-medical-800" : ""}`} onClick={() => setStatusFilter("RESOLVED")}>Resueltos</Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {filteredConversations.map(convo => (
              <button key={convo.id} onClick={() => handleSelectConversation(convo)}
                className={`flex items-center gap-4 p-4 text-left transition-all border-b border-slate-100 dark:border-slate-800/50 group
                  ${activeConversation?.id === convo.id ? "bg-medical-50 dark:bg-medical-500/10 border-l-4 border-l-medical-500" : "hover:bg-slate-100 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent"}`}>
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-medical-500 to-emerald-500 text-white font-medium">
                      {convo.contactName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`font-semibold truncate text-sm flex items-center gap-1 ${activeConversation?.id === convo.id ? "text-medical-900 dark:text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                      {getPlatformIcon(convo.platform)}
                      {convo.contactName || "Usuario"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex justify-between items-center font-light">
                    <span>{convo.lastMessage}</span>
                    {!convo.isRead ? (
                      <Badge className="bg-medical-600 hover:bg-medical-700 h-5 w-5 flex items-center justify-center p-0 text-[10px] ml-2 font-medium">
                        !
                      </Badge>
                    ) : null}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {convo.patientDirectoryId && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-medical-50 text-medical-700 border-medical-200">Paciente</Badge>}
                    {convo.status === "RESOLVED" && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-slate-100 text-slate-500">Resuelto</Badge>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* MAIN CHAT */}
      <main className="hidden md:flex flex-1 flex-col bg-slate-50 dark:bg-slate-950 relative transition-colors">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-medical-600 text-white font-medium">
                    {activeConversation.contactName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    {activeConversation.contactName || "Usuario"}
                    {activeConversation.status === "RESOLVED" && <Badge variant="secondary" className="text-xs font-normal">Resuelto</Badge>}
                    {activeConversation.patientDirectoryId && <Badge className="bg-medical-100 text-medical-800 hover:bg-medical-200 border-none text-xs font-normal">Paciente Vinculado</Badge>}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    {getPlatformIcon(activeConversation.platform)}
                    {activeConversation.platform}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleStatus(activeConversation.status)}
                  className={`text-xs h-8 ${activeConversation.status === "RESOLVED" ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}`}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  {activeConversation.status === "RESOLVED" ? "Reabrir" : "Resolver"}
                </Button>

                <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs h-8 text-medical-600 border-medical-200 hover:bg-medical-50">
                      <UserPlus className="w-3.5 h-3.5 mr-1" />
                      {activeConversation.patientDirectoryId ? "Cambiar Paciente" : "Vincular"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Vincular a Paciente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input 
                        placeholder="Buscar por nombre..." 
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                      />
                      {isSearchingPatient ? (
                        <p className="text-sm text-slate-500 text-center">Buscando...</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {patientSearchResults.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 border rounded-lg hover:bg-slate-50">
                              <div>
                                <p className="font-medium text-sm">{p.firstName} {p.lastName}</p>
                                <p className="text-xs text-slate-500">{p.email}</p>
                              </div>
                              <Button size="sm" onClick={() => handleLinkPatient(p.id)}>Seleccionar</Button>
                            </div>
                          ))}
                          {patientSearchQuery.length > 2 && patientSearchResults.length === 0 && (
                            <p className="text-sm text-slate-500 text-center">No se encontraron pacientes.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="ghost" size="default" className="text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full w-9 h-9"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex flex-col max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.direction === "OUTBOUND"
                      ? "bg-medical-600 text-white rounded-tr-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700"}`}>
                      <span>{msg.content}</span>
                      {msg.direction === "OUTBOUND" && (
                        <div className="flex justify-end mt-1 text-emerald-200">
                          <CheckCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isSuggesting && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <div className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    {t("typing") || "Escribiendo..."}
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </ScrollArea>

            {/* AI Suggestion */}
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAISuggestionClick}
                    disabled={isSuggesting}
                    className="text-xs h-8 border-medical-200 text-medical-600 hover:bg-medical-50 dark:border-medical-800 dark:text-medical-400 dark:hover:bg-medical-900/20"
                  >
                    {isSuggesting ? (
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Sugerir Respuesta IA
                  </Button>
                </div>
                
                {(isSuggesting || suggestedReplies.length > 0) && (
                  <div className="bg-gradient-to-r from-medical-50 dark:from-medical-500/10 to-emerald-50 dark:to-emerald-500/10 border border-medical-200 dark:border-medical-500/30 rounded-2xl p-4 shadow-sm backdrop-blur-md">
                    {isSuggesting ? (
                      <div className="flex items-center gap-2.5 text-sm text-medical-600 dark:text-medical-400 font-medium">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>{t("ai_analyzing")}</span>
                      </div>
                    ) : suggestedReplies.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-medical-700 dark:text-medical-400 font-semibold tracking-wide uppercase">{t("ai_suggestion")}</p>
                        <div className="flex flex-col gap-2">
                          {suggestedReplies.map((reply, idx) => (
                            <div key={idx} className="flex items-start gap-3.5">
                              <div className="flex-1 pt-0.5">
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">"{reply.text}"</p>
                              </div>
                              <Button size="sm" onClick={() => handleApplySuggestion(reply.text)}
                                className="bg-medical-600 hover:bg-medical-700 text-white h-8 text-xs rounded-lg px-4 shadow-sm transition-all focus:ring-2 focus:ring-medical-500/20">
                                {t("use_suggestion")}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 relative transition-colors">
              <div className="relative flex-1">
                <Input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  placeholder={t("type_message")}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-medical-500 pl-4 pr-12 h-12 rounded-2xl transition-all shadow-sm text-slate-900 dark:text-white"
                />
              </div>
              <Button type="submit" disabled={!newMessage.trim()}
                className="bg-medical-600 hover:bg-medical-700 text-white p-0 w-12 h-12 rounded-full shrink-0 shadow-md transition-all disabled:opacity-50 disabled:hover:bg-medical-600">
                <Send className="w-5 h-5 ml-1" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="p-6 bg-white dark:bg-slate-900 rounded-full mb-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{t("empty_title")}</h3>
            <p className="max-w-xs text-center text-sm text-slate-500 dark:text-slate-400 font-light">{t("empty_desc")}</p>
          </div>
        )}
      </main>
    </div>
  );
}