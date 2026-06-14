"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { UploadCloud, FileText, Loader2, ShieldCheck, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HealthVaultComposerProps {
    onUpload: (file: File, title?: string) => Promise<unknown>;
    onCreateNote?: (title: string, content: string) => Promise<unknown>;
    isUploading: boolean;
}

export function HealthVaultDropzone({ onUpload, onCreateNote, isUploading }: HealthVaultComposerProps) {
    const t = useTranslations('HealthVault.Dropzone');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [activeTab, setActiveTab] = useState<'upload' | 'note'>('upload');
    const [title, setTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (activeTab === 'upload') setIsDragging(true);
    }, [activeTab]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (isUploading || activeTab !== 'upload') return;

        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            await onUpload(files[0], title || files[0].name);
            setTitle(''); // Reset
        }
    }, [isUploading, onUpload, activeTab, title]);

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && !isUploading) {
            await onUpload(files[0], title || files[0].name);
            setTitle(''); // Reset
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCreateNote = async () => {
        if (!title.trim() || !noteContent.trim() || isUploading || !onCreateNote) return;
        await onCreateNote(title.trim(), noteContent.trim());
        setTitle('');
        setNoteContent('');
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'upload' | 'note')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                        <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-semibold py-2.5">
                            <UploadCloud className="w-4 h-4 mr-2" />
                            {t('tab_upload', { defaultValue: 'Subir Archivo' })}
                        </TabsTrigger>
                        <TabsTrigger value="note" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all font-semibold py-2.5">
                            <Type className="w-4 h-4 mr-2" />
                            {t('tab_note', { defaultValue: 'Crear Nota' })}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Título del Documento (Opcional)
                            </label>
                            <Input
                                placeholder="Ej: Laboratorios Diciembre"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-12"
                                disabled={isUploading}
                            />
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            className={cn(
                                "relative overflow-hidden group cursor-pointer flex flex-col items-center justify-center p-10 md:p-12 rounded-[2rem] border-2 border-dashed transition-all duration-500 ease-out",
                                isDragging
                                    ? "border-medical-500 bg-medical-50/80 dark:bg-medical-500/10 scale-[1.02] shadow-xl shadow-medical-500/10"
                                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700",
                                isUploading && "pointer-events-none opacity-90 scale-[0.98]"
                            )}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInputChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                            />

                            <AnimateContent isUploading={isUploading} isDragging={isDragging} t={t} />
                        </div>
                    </TabsContent>

                    <TabsContent value="note" className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Título de la Nota
                            </label>
                            <Input
                                placeholder="Ej: Síntomas presentados en la noche"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-12"
                                disabled={isUploading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Contenido
                            </label>
                            <Textarea
                                placeholder="Escribe aquí los detalles..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl min-h-[160px] resize-none"
                                disabled={isUploading}
                            />
                        </div>
                        <Button
                            onClick={handleCreateNote}
                            disabled={!title.trim() || !noteContent.trim() || isUploading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 h-12 rounded-xl font-bold shadow-md transition-all"
                        >
                            {isUploading ? (
                                <QhSpinner size="sm" className="mr-2" />
                            ) : (
                                <FileText className="w-5 h-5 mr-2" />
                            )}
                            Guardar Nota
                        </Button>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Privacy Badge */}
            <div className="flex items-center justify-center gap-2 mt-6 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                    {t('privacy_note', { defaultValue: 'Encriptación de extremo a extremo (HIPAA Compliant)' })}
                </span>
            </div>
        </div>
    );
}

function AnimateContent({ isUploading, isDragging, t }: { isUploading: boolean, isDragging: boolean, t: any }) {
    if (isUploading) {
        return (
            <div className="flex flex-col items-center text-medical-600 dark:text-medical-400 animate-in zoom-in duration-500">
                <div className="relative p-4 bg-medical-50 dark:bg-medical-500/20 rounded-full mb-4">
                    <div className="absolute inset-0 border-4 border-medical-200 dark:border-medical-500/30 rounded-full animate-ping opacity-75"></div>
                    <QhSpinner size="md" />
                </div>
                <h3 className="text-lg md:text-xl font-black tracking-tight mb-1">
                    {t('btn_uploading', { defaultValue: 'Procesando documento...' })}
                </h3>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center text-slate-400 dark:text-slate-500 transition-all duration-500">
            <div className={cn(
                "p-4 rounded-full mb-4 transition-all duration-500",
                isDragging ? "bg-medical-100 dark:bg-medical-500/20 text-medical-600 dark:text-medical-400" : "bg-slate-100 dark:bg-slate-800"
            )}>
                <UploadCloud className={cn("w-8 h-8", isDragging && "animate-bounce")} />
            </div>
            <h3 className={cn(
                "text-lg md:text-xl font-bold tracking-tight mb-2 transition-colors",
                isDragging ? "text-medical-700 dark:text-medical-300" : "text-slate-700 dark:text-slate-300"
            )}>
                {isDragging ? t('drag_active', { defaultValue: '¡Suéltalo aquí!' }) : t('drag_inactive', { defaultValue: 'Arrastra tu archivo aquí' })}
            </h3>
            <p className="text-sm font-medium">
                {t('supported_formats', { defaultValue: 'o haz clic para explorar (PDF, JPG, PNG)' })}
            </p>
        </div>
    );
}