import React, { useState } from 'react';
import { ClinicalTemplateResponse } from '@/services/clinicalTemplates.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Save, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface SportsTemplateRendererProps {
    template: ClinicalTemplateResponse;
    initialData?: any;
    onSave: (data: any, isFinal: boolean) => void;
    isSaving: boolean;
    isFinalized?: boolean;
}

export function SportsTemplateRenderer({ template, initialData, onSave, isSaving, isFinalized }: SportsTemplateRendererProps) {
    const [formData, setFormData] = useState<any>(initialData || {});

    const handleInputChange = (field: string, value: any) => {
        if (isFinalized) return;
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSaveDraft = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, false);
    };

    const handleFinalize = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.evaluationResult) {
            toast.error("Debe seleccionar un resultado de aptitud.");
            return;
        }
        if (!formData.generalRecommendations) {
            toast.error("Las recomendaciones generales son obligatorias.");
            return;
        }
        if (formData.evaluationResult !== 'APT' && !formData.estimatedReturnDate) {
            toast.error("Debe indicar la fecha estimada de regreso para resultados no APTOS.");
            return;
        }

        if (confirm("¿Estás seguro de finalizar esta ficha? No podrás editarla después.")) {
            onSave(formData, true);
        }
    };

    return (
        <div className="bg-white dark:bg-[#0a0a0a] space-y-8 animate-in fade-in duration-300">
            <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-[12px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {template.name}
                </h2>
                <p className="text-[10px] uppercase text-gray-500 mt-2">
                    {template.description}
                </p>
                {isFinalized && (
                    <div className="mt-4 inline-block bg-black text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold">
                        FICHA FINALIZADA
                    </div>
                )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* DICTAMEN DE APTITUD */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Dictamen *</h3>
                    <div className="space-y-2">
                        {['APT', 'APT_WITH_RESTRICTIONS', 'NOT_APT'].map((val) => (
                            <label key={val} className="flex items-center gap-2 text-xs uppercase cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 border border-transparent hover:border-black/10 dark:hover:border-white/10 transition-colors">
                                <input 
                                    type="radio" 
                                    name="evaluationResult" 
                                    value={val}
                                    checked={formData.evaluationResult === val}
                                    onChange={(e) => handleInputChange('evaluationResult', e.target.value)}
                                    disabled={isFinalized}
                                    className="accent-black dark:accent-white w-4 h-4"
                                />
                                {val.replace(/_/g, ' ')}
                            </label>
                        ))}
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Fecha Estimada de Regreso {(formData.evaluationResult && formData.evaluationResult !== 'APT') ? '*' : ''}</label>
                            <DatePicker 
                                value={formData.estimatedReturnDate ? new Date(formData.estimatedReturnDate) : undefined}
                                onChange={(date) => {
                                    if (date) {
                                        // Format as YYYY-MM-DD
                                        const yyyy = date.getFullYear();
                                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                                        const dd = String(date.getDate()).padStart(2, '0');
                                        handleInputChange('estimatedReturnDate', `${yyyy}-${mm}-${dd}`);
                                    } else {
                                        handleInputChange('estimatedReturnDate', '');
                                    }
                                }}
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
                            <Select 
                                disabled={isFinalized}
                                value={formData.injuryType || ''}
                                onValueChange={(val) => handleInputChange('injuryType', val)}
                            >
                                <SelectTrigger className="rounded-none border-gray-300 h-10 text-xs text-black dark:text-white">
                                    <SelectValue placeholder="-- Seleccionar --" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    {["FRACTURA", "ESGUINCE", "LUXACION", "DESGARRO", "CONTUSION", "OTRO"].map(val => (
                                        <SelectItem key={val} value={val}>{val}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Lateralidad</label>
                            <Select 
                                disabled={isFinalized}
                                value={formData.laterality || ''}
                                onValueChange={(val) => handleInputChange('laterality', val)}
                            >
                                <SelectTrigger className="rounded-none border-gray-300 h-10 text-xs text-black dark:text-white">
                                    <SelectValue placeholder="-- Seleccionar --" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    {["IZQUIERDA", "DERECHA", "BILATERAL", "NA"].map(val => (
                                        <SelectItem key={val} value={val}>{val}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[10px] font-bold uppercase text-gray-500">Zona Anatómica</label>
                            <Select 
                                disabled={isFinalized}
                                value={formData.anatomicalZone || ''}
                                onValueChange={(val) => handleInputChange('anatomicalZone', val)}
                            >
                                <SelectTrigger className="rounded-none border-gray-300 h-10 text-xs text-black dark:text-white">
                                    <SelectValue placeholder="-- Seleccionar --" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none">
                                    {["CABEZA", "CUELLO", "HOMBRO", "CODO", "MUÑECA", "MANO", "TORAX", "ABDOMEN", "COLUMNA", "PELVIS", "CADERA", "RODILLA", "TOBILLO", "PIE", "OTRO"].map(val => (
                                        <SelectItem key={val} value={val}>{val}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 pt-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Descripción Clínica / Diagnóstico Libre</label>
                        <textarea 
                            rows={3}
                            value={formData.clinicalDescription || ''}
                            onChange={(e) => handleInputChange('clinicalDescription', e.target.value)}
                            disabled={isFinalized}
                            className="border border-black dark:border-white bg-transparent text-xs p-2 text-black dark:text-white resize-none rounded-none"
                            placeholder="Describa el mecanismo de lesión o detalles relevantes..."
                        />
                    </div>
                </div>

            </div>

            {/* RECOMENDACIONES */}
            <div className="mx-6 border-t border-black/10 dark:border-white/10 pt-6 pb-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Recomendaciones y Tratamiento</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Recomendaciones Generales *</label>
                        <textarea 
                            rows={3}
                            value={formData.generalRecommendations || ''}
                            onChange={(e) => handleInputChange('generalRecommendations', e.target.value)}
                            disabled={isFinalized}
                            className="border border-black dark:border-white bg-transparent text-xs p-2 text-black dark:text-white resize-none rounded-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Restricciones Específicas</label>
                        <textarea 
                            rows={3}
                            value={formData.activityRestrictions || ''}
                            onChange={(e) => handleInputChange('activityRestrictions', e.target.value)}
                            disabled={isFinalized}
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
                        disabled={isFinalized}
                        className="accent-black dark:accent-white w-4 h-4 rounded-none"
                    />
                    <label htmlFor="rehabNeeded" className="text-xs uppercase font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                        Requiere sesión de rehabilitación física
                    </label>
                </div>
            </div>

            {/* BOTONERA INFERIOR */}
            {!isFinalized && (
                <div className="flex gap-4 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                    <button 
                        onClick={handleSaveDraft} 
                        disabled={isSaving}
                        className="flex-1 border border-black dark:border-white text-black dark:text-white uppercase text-[10px] font-bold h-12 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-2 rounded-none"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Borrador
                    </button>
                    <button 
                        onClick={handleFinalize} 
                        disabled={isSaving}
                        className="flex-1 bg-black text-white dark:bg-white dark:text-black uppercase text-[10px] font-bold h-12 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 rounded-none"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Finalizar Ficha
                    </button>
                </div>
            )}
        </div>
    );
}
