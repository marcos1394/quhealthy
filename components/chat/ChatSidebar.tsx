"use client"
/* eslint-disable react-doctor/click-events-have-key-events */;

import React from 'react';
import { useTranslations } from 'next-intl';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/stores/SessionStore';

interface ChatSidebarProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (conv: Conversation) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function ChatSidebar({ conversations, selectedId, onSelect, searchQuery, onSearchChange }: ChatSidebarProps) {
    const t = useTranslations('PatientMessages');
    const { user, role } = useSessionStore();

    // 🟢 NUEVO: el "otro" participante depende de quién soy yo.
    // Si yo soy PROVIDER, el otro es un PACIENTE (no un "especialista").
    const isProvider = role === 'ROLE_PROVIDER' || user?.role === 'ROLE_PROVIDER';
    const fallbackName = isProvider ? 'Paciente' : 'Especialista';

    const formatRelativeTime = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return t('time_now', { defaultValue: 'Ahora' });
        if (minutes < 60) return `${minutes}M`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}H`;
        return `${Math.floor(hours / 24)}D`;
    };

    const filtered = conversations.filter(c => 
        (c.provider?.name || c.otherParticipantName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-[#0a0a0a] h-full shrink-0">
            {/* Buscador Arquitectónico */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-4">
                    Directorio de Mensajes
                </h2>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={
                            isProvider
                                ? t('search_placeholder_provider', { defaultValue: 'BUSCAR PACIENTE...' })
                                : t('search_placeholder', { defaultValue: 'BUSCAR ESPECIALISTA...' })
                        }
                        className="pl-12 rounded-none bg-white dark:bg-black border-gray-300 dark:border-gray-700 h-12 text-xs focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors uppercase placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Lista de Chats */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {filtered.length > 0 ? (
                    filtered.map(convo => {
                        const providerName = convo.provider?.name || convo.otherParticipantName || fallbackName;
                        const isSelected = selectedId === convo.id;

                        // 🔧 FIX: el backend puebla `otherParticipantOnline`, no `provider.online`
                        // (ese objeto `provider` aún no se llena en ningún lado). Mantenemos
                        // el fallback a provider?.online por compatibilidad futura.
                        const isOnline = convo.otherParticipantOnline ?? convo.provider?.online;

                        return (
                            <div
                                key={convo.id}
                                onClick={() => onSelect(convo)}
                                className={cn(
                                    "flex items-start gap-4 p-6 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800/50 group",
                                    isSelected
                                        ? "bg-black text-white dark:bg-white dark:text-black"
                                        : "bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-gray-50 dark:hover:bg-[#111]"
                                )}
                            >
                                {/* Avatar Cuadrado Estricto */}
                                <div className="relative shrink-0">
                                    <div className={cn(
                                        "w-12 h-12 flex items-center justify-center border overflow-hidden transition-colors",
                                        isSelected 
                                            ? "border-gray-700 dark:border-gray-300 bg-gray-900 dark:bg-gray-100" 
                                            : "border-black dark:border-white bg-gray-50 dark:bg-[#050505]"
                                    )}>
                                        {convo.provider?.image || convo.otherParticipantImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img 
                                                src={convo.provider?.image || convo.otherParticipantImage} 
                                                alt={providerName}
                                                className="w-full h-full object-cover grayscale"
                                            />
                                        ) : (
                                            <span className="font-bold text-lg">
                                                {providerName.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    {/* Indicador de conexión arquitectónico */}
                                    {isOnline && (
                                        <div className={cn(
                                            "absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2",
                                            isSelected ? "bg-white border-black dark:bg-black dark:border-white" : "bg-black border-white dark:bg-white dark:border-black"
                                        )} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-xs uppercase tracking-wider truncate">
                                            {providerName}
                                        </p>
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-widest shrink-0 ml-2",
                                            isSelected ? "text-gray-400 dark:text-gray-500" : "text-gray-500"
                                        )}>
                                            {formatRelativeTime(convo.lastMessageAt)}
                                        </span>
                                    </div>
                                    {/* 🔧 FIX: si soy PROVIDER, no tiene sentido mostrar "especialidad" 
                                        (el otro es un paciente, no tiene especialidad). Mostramos una 
                                        etiqueta de rol en su lugar. */}
                                    <p className={cn(
                                        "text-[9px] uppercase tracking-widest truncate mb-2",
                                        isSelected ? "text-gray-400 dark:text-gray-500" : "text-gray-500"
                                    )}>
                                        {isProvider
                                            ? t('patient_label', { defaultValue: 'PACIENTE' })
                                            : (convo.provider?.specialty || convo.otherParticipantSpecialty || t('specialist', { defaultValue: 'ESPECIALISTA' }))}
                                    </p>
                                    <p className={cn(
                                        "text-xs truncate font-light",
                                        convo.unreadCount && convo.unreadCount > 0 
                                            ? "font-semibold" 
                                            : (isSelected ? "text-gray-300 dark:text-gray-700" : "text-gray-500")
                                    )}>
                                        {convo.lastMessagePreview || t('new_conversation', { defaultValue: 'Iniciar transmisión' })}
                                    </p>
                                </div>

                                {/* Unread Badge Estricto */}
                                {convo.unreadCount && convo.unreadCount > 0 && (
                                    <div className={cn(
                                        "px-2 py-0.5 text-[9px] font-bold flex items-center justify-center border",
                                        isSelected 
                                            ? "bg-white text-black border-white dark:bg-black dark:text-white dark:border-black" 
                                            : "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                    )}>
                                        {convo.unreadCount}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    /* Empty State Blueprint */
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 dark:bg-[#050505] border border-dashed border-gray-300 dark:border-gray-800 m-4">
                        <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black mb-4">
                            <MessageSquare className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                            {t('no_conversations', { defaultValue: 'Bandeja Vacía' })}
                        </p>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                            {t('no_conversations_desc', { defaultValue: 'No se han establecido canales de comunicación con este criterio.' })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}