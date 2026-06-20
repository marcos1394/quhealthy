"use client";

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
        
        onTyping(true);
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            onTyping(false);
        }, 2000);
    };

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
            if (newDoc) {
                onSendMessage(`Adjunto documento clínico: ${newDoc.fileName}`, newDoc.id);
                toast.success("Documento adjuntado exitosamente.");
            } else {
                toast.error("Error de sincronización con la bóveda.");
            }
        } catch (error) {
            console.error("Error subiendo el archivo:", error);
            toast.error("Fallo de subida. Verifique el archivo.");
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
            className="p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-gray-800 flex items-center gap-4 shrink-0"
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black w-12 h-12 p-0 flex items-center justify-center transition-colors shrink-0 hidden md:flex"
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Paperclip className="w-4 h-4" strokeWidth={1.5} />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-0 shadow-none">
                    <DropdownMenuItem 
                        className="rounded-none px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505] focus:bg-gray-50 dark:focus:bg-[#050505] flex items-center gap-3 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">Carga Local</span>
                    </DropdownMenuItem>
                    <div className="h-px bg-gray-200 dark:bg-gray-800 w-full" />
                    <DropdownMenuItem 
                        className="rounded-none px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505] focus:bg-gray-50 dark:focus:bg-[#050505] flex items-center gap-3 transition-colors"
                        onClick={() => setIsVaultModalOpen(true)}
                    >
                        <FolderHeart className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">Extraer de Bóveda</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            
            <Input
                value={message}
                onChange={handleChange}
                placeholder={t('input_placeholder', { defaultValue: 'REDACTAR TRANSMISIÓN...' })}
                className="flex-1 rounded-none bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-12 px-4 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors placeholder:text-[10px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest"
            />
            
            <Button
                type="submit"
                disabled={!message.trim()}
                className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest border-0 transition-colors shrink-0 disabled:opacity-50"
            >
                <Send className="w-4 h-4 md:mr-3" strokeWidth={2} />
                <span className="hidden md:inline">{t('btn_send', { defaultValue: 'Enviar' })}</span>
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