import React, { useState } from 'react';
import { ClinicalTemplateResponse, ClinicalTemplateField } from '@/services/clinicalTemplates.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
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

    let schemaFields: ClinicalTemplateField[] = [];
    try {
        if (typeof template.schema === 'string') {
            schemaFields = JSON.parse(template.schema).fields || [];
        } else if (template.schema && template.schema.fields) {
            schemaFields = template.schema.fields;
        }
    } catch (e) {
        console.error("Error parsing schema", e);
    }

    const handleFinalize = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation: check required fields
        const missing = schemaFields.filter(f => f.required && !formData[f.id]);
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
                
                {/* DEBUG BLOCK TO HELP US FIND THE ISSUE */}
                {schemaFields.length === 0 && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 text-xs">
                        <strong>Error:</strong> No se encontraron campos en la plantilla.
                        <br/>
                        <strong>Type of template.schema:</strong> {typeof template.schema}
                        <br/>
                        <strong>Value of template.schema:</strong> {JSON.stringify(template.schema, null, 2)}
                    </div>
                )}
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {schemaFields.map((field) => (
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
                            <DatePicker 
                                disabled={isFinalized ? () => true : undefined}
                                value={formData[field.id] ? new Date(formData[field.id]) : undefined}
                                onChange={(date) => {
                                    if (date) {
                                        const yyyy = date.getFullYear();
                                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                                        const dd = String(date.getDate()).padStart(2, '0');
                                        handleChange(field.id, `${yyyy}-${mm}-${dd}`);
                                    } else {
                                        handleChange(field.id, '');
                                    }
                                }}
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

                        {(field.type === 'boolean' || field.type === 'checkbox') && (
                            <div className="flex items-center h-10">
                                <input 
                                    type="checkbox" 
                                    id={field.id}
                                    checked={formData[field.id] || false}
                                    onChange={(e) => handleChange(field.id, e.target.checked)}
                                    disabled={isFinalized || field.readonly}
                                    className="accent-black dark:accent-white w-4 h-4 rounded-none"
                                />
                                <label htmlFor={field.id} className="ml-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                    {field.label}
                                </label>
                            </div>
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
