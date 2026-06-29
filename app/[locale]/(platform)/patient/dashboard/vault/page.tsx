"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FolderOpen, FileText, Syringe, Search, BrainCircuit, AlertTriangle, Pill } from 'lucide-react';

// Hooks & Components
import { useHealthVault } from '@/hooks/useHealthVault';
import { HealthVaultDropzone } from '@/components/vault/HealthVaultDropzone';
import { HealthVaultDocumentCard } from '@/components/vault/HealthVaultDocumentCard';
import { DigitalVaccinationCard } from '@/components/vault/DigitalVaccinationCard';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { useFamily } from '@/hooks/useFamily';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function PatientVaultPage() {
    const t = useTranslations('HealthVault');
    const {
        documents,
        isLoading,
        isUploading,
        fetchDocuments,
        uploadDocument,
        createNote,
        viewDocument,
        updateDocument
    } = useHealthVault();

    const { family } = useFamily();

    const [activeTab, setActiveTab] = useState<string>('titular');
    const [searchQuery, setSearchQuery] = useState('');
    const [documentFilter, setDocumentFilter] = useState<string>('ALL'); // ALL, LAB_RESULT, PRESCRIPTION, IMAGING, GENERAL, NOTE

    // Cargar los documentos al montar la página
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Filtrar documentos según el paciente activo, la búsqueda y el filtro de tipo
    const visibleDocuments = useMemo(() => {
        const dependentId = activeTab === 'titular' ? null : Number(activeTab);
        
        return documents.filter(doc => {
            // 1. Filtrar por familiar
            if (dependentId === null) {
                if (doc.dependentId != null) return false;
            } else {
                if (doc.dependentId !== dependentId) return false;
            }

            // 2. Filtrar por búsqueda
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const titleMatch = doc.title?.toLowerCase().includes(searchLower) || false;
                const fileMatch = doc.fileName?.toLowerCase().includes(searchLower) || false;
                if (!titleMatch && !fileMatch) return false;
            }

            // 3. Filtrar por tipo
            if (documentFilter !== 'ALL' && doc.documentType !== documentFilter) {
                return false;
            }

            return true;
        });
    }, [documents, activeTab, searchQuery, documentFilter]);

    // Calcular el resumen de IA
    const aiSummary = useMemo(() => {
        const conditions = new Set<string>();
        const allergies = new Set<string>();
        const medications = new Set<string>();

        // Solo procesamos los documentos del paciente activo (titular o el dependiente)
        const dependentId = activeTab === 'titular' ? null : Number(activeTab);
        const personDocs = documents.filter(doc => 
            (dependentId === null && doc.dependentId == null) || 
            (doc.dependentId === dependentId)
        );

        personDocs.forEach(doc => {
            if (doc.aiExtractedData) {
                if (doc.aiExtractedData.medicalConditions) {
                    doc.aiExtractedData.medicalConditions.forEach((c: string) => conditions.add(c));
                }
                if (doc.aiExtractedData.allergies) {
                    doc.aiExtractedData.allergies.forEach((a: string) => allergies.add(a));
                }
                if (doc.aiExtractedData.medications) {
                    doc.aiExtractedData.medications.forEach((m: string) => medications.add(m));
                }
            }
        });

        return {
            conditions: Array.from(conditions),
            allergies: Array.from(allergies),
            medications: Array.from(medications)
        };
    }, [documents, activeTab]);

    const activeDependentId = activeTab === 'titular' ? undefined : Number(activeTab);

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
                            {t('title', { defaultValue: 'Expediente Clínico' })}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-3 text-base font-light leading-relaxed max-w-2xl">
                            {t('subtitle', { defaultValue: 'Tu bóveda de salud encriptada para toda la familia. Sube estudios o recetas y nuestra IA extraerá los datos automáticamente.' })}
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex overflow-x-auto bg-transparent border-b border-gray-200 dark:border-gray-800 h-14 w-full justify-start rounded-none p-0 hide-scrollbar gap-2 mb-8">
                        <TabsTrigger 
                            value="titular"
                            className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#111111] transition-all text-[10px] font-bold uppercase tracking-widest px-6 h-full"
                        >
                            Mi Expediente
                        </TabsTrigger>
                        {family?.map(member => (
                            <TabsTrigger 
                                key={member.id}
                                value={member.id.toString()}
                                className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black border border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#111111] transition-all text-[10px] font-bold uppercase tracking-widest px-6 h-full whitespace-nowrap"
                            >
                                {member.firstName}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value={activeTab} className="space-y-12">
                        
                        {/* --- ZONA DE SUBIDA (DROPZONE) --- */}
                        <section>
                            <HealthVaultDropzone
                                onUpload={(file, title) => uploadDocument(file, title, 'GENERAL', activeDependentId)}
                                onCreateNote={(title, content) => createNote(title, content, activeDependentId)}
                                isUploading={isUploading}
                            />
                        </section>

                        {/* --- RESUMEN DE IA (HEALTH SUMMARY) --- */}
                        {(aiSummary.conditions.length > 0 || aiSummary.allergies.length > 0 || aiSummary.medications.length > 0) && (
                            <section className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                                <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
                                    <div className="w-8 h-8 border border-black dark:border-white bg-black dark:bg-white flex items-center justify-center shrink-0">
                                        <BrainCircuit className="w-4 h-4 text-white dark:text-black" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                                            Resumen Clínico Inteligente
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            Datos extraídos automáticamente de los documentos subidos
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    {aiSummary.conditions.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                                                <AlertTriangle className="w-3 h-3" /> Condiciones Médicas
                                            </h3>
                                            <ul className="space-y-2">
                                                {aiSummary.conditions.map((c, i) => (
                                                    <li key={i} className="text-sm font-medium text-black dark:text-white flex items-start gap-2">
                                                        <span className="text-gray-400 mt-1">•</span> {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {aiSummary.allergies.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-red-400 mb-3 flex items-center gap-2">
                                                <AlertTriangle className="w-3 h-3" /> Alergias
                                            </h3>
                                            <ul className="space-y-2">
                                                {aiSummary.allergies.map((a, i) => (
                                                    <li key={i} className="text-sm font-medium text-red-600 dark:text-red-400 flex items-start gap-2">
                                                        <span className="text-red-400 mt-1">•</span> {a}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {aiSummary.medications.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-blue-400 mb-3 flex items-center gap-2">
                                                <Pill className="w-3 h-3" /> Medicamentos Mencionados
                                            </h3>
                                            <ul className="space-y-2">
                                                {aiSummary.medications.map((m, i) => (
                                                    <li key={i} className="text-sm font-medium text-black dark:text-white flex items-start gap-2">
                                                        <span className="text-blue-400 mt-1">•</span> {m}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* --- CARTILLA DIGITAL DEL PACIENTE ACTIVO --- */}
                        {activeDependentId !== undefined && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
                                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                        <Syringe className="w-4 h-4" strokeWidth={1.5} />
                                        Cartilla de Vacunación
                                    </h2>
                                </div>
                                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                                    <DigitalVaccinationCard memberId={activeDependentId} hideHeader={true} />
                                </div>
                            </section>
                        )}

                        {/* --- LISTA DE DOCUMENTOS CON FILTROS --- */}
                        <section className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
                                <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                    <FolderOpen className="w-4 h-4" strokeWidth={1.5} />
                                    Documentos
                                </h2>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input 
                                            placeholder="Buscar documento..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-10 w-full sm:w-64 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors"
                                        />
                                    </div>
                                    
                                    <div className="flex bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-1">
                                        {[
                                            { id: 'ALL', label: 'Todos' },
                                            { id: 'LAB_RESULT', label: 'Labs' },
                                            { id: 'PRESCRIPTION', label: 'Recetas' },
                                            { id: 'NOTE', label: 'Notas' }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => setDocumentFilter(f.id)}
                                                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                                    documentFilter === f.id 
                                                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' 
                                                        : 'text-gray-500 hover:text-black dark:hover:text-white'
                                                }`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
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
                                    {visibleDocuments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                            {visibleDocuments.map((doc, index) => (
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
                                                No se encontraron documentos
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-light leading-relaxed">
                                                {searchQuery || documentFilter !== 'ALL' 
                                                    ? 'No hay archivos que coincidan con los filtros de búsqueda.' 
                                                    : 'Sube tu primer estudio de laboratorio, receta médica o nota de evolución usando el recuadro de arriba.'}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </section>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}