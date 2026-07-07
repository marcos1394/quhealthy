import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { CheckCircle, Save, FileText, ChevronRight } from 'lucide-react';

import { 
    sportsMedicineService 
} from '@/services/sportsMedicine.service';

import { 
    SportsMedicalEvaluationRequest, 
    SportsMedicalEvaluationResponse,
    EvaluationResult,
    InjuryType,
    AnatomicalZone,
    Laterality
} from '@/types/sportsMedicine';

import { QhSpinner } from '@/components/ui/QhSpinner';

interface SportsMedicalEvaluationStepProps {
    appointmentId: number;
    consumerId: number;
    onBack: () => void;
    onNext: () => void;
}

export function SportsMedicalEvaluationStep({
    appointmentId,
    consumerId,
    onBack,
    onNext
}: SportsMedicalEvaluationStepProps) {
    const t = useTranslations('EHR');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [evaluationId, setEvaluationId] = useState<number | null>(null);

    const [formData, setFormData] = useState<Partial<SportsMedicalEvaluationRequest>>({
        consumerId: consumerId,
        appointmentId: appointmentId,
        status: 'DRAFT'
    });

    // Cargar si ya existe una evaluación DRAFT para esta cita
    useEffect(() => {
        const fetchExisting = async () => {
            if (!consumerId) return;
            setIsLoading(true);
            try {
                // Fetch patient history
                const history = await sportsMedicineService.getPatientHistory(consumerId);
                // Buscar si hay un borrador de esta cita
                const draft = history.find(h => h.appointmentId === appointmentId && h.status === 'DRAFT');
                if (draft) {
                    setEvaluationId(draft.id);
                    setFormData({
                        consumerId: draft.consumerId,
                        appointmentId: draft.appointmentId,
                        evaluationResult: draft.evaluationResult,
                        icd10Code: draft.icd10Code,
                        icd10Description: draft.icd10Description,
                        diagnosisObservations: draft.diagnosisObservations,
                        injuryType: draft.injuryType,
                        anatomicalZone: draft.anatomicalZone,
                        laterality: draft.laterality,
                        clinicalDescription: draft.clinicalDescription,
                        generalRecommendations: draft.generalRecommendations,
                        activityRestrictions: draft.activityRestrictions,
                        treatmentPlan: draft.treatmentPlan,
                        rehabNeeded: draft.rehabNeeded,
                        additionalObservations: draft.additionalObservations,
                        estimatedReturnDate: draft.estimatedReturnDate,
                        status: draft.status
                    });
                }
            } catch (error) {
                console.error("Error fetching draft", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExisting();
    }, [appointmentId, consumerId]);

    const handleInputChange = (field: keyof SportsMedicalEvaluationRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            const dataToSave = { ...formData, status: 'DRAFT' } as SportsMedicalEvaluationRequest;
            let result;
            if (evaluationId) {
                result = await sportsMedicineService.updateEvaluation(evaluationId, dataToSave);
            } else {
                result = await sportsMedicineService.createEvaluation(dataToSave);
                setEvaluationId(result.id);
            }
            toast.success("Borrador guardado correctamente.");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar borrador.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinalize = async () => {
        // Validaciones
        if (!formData.evaluationResult) {
            toast.error("Debe seleccionar un resultado de aptitud.");
            return;
        }
        if (!formData.generalRecommendations) {
            toast.error("Las recomendaciones generales son obligatorias.");
            return;
        }
        if (formData.evaluationResult !== EvaluationResult.APT && !formData.estimatedReturnDate) {
            toast.error("Debe indicar la fecha estimada de regreso para resultados no APTOS.");
            return;
        }

        setIsSaving(true);
        try {
            const dataToSave = { ...formData, status: 'FINAL' } as SportsMedicalEvaluationRequest;
            if (evaluationId) {
                await sportsMedicineService.updateEvaluation(evaluationId, dataToSave);
            } else {
                await sportsMedicineService.createEvaluation(dataToSave);
            }
            toast.success("Ficha finalizada con éxito.");
            onNext();
        } catch (error) {
            console.error(error);
            toast.error("Error al finalizar la ficha.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <QhSpinner size="md" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-6 space-y-8 animate-in fade-in duration-300">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white border-b border-black dark:border-white pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Ficha de Aptitud Física / Lesiones Deportivas
                </h2>
                <p className="text-[10px] uppercase text-gray-500 mt-2">Complete el dictamen deportivo. Los campos con asterisco (*) son obligatorios para finalizar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* DICTAMEN DE APTITUD */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Dictamen *</h3>
                    <div className="space-y-2">
                        {Object.values(EvaluationResult).map((val) => (
                            <label key={val} className="flex items-center gap-2 text-xs uppercase cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-colors">
                                <input 
                                    type="radio" 
                                    name="evaluationResult" 
                                    value={val}
                                    checked={formData.evaluationResult === val}
                                    onChange={(e) => handleInputChange('evaluationResult', e.target.value)}
                                    className="accent-black dark:accent-white w-4 h-4"
                                />
                                {val.replace(/_/g, ' ')}
                            </label>
                        ))}
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Fecha Estimada de Regreso {(formData.evaluationResult && formData.evaluationResult !== EvaluationResult.APT) ? '*' : ''}</label>
                            <input 
                                type="date" 
                                value={formData.estimatedReturnDate || ''}
                                onChange={(e) => handleInputChange('estimatedReturnDate', e.target.value)}
                                className="border border-black dark:border-white bg-transparent text-sm p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white rounded-none"
                            />
                        </div>
                    </div>
                </div>

                {/* DETALLES CLÍNICOS */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Detalles Clínicos</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Tipo de Lesión</label>
                            <select 
                                value={formData.injuryType || ''}
                                onChange={(e) => handleInputChange('injuryType', e.target.value)}
                                className="border border-black dark:border-white bg-transparent text-xs p-2 text-black dark:text-white rounded-none"
                            >
                                <option value="" className="text-black bg-white">-- Seleccionar --</option>
                                {Object.values(InjuryType).map(val => <option key={val} value={val} className="text-black bg-white">{val}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Lateralidad</label>
                            <select 
                                value={formData.laterality || ''}
                                onChange={(e) => handleInputChange('laterality', e.target.value)}
                                className="border border-black dark:border-white bg-transparent text-xs p-2 text-black dark:text-white rounded-none"
                            >
                                <option value="" className="text-black bg-white">-- Seleccionar --</option>
                                {Object.values(Laterality).map(val => <option key={val} value={val} className="text-black bg-white">{val}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Zona Anatómica</label>
                            <select 
                                value={formData.anatomicalZone || ''}
                                onChange={(e) => handleInputChange('anatomicalZone', e.target.value)}
                                className="border border-black dark:border-white bg-transparent text-xs p-2 text-black dark:text-white rounded-none"
                            >
                                <option value="" className="text-black bg-white">-- Seleccionar --</option>
                                {Object.values(AnatomicalZone).map(val => <option key={val} value={val} className="text-black bg-white">{val}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Descripción Clínica / Diagnóstico Libre</label>
                        <textarea 
                            rows={3}
                            value={formData.clinicalDescription || ''}
                            onChange={(e) => handleInputChange('clinicalDescription', e.target.value)}
                            className="border border-black dark:border-white bg-transparent text-xs p-2 text-black dark:text-white resize-none rounded-none"
                            placeholder="Describa el mecanismo de lesión o detalles relevantes..."
                        />
                    </div>
                </div>

            </div>

            {/* RECOMENDACIONES */}
            <div className="border-t border-black/10 dark:border-white/10 pt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Recomendaciones y Tratamiento</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Recomendaciones Generales *</label>
                        <textarea 
                            rows={3}
                            value={formData.generalRecommendations || ''}
                            onChange={(e) => handleInputChange('generalRecommendations', e.target.value)}
                            className="border border-black dark:border-white bg-transparent text-xs p-2 text-black dark:text-white resize-none rounded-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Restricciones Específicas</label>
                        <textarea 
                            rows={3}
                            value={formData.activityRestrictions || ''}
                            onChange={(e) => handleInputChange('activityRestrictions', e.target.value)}
                            className="border border-black dark:border-white bg-transparent text-xs p-2 text-black dark:text-white resize-none rounded-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <input 
                        type="checkbox" 
                        id="rehabNeeded"
                        checked={formData.rehabNeeded || false}
                        onChange={(e) => handleInputChange('rehabNeeded', e.target.checked)}
                        className="accent-black dark:accent-white w-4 h-4 rounded-none"
                    />
                    <label htmlFor="rehabNeeded" className="text-xs uppercase font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                        Requiere sesión de rehabilitación física
                    </label>
                </div>
            </div>

            {/* BOTONERA INFERIOR */}
            <div className="flex items-center justify-between border-t border-black dark:border-white pt-6">
                <button 
                    onClick={onBack}
                    className="border border-black dark:border-white px-6 h-10 text-[9px] uppercase font-bold tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
                >
                    Atrás
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="border border-gray-400 text-gray-600 px-6 h-10 text-[9px] uppercase font-bold tracking-widest hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white disabled:opacity-50 transition-colors flex items-center gap-2 rounded-none"
                    >
                        <Save className="w-3.5 h-3.5" /> Guardar Borrador
                    </button>
                    <button 
                        onClick={handleFinalize}
                        disabled={isSaving}
                        className="bg-black text-white dark:bg-white dark:text-black px-6 h-10 text-[9px] uppercase font-bold tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-2 rounded-none"
                    >
                        <CheckCircle className="w-3.5 h-3.5" /> Finalizar Ficha
                    </button>
                </div>
            </div>
        </div>
    );
}
