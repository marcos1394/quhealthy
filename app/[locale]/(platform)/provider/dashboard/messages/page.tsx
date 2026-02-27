/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {  Send, MessageSquare, Sparkles, Search, MoreVertical, Phone, Video } from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';

// Store
import { useSessionStore } from '@/stores/SessionStore';

// --- TIPOS ---
interface Conversation {
  id: number;
  provider: { id: number, name: string };
  consumer: { id: number, name: string, image?: string, online?: boolean };
  lastMessage: { content: string, createdAt: string };
  unreadCount?: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: 'provider' | 'consumer';
  content: string;
  createdAt: string;
}

// --- MOCK DATA (Para desarrollo) ---
const mockConversations: Conversation[] = [
  {
    id: 1,
    provider: { id: 1, name: "Dr. Marcos" },
    consumer: { id: 101, name: "Ana López", online: true },
    lastMessage: { content: "¿A qué hora es mi cita mañana?", createdAt: new Date().toISOString() },
    unreadCount: 2
  },
  {
    id: 2,
    provider: { id: 1, name: "Dr. Marcos" },
    consumer: { id: 102, name: "Carlos Ruiz", online: false },
    lastMessage: { content: "Gracias por la atención.", createdAt: new Date(Date.now() - 86400000).toISOString() },
    unreadCount: 0
  }
];

const mockMessages: Message[] = [
  { id: 1, conversationId: 1, senderId: 101, senderRole: 'consumer', content: "Hola Doctor, tengo una duda.", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, conversationId: 1, senderId: 1, senderRole: 'provider', content: "Hola Ana, dime en qué puedo ayudarte.", createdAt: new Date(Date.now() - 3500000).toISOString() },
  { id: 3, conversationId: 1, senderId: 101, senderRole: 'consumer', content: "¿A qué hora es mi cita mañana?", createdAt: new Date().toISOString() }
];

// Socket connection (lazy init)
let socket: any;

export default function ProviderMessagesPage() {
  const { user } = useSessionStore();
  
  // Estados
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // IA
  const [suggestedReply, setSuggestedReply] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar Conversaciones
  useEffect(() => {
    // Simulación de carga
    setTimeout(() => {
      setConversations(mockConversations);
      setIsLoading(false);
    }, 800);

    // En producción:
    /*
    axios.get('/api/messages/conversations', { withCredentials: true })
      .then(res => setConversations(res.data))
      .finally(() => setIsLoading(false));
    */
  }, []);

  // 2. Conectar Socket
  useEffect(() => {
    if (!user) return;

    // Solo conectamos si hay URL de API definida (para evitar errores en dev sin backend)
    if (process.env.NEXT_PUBLIC_API_URL) {
        socket = io(process.env.NEXT_PUBLIC_API_URL);
        socket.emit('join_room', user.id);

        socket.on('receive_message', (message: Message) => {
            if (message.conversationId === activeConversation?.id) {
                setMessages(prev => [...prev, message]);
                handleAISuggestion(message);
            }
        });

        return () => {
            socket.off('receive_message');
            socket.disconnect();
        };
    }
  }, [user, activeConversation]);

  // 3. Scroll al fondo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- HANDLERS ---

  const handleSelectConversation = async (convo: Conversation) => {
    setActiveConversation(convo);
    setIsLoading(true); // Loading local para mensajes
    setSuggestedReply(null);

    try {
      // Mock fetch messages
      await new Promise(r => setTimeout(r, 500));
      // Filtramos mensajes del mock que correspondan al ID (simulado)
      // En producción: const { data } = await axios.get(...)
      const convoMessages = mockMessages.filter(m => m.conversationId === convo.id);
      setMessages(convoMessages);
      
      // Simular IA Suggestion si el último mensaje es del consumidor
      if (convoMessages.length > 0 && convoMessages[convoMessages.length - 1].senderRole === 'consumer') {
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
      id: Date.now(),
      conversationId: activeConversation.id,
      senderId: Number(user.id),
      senderRole: 'provider',
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setSuggestedReply(null); // Limpiar sugerencia usada

    // Emitir socket y guardar DB (simulado)
    if (socket) {
        socket.emit('send_message', { ...optimisticMessage, recipientId: activeConversation.consumer.id });
    }
    // axios.post(...)
  };

  const handleAISuggestion = async (message: Message) => {
    if (message.senderRole === 'consumer') {
      setIsSuggesting(true);
      // Simulación de IA
      setTimeout(() => {
        const responses = [
            "Hola, tu cita es mañana a las 10:00 AM.",
            "Claro, cuéntame más sobre tus síntomas.",
            "Perfecto, nos vemos entonces."
        ];
        setSuggestedReply(responses[Math.floor(Math.random() * responses.length)]);
        setIsSuggesting(false);
      }, 1500);
      
      /*
      axios.post('/api/ai/suggest-reply', { latestMessage: message.content })
        .then(res => setSuggestedReply(res.data.suggestedReply))
        .finally(() => setIsSuggesting(false));
      */
    }
  };

  const handleApplySuggestion = () => {
    if (suggestedReply) {
      setNewMessage(suggestedReply);
      setSuggestedReply(null);
    }
  };

  // Filtrado
  const filteredConversations = conversations.filter(c => 
    c.consumer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* --- SIDEBAR (LISTA DE CHATS) --- */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-gray-800 flex flex-col bg-gray-900/50">
        
        {/* Header Sidebar */}
        <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Mensajes</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                    placeholder="Buscar paciente..." 
                    className="pl-9 bg-gray-900 border-gray-700 h-10 focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Lista Scrollable */}
        <ScrollArea className="flex-1">
            <div className="flex flex-col">
                {filteredConversations.map(convo => (
                    <button 
                        key={convo.id} 
                        onClick={() => handleSelectConversation(convo)}
                        className={`
                            flex items-center gap-4 p-4 text-left transition-all border-b border-gray-800/50
                            ${activeConversation?.id === convo.id ? 'bg-purple-900/20 border-l-4 border-l-purple-500' : 'hover:bg-gray-800/50 border-l-4 border-l-transparent'}
                        `}
                    >
                        <div className="relative">
                            <Avatar>
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium">
                                    {convo.consumer.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {convo.consumer.online && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className={`font-medium truncate ${activeConversation?.id === convo.id ? 'text-white' : 'text-gray-300'}`}>
                                    {convo.consumer.name}
                                </span>
                                <span className="text-xs text-gray-500">10:30 AM</span>
                            </div>
                            <p className="text-sm text-gray-500 truncate flex justify-between items-center">
                                <span>{convo.lastMessage.content}</span>
                                {convo.unreadCount ? (
                                    <Badge className="bg-purple-600 hover:bg-purple-600 h-5 w-5 flex items-center justify-center p-0 text-[10px] ml-2">
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

      {/* --- MAIN CHAT AREA --- */}
      <main className="hidden md:flex flex-1 flex-col bg-gray-950 relative">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback className="bg-purple-600 text-white">
                            {activeConversation.consumer.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-white">{activeConversation.consumer.name}</h3>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> En línea
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="default" className="text-gray-400 hover:text-white"><Phone className="w-5 h-5"/></Button>
                    <Button variant="ghost" size="default" className="text-gray-400 hover:text-white"><Video className="w-5 h-5"/></Button>
                    <Button variant="ghost" size="default" className="text-gray-400 hover:text-white"><MoreVertical className="w-5 h-5"/></Button>
                </div>
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.senderRole === 'provider' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${msg.senderRole === 'provider' 
                                    ? 'bg-purple-600 text-white rounded-tr-none' 
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'}
                            `}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* AI Suggestion Area */}
            <AnimatePresence>
                {(isSuggesting || suggestedReply) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="px-4 pb-2"
                    >
                        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-3 backdrop-blur-md">
                            {isSuggesting ? (
                                <div className="flex items-center gap-2 text-xs text-purple-300">
                                    <Sparkles className="w-4 h-4 animate-spin" />
                                    <span>Gemini está analizando la respuesta ideal...</span>
                                </div>
                            ) : suggestedReply ? (
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-purple-500/20 rounded-lg shrink-0">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-purple-300 font-semibold mb-1">Sugerencia Inteligente:</p>
                                        <p className="text-sm text-gray-300 italic">&quot;{suggestedReply}&quot;</p>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={handleApplySuggestion}
                                        className="bg-purple-600 hover:bg-purple-700 text-white h-7 text-xs"
                                    >
                                        Usar
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-3">
                <Input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Escribe un mensaje..." 
                    className="bg-gray-800 border-gray-700 focus:border-purple-500"
                />
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4">
                    <Send className="w-5 h-5" />
                </Button>
            </form>

          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-950/50">
            <div className="p-6 bg-gray-900 rounded-full mb-4">
                <MessageSquare className="w-12 h-12 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tus Mensajes</h3>
            <p className="max-w-xs text-center text-sm">Selecciona una conversación de la lista para ver el historial o comenzar a chatear.</p>
          </div>
        )}
      </main>
    </div>
  );
}