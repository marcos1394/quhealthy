"use client";

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, FolderOpen, FileText } from 'lucide-react';

// Hooks & Components
import { useHealthVault } from '@/hooks/useHealthVault';
import { HealthVaultDropzone } from '@/components/vault/HealthVaultDropzone';
import { HealthVaultDocumentCard } from '@/components/vault/HealthVaultDocumentCard';

export default function PatientVaultPage() {
    const t = useTranslations('HealthVault');
    const {
        documents,
        isLoading,
        isUploading,
        fetchDocuments,
        uploadDocument,
        viewDocument
    } = useHealthVault();

    // Cargar los documentos al montar la página
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30 transition-colors">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12"
            >
                {/* --- CABECERA EDITORIAL --- */}
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-colors w-fit">
                        <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            {t('title', { defaultValue: 'Mi Expediente Clínico' })}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-3 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                            {t('subtitle', { defaultValue: 'Tu bóveda de salud encriptada. Sube tus laboratorios o recetas y nuestra IA extraerá los datos clínicos relevantes automáticamente.' })}
                        </p>
                    </div>
                </div>

                {/* --- ZONA DE SUBIDA (DROPZONE) --- */}
                <section>
                    <HealthVaultDropzone
                        onUpload={uploadDocument}
                        isUploading={isUploading}
                    />
                </section>

                {/* --- LISTA DE DOCUMENTOS --- */}
                <section className="space-y-8 pt-4">
                    <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800/80 pb-5">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <FolderOpen className="w-6 h-6 text-medical-500" />
                            {t('docs_title', { defaultValue: 'Tus Documentos' })}
                        </h2>
                        {!isLoading && documents.length > 0 && (
                            <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold tracking-widest uppercase">
                                {documents.length} {documents.length === 1 ? 'Archivo' : 'Archivos'}
                            </span>
                        )}
                    </div>

                    {/* Estado: Cargando Inicial */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="relative p-6 bg-medical-50 dark:bg-medical-500/20 rounded-full">
                                <div className="absolute inset-0 border-4 border-medical-200 dark:border-medical-500/30 rounded-full animate-ping opacity-75"></div>
                                <Loader2 className="w-12 h-12 text-medical-600 dark:text-medical-400 animate-spin relative z-10" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-sm animate-pulse">
                                {t('loading', { defaultValue: 'Desencriptando tu bóveda...' })}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {documents.length > 0 ? (
                                /* Cuadrícula Responsiva de Tarjetas */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                    {documents.map((doc, index) => (
                                        <motion.div
                                            key={doc.id}
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                                            layout
                                        >
                                            <HealthVaultDocumentCard
                                                document={doc}
                                                onView={viewDocument}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                /* Estado Vacío */
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center"
                                >
                                    <div className="relative mb-6">
                                        <div className="absolute -inset-4 bg-medical-50 dark:bg-medical-500/10 rounded-full blur-xl"></div>
                                        <div className="relative p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transform -rotate-6 transition-transform hover:rotate-0">
                                            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                                        {t('empty_title', { defaultValue: 'Tu bóveda está vacía' })}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
                                        {t('empty_desc', { defaultValue: 'Sube tu primer estudio de laboratorio, receta médica o nota de evolución usando el recuadro de arriba.' })}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </section>
            </motion.div>
        </div>
    );
}