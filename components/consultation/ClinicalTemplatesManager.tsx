"use client";

import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { clinicalTemplateService, ClinicalTemplateResponse } from '@/services/clinicalTemplates.service';
import { clinicalSubmissionService, ClinicalSubmissionResponse, ClinicalSubmissionRequest } from '@/services/clinicalSubmissions.service';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { SportsTemplateRenderer } from './SportsTemplateRenderer';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { handleApiError } from '@/lib/handleApiError';
import { toast } from 'react-toastify';

interface ClinicalTemplatesManagerProps {
    appointmentId: number;
    consumerId: number;
    onBack: () => void;
    onNext: () => void;
}

export function ClinicalTemplatesManager({ appointmentId, consumerId, onBack, onNext }: ClinicalTemplatesManagerProps) {
    const { user } = useSessionStore();
    const [templates, setTemplates] = useState<ClinicalTemplateResponse[]>([]);
    const [submissions, setSubmissions] = useState<ClinicalSubmissionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeTemplate, setActiveTemplate] = useState<ClinicalTemplateResponse | null>(null);
    const [activeSubmission, setActiveSubmission] = useState<ClinicalSubmissionResponse | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [appointmentId, user?.id]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [tmpls, subs] = await Promise.all([
                clinicalTemplateService.getTemplates(user?.id),
                clinicalSubmissionService.getAppointmentSubmissions(appointmentId)
            ]);
            setTemplates(tmpls);
            setSubmissions(subs);
        } catch (error) {
            handleApiError(error, "Error al cargar plantillas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectTemplate = (template: ClinicalTemplateResponse) => {
        setActiveTemplate(template);
        const existing = submissions.find(s => s.template.id === template.id);
        setActiveSubmission(existing || null);
    };

    const handleSave = async (data: any, isFinal: boolean) => {
        if (!activeTemplate || !user?.id) return;
        
        try {
            setIsSaving(true);
            const request: ClinicalSubmissionRequest = {
                appointmentId,
                consumerId,
                providerId: user.id,
                templateId: activeTemplate.id,
                data,
                status: isFinal ? 'FINALIZED' : 'DRAFT'
            };

            const saved = await clinicalSubmissionService.saveSubmission(request);
            setActiveSubmission(saved);
            toast.success(isFinal ? "Ficha finalizada" : "Borrador guardado");
            loadData(); // Refrescar lista
            
            if (isFinal) {
                setActiveTemplate(null);
            }
        } catch (error) {
            handleApiError(error, "Error al guardar la ficha");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 border border-black dark:border-white bg-white dark:bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] min-h-[600px] flex flex-col relative rounded-none">
            
            {/* Cabecera */}
            <div className="bg-white dark:bg-[#0a0a0a] p-4 md:p-6 border-b border-black dark:border-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
                        <FileText className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                            Formatos Dinámicos
                        </p>
                        <h2 className="text-base md:text-lg font-semibold tracking-tight uppercase leading-none">
                            Plantillas Clínicas
                        </h2>
                    </div>
                </div>
                {activeTemplate && (
                    <Button 
                        variant="ghost" 
                        onClick={() => setActiveTemplate(null)}
                        className="text-[9px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-900"
                    >
                        Volver al Catálogo
                    </Button>
                )}
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
                {activeTemplate ? (
                    activeTemplate.category === 'Sports' ? (
                        <SportsTemplateRenderer
                            template={activeTemplate}
                            initialData={activeSubmission?.data}
                            onSave={handleSave}
                            isSaving={isSaving}
                            isFinalized={activeSubmission?.status === 'FINALIZED'}
                        />
                    ) : (
                        <DynamicFormRenderer 
                            template={activeTemplate}
                            initialData={activeSubmission?.data}
                            onSave={handleSave}
                            isSaving={isSaving}
                            isFinalized={activeSubmission?.status === 'FINALIZED'}
                        />
                    )
                ) : (
                    <div className="p-6 md:p-8">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">
                            Selecciona una plantilla para rellenar durante esta consulta:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {templates.map(tmpl => {
                                const submission = submissions.find(s => s.template.id === tmpl.id);
                                const isFinalized = submission?.status === 'FINALIZED';
                                const isDraft = submission?.status === 'DRAFT';

                                return (
                                    <div 
                                        key={tmpl.id} 
                                        onClick={() => handleSelectTemplate(tmpl)}
                                        className="border border-gray-200 dark:border-gray-800 p-6 cursor-pointer hover:border-black dark:hover:border-white transition-colors flex flex-col justify-between h-48 bg-gray-50 dark:bg-[#050505]"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-bold uppercase tracking-widest bg-white dark:bg-black px-2 py-1 border border-gray-200 dark:border-gray-800">
                                                    {tmpl.category || 'General'}
                                                </span>
                                                {isFinalized && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                            </div>
                                            <h3 className="font-bold text-sm mb-2">{tmpl.name}</h3>
                                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                                {tmpl.description}
                                            </p>
                                        </div>
                                        <div>
                                            {isFinalized ? (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-green-600">Finalizada</span>
                                            ) : isDraft ? (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600">Borrador Guardado</span>
                                            ) : (
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black">Nueva Ficha</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {templates.length === 0 && (
                                <div className="col-span-full text-center py-12 border border-dashed border-gray-300 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                                        No hay plantillas disponibles. Configura tus plantillas en los ajustes.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Navegación Pie */}
            <div className="bg-gray-50 dark:bg-[#050505] p-4 border-t border-black dark:border-white flex justify-between shrink-0">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onBack}
                    className="border-black dark:border-white rounded-none uppercase text-[10px] font-bold h-10 px-6 hover:bg-black hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-3 h-3 mr-2" /> Anterior
                </Button>

                <Button 
                    type="button"
                    onClick={onNext}
                    className="bg-black text-white dark:bg-white dark:text-black rounded-none uppercase text-[10px] font-bold h-10 px-6 hover:bg-gray-800 transition-colors"
                >
                    Siguiente Paso <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
            </div>
        </div>
    );
}
