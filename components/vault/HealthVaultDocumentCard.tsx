"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import {
    FileText, Eye, BrainCircuit, Activity, Pill, AlertCircle,
    Clock, CheckCircle2, AlertTriangle
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
            color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
            pulse: true
        },
        PROCESSED: {
            icon: BrainCircuit,
            text: t('ai_processed', { defaultValue: 'Analizado por IA' }),
            color: 'bg-medical-50 text-medical-600 border-medical-200 dark:bg-medical-500/10 dark:text-medical-400 dark:border-medical-500/20',
            pulse: false
        },
        FAILED: {
            icon: AlertTriangle,
            text: t('ai_failed', { defaultValue: 'Solo Almacenamiento' }),
            color: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50',
            pulse: false
        },
        UNSUPPORTED: {
            icon: FileText,
            text: t('ai_unsupported', { defaultValue: 'Documento Seguro' }),
            color: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50',
            pulse: false
        }
    };

    const StatusIcon = aiStatusConfig[document.aiStatus].icon;
    const aiData = document.aiExtractedData;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none transition-all duration-300 flex flex-col group hover:-translate-y-1">

            {/* Cabecera del Documento */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-start w-full">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10 transition-colors">
                        <FileText className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-medical-500 transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-base">
                            {document.fileName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            <span>{formatDate(document.uploadedAt)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span>{formatBytes(document.fileSizeBytes)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badge de Estado IA */}
            <div className="mb-6">
                <Badge variant="outline" className={cn(
                    "px-3 py-1.5 text-xs font-semibold border flex items-center w-fit gap-2 rounded-xl",
                    aiStatusConfig[document.aiStatus].color
                )}>
                    <StatusIcon className={cn("w-3.5 h-3.5", aiStatusConfig[document.aiStatus].pulse && "animate-spin")} />
                    {aiStatusConfig[document.aiStatus].text}
                </Badge>
            </div>

            {/* Resultados de la IA */}
            {document.aiStatus === 'PROCESSED' && aiData && (
                <div className="flex-1 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 mb-6 space-y-5 transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-950">

                    {aiData.summary && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed">
                            "{aiData.summary}"
                        </p>
                    )}

                    {aiData.medicalConditions && aiData.medicalConditions.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400">
                                <Activity className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t('findings', { defaultValue: 'Hallazgos' })}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {aiData.medicalConditions.map((cond, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-bold tracking-wide text-slate-700 dark:text-slate-300 shadow-sm">
                                        {cond}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {aiData.medications && aiData.medications.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-blue-500/80">
                                <Pill className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t('medications', { defaultValue: 'Medicamentos' })}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {aiData.medications.map((med, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl text-[11px] font-bold tracking-wide text-blue-700 dark:text-blue-300">
                                        {med}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {document.aiStatus !== 'PROCESSED' && <div className="flex-1 min-h-[1rem]"></div>}

            {/* Acciones */}
            <div className="pt-2 mt-auto">
                <Button
                    variant="ghost"
                    onClick={() => onView(document.id)}
                    className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-14 rounded-2xl font-bold transition-all hover:text-medical-600 dark:hover:text-medical-400"
                >
                    <Eye className="w-5 h-5 mr-2" />
                    {t('btn_view', { defaultValue: 'Ver Documento' })}
                </Button>
            </div>
        </div>
    );
}