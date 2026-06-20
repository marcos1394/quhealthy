"use client";

import React from 'react';
import { format } from 'date-fns';
import { Clock, Check, CheckCheck, FileText, ArrowRight } from 'lucide-react';
import { ChatMessage } from '@/types/chat';
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

    // Iconos de estado de entrega estrictamente monocromáticos
    const renderStatusIcon = () => {
        if (!isOwn) return null;
        
        if (message.isRead || message.status === 'read') {
            // Leído (doble check full opacidad)
            return <CheckCheck className="w-[14px] h-[14px] opacity-100" strokeWidth={2} />;
        }
        if (message.status === 'sending') {
            // Enviando (reloj)
            return <Clock className="w-[12px] h-[12px] opacity-50" strokeWidth={1.5} />;
        }
        if (message.status === 'delivered') {
            // Entregado (doble check media opacidad)
            return <CheckCheck className="w-[14px] h-[14px] opacity-50" strokeWidth={1.5} />;
        }
        // Enviado por defecto (un check media opacidad)
        return <Check className="w-[14px] h-[14px] opacity-50" strokeWidth={1.5} />;
    };

    return (
        <div className={cn("flex gap-4 w-full", isOwn ? "justify-end" : "justify-start")}>
            
            {/* Avatar del otro participante (Cuadrado estricto) */}
            {!isOwn && (
                <div className="w-10 h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] hidden md:flex items-center justify-center shrink-0 mt-auto">
                    <span className="text-xs font-bold text-black dark:text-white uppercase">
                        {providerInitial}
                    </span>
                </div>
            )}
            
            <div className={cn(
                "max-w-[85%] md:max-w-[70%] p-5 relative flex flex-col rounded-none",
                isOwn
                    ? "bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white"
                    : "bg-gray-50 text-black dark:bg-[#111] dark:text-white border border-gray-200 dark:border-gray-800"
            )}>
                {/* Adjunto tipo Bóveda (Documento Clínico) */}
                {message.messageType === 'VAULT_DOCUMENT' ? (
                    <div className="flex flex-col gap-3">
                        <div className={cn(
                            "flex items-start gap-4 p-4 border",
                            isOwn 
                                ? "border-white/30 dark:border-black/30 bg-white/5 dark:bg-black/5" 
                                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-black"
                        )}>
                            <div className="shrink-0 mt-1">
                                <FileText className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate leading-snug mb-2">
                                    {message.content.replace('Adjunto documento clínico: ', '')}
                                </p>
                                <Link 
                                    href={`/patient/dashboard/vault?docId=${message.vaultDocumentId}`}
                                    className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity w-fit border-b border-current pb-0.5"
                                >
                                    Ver Expediente <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm font-light leading-relaxed break-words whitespace-pre-wrap">
                        {message.content}
                    </p>
                )}
                
                {/* Meta Data (Hora y Estado) */}
                <div className={cn(
                    "flex items-center justify-end gap-2 mt-4 shrink-0 border-t pt-2",
                    isOwn 
                        ? "border-white/20 dark:border-black/20 text-white/80 dark:text-black/80" 
                        : "border-gray-200 dark:border-gray-800 text-gray-500"
                )}>
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                        {timeString}
                    </span>
                    {renderStatusIcon()}
                </div>
            </div>
        </div>
    );
}