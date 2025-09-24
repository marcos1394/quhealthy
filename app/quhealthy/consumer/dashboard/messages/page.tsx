"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import io from 'socket.io-client';
import axios from 'axios';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


// Tipos para la mensajería
interface Conversation {
  id: number;
  provider: { id: number, name: string };
  consumer: { id: number, name: string };
  lastMessage: { content: string, createdAt: string };
}

// Al inicio de tu archivo, asegúrate que la interfaz sea completa
interface Message {
  id: number;
  conversationId: number; // Asegúrate de que este campo esté aquí
  senderId: number;
  senderRole: 'provider' | 'consumer';
  content: string;
  createdAt: string;
}

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export default function MessagesPage() {
  const { user } = useSessionStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Conectarse y unirse a su sala privada de Socket.IO
    socket.connect();
    socket.emit('join_room', user.id);

    // 2. Escuchar por nuevos mensajes en tiempo real
    socket.on('receive_message', (message: Message) => {
      // Si el mensaje es para la conversación activa, lo añadimos a la lista
      if (message.conversationId === activeConversation?.id) {
        setMessages(prev => [...prev, message]);
      }
    });

    // 3. Cargar la lista de conversaciones inicial
    axios.get('/api/messages/conversations', { withCredentials: true })
      .then(res => setConversations(res.data))
      .catch(err => console.error("Error fetching conversations", err))
      .finally(() => setIsLoading(false));
    
    return () => {
      socket.off('receive_message');
      socket.disconnect();
    };
  }, [user, activeConversation]);

  // Scroll automático al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cargar el historial de una conversación al seleccionarla
  const handleSelectConversation = async (convo: Conversation) => {
    setActiveConversation(convo);
    const { data } = await axios.get(`/api/messages/conversations/${convo.id}`, { withCredentials: true });
    setMessages(data);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    // --- INICIO DE LA CORRECCIÓN ---
    // 1. Creamos un objeto que coincide con la 'interface Message'
    const optimisticMessage: Message = {
      id: Date.now(), // 2. Añadimos un ID temporal y único
      conversationId: activeConversation.id,
      content: newMessage,
      senderId: user.id,
      senderRole: user.role,
      createdAt: new Date().toISOString(),
    };
    // --- FIN DE LA CORRECCIÓN ---

    // Añadimos el 'recipientId' solo para el evento de socket
    const socketData = {
      ...optimisticMessage,
      recipientId: user.role === 'provider' ? activeConversation.consumer.id : activeConversation.provider.id,
    };

    // 1. Emitir el mensaje vía Socket.IO para entrega en tiempo real
    socket.emit('send_message', socketData);
    
    // 2. Añadir el mensaje a nuestro estado local inmediatamente
    setMessages(prev => [...prev, optimisticMessage]);
    
    // 3. (En producción) También llamar a una API POST para guardarlo en la BD
    axios.post('/api/messages', {
      conversationId: optimisticMessage.conversationId,
      content: optimisticMessage.content,
    }, { withCredentials: true });

    setNewMessage('');
};

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      {/* Panel de Conversaciones */}
      <aside className="w-1/3 border-r border-gray-700">
        {conversations.map(convo => (
          <div key={convo.id} onClick={() => handleSelectConversation(convo)} className={`p-4 cursor-pointer hover:bg-gray-700/50 ${activeConversation?.id === convo.id ? 'bg-purple-600/20' : ''}`}>
            <p className="font-semibold text-white">{user?.role === 'provider' ? convo.consumer.name : convo.provider.name}</p>
            <p className="text-sm text-gray-400 truncate">{convo.lastMessage?.content}</p>
          </div>
        ))}
      </aside>

      {/* Panel de Chat Activo */}
      <main className="w-2/3 flex flex-col">
        {activeConversation ? (
          <>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-lg ${msg.senderId === user?.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex gap-2">
              <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="bg-gray-700"/>
              <Button type="submit"><Send className="w-4 h-4"/></Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Selecciona una conversación para empezar a chatear.</div>
        )}
      </main>
    </div>
  );
}