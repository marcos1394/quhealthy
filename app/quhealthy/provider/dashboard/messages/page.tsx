"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import io from 'socket.io-client';
import axios from 'axios';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Tipos para la mensajería
interface Conversation {
  id: number;
  provider: { id: number, name: string };
  consumer: { id: number, name: string };
  lastMessage: { content: string, createdAt: string };
}
interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderRole: 'provider' | 'consumer';
  content: string;
  createdAt: string;
}

// Conectamos al servidor de Socket.IO
const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export default function ProviderMessagesPage() {
  const { user } = useSessionStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Conectarse y unirse a su sala privada de Socket.IO
    socket.connect();
    socket.emit('join_room', user.id);

    // Escuchar por nuevos mensajes en tiempo real
    socket.on('receive_message', (message: Message) => {
      if (message.conversationId === activeConversation?.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Cargar la lista de conversaciones inicial
    axios.get('/api/messages/conversations', { withCredentials: true })
      .then(res => setConversations(res.data))
      .catch(err => console.error("Error fetching conversations", err))
      .finally(() => setIsLoading(false));
    
    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [user, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (convo: Conversation) => {
    setActiveConversation(convo);
    const { data } = await axios.get(`/api/messages/conversations/${convo.id}`, { withCredentials: true });
    setMessages(data);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const optimisticMessage: Message = {
      id: Date.now(),
      conversationId: activeConversation.id,
      content: newMessage,
      senderId: user.id,
      senderRole: 'provider',
      createdAt: new Date().toISOString(),
    };

    const socketData = {
      ...optimisticMessage,
      recipientId: activeConversation.consumer.id,
    };

    socket.emit('send_message', socketData);
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Guardamos el mensaje en la base de datos
    axios.post('/api/messages', {
      conversationId: optimisticMessage.conversationId,
      content: optimisticMessage.content,
    }, { withCredentials: true });

    setNewMessage('');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      {/* Panel de Conversaciones */}
      <aside className="w-full md:w-1/3 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Bandeja de Entrada</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
            {conversations.map(convo => (
            <div 
                key={convo.id} 
                onClick={() => handleSelectConversation(convo)} 
                className={`p-4 cursor-pointer hover:bg-gray-700/50 border-l-4 ${activeConversation?.id === convo.id ? 'bg-purple-600/20 border-purple-500' : 'border-transparent'}`}
            >
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback className="bg-purple-600/20 text-purple-300">
                            {convo.consumer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-white truncate">{convo.consumer.name}</p>
                        <p className="text-sm text-gray-400 truncate">{convo.lastMessage?.content}</p>
                    </div>
                </div>
            </div>
            ))}
        </div>
      </aside>

      {/* Panel de Chat Activo */}
      <main className="hidden md:flex w-2/3 flex-col">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                 <Avatar>
                    <AvatarFallback className="bg-gray-600">
                        {activeConversation.consumer.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg text-white">{activeConversation.consumer.name}</h3>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderRole === 'provider' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-lg ${msg.senderRole === 'provider' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex gap-2 bg-gray-900">
              <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="bg-gray-700"/>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700"><Send className="w-4 h-4"/></Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4" />
            <p className="text-lg">Selecciona una conversación</p>
            <p>Tus chats con clientes aparecerán aquí.</p>
          </div>
        )}
      </main>
    </div>
  );
}