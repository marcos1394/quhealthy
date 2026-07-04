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
 <div className="p-4 md:p-6 bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-4">
 <Button 
 variant="ghost" 
 className="md:hidden shrink-0 rounded-none border border-black dark:border-white w-10 h-10 p-0 flex items-center justify-center" 
 onClick={onBack}
 >
 <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
 </Button>
 
 {/* Avatar Cuadrado Estricto */}
 <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 bg-white dark:bg-black overflow-hidden">
 {conversation.provider?.image ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img 
 src={conversation.provider.image} 
 alt={providerName} 
 className="w-full h-full object-cover"
 />
 ) : (
 <span className="font-bold text-sm text-black dark:text-white">
 {providerName.charAt(0)}
 </span>
 )}
 </div>
 
 <div className="flex flex-col justify-center">
 <p className="font-bold text-sm uppercase tracking-wider text-black dark:text-white leading-none mb-2">
 {providerName}
 </p>
 {/* 🔧 FIX: antes mostraba "ÚLT:" con `lastMessageAt` (hora del último 
 mensaje, no tiene relación con si la persona está conectada). 
 Ahora usa `otherParticipantLastSeenAt`, el dato real de presencia. */}
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 leading-none">
 {isOnline ? (
 <><span className="w-2 h-2 bg-black dark:bg-white inline-block"></span> {t('online', { defaultValue: 'EN LÍNEA' })}</>
 ) : (
 <>
 <span className="w-2 h-2 border border-black dark:border-white inline-block"></span> 
 {t('offline', { defaultValue: 'DESCONECTADO' })}
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
 className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-10 h-10 p-0 flex items-center justify-center transition-colors"
 >
 <Phone className="w-4 h-4" strokeWidth={1.5} />
 </Button>
 <Button 
 variant="outline" 
 onClick={onVideoCall} 
 className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-10 h-10 p-0 flex items-center justify-center transition-colors"
 >
 <Video className="w-4 h-4" strokeWidth={1.5} />
 </Button>
 </div>
 </div>
 );
}