"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import { useSessionStore } from '@/stores/SessionStore';
import { useChat } from '@/hooks/useChat'; 
import { cn } from '@/lib/utils';

// Componentes modulares que creamos en la carpeta chat/
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';

export default function MessagesPage() {
    const t = useTranslations('PatientMessages');
    const { user } = useSessionStore();
    
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

    // Handlers de UI para futuras fases
    const handleVoiceCall = () => toast.info(t('toast_voice', { defaultValue: 'Llamada de voz encriptada próximamente.' }));
    const handleVideoCall = () => toast.info(t('toast_video', { defaultValue: 'Videoconsulta próximamente.' }));
    const handleBackToInbox = () => setSelectedConversation(null);

    // 1. Pantalla de Carga Inicial
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[70vh] gap-4 bg-slate-50 dark:bg-slate-950 rounded-3xl">
                <Loader2 className="w-12 h-12 animate-spin text-medical-500" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {t('loading', { defaultValue: 'Desencriptando tu bóveda de mensajes...' })}
                </p>
            </div>
        );
    }

    // 2. Render Principal
    return (
        <div className="bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30 w-full h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col">
            
            {/* Título de la Sección (Oculto en móvil cuando hay un chat abierto) */}
            <div className={cn(
                "items-center gap-4 mb-4 px-4 md:px-0 hidden md:flex shrink-0",
                selectedConversation && "hidden lg:flex" 
            )}>
                <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
                    <MessageCircle className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {t('title', { defaultValue: 'Mensajes Clínicos' })}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {t('subtitle', { defaultValue: 'Comunicación encriptada de extremo a extremo' })}
                    </p>
                </div>
            </div>

            {/* Contenedor Principal del Chat (Card) */}
            <div className="flex-1 bg-white dark:bg-slate-900 md:rounded-[2rem] border-0 md:border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex min-h-0 relative">
                
                {/* Alerta de Desconexión */}
                {!isConnected && !isLoading && (
                    <div className="absolute top-0 left-0 right-0 bg-amber-500/90 dark:bg-amber-600/90 text-white text-xs text-center py-1.5 z-50 font-semibold backdrop-blur-sm shadow-sm flex items-center justify-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t('reconnecting', { defaultValue: 'Reconectando al servidor seguro...' })}
                    </div>
                )}

                {/* Columna Izquierda: Barra Lateral (Inbox) */}
                <div className={cn(
                    "h-full transition-all duration-300",
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
                    "flex-1 flex flex-col h-full bg-[#fafafa] dark:bg-[#0a0f1c] relative",
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

                            {/* Lista de Mensajes (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                                {/* Disclaimer de Privacidad */}
                                <div className="flex justify-center mb-6">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                                        {t('privacy_notice', { defaultValue: '🔒 Chat protegido bajo estándares de salud' })}
                                    </span>
                                </div>

                                {messages.map((msg) => (
                                    <ChatMessageBubble 
                                        key={msg.id}
                                        message={msg}
                                        isOwn={msg.senderId === user?.id}
                                        providerInitial={(selectedConversation.provider?.name || selectedConversation.otherParticipantName || 'D').charAt(0)}
                                    />
                                ))}

                                {/* Indicador "Escribiendo..." */}
                                {isTyping && (
                                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium ml-12">
                                        <div className="flex space-x-1">
                                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        {t('typing', { defaultValue: 'Escribiendo...' })}
                                    </div>
                                )}
                                {/* Ancla para el auto-scroll */}
                                <div ref={messagesEndRef} className="h-1" />
                            </div>

                            {/* Formulario Input */}
                            <ChatInput 
                                onSendMessage={(content) => sendMessage(content)}
                                onTyping={sendTypingEvent}
                            />
                        </>
                    ) : (
                        /* Estado Empty cuando no hay chat seleccionado */
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-950/50">
                            <div className="p-5 bg-white dark:bg-slate-900 rounded-full mb-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                <MessageCircle className="w-12 h-12 text-medical-200 dark:text-medical-900/50" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {t('select_conversation', { defaultValue: 'Tus Mensajes Clínicos' })}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed text-sm">
                                {t('select_conversation_desc', { defaultValue: 'Selecciona una conversación a la izquierda para continuar chateando de forma segura con tu especialista.' })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}