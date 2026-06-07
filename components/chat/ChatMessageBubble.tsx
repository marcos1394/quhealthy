import React from 'react';
import { format } from 'date-fns';
import { Clock, Check, CheckCheck, FileText, ArrowRight } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ChatMessageBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
    providerInitial: string;
}

export function ChatMessageBubble({ message, isOwn, providerInitial }: ChatMessageBubbleProps) {
    
    // Formatear hora (ej. 14:30)
    const timeString = message.createdAt 
        ? format(new Date(message.createdAt), 'HH:mm') 
        : '';

    // Icono de estado de entrega (Estilo WhatsApp)
    const renderStatusIcon = () => {
        if (!isOwn) return null;
        
        if (message.isRead || message.status === 'read') {
            return <CheckCheck className="w-[14px] h-[14px] text-sky-400" />;
        }
        if (message.status === 'sending') {
            return <Clock className="w-[12px] h-[12px] text-white/50" />;
        }
        if (message.status === 'delivered') {
            return <CheckCheck className="w-[14px] h-[14px] text-white/70" />;
        }
        // Por defecto: Sent (Un check)
        return <Check className="w-[14px] h-[14px] text-white/70" />;
    };

    return (
        <div className={cn("flex gap-2 w-full", isOwn ? "justify-end" : "justify-start")}>
            {!isOwn && (
                <Avatar className="h-8 w-8 border border-medical-100 dark:border-medical-500/20 shrink-0 mt-auto hidden md:block">
                    <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 text-xs font-bold">
                        {providerInitial}
                    </AvatarFallback>
                </Avatar>
            )}
            
            <div className={cn(
                "max-w-[85%] md:max-w-[75%] px-4 py-2.5 relative flex flex-col shadow-sm",
                isOwn
                    ? "bg-medical-600 dark:bg-medical-500 text-white rounded-2xl rounded-br-sm"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm"
            )}>
                {message.messageType === 'VAULT_DOCUMENT' ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 bg-white/10 dark:bg-black/20 p-3 rounded-xl border border-white/20 dark:border-white/5">
                            <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate leading-tight mb-1">
                                    {message.content.replace('Adjunto documento clínico: ', '')}
                                </p>
                                <Link 
                                    href={`/patient/dashboard/vault?docId=${message.vaultDocumentId}`}
                                    className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 hover:underline opacity-80"
                                >
                                    Ver documento <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                        {message.content}
                    </p>
                )}
                
                <div className={cn(
                    "flex items-center justify-end gap-1 mt-1 shrink-0",
                    isOwn ? "text-white/70" : "text-slate-400 dark:text-slate-500"
                )}>
                    <span className="text-[10px] font-medium tracking-wide">
                        {timeString}
                    </span>
                    {renderStatusIcon()}
                </div>
            </div>
        </div>
    );
}