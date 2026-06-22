"use client"
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React from 'react';
import { useTranslations } from 'next-intl';
import {
    FileText, Eye, BrainCircuit, Activity, Pill, AlertCircle,
    Clock, CheckCircle2, AlertTriangle, Type
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

import { ConsumerDocument } from '@/types/healthVault';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HealthVaultDocumentCardProps {
    document: ConsumerDocument;
    onView: (id: string) => void;
}

export function HealthVaultDocumentCard({ document, onView }: HealthVaultDocumentCardProps) {
    const t = useTranslations('HealthVault.Card');

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return formatInTimeZone(new Date(dateString), 'UTC', "d MMM yyyy", { locale: es });
    };

    const aiStatusConfig = {
        PENDING: {
            icon: Clock,
            text: t('ai_pending', { defaultValue: 'Analizando...' }),
            color: 'bg-transparent text-amber-600 dark:text-amber-400 border-amber-500/50',
            pulse: true
        },
        PROCESSED: {
            icon: BrainCircuit,
            text: t('ai_processed', { defaultValue: 'Analizado por IA' }),
            color: 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white',
            pulse: false
        },
        FAILED: {
            icon: AlertTriangle,
            text: t('ai_failed', { defaultValue: 'Solo Almacenamiento' }),
            color: 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700',
            pulse: false
        },
        UNSUPPORTED: {
            icon: FileText,
            text: t('ai_unsupported', { defaultValue: 'Documento Seguro' }),
            color: 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700',
            pulse: false
        }
    };

    // 🚀 FIX: Salvavidas ultra seguro. Si document.aiStatus no existe o no es válido, usamos 'PENDING'
    const currentStatus = (document.aiStatus && aiStatusConfig[document.aiStatus as keyof typeof aiStatusConfig]) 
        ? (document.aiStatus as keyof typeof aiStatusConfig) 
        : 'PENDING';

    const StatusIcon = aiStatusConfig[currentStatus].icon;
    const aiData = document.aiExtractedData;

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-none p-6 transition-all duration-300 flex flex-col group hover:border-black dark:hover:border-white">

            {/* Cabecera del Documento */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-start w-full">
                    <div className="p-4 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] group-hover:bg-black dark:group-hover:bg-white transition-colors shrink-0">
                        {document.documentType === 'NOTE' ? (
                            <Type className="w-6 h-6 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                        ) : (
                            <FileText className="w-6 h-6 text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-black dark:text-white truncate text-base">
                            {document.title || document.fileName || 'Nota sin título'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            <span>{formatDate(document.uploadedAt)}</span>
                            {document.documentType !== 'NOTE' && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                    <span>{formatBytes(document.fileSizeBytes || 0)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Badge de Estado IA */}
            <div className="mb-6">
                <Badge variant="outline" className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border flex items-center w-fit gap-2 rounded-none",
                    aiStatusConfig[currentStatus].color
                )}>
                    <StatusIcon className={cn("w-3.5 h-3.5", aiStatusConfig[currentStatus].pulse && "animate-spin")} />
                    {aiStatusConfig[currentStatus].text}
                </Badge>
            </div>

            {/* Resultados de la IA */}
            {currentStatus === 'PROCESSED' && aiData && (
                <div className="flex-1 border border-gray-200 dark:border-gray-800 rounded-none p-5 mb-6 space-y-5 transition-colors">

                    {aiData.summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium italic leading-relaxed">
                            "{aiData.summary}"
                        </p>
                    )}

                    {aiData.medicalConditions && aiData.medicalConditions.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                                <Activity className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t('findings', { defaultValue: 'Hallazgos' })}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {aiData.medicalConditions.map((cond, i) => (
                                    <span key={i} className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-none text-[11px] font-bold tracking-wide text-gray-700 dark:text-gray-300">
                                        {cond}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {aiData.medications && aiData.medications.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                                <Pill className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t('medications', { defaultValue: 'Medicamentos' })}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {aiData.medications.map((med, i) => (
                                    <span key={i} className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-none text-[11px] font-bold tracking-wide text-gray-700 dark:text-gray-300">
                                        {med}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {currentStatus !== 'PROCESSED' && document.documentType !== 'NOTE' && <div className="flex-1 min-h-[1rem]"></div>}

            {/* Renderizado de Nota Pura */}
            {document.documentType === 'NOTE' && document.noteContent && (
                <div className="flex-1 border border-gray-200 dark:border-gray-800 rounded-none p-5 mb-6 transition-colors">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
                        {document.noteContent}
                    </p>
                </div>
            )}

            {/* Acciones */}
            <div className="pt-2 mt-auto">
                <Button
                    variant="ghost"
                    onClick={() => {
                        if (document.documentType === 'NOTE') {
                            // En un entorno real abriría un modal para leer la nota completa
                            alert(document.noteContent);
                        } else {
                            onView(document.id);
                        }
                    }}
                    className="w-full rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white h-12 text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    {document.documentType === 'NOTE' ? 'Leer Nota Completa' : t('btn_view', { defaultValue: 'Ver Documento' })}
                </Button>
            </div>
        </div>
    );
}