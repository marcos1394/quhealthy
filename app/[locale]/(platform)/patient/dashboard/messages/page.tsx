"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import { useSessionStore } from '@/stores/SessionStore';
import { useChat } from '@/hooks/useChat'; 
import { cn } from '@/lib/utils';

// Componentes modulares
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function MessagesPage() {
 const t = useTranslations('PatientMessages');
 const { user } = useSessionStore();
 
 // Estado del Buscador Local
 const [searchQuery, setSearchQuery] = useState('');
 
 // Referencia para Auto-Scroll al último mensaje
 const messagesEndRef = useRef<HTMLDivElement>(null);

 // Hook de Producción (REST + STOMP)
 const {
 conversations,
 messages,
 selectedConversation,
 setSelectedConversation,
 isLoading,
 isConnected,
 isTyping,
 sendMessage,
 sendTypingEvent
 } = useChat();

 // Auto-scroll al fondo cuando llegan mensajes nuevos
 useEffect(() => {
 if (messagesEndRef.current) {
 messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
 }
 }, [messages, isTyping]);

 // Handlers de UI para futuras fases
 const handleVoiceCall = () => toast.info(t('toast_voice', { defaultValue: 'Las llamadas de voz estarán disponibles pronto.' }));
 const handleVideoCall = () => toast.info(t('toast_video', { defaultValue: 'Protocolo de video inactivo.' }));
 const handleBackToInbox = () => setSelectedConversation(null);

 // 1. Pantalla de Carga Inicial
 if (isLoading) {
 return (
 <div className="flex flex-col justify-center items-center min-h-[70vh] bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
 <QhSpinner size="lg" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mt-4 animate-pulse">
 {t('loading', { defaultValue: 'Cargando tus mensajes...' })}
 </p>
 </div>
 );
 }

 // 2. Render Principal
 return (
 <div className="bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 w-full h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col transition-colors duration-300 px-4 md:px-8 py-6">
 
 {/* Título de la Sección */}
 <div className={cn(
 "items-center gap-6 mb-6 hidden md:flex shrink-0",
 selectedConversation && "hidden lg:flex" 
 )}>
 <div className="w-14 h-14 rounded-2xl border-none flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 shrink-0">
 <MessageCircle className="w-7 h-7 text-blue-500" strokeWidth={1.5} />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
 {t('title', { defaultValue: 'Mensajes' })}
 </h1>
 <p className="text-sm font-medium text-gray-500">
 {t('subtitle', { defaultValue: 'Comunicación privada y directa con tu especialista' })}
 </p>
 </div>
 </div>

 {/* Contenedor Principal del Chat (Soft Health) */}
 <div className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex min-h-0 relative rounded-3xl shadow-sm overflow-hidden">
 
 {/* Alerta de Desconexión */}
 {!isConnected && !isLoading && (
 <div className="absolute top-0 left-0 right-0 bg-rose-500 text-white text-xs font-bold text-center py-2 z-50 border-b border-rose-600 flex items-center justify-center gap-3 rounded-t-3xl">
 <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
 {t('reconnecting', { defaultValue: 'Reestableciendo conexión segura...' })}
 </div>
 )}

 {/* Columna Izquierda: Barra Lateral (Inbox) */}
 <div className={cn(
 "h-full transition-all duration-300 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]",
 selectedConversation ? "hidden md:block w-80 lg:w-96 shrink-0" : "w-full"
 )}>
 <ChatSidebar 
 conversations={conversations}
 selectedId={selectedConversation?.id}
 onSelect={setSelectedConversation}
 searchQuery={searchQuery}
 onSearchChange={setSearchQuery}
 />
 </div>

 {/* Columna Derecha: Área de Mensajes */}
 <div className={cn(
 "flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#050505] relative",
 !selectedConversation ? "hidden md:flex" : "flex w-full"
 )}>
 {selectedConversation ? (
 <>
 {/* Header del Médico */}
 <ChatHeader 
 conversation={selectedConversation}
 onBack={handleBackToInbox}
 onVoiceCall={handleVoiceCall}
 onVideoCall={handleVideoCall}
 />

 {/* Lista de Mensajes */}
 <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar">
 
 {/* Disclaimer de Privacidad */}
 <div className="flex justify-center mb-8">
 <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 text-xs font-bold rounded-full shadow-sm">
 {t('privacy_notice', { defaultValue: '🔒 Chat Privado y Seguro' })}
 </span>
 </div>

 {messages.map((msg) => (
 <ChatMessageBubble 
 key={msg.id}
 message={msg}
 isOwn={msg.senderId === user?.id}
 providerInitial={(selectedConversation.provider?.name || selectedConversation.otherParticipantName || 'E').charAt(0)}
 />
 ))}

 {/* Indicador "Escribiendo..." (Consola) */}
 {isTyping && (
 <div className="flex items-center gap-3 text-xs font-medium text-gray-500 ml-12 mt-4 bg-white dark:bg-gray-800 w-fit px-4 py-2 rounded-2xl shadow-sm">
 <span className="flex gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
 <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
 <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
 </span>
 {t('typing', { defaultValue: 'Escribiendo...' })}
 </div>
 )}
 {/* Ancla para el auto-scroll */}
 <div ref={messagesEndRef} className="h-4" />
 </div>

 {/* Formulario Input */}
 <ChatInput 
 onSendMessage={(content) => sendMessage(content)}
 onTyping={sendTypingEvent}
 />
 </>
 ) : (
 /* Estado Empty cuando no hay chat seleccionado */
 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 dark:bg-gray-900/10">
 <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 shadow-sm">
 <MessageCircle className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
 </div>
 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
 {t('select_conversation', { defaultValue: 'Tus Mensajes' })}
 </h3>
 <p className="text-sm text-gray-500 font-medium max-w-sm leading-relaxed">
 {t('select_conversation_desc', { defaultValue: 'Selecciona una conversación de la lista para comunicarte con tu especialista.' })}
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}