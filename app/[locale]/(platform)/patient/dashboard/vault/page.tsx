"use client";

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, FolderOpen, FileText, Syringe } from 'lucide-react';

// Hooks & Components
import { useHealthVault } from '@/hooks/useHealthVault';
import { HealthVaultDropzone } from '@/components/vault/HealthVaultDropzone';
import { HealthVaultDocumentCard } from '@/components/vault/HealthVaultDocumentCard';
import { DigitalVaccinationCard } from '@/components/vault/DigitalVaccinationCard';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { useFamily } from '@/hooks/useFamily';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, Syringe as SyringeIcon } from 'lucide-react';

export default function PatientVaultPage() {
    const t = useTranslations('HealthVault');
    const {
        documents,
        isLoading,
        isUploading,
        fetchDocuments,
        uploadDocument,
        createNote,
        viewDocument
    } = useHealthVault();

    const { family } = useFamily();

    // Cargar los documentos al montar la página
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12"
            >
                {/* --- CABECERA EDITORIAL --- */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
                    <div className="w-16 h-16 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-7 h-7 text-black dark:text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-semibold text-black dark:text-white tracking-tight uppercase">
                            {t('title', { defaultValue: 'Mi Expediente Clínico' })}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-3 text-base font-light leading-relaxed max-w-2xl">
                            {t('subtitle', { defaultValue: 'Tu bóveda de salud encriptada. Sube tus laboratorios o recetas y nuestra IA extraerá los datos clínicos relevantes automáticamente.' })}
                        </p>
                    </div>
                </div>

                {/* --- ZONA DE SUBIDA (DROPZONE) --- */}
                <section>
                    <HealthVaultDropzone
                        onUpload={uploadDocument}
                        onCreateNote={createNote}
                        isUploading={isUploading}
                    />
                </section>

                {/* --- CARTILLAS DIGITALES --- */}
                <section className="space-y-6 pt-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                            <Syringe className="w-4 h-4" strokeWidth={1.5} />
                            Cartillas de Salud
                        </h2>
                    </div>
                    {family && family.length > 0 ? (
                        <Accordion type="multiple" className="grid grid-cols-1 gap-6">
                            {family.map(member => (
                                <AccordionItem 
                                    value={`member-${member.id}`} 
                                    key={member.id}
                                    className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-none data-[state=open]:border-black dark:data-[state=open]:border-white transition-colors"
                                >
                                    <AccordionTrigger className="bg-gray-50 dark:bg-[#050505] px-6 py-4 hover:no-underline hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors border-b border-transparent data-[state=open]:border-gray-200 dark:data-[state=open]:border-gray-800 [&[data-state=open]>svg]:rotate-180">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 border border-black dark:border-white bg-white dark:bg-black flex items-center justify-center shrink-0">
                                                <SyringeIcon className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                                            </div>
                                            <div className="text-left">
                                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                                                    Cartilla Digital
                                                </h2>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                    {member.firstName} {member.lastName}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-black dark:text-white" />
                                    </AccordionTrigger>
                                    <AccordionContent className="p-0 border-t-0">
                                        <DigitalVaccinationCard memberId={member.id} hideHeader={true} />
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-[#0a0a0a] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-none">
                            <p className="text-gray-500 dark:text-gray-400">No tienes familiares registrados para mostrar cartillas.</p>
                        </div>
                    )}
                </section>

                {/* --- LISTA DE DOCUMENTOS --- */}
                <section className="space-y-8 pt-4">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                            <FolderOpen className="w-4 h-4" strokeWidth={1.5} />
                            {t('docs_title', { defaultValue: 'Tus Documentos' })}
                        </h2>
                        {!isLoading && documents.length > 0 && (
                            <span className="border border-gray-300 dark:border-gray-700 rounded-none px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                                {documents.length} {documents.length === 1 ? 'Archivo' : 'Archivos'}
                            </span>
                        )}
                    </div>

                    {/* Estado: Cargando Inicial */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6">
                            <div className="border border-gray-200 dark:border-gray-800 p-6">
                                <QhSpinner size="lg" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase text-[10px]">
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
                                                onUpdate={(docId, data) => updateDocument(docId, data)}
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
                                    className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-[#0a0a0a] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-none text-center"
                                >
                                    <div className="p-6 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] mb-6">
                                        <FileText className="w-10 h-10 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
                                    </div>

                                    <h3 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white mb-3">
                                        {t('empty_title', { defaultValue: 'Tu bóveda está vacía' })}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-light leading-relaxed">
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