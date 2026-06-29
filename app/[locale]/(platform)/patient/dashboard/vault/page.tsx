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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from 'lucide-react';

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

    const [panoramaData, setPanoramaData] = useState<{ [key: string]: { clinicalSummary: string; careRecommendations: string[] } | null }>({});
    const [isGeneratingPanorama, setIsGeneratingPanorama] = useState(false);

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

    const activeDependentId = activeTab === 'titular' ? undefined : Number(activeTab);

    const activeDependent = useMemo(() => {
        if (!family || activeDependentId === undefined) return undefined;
        return family.find(m => m.id === activeDependentId);
    }, [family, activeDependentId]);

    const activeDependentAge = useMemo(() => {
        if (!activeDependent?.dateOfBirth) return undefined;
        const dob = new Date(activeDependent.dateOfBirth);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms); 
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    }, [activeDependent]);

    const showVaccinationCard = activeDependentId !== undefined && activeDependentAge !== undefined && activeDependentAge <= 12;

    // Manejar generación del panorama
    const handleGeneratePanorama = async () => {
        const dependentId = activeTab === 'titular' ? undefined : Number(activeTab);
        setIsGeneratingPanorama(true);
        try {
            const result = await generatePanorama(dependentId);
            if (result) {
                setPanoramaData(prev => ({
                    ...prev,
                    [activeTab]: result
                }));
            }
        } finally {
            setIsGeneratingPanorama(false);
        }
    };

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
                        <section className="bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 border border-black dark:border-white bg-black dark:bg-white flex items-center justify-center shrink-0">
                                        <BrainCircuit className="w-4 h-4 text-white dark:text-black" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                                            Panorama Clínico Inteligente
                                        </h2>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            Generado por IA en base a todo el expediente (notas, vacunas y estudios).
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGeneratePanorama}
                                    disabled={isGeneratingPanorama}
                                    className="px-4 py-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
                                >
                                    {isGeneratingPanorama ? 'Generando...' : 'Generar Panorama'}
                                </button>
                            </div>

                            <div className="pt-2">
                                {!panoramaData[activeTab] ? (
                                    <div className="text-sm text-gray-500 italic py-4 text-center">
                                        Aún no se ha generado un panorama clínico. Haz clic en "Generar Panorama" para consultar a la IA.
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Panorama General</h3>
                                            <p className="text-sm text-black dark:text-white leading-relaxed">
                                                {panoramaData[activeTab]?.clinicalSummary}
                                            </p>
                                        </div>
                                        {panoramaData[activeTab]!.careRecommendations && panoramaData[activeTab]!.careRecommendations.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-bold uppercase text-blue-400 mb-2">Recomendaciones de Cuidado</h3>
                                                <ul className="space-y-2">
                                                    {panoramaData[activeTab]?.careRecommendations.map((rec, idx) => (
                                                        <li key={idx} className="text-sm text-black dark:text-white flex items-start gap-2">
                                                            <span className="text-blue-400 mt-1">•</span>
                                                            <span className="leading-relaxed">{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* --- CARTILLA DIGITAL DEL PACIENTE ACTIVO (SOLO <= 12 AÑOS) --- */}
                        {showVaccinationCard && (
                            <section className="space-y-6 pt-4">
                                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
                                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
                                        <Syringe className="w-4 h-4" strokeWidth={1.5} />
                                        Cartillas de Salud
                                    </h2>
                                </div>
                                <Accordion type="single" collapsible className="grid grid-cols-1 gap-6">
                                    <AccordionItem 
                                        value="vaccination-card" 
                                        className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-none data-[state=open]:border-black dark:data-[state=open]:border-white transition-colors"
                                    >
                                        <AccordionTrigger className="bg-gray-50 dark:bg-[#050505] px-6 py-4 hover:no-underline hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors border-b border-transparent data-[state=open]:border-gray-200 dark:data-[state=open]:border-gray-800 [&[data-state=open]>svg]:rotate-180">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 border border-black dark:border-white bg-white dark:bg-black flex items-center justify-center shrink-0">
                                                    <Syringe className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                                                </div>
                                                <div className="text-left">
                                                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                                                        Cartilla Digital
                                                    </h2>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                        Haz clic para ver el historial de dosis
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-black dark:text-white" />
                                        </AccordionTrigger>
                                        <AccordionContent className="p-0 border-t-0">
                                            <DigitalVaccinationCard memberId={activeDependentId} hideHeader={true} />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
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