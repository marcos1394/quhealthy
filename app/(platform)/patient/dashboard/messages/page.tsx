/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Loader2, Send, MessageSquare, Search, Phone, Video, MoreVertical } from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';

// Store
import { useSessionStore } from '@/stores/SessionStore';

// --- TIPOS ---
interface Conversation {
  id: number;
  // Nota: Para el paciente, el "otro" es el 'provider'
  provider: { 
    id: number; 
    name: string; 
    image?: string; 
    specialty?: string;
    online?: boolean; 
  };
  consumer: { id: number; name: string };
  lastMessage: { content: string; createdAt: string };
  unreadCount?: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: 'provider' | 'consumer'; // Roles estrictos
  content: string;
  createdAt: string;
}

// --- MOCK DATA (Para desarrollo sin backend) ---
const mockConversations: Conversation[] = [
  {
    id: 1,
    provider: { id: 101, name: "Dr. Roberto Casas", specialty: "Dentista", online: true },
    consumer: { id: 1, name: "Yo" },
    lastMessage: { content: "Recuerda traer tu radiografía.", createdAt: new Date().toISOString() },
    unreadCount: 1
  },
  {
    id: 2,
    provider: { id: 102, name: "Dra. Elena Gómez", specialty: "Nutrióloga", online: false },
    consumer: { id: 1, name: "Yo" },
    lastMessage: { content: "¡Gracias doctora!", createdAt: new Date(Date.now() - 86400000).toISOString() },
    unreadCount: 0
  }
];

const mockMessages: Message[] = [
  { id: 1, conversationId: 1, senderId: 101, senderRole: 'provider', content: "Hola, ¿cómo sigues del dolor?", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, conversationId: 1, senderId: 1, senderRole: 'consumer', content: "Mucho mejor, gracias Dr.", createdAt: new Date(Date.now() - 3500000).toISOString() },
  { id: 3, conversationId: 1, senderId: 101, senderRole: 'provider', content: "Recuerda traer tu radiografía mañana.", createdAt: new Date().toISOString() }
];

// Socket Connection (Lazy init)
let socket: any;

export default function PatientMessagesPage() {
  const { user } = useSessionStore();
  
  // Estados
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar Conversaciones
  useEffect(() => {
    // Simulación
    setTimeout(() => {
        setConversations(mockConversations);
        setIsLoading(false);
    }, 800);

    /* Producción:
    axios.get('/api/messages/conversations', { withCredentials: true })
      .then(res => setConversations(res.data))
      .catch(err => console.error("Error fetching conversations", err))
      .finally(() => setIsLoading(false));
    */
  }, []);

  // 2. Socket Connection
  useEffect(() => {
    if (!user) return;

    if (process.env.NEXT_PUBLIC_API_URL) {
        socket = io(process.env.NEXT_PUBLIC_API_URL);
        socket.emit('join_room', user.id);

        socket.on('receive_message', (message: Message) => {
            if (message.conversationId === activeConversation?.id) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            socket.off('receive_message');
            socket.disconnect();
        };
    }
  }, [user, activeConversation]);

  // 3. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- HANDLERS ---

  const handleSelectConversation = async (convo: Conversation) => {
    setActiveConversation(convo);
    // Simulación de carga de mensajes
    const chatMessages = mockMessages.filter(m => m.conversationId === convo.id);
    setMessages(chatMessages);

    /* Producción:
    const { data } = await axios.get(`/api/messages/conversations/${convo.id}`, { withCredentials: true });
    setMessages(data);
    */
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const optimisticMessage: Message = {
      id: Date.now(),
      conversationId: activeConversation.id,
      content: newMessage,
      senderId: Number(user.id),
      senderRole: 'consumer', // Rol del paciente
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);
    
    // Emitir socket
    if (socket) {
        socket.emit('send_message', { 
            ...optimisticMessage, 
            recipientId: activeConversation.provider.id 
        });
    }

    /* Producción: Guardar en DB
    axios.post('/api/messages', {
      conversationId: optimisticMessage.conversationId,
      content: optimisticMessage.content,
    }, { withCredentials: true });
    */

    setNewMessage('');
  };

  const filteredConversations = conversations.filter(c => 
    c.provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="flex h-[calc(100vh-6rem)] justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl max-w-7xl mx-auto my-4">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-full md:w-80 border-r border-gray-800 flex flex-col bg-gray-900/50">
        <div className="p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Mis Doctores</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                    placeholder="Buscar doctor..." 
                    className="pl-9 bg-gray-900 border-gray-700 h-10 focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

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
                                <AvatarImage src={convo.provider.image} />
                                <AvatarFallback className="bg-purple-800 text-white font-bold">
                                    {convo.provider.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {convo.provider.online && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className={`font-medium truncate ${activeConversation?.id === convo.id ? 'text-white' : 'text-gray-300'}`}>
                                    {convo.provider.name}
                                </span>
                            </div>
                            <p className="text-xs text-purple-400 mb-1">{convo.provider.specialty}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 truncate max-w-[140px]">{convo.lastMessage.content}</p>
                                {convo.unreadCount ? (
                                    <Badge className="bg-purple-600 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                                        {convo.unreadCount}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </ScrollArea>
      </aside>

      {/* --- CHAT AREA --- */}
      <main className="hidden md:flex flex-1 flex-col bg-gray-950">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={activeConversation.provider.image} />
                        <AvatarFallback className="bg-purple-600 text-white font-bold">
                            {activeConversation.provider.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-white">{activeConversation.provider.name}</h3>
                        <p className="text-xs text-gray-400">{activeConversation.provider.specialty}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="default" className="text-gray-400 hover:text-white"><Phone className="w-5 h-5"/></Button>
                    <Button variant="ghost" size="default" className="text-gray-400 hover:text-white"><Video className="w-5 h-5"/></Button>
                    <Button variant="ghost" size="default" className="text-gray-400 hover:text-white"><MoreVertical className="w-5 h-5"/></Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.senderRole === 'consumer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${msg.senderRole === 'consumer' 
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

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-3">
                <Input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    placeholder="Escribe un mensaje..." 
                    className="bg-gray-800 border-gray-700 focus:border-purple-500 text-white"
                />
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4">
                    <Send className="w-5 h-5" />
                </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-950/50">
            <div className="p-6 bg-gray-900 rounded-full mb-4 border border-gray-800">
                <MessageSquare className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Tus Consultas</h3>
            <p className="max-w-xs text-center text-sm text-gray-400">Selecciona un doctor para hacer preguntas o seguimiento.</p>
          </div>
        )}
      </main>
    </div>
  );
}