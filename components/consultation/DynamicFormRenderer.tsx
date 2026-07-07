import React, { useState } from 'react';
import { ClinicalTemplateResponse, ClinicalTemplateField } from '@/services/clinicalTemplates.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';

interface DynamicFormRendererProps {
    template: ClinicalTemplateResponse;
    initialData?: any;
    onSave: (data: any, isFinal: boolean) => void;
    isSaving: boolean;
    isFinalized?: boolean;
}

export function DynamicFormRenderer({ template, initialData, onSave, isSaving, isFinalized }: DynamicFormRendererProps) {
    const [formData, setFormData] = useState<any>(initialData || {});

    const handleChange = (fieldId: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [fieldId]: value }));
    };

    const handleSaveDraft = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, false);
    };

    const handleFinalize = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation: check required fields
        const missing = template.schema.fields.filter(f => f.required && !formData[f.id]);
        if (missing.length > 0) {
            alert(`Por favor completa los campos obligatorios: ${missing.map(f => f.label).join(', ')}`);
            return;
        }

        if (confirm("¿Estás seguro de finalizar esta ficha? No podrás editarla después.")) {
            onSave(formData, true);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-[12px] font-bold uppercase tracking-widest text-black dark:text-white">
                    {template.name}
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                    {template.description}
                </p>
                {isFinalized && (
                    <div className="mt-4 inline-block bg-black text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold">
                        FICHA FINALIZADA
                    </div>
                )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {template.schema.fields.map((field) => (
                    <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {field.type === 'text' && (
                            <Input 
                                className="rounded-none border-gray-300 focus-visible:ring-black h-10 text-xs"
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                disabled={isFinalized}
                            />
                        )}

                        {field.type === 'textarea' && (
                            <textarea 
                                className="w-full rounded-none border border-gray-300 focus-visible:ring-black p-3 text-xs min-h-[100px] bg-transparent"
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                disabled={isFinalized}
                            />
                        )}

                        {field.type === 'number' && (
                            <Input 
                                type="number"
                                className="rounded-none border-gray-300 focus-visible:ring-black h-10 text-xs"
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                disabled={isFinalized}
                            />
                        )}

                        {field.type === 'date' && (
                            <Input 
                                type="date"
                                className="rounded-none border-gray-300 focus-visible:ring-black h-10 text-xs"
                                value={formData[field.id] || ''}
                                onChange={e => handleChange(field.id, e.target.value)}
                                disabled={isFinalized}
                            />
                        )}

                        {field.type === 'select' && (
                            <Select 
                                disabled={isFinalized} 
                                value={formData[field.id] || ''} 
                                onValueChange={(val) => handleChange(field.id, val)}
                            >
                                <SelectTrigger className="rounded-none border-gray-300 h-10 text-xs">
                                    <SelectValue placeholder="Seleccionar opción" />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options?.map(opt => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ))}
            </div>

            {!isFinalized && (
                <div className="flex gap-4 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                    <Button 
                        onClick={handleSaveDraft} 
                        disabled={isSaving}
                        variant="outline" 
                        className="flex-1 rounded-none border-black dark:border-white uppercase text-[10px] font-bold h-12 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar Borrador
                    </Button>
                    <Button 
                        onClick={handleFinalize} 
                        disabled={isSaving}
                        className="flex-1 rounded-none bg-black text-white dark:bg-white dark:text-black uppercase text-[10px] font-bold h-12 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Finalizar Ficha
                    </Button>
                </div>
            )}
        </div>
    );
}
