import React from 'react';
import { useTranslations } from 'next-intl';
import { Search, Star, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (conv: Conversation) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function ChatSidebar({ conversations, selectedId, onSelect, searchQuery, onSearchChange }: ChatSidebarProps) {
    const t = useTranslations('PatientMessages');

    const formatRelativeTime = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return t('time_now', { defaultValue: 'Ahora' });
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    const filtered = conversations.filter(c => 
        (c.provider?.name || c.otherParticipantName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900 h-full">
            {/* Buscador */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t('search_placeholder', { defaultValue: 'Buscar especialista...' })}
                        className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                </div>
            </div>

            {/* Lista de Chats */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filtered.length > 0 ? (
                    filtered.map(convo => {
                        const providerName = convo.provider?.name || convo.otherParticipantName || 'Doctor';
                        const isSelected = selectedId === convo.id;

                        return (
                            <div
                                key={convo.id}
                                onClick={() => onSelect(convo)}
                                className={cn(
                                    "flex items-center gap-3 p-4 cursor-pointer transition-all border-b border-slate-50 dark:border-slate-800/50",
                                    isSelected
                                        ? "bg-medical-50 dark:bg-medical-500/10 border-l-4 border-l-medical-500"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent"
                                )}
                            >
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-medical-100 dark:border-medical-500/20">
                                        <AvatarImage src={convo.provider?.image} />
                                        <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 font-bold">
                                            {providerName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {convo.provider?.online && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{providerName}</p>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2 font-medium">
                                            {formatRelativeTime(convo.lastMessageAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{convo.provider?.specialty || t('specialist', { defaultValue: 'Especialista' })}</p>
                                    </div>
                                    <p className={cn(
                                        "text-xs truncate mt-1",
                                        convo.unreadCount && convo.unreadCount > 0 ? "text-slate-900 dark:text-white font-semibold" : "text-slate-400 dark:text-slate-500"
                                    )}>
                                        {convo.lastMessagePreview || t('new_conversation', { defaultValue: 'Inicia la conversación' })}
                                    </p>
                                </div>

                                {convo.unreadCount && convo.unreadCount > 0 && (
                                    <Badge className="bg-medical-500 text-white border-none min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold">
                                        {convo.unreadCount}
                                    </Badge>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                        <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="font-bold text-slate-900 dark:text-white">{t('no_conversations', { defaultValue: 'Sin mensajes' })}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px]">
                            {t('no_conversations_desc', { defaultValue: 'No se encontraron conversaciones con ese nombre.' })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}