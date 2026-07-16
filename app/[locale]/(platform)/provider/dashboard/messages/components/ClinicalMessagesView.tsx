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
// Dentro de ClinicalMessagesView, agregar:

export function ClinicalMessagesView() {
 const t = useTranslations('PatientMessages');
 const { user } = useSessionStore();
 const isProvider = user?.role === 'ROLE_PROVIDER' || user?.role === 'ROLE_STAFF';
 
 // Estado del Buscador Local
 const [searchQuery, setSearchQuery] = useState('');
 
 // Referencia para Auto-Scroll al último mensaje
 const messagesEndRef = useRef<HTMLDivElement>(null);

 // Inyectamos nuestro Hook de Producción (REST + STOMP)
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

 const handleVoiceCall = () => toast.info(t('toast_voice', { defaultValue: 'CANAL DE VOZ DESHABILITADO.' }));
 const handleVideoCall = () => toast.info(t('toast_video', { defaultValue: 'CANAL DE VIDEO DESHABILITADO.' }));
 const handleBackToInbox = () => setSelectedConversation(null);

 // 1. Pantalla de Carga Inicial
 if (isLoading) {
 return (
 <div className="flex flex-col justify-center items-center flex-1 bg-white dark:bg-[#0a0a0a]">
 <QhSpinner size="lg" className="text-black dark:text-white" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
 {t('loading', { defaultValue: 'DESENCRIPTANDO BÓVEDA DE MENSAJES...' })}
 </p>
 </div>
 );
 }

 // 2. Render Principal
 return (
 // 1. Utilizamos flex-1 min-h-0 en lugar de w-full h-full para amoldarse al TabContent
 <div className="bg-white dark:bg-[#0a0a0a] font-sans flex flex-col flex-1 min-h-0 overflow-hidden">
 
 {/* Título de la Sección (Oculto en móvil cuando hay un chat abierto) */}
 <div className={cn(
 "flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] shrink-0",
 selectedConversation ? "hidden lg:flex" : "hidden md:flex" 
 )}>
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
 <MessageCircle className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <h2 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white leading-none mb-1">
 {t('title', { defaultValue: 'CANAL CLÍNICO' })}
 </h2>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {t('subtitle', {
 defaultValue: isProvider
 ? 'COMUNICACIÓN E2E CON PACIENTES'
 : 'COMUNICACIÓN E2E CON ESPECIALISTAS'
 })}
 </p>
 </div>
 </div>
 </div>

 {/* Contenedor Principal del Chat (Grid) */}
 {/* 2. Flex-1 y min-h-0 evitan que los hijos rompan el contenedor */}
 <div className="flex-1 flex min-h-0 relative bg-white dark:bg-[#0a0a0a]">
 
 {/* Alerta de Desconexión */}
 {!isConnected && !isLoading && (
 <div className="absolute top-0 left-0 right-0 bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold uppercase tracking-widest py-2 z-50 flex items-center justify-center gap-2 border-b border-black/20 dark:border-white/20">
 <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
 {t('reconnecting', { defaultValue: 'RESTAURANDO CONEXIÓN SEGURA...' })}
 </div>
 )}

 {/* Columna Izquierda: Barra Lateral (Inbox) */}
 <div className={cn(
 "flex flex-col min-h-0 border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] transition-all duration-300",
 selectedConversation ? "hidden md:flex md:w-80 lg:w-96 shrink-0" : "flex w-full"
 )}>
 {/* Nos aseguramos que ChatSidebar controle su propio scroll y no se desborde */}
 <div className="flex-1 overflow-y-auto no-scrollbar">
 <ChatSidebar 
 conversations={conversations}
 selectedId={selectedConversation?.id}
 onSelect={setSelectedConversation}
 searchQuery={searchQuery}
 onSearchChange={setSearchQuery}
 />
 </div>
 </div>

 {/* Columna Derecha: Área de Mensajes */}
 <div className={cn(
 "flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#050505] relative",
 !selectedConversation ? "hidden md:flex" : "flex w-full"
 )}>
 {selectedConversation ? (
 <>
 {/* Header del Paciente */}
 <ChatHeader 
 conversation={selectedConversation}
 onBack={handleBackToInbox}
 onVoiceCall={handleVoiceCall}
 onVideoCall={handleVideoCall}
 />

 {/* Lista de Mensajes (Scrollable) */}
 {/* 3. Aseguramos que la lista tenga overflow-y-auto y el input esté siempre pegado abajo */}
 <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
 
 {/* Disclaimer de Privacidad */}
 <div className="flex justify-center mb-8 mt-4">
 <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-1.5">
 {t('privacy_notice', { defaultValue: '🔒 TRANSMISIÓN ENCRIPTADA E2E' })}
 </span>
 </div>

 {messages.map((msg) => (
 <ChatMessageBubble 
 key={msg.id}
 message={msg}
 isOwn={msg.senderId === user?.id}
 providerInitial={(selectedConversation.otherParticipantName || 'P').charAt(0)}
 />
 ))}

 {/* Indicador "Escribiendo..." Técnico */}
 {isTyping && (
 <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 ml-12">
 <Loader2 className="w-3 h-3 animate-spin" strokeWidth={1.5} />
 {t('typing', { defaultValue: 'RECIBIENDO DATOS...' })}
 </div>
 )}
 
 {/* Ancla para el auto-scroll */}
 <div ref={messagesEndRef} className="h-1" />
 </div>

 {/* Formulario Input */}
 <div className="shrink-0">
 <ChatInput 
 onSendMessage={(content) => sendMessage(content)}
 onTyping={sendTypingEvent}
 />
 </div>
 </>
 ) : (
 /* Estado Empty cuando no hay chat seleccionado */
 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-[#050505]">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
 <MessageCircle className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
 </div>
 <h3 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
 {t('select_conversation', { defaultValue: 'MODO DE ESPERA' })}
 </h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-sm leading-relaxed">
 {t('select_conversation_desc', { defaultValue: 'SELECCIONE UNA CONVERSACIÓN EN EL PANEL LATERAL PARA INICIAR LA TRANSMISIÓN.' })}
 </p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}