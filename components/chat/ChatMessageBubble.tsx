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
 
 {/* Avatar del otro participante (Redondo) */}
 {!isOwn && (
 <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hidden md:flex items-center justify-center shrink-0 mt-auto border border-gray-200 dark:border-gray-700 shadow-sm">
 <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
 {providerInitial}
 </span>
 </div>
 )}
 
 <div className={cn(
 "max-w-[85%] md:max-w-[70%] px-4 py-3 relative flex flex-col shadow-sm text-sm font-medium leading-relaxed break-words whitespace-pre-wrap",
 isOwn
 ? "bg-quhealthy-green text-white dark:bg-emerald-700 rounded-2xl rounded-tr-sm"
 : "bg-white text-gray-900 dark:bg-[#111] dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-sm"
 )}>
 {/* Adjunto tipo Bóveda (Documento Clínico) */}
 {message.messageType === 'VAULT_DOCUMENT' ? (
 <div className="flex flex-col gap-2">
 <div className={cn(
 "flex items-start gap-3 p-3 rounded-xl",
 isOwn 
 ? "bg-black/10 dark:bg-white/10" 
 : "bg-white dark:bg-black shadow-sm border border-gray-100 dark:border-gray-800"
 )}>
 <div className="shrink-0 mt-0.5">
 <FileText className="w-5 h-5" strokeWidth={1.5} />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold truncate leading-snug mb-1.5">
 {message.content.replace('Adjunto documento clínico: ', '')}
 </p>
 <Link 
 href={`/patient/dashboard/vault?docId=${message.vaultDocumentId}`}
 className="text-[10px] font-bold flex items-center gap-1 hover:opacity-70 transition-opacity w-fit"
 >
 Ver Expediente <ArrowRight className="w-3 h-3" strokeWidth={2} />
 </Link>
 </div>
 </div>
 </div>
 ) : (
 message.content
 )}
 
 {/* Meta Data (Hora y Estado) */}
 <div className={cn(
 "flex items-center justify-end gap-1.5 mt-2 shrink-0",
 isOwn 
 ? "text-emerald-100 dark:text-emerald-200" 
 : "text-gray-400"
 )}>
 <span className="text-[10px] font-medium">
 {timeString}
 </span>
 {renderStatusIcon()}
 </div>
 </div>
 </div>
 );
}