/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import {
  Loader2,
  Send,
  Search,
  MessageCircle,
  Phone,
  Video,
  Star,
  Check,
  CheckCheck,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Store
import { useSessionStore } from '@/stores/SessionStore';
import { cn } from '@/lib/utils';

// Types
interface Conversation {
  id: number;
  provider: {
    id: number;
    name: string;
    image?: string;
    specialty?: string;
    online?: boolean;
    rating?: number;
  };
  consumer: { id: number; name: string };
  lastMessage: { content: string; createdAt: string };
  unreadCount?: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: 'provider' | 'consumer';
  content: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

// Mock Data
const mockConversations: Conversation[] = [
  {
    id: 1,
    provider: {
      id: 101,
      name: "Dr. Roberto Casas",
      specialty: "Odontología",
      online: true,
      rating: 4.8
    },
    consumer: { id: 1, name: "Yo" },
    lastMessage: {
      content: "Recuerda traer tu radiografía mañana",
      createdAt: new Date(Date.now() - 300000).toISOString()
    },
    unreadCount: 2
  },
  {
    id: 2,
    provider: {
      id: 102,
      name: "Dra. Elena Gómez",
      specialty: "Nutrición",
      online: false,
      rating: 4.9
    },
    consumer: { id: 1, name: "Yo" },
    lastMessage: {
      content: "Nos vemos el viernes",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    unreadCount: 0
  }
];

const mockMessages: Message[] = [
  {
    id: 1,
    conversationId: 1,
    senderId: 101,
    senderRole: 'provider',
    content: "Hola, ¿cómo sigues del dolor?",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'read'
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 1,
    senderRole: 'consumer',
    content: "Mucho mejor, gracias doctor! Ya casi no siento molestia.",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'read'
  },
  {
    id: 3,
    conversationId: 1,
    senderId: 101,
    senderRole: 'provider',
    content: "Excelente! Recuerda traer tu radiografía mañana para revisarla.",
    createdAt: new Date(Date.now() - 300000).toISOString(),
    status: 'delivered'
  }
];

// Socket Connection
let socket: any;

export default function PatientMessagesPage() {
  const t = useTranslations('PatientMessages');
  const { user } = useSessionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    setTimeout(() => {
      setConversations(mockConversations);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handlers
  const handleSelectConversation = (convo: Conversation) => {
    setSelectedConversation(convo);
    const convoMessages = mockMessages.filter(m => m.conversationId === convo.id);
    setMessages(convoMessages);

    setConversations(prev => prev.map(c =>
      c.id === convo.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const optimisticMessage: Message = {
      id: Date.now(),
      conversationId: selectedConversation.id,
      senderId: user?.id || 1,
      senderRole: 'consumer',
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === optimisticMessage.id ? { ...m, status: 'sent' } : m
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === optimisticMessage.id ? { ...m, status: 'delivered' } : m
      ));
    }, 1500);
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };

  const handleVoiceCall = () => {
    toast.info(t('toast_voice'));
  };

  const handleVideoCall = () => {
    toast.info(t('toast_video'));
  };

  // Message status icon
  const getStatusIcon = (status?: Message['status']) => {
    switch (status) {
      case 'sending': return <Clock className="w-3 h-3 text-slate-400" />;
      case 'sent': return <Check className="w-3 h-3 text-slate-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-slate-400" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-medical-500" />;
      default: return null;
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.provider.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-medical-500" />
        <p className="text-slate-500 dark:text-slate-400">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
            <MessageCircle className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
          <div className="flex h-full">

            {/* Conversations List */}
            <div className={cn(
              "w-full md:w-80 lg:w-96 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900",
              selectedConversation ? "hidden md:flex" : "flex"
            )}>
              {/* Search */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map(convo => (
                    <div
                      key={convo.id}
                      onClick={() => handleSelectConversation(convo)}
                      className={cn(
                        "flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800",
                        selectedConversation?.id === convo.id
                          ? "bg-medical-50 dark:bg-medical-500/10 border-l-4 border-l-medical-500"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-medical-200 dark:border-medical-500/20">
                          <AvatarImage src={convo.provider.image} />
                          <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 font-bold">
                            {convo.provider.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {convo.provider.online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{convo.provider.name}</p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2">
                            {formatRelativeTime(convo.lastMessage.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-xs text-slate-500 dark:text-slate-400">{convo.provider.specialty}</p>
                          {convo.provider.rating && (
                            <>
                              <span className="text-slate-300">•</span>
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">{convo.provider.rating}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-1">
                          {convo.lastMessage.content}
                        </p>
                      </div>

                      {convo.unreadCount && convo.unreadCount > 0 && (
                        <Badge className="bg-medical-500 text-white border-none min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold">
                          {convo.unreadCount}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="font-bold text-slate-900 dark:text-white">{t('no_conversations')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('no_conversations_desc')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={cn(
              "flex-1 flex flex-col bg-slate-50 dark:bg-slate-950",
              !selectedConversation ? "hidden md:flex" : "flex"
            )}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        ←
                      </Button>
                      <Avatar className="h-10 w-10 border-2 border-medical-200 dark:border-medical-500/20">
                        <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 font-bold text-sm">
                          {selectedConversation.provider.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedConversation.provider.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {selectedConversation.provider.online
                            ? <span className="text-emerald-500 font-semibold">{t('online')}</span>
                            : t('offline')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={handleVoiceCall} className="text-slate-500 hover:text-medical-500">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleVideoCall} className="text-slate-500 hover:text-medical-500">
                        <Video className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => {
                      const isOwn = msg.senderRole === 'consumer';
                      return (
                        <div key={msg.id} className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}>
                          {!isOwn && (
                            <Avatar className="h-8 w-8 border border-medical-200 dark:border-medical-500/20 shrink-0 mt-auto">
                              <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 text-xs font-bold">
                                {selectedConversation.provider.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-3 relative",
                            isOwn
                              ? "bg-medical-600 text-white rounded-br-md"
                              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-md"
                          )}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <div className={cn(
                              "flex items-center justify-end gap-1 mt-1",
                              isOwn ? "text-white/60" : "text-slate-400 dark:text-slate-500"
                            )}>
                              <span className="text-[10px]">{formatRelativeTime(msg.createdAt)}</span>
                              {isOwn && getStatusIcon(msg.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <div className="flex space-x-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        {t('typing')}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Input
                        value={newMessage}
                        onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                        placeholder={t('input_placeholder')}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="p-4 bg-medical-50 dark:bg-medical-500/10 rounded-full mb-4">
                    <MessageCircle className="w-12 h-12 text-medical-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('select_conversation')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{t('select_conversation_desc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}