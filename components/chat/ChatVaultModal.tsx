"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useHealthVault } from '@/hooks/useHealthVault';
import { ConsumerDocument } from '@/types/healthVault';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChatVaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAttach: (document: ConsumerDocument) => void;
}

export function ChatVaultModal({ isOpen, onClose, onAttach }: ChatVaultModalProps) {
    const t = useTranslations('PatientMessages');
    const { documents, isLoading, loadDocuments } = useHealthVault();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadDocuments();
        }
    }, [isOpen, loadDocuments]);

    const formatDate = (dateString: string) => {
        return formatInTimeZone(new Date(dateString), 'UTC', "d MMM yyyy", { locale: es });
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredDocs = documents.filter(doc =>
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('attach_vault', { defaultValue: 'Adjuntar de la bóveda' })}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                        Selecciona un documento de tu historial clínico para compartir de forma segura con el especialista.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar documento..."
                            className="pl-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-medical-500" />
                            <p className="text-sm text-slate-500 font-medium">Cargando tu bóveda...</p>
                        </div>
                    ) : filteredDocs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredDocs.map(doc => (
                                <div
                                    key={doc.id}
                                    onClick={() => {
                                        onAttach(doc);
                                        onClose();
                                    }}
                                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-medical-300 dark:hover:border-medical-700 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl group-hover:bg-medical-50 dark:group-hover:bg-medical-900/20 transition-colors">
                                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-medical-500" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                            {doc.fileName}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                                            <span>{formatDate(doc.uploadedAt)}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{formatBytes(doc.fileSizeBytes)}</span>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="shrink-0 rounded-xl">
                                        Adjuntar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                            </div>
                            <p className="font-bold text-slate-900 dark:text-white">No se encontraron documentos</p>
                            <p className="text-sm text-slate-500 mt-1">Sube documentos a tu bóveda para poder compartirlos por aquí.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
