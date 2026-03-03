import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Paperclip } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    onTyping: (isTyping: boolean) => void;
}

export function ChatInput({ onSendMessage, onTyping }: ChatInputProps) {
    const t = useTranslations('PatientMessages');
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        onSendMessage(message.trim());
        setMessage('');
        onTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        
        // Emitir evento "escribiendo..."
        onTyping(true);
        
        // Limpiar el evento después de 2 segundos de inactividad
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            onTyping(false);
        }, 2000);
    };

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    return (
        <form 
            onSubmit={handleSubmit} 
            className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-medical-500 shrink-0 hidden md:flex"
                title={t('attach_vault', { defaultValue: 'Adjuntar de la bóveda' })}
            >
                <Paperclip className="w-5 h-5" />
            </Button>
            
            <Input
                value={message}
                onChange={handleChange}
                placeholder={t('input_placeholder', { defaultValue: 'Escribe un mensaje...' })}
                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl px-4 h-12 focus-visible:ring-medical-500"
            />
            
            <Button
                type="submit"
                disabled={!message.trim()}
                className="bg-medical-600 hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600 text-white rounded-2xl px-4 h-12 shrink-0 shadow-sm transition-all"
            >
                <Send className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline font-semibold">{t('btn_send', { defaultValue: 'Enviar' })}</span>
            </Button>
        </form>
    );
}