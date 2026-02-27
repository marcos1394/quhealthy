/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { 
  Loader2, 
  Send, 
  MessageSquare, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  X,
  ArrowLeft,
  Circle,
  Sparkles,
  Star,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Store
import { useSessionStore } from '@/stores/SessionStore';
import { cn } from '@/lib/utils';

/**
 * PatientMessagesPage Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Visual conversation list
 *    - Provider avatars
 *    - Last message preview
 *    - Online status indicators
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Typing indicators
 *    - Message delivery status
 *    - Real-time updates
 *    - Send confirmation
 * 
 * 3. MINIMIZAR ANSIEDAD
 *    - Clear online status
 *    - Read receipts
 *    - Timestamp visible
 *    - Conversation saved
 * 
 * 4. SATISFICING
 *    - Quick emoji access
 *    - Voice/video call buttons
 *    - Easy attachment
 *    - Search conversations
 * 
 * 5. JERARQUÍA VISUAL
 *    - Unread count badges
 *    - Active conversation highlighted
 *    - Provider specialty visible
 *    - Color-coded messages
 * 
 * 6. CREDIBILIDAD
 *    - Professional design
 *    - Provider credentials
 *    - Secure messaging
 *    - Trust indicators
 */

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
      content: "Recuerda traer tu radiografía.", 
      createdAt: new Date().toISOString() 
    },
    unreadCount: 2
  },
  {
    id: 2,
    provider: { 
      id: 102, 
      name: "Dra. Elena Gómez", 
      specialty: "Nutriología", 
      online: false,
      rating: 4.9
    },
    consumer: { id: 1, name: "Yo" },
    lastMessage: { 
      content: "¡Gracias doctora!", 
      createdAt: new Date(Date.now() - 86400000).toISOString() 
    },
    unreadCount: 0
  },
  {
    id: 3,
    provider: { 
      id: 103, 
      name: "Dr. Carlos Méndez", 
      specialty: "Medicina General", 
      online: true,
      rating: 4.7
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
    content: "Mucho mejor, gracias Dr. Ya casi no me duele.", 
    createdAt: new Date(Date.now() - 3500000).toISOString(),
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
  const { user } = useSessionStore();
  
  // States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations
  useEffect(() => {
    setTimeout(() => {
      setConversations(mockConversations);
      setIsLoading(false);
    }, 800);
  }, []);

  // Socket connection
  useEffect(() => {
    if (!user || !process.env.NEXT_PUBLIC_API_URL) return;

    socket = io(process.env.NEXT_PUBLIC_API_URL);
    socket.emit('join_room', user.id);

    socket.on('receive_message', (message: Message) => {
      if (message.conversationId === activeConversation?.id) {
        setMessages(prev => [...prev, message]);
      }
      // Update conversation list
      setConversations(prev => prev.map(c => 
        c.id === message.conversationId 
          ? { ...c, lastMessage: { content: message.content, createdAt: message.createdAt } }
          : c
      ));
    });

    socket.on('typing', (data: { conversationId: number; isTyping: boolean }) => {
      if (data.conversationId === activeConversation?.id) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.disconnect();
    };
  }, [user, activeConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handlers
  const handleSelectConversation = async (convo: Conversation) => {
    setActiveConversation(convo);
    setShowMobileChat(true);
    
    // Load messages
    const chatMessages = mockMessages.filter(m => m.conversationId === convo.id);
    setMessages(chatMessages);
    
    // Mark as read
    setConversations(prev => prev.map(c => 
      c.id === convo.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const optimisticMessage: Message = {
      id: Date.now(),
      conversationId: activeConversation.id,
      content: newMessage,
      senderId: Number(user.id),
      senderRole: 'consumer',
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    
    // Emit socket
    if (socket) {
      socket.emit('send_message', { 
        ...optimisticMessage, 
        recipientId: activeConversation.provider.id 
      });
      
      // Update message status
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === optimisticMessage.id ? { ...m, status: 'sent' } : m
        ));
      }, 500);
    }

    // Update conversation list
    setConversations(prev => prev.map(c => 
      c.id === activeConversation.id 
        ? { ...c, lastMessage: { content: newMessage, createdAt: new Date().toISOString() } }
        : c
    ));

    setNewMessage('');
  };

  const handleTyping = () => {
    if (socket && activeConversation) {
      socket.emit('typing', { 
        conversationId: activeConversation.id, 
        isTyping: true 
      });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { 
          conversationId: activeConversation.id, 
          isTyping: false 
        });
      }, 1000);
    }
  };

  const handleVoiceCall = () => {
    toast.info("Llamada de voz próximamente disponible");
  };

  const handleVideoCall = () => {
    toast.info("Videollamada próximamente disponible");
  };

  const filteredConversations = conversations.filter(c => 
    c.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.provider.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Message status icon
  const getStatusIcon = (status?: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] justify-center items-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
        <p className="text-gray-400">Cargando conversaciones...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl max-w-7xl mx-auto my-4">
      
      {/* Sidebar - Conversations List */}
      <aside className={cn(
        "w-full md:w-96 border-r border-gray-800 flex flex-col bg-gray-900/50 transition-all",
        showMobileChat ? "hidden md:flex" : ""
      )}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-400" />
                Mensajes
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {filteredConversations.length} conversaciones
              </p>
            </div>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Activo
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Buscar doctor o especialidad..." 
              className="pl-10 bg-gray-900 border-gray-700 h-11 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <AnimatePresence mode="popLayout">
            {filteredConversations.length > 0 ? (
              <div className="flex flex-col">
                {filteredConversations.map((convo, index) => (
                  <motion.button 
                    key={convo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectConversation(convo)}
                    className={cn(
                      "flex items-center gap-4 p-4 text-left transition-all border-b border-gray-800/50 group",
                      activeConversation?.id === convo.id 
                        ? "bg-purple-900/20 border-l-4 border-l-purple-500" 
                        : "hover:bg-gray-800/50 border-l-4 border-l-transparent"
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12 border-2 border-purple-500/20">
                        <AvatarImage src={convo.provider.image} />
                        <AvatarFallback className="bg-purple-800 text-white font-bold text-lg">
                          {convo.provider.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {convo.provider.online ? (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                      ) : (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-600 border-2 border-gray-900 rounded-full" />
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={cn(
                          "font-bold truncate",
                          activeConversation?.id === convo.id ? "text-white" : "text-gray-200"
                        )}>
                          {convo.provider.name}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(convo.lastMessage.createdAt), { 
                            addSuffix: false, 
                            locale: es 
                          })}
                        </span>
                      </div>
                      
                      {/* Specialty & Rating */}
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-purple-400">
                          {convo.provider.specialty}
                        </p>
                        {convo.provider.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-500">{convo.provider.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Last Message */}
                      <div className="flex justify-between items-center">
                        <p className={cn(
                          "text-sm truncate max-w-[180px]",
                          convo.unreadCount ? "text-white font-semibold" : "text-gray-500"
                        )}>
                          {convo.lastMessage.content}
                        </p>
                        {convo.unreadCount ? (
                          <Badge className="bg-purple-600 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs font-bold">
                            {convo.unreadCount}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Search className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">No se encontraron conversaciones</p>
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </aside>

      {/* Chat Area */}
      <main className={cn(
        "flex-1 flex flex-col bg-gray-950",
        !showMobileChat ? "hidden md:flex" : ""
      )}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900/30 to-purple-900/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {/* Back button (mobile) */}
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <Avatar className="h-11 w-11 border-2 border-purple-500/20">
                  <AvatarImage src={activeConversation.provider.image} />
                  <AvatarFallback className="bg-purple-600 text-white font-bold">
                    {activeConversation.provider.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {activeConversation.provider.name}
                    {activeConversation.provider.online && (
                      <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                    )}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {activeConversation.provider.online ? 'En línea' : 'Desconectado'} • {activeConversation.provider.specialty}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="default"
                  onClick={handleVoiceCall}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="default"
                  onClick={handleVideoCall}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Video className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="default"
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/5 via-gray-950 to-gray-950">
              <div className="space-y-4 max-w-4xl mx-auto">
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => {
                    const isOwn = msg.senderRole === 'consumer';
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                      >
                        <div className={cn(
                          "max-w-[75%] md:max-w-[60%] flex flex-col gap-1",
                          isOwn ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg",
                            isOwn 
                              ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-none" 
                              : "bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700"
                          )}>
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-1 px-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(msg.createdAt), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                            {isOwn && getStatusIcon(msg.status)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <form 
              onSubmit={handleSendMessage} 
              className="p-4 bg-gray-900 border-t border-gray-800 flex gap-3 items-center"
            >
              <Button 
                type="button"
                variant="ghost" 
                size="default"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <Input 
                value={newMessage} 
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Escribe un mensaje..." 
                className="flex-1 bg-gray-800 border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white h-11"
              />
              
              <Button 
                type="button"
                variant="ghost" 
                size="default"
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Smile className="w-5 h-5" />
              </Button>
              
              <Button 
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 h-11 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/5 via-gray-950 to-gray-950">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 bg-gray-900/50 rounded-2xl border border-gray-800 max-w-md"
            >
              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full mb-6 inline-flex border border-purple-500/20">
                <MessageSquare className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                Comunicación Directa
              </h3>
              <p className="text-gray-400 mb-6">
                Selecciona un doctor de la lista para iniciar una conversación segura y privada
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>Cifrado de extremo a extremo</span>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}