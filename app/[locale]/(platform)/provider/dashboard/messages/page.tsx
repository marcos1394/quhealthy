/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Sparkles, Search, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/stores/SessionStore";
import { useTranslations } from "next-intl";

interface Conversation {
  id: number;
  provider: { id: number; name: string };
  consumer: { id: number; name: string; image?: string; online?: boolean };
  lastMessage: { content: string; createdAt: string };
  unreadCount?: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: "provider" | "consumer";
  content: string;
  createdAt: string;
}

const mockConversations: Conversation[] = [
  {
    id: 1, provider: { id: 1, name: "Dr. Marcos" }, consumer: { id: 101, name: "Ana López", online: true },
    lastMessage: { content: "¿A qué hora es mi cita mañana?", createdAt: new Date().toISOString() }, unreadCount: 2
  },
  {
    id: 2, provider: { id: 1, name: "Dr. Marcos" }, consumer: { id: 102, name: "Carlos Ruiz", online: false },
    lastMessage: { content: "Gracias por la atención.", createdAt: new Date(Date.now() - 86400000).toISOString() }, unreadCount: 0
  }
];

const mockMessages: Message[] = [
  { id: 1, conversationId: 1, senderId: 101, senderRole: "consumer", content: "Hola Doctor, tengo una duda.", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, conversationId: 1, senderId: 1, senderRole: "provider", content: "Hola Ana, dime en qué puedo ayudarte.", createdAt: new Date(Date.now() - 3500000).toISOString() },
  { id: 3, conversationId: 1, senderId: 101, senderRole: "consumer", content: "¿A qué hora es mi cita mañana?", createdAt: new Date().toISOString() }
];

let socket: any;

export default function ProviderMessagesPage() {
  const { user } = useSessionStore();
  const t = useTranslations("DashboardMessages");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => { setConversations(mockConversations); setIsLoading(false); }, 800);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (process.env.NEXT_PUBLIC_API_URL) {
      socket = io(process.env.NEXT_PUBLIC_API_URL);
      socket.emit("join_room", user.id);
      socket.on("receive_message", (message: Message) => {
        if (message.conversationId === activeConversation?.id) {
          setMessages(prev => [...prev, message]);
          handleAISuggestion(message);
        }
      });
      return () => { socket.off("receive_message"); socket.disconnect(); };
    }
  }, [user, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = async (convo: Conversation) => {
    setActiveConversation(convo);
    setIsLoading(true);
    setSuggestedReply(null);
    try {
      await new Promise(r => setTimeout(r, 500));
      const convoMessages = mockMessages.filter(m => m.conversationId === convo.id);
      setMessages(convoMessages);
      if (convoMessages.length > 0 && convoMessages[convoMessages.length - 1].senderRole === "consumer") {
        handleAISuggestion(convoMessages[convoMessages.length - 1]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;
    const optimisticMessage: Message = {
      id: Date.now(), conversationId: activeConversation.id, senderId: Number(user.id),
      senderRole: "provider", content: newMessage, createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    setSuggestedReply(null);
    if (socket) socket.emit("send_message", { ...optimisticMessage, recipientId: activeConversation.consumer.id });
  };

  const handleAISuggestion = async (message: Message) => {
    if (message.senderRole === "consumer") {
      setIsSuggesting(true);
      setTimeout(() => {
        const responses = ["Hola, tu cita es mañana a las 10:00 AM.", "Claro, cuéntame más sobre tus síntomas.", "Perfecto, nos vemos entonces."];
        setSuggestedReply(responses[Math.floor(Math.random() * responses.length)]);
        setIsSuggesting(false);
      }, 1500);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestedReply) { setNewMessage(suggestedReply); setSuggestedReply(null); }
  };

  const filteredConversations = conversations.filter(c => c.consumer.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">

      {/* SIDEBAR */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{t("title")}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t("search_patient")}
              className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10 focus:border-medical-500 rounded-xl transition-all shadow-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                      {convo.consumer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {convo.consumer.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`font-semibold truncate text-sm ${activeConversation?.id === convo.id ? "text-medical-900 dark:text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                      {convo.consumer.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">10:30 AM</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex justify-between items-center font-light">
                    <span>{convo.lastMessage.content}</span>
                    {convo.unreadCount ? (
                      <Badge className="bg-medical-600 hover:bg-medical-700 h-5 w-5 flex items-center justify-center p-0 text-[10px] ml-2 font-medium">
                        {convo.unreadCount}
                      </Badge>
                    ) : null}
                  </p>
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
                    {activeConversation.consumer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">{activeConversation.consumer.name}</h3>
                  <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> {t("online")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="default" className="text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 rounded-full w-9 h-9"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="default" className="text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 rounded-full w-9 h-9"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="default" className="text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full w-9 h-9"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderRole === "provider" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.senderRole === "provider"
                      ? "bg-medical-600 text-white rounded-tr-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </ScrollArea>

            {/* AI Suggestion */}
            <AnimatePresence>
              {(isSuggesting || suggestedReply) && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="px-6 pb-4">
                  <div className="bg-gradient-to-r from-medical-50 dark:from-medical-500/10 to-emerald-50 dark:to-emerald-500/10 border border-medical-200 dark:border-medical-500/30 rounded-2xl p-4 shadow-sm backdrop-blur-md">
                    {isSuggesting ? (
                      <div className="flex items-center gap-2.5 text-sm text-medical-600 dark:text-medical-400 font-medium">
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>{t("ai_analyzing")}</span>
                      </div>
                    ) : suggestedReply ? (
                      <div className="flex items-start gap-3.5">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm shrink-0 border border-slate-100 dark:border-slate-700">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-xs text-medical-700 dark:text-medical-400 font-semibold mb-1 tracking-wide uppercase">{t("ai_suggestion")}</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium">"{suggestedReply}"</p>
                        </div>
                        <Button size="sm" onClick={handleApplySuggestion}
                          className="bg-medical-600 hover:bg-medical-700 text-white h-8 text-xs rounded-lg px-4 shadow-sm transition-all focus:ring-2 focus:ring-medical-500/20">
                          {t("use_suggestion")}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              )}
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