import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Paperclip, Upload, FolderHeart, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useHealthVault } from '@/hooks/useHealthVault';
import { toast } from 'react-toastify';
import { ChatVaultModal } from './ChatVaultModal';

interface ChatInputProps {
    onSendMessage: (content: string, vaultDocumentId?: string) => void;
    onTyping: (isTyping: boolean) => void;
}

export function ChatInput({ onSendMessage, onTyping }: ChatInputProps) {
    const t = useTranslations('PatientMessages');
    const [message, setMessage] = useState('');
    const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadDocument } = useHealthVault();

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

    const handleAttachDocument = (document: any) => {
        onSendMessage(`Adjunto documento clínico: ${document.fileName}`, document.id);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const newDoc = await uploadDocument(file, 'GENERAL');
            onSendMessage(`Adjunto documento clínico: ${newDoc.fileName}`, newDoc.id);
            toast.success("Documento subido y adjuntado con éxito");
        } catch (error) {
            console.error("Error subiendo el archivo:", error);
            toast.error("Error al subir el archivo");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg"
        />
        <form 
            onSubmit={handleSubmit} 
            className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-medical-500 shrink-0 hidden md:flex"
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-lg">
                    <DropdownMenuItem 
                        className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="bg-medical-50 dark:bg-medical-500/10 p-1.5 rounded-md text-medical-600 dark:text-medical-400">
                            <Upload className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">Subir desde equipo</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 mt-1"
                        onClick={() => setIsVaultModalOpen(true)}
                    >
                        <div className="bg-sky-50 dark:bg-sky-500/10 p-1.5 rounded-md text-sky-600 dark:text-sky-400">
                            <FolderHeart className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">Elegir de mi Bóveda</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
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
        
        <ChatVaultModal 
            isOpen={isVaultModalOpen} 
            onClose={() => setIsVaultModalOpen(false)} 
            onAttach={handleAttachDocument} 
        />
        </>
    );
}