"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Phone, Video, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/types/chat';
import { useSessionStore } from '@/stores/SessionStore';
import { formatLastSeen } from '@/lib/formatMessageTime';

interface ChatHeaderProps {
 conversation: Conversation;
 onBack: () => void;
 onVoiceCall: () => void;
 onVideoCall: () => void;
}

export function ChatHeader({ conversation, onBack, onVoiceCall, onVideoCall }: ChatHeaderProps) {
 const t = useTranslations('PatientMessages');
 const { user } = useSessionStore();

 const isProvider = user?.role === 'ROLE_PROVIDER';
 const fallbackName = isProvider ? 'Paciente' : 'Especialista';
 const providerName = conversation.provider?.name || conversation.otherParticipantName || fallbackName;

 // 🔧 FIX: leer el campo real que puebla el backend de presencia.
 // `provider.online` se mantiene como fallback por si en el futuro
 // se llena ese objeto desde otro lado.
 const isOnline = conversation.otherParticipantOnline ?? conversation.provider?.online;
 const lastSeenLabel = formatLastSeen(conversation.otherParticipantLastSeenAt);

 return (
 <div className="p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-4">
 <Button 
 variant="ghost" 
 className="md:hidden shrink-0 rounded-xl border border-gray-200 dark:border-gray-800 w-10 h-10 p-0 flex items-center justify-center" 
 onClick={onBack}
 >
 <ChevronLeft className="w-4 h-4" strokeWidth={2} />
 </Button>
 
 {/* Avatar Redondo */}
 <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 overflow-hidden shadow-sm">
 {conversation.provider?.image ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img 
 src={conversation.provider.image} 
 alt={providerName} 
 className="w-full h-full object-cover"
 />
 ) : (
 <span className="font-bold text-sm">
 {providerName.charAt(0)}
 </span>
 )}
 </div>
 
 <div className="flex flex-col justify-center">
 <p className="font-bold text-sm text-gray-900 dark:text-white leading-none mb-1">
 {providerName}
 </p>
 {/* 🔧 FIX: antes mostraba "ÚLT:" con `lastMessageAt` (hora del último 
 mensaje, no tiene relación con si la persona está conectada). 
 Ahora usa `otherParticipantLastSeenAt`, el dato real de presencia. */}
 <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 leading-none">
 {isOnline ? (
 <><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-sm"></span> {t('online', { defaultValue: 'En Línea' })}</>
 ) : (
 <>
 <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 inline-block"></span> 
 {t('offline', { defaultValue: 'Desconectado' })}
 {lastSeenLabel && <> • {lastSeenLabel}</>}
 </>
 )}
 </p>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <Button 
 variant="outline" 
 onClick={onVoiceCall} 
 className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 w-10 h-10 p-0 flex items-center justify-center transition-all shadow-sm"
 >
 <Phone className="w-4 h-4" strokeWidth={2} />
 </Button>
 <Button 
 variant="outline" 
 onClick={onVideoCall} 
 className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-300 w-10 h-10 p-0 flex items-center justify-center transition-all shadow-sm"
 >
 <Video className="w-4 h-4" strokeWidth={2} />
 </Button>
 </div>
 </div>
 );
}