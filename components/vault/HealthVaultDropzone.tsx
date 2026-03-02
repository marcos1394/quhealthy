"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { UploadCloud, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthVaultDropzoneProps {
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

export function HealthVaultDropzone({ onUpload, isUploading }: HealthVaultDropzoneProps) {
    const t = useTranslations('HealthVault.Dropzone');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (isUploading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files && files.length > 0) {
            await onUpload(files[0]);
        }
    }, [isUploading, onUpload]);

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && !isUploading) {
            await onUpload(files[0]);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                    "relative overflow-hidden group cursor-pointer flex flex-col items-center justify-center p-10 md:p-16 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 ease-out",
                    isDragging
                        ? "border-medical-500 bg-medical-50/80 dark:bg-medical-500/10 scale-[1.02] shadow-xl shadow-medical-500/10"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none",
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
                <div className="relative p-5 bg-medical-50 dark:bg-medical-500/20 rounded-full mb-6">
                    <div className="absolute inset-0 border-4 border-medical-200 dark:border-medical-500/30 rounded-full animate-ping opacity-75"></div>
                    <Loader2 className="w-10 h-10 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight mb-2">
                    {t('btn_uploading', { defaultValue: 'Procesando documento...' })}
                </h3>
                <p className="text-sm md:text-base font-medium opacity-80">
                    {t('ai_analyzing', { defaultValue: 'Nuestra IA está extrayendo los datos médicos.' })}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center text-center transition-transform duration-500">
            <div className={cn(
                "p-5 rounded-3xl mb-6 transition-all duration-500 transform group-hover:-translate-y-2",
                isDragging
                    ? "bg-medical-100 dark:bg-medical-500/20 text-medical-600 dark:text-medical-400 scale-110"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-sm group-hover:text-medical-500 group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10 group-hover:shadow-md"
            )}>
                {isDragging ? <FileText className="w-12 h-12" strokeWidth={1.5} /> : <UploadCloud className="w-12 h-12" strokeWidth={1.5} />}
            </div>

            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3 transition-colors group-hover:text-medical-600 dark:group-hover:text-medical-400">
                {isDragging
                    ? t('drop_here', { defaultValue: 'Suelta el documento aquí' })
                    : t('title', { defaultValue: 'Arrastra tus resultados o recetas aquí' })
                }
            </h3>

            <p className="text-slate-500 dark:text-slate-400 font-light text-sm md:text-base mb-8 max-w-md leading-relaxed">
                {t('subtitle', { defaultValue: 'o haz clic para explorar en tu dispositivo. Asegúrate de que el texto sea legible.' })}
            </p>

            <div className="flex gap-3">
                {['PDF', 'JPG', 'PNG'].map(ext => (
                    <span key={ext} className="px-4 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold tracking-widest text-slate-500 shadow-sm transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700">
                        {ext}
                    </span>
                ))}
            </div>
        </div>
    );
}