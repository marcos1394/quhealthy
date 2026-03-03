import React from 'react';
import { format } from 'date-fns';
import { Clock, Check, CheckCheck } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
                <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                    {message.content}
                </p>
                
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