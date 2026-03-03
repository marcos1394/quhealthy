import React from 'react';
import { useTranslations } from 'next-intl';
import { Phone, Video, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/chat';

interface ChatHeaderProps {
    conversation: Conversation;
    onBack: () => void;
    onVoiceCall: () => void;
    onVideoCall: () => void;
}

export function ChatHeader({ conversation, onBack, onVoiceCall, onVideoCall }: ChatHeaderProps) {
    const t = useTranslations('PatientMessages');
    const providerName = conversation.provider?.name || conversation.otherParticipantName || 'Doctor';

    return (
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={onBack}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <Avatar className="h-10 w-10 border-2 border-medical-100 dark:border-medical-500/20">
                    <AvatarImage src={conversation.provider?.image} />
                    <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 font-bold text-sm">
                        {providerName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col justify-center">
                    <p className="font-bold text-sm text-slate-900 dark:text-white leading-none mb-1">{providerName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 leading-none">
                        {conversation.provider?.online ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t('online', { defaultValue: 'En línea' })}</>
                        ) : (
                            <><span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span> {t('offline', { defaultValue: 'Desconectado' })}</>
                        )}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={onVoiceCall} className="text-slate-400 hover:text-medical-500 dark:hover:text-medical-400">
                    <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onVideoCall} className="text-slate-400 hover:text-medical-500 dark:hover:text-medical-400">
                    <Video className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}