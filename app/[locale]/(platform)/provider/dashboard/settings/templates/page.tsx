"use client";

import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { clinicalTemplateService, ClinicalTemplateResponse, ClinicalTemplateRequest, ClinicalTemplateField, ClinicalTemplateSchema } from '@/services/clinicalTemplates.service';
import { Plus, Trash2, Edit2, Save, FileText, Settings, X, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleApiError } from '@/lib/handleApiError';
import { toast } from 'react-hot-toast';

export default function TemplatesSettingsPage() {
    const { user } = useSessionStore();
    const [templates, setTemplates] = useState<ClinicalTemplateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<ClinicalTemplateRequest>({
        name: '',
        description: '',
        type: 'CUSTOM',
        category: 'General',
        schema: { fields: [] }
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadTemplates();
        }
    }, [user?.id]);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await clinicalTemplateService.getTemplates(user?.id);
            setTemplates(data);
        } catch (error) {
            handleApiError(error, "Error al cargar plantillas");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewTemplate = () => {
        setCurrentTemplate({
            name: '',
            description: '',
            type: 'CUSTOM',
            category: 'General',
            providerId: user?.id,
            schema: { fields: [] }
        });
        setEditingId(null);
        setIsEditing(true);
    };

    const handleEditTemplate = (tmpl: ClinicalTemplateResponse) => {
        setCurrentTemplate({
            name: tmpl.name,
            description: tmpl.description,
            type: tmpl.type,
            category: tmpl.category,
            providerId: tmpl.providerId,
            schema: tmpl.schema || { fields: [] },
            pdfTemplateText: tmpl.pdfTemplateText
        });
        setEditingId(tmpl.id);
        setIsEditing(true);
    };

    const handleDeleteTemplate = async (id: number) => {
        if (confirm("¿Estás seguro de eliminar esta plantilla?")) {
            try {
                await clinicalTemplateService.deleteTemplate(id);
                toast.success("Plantilla eliminada");
                loadTemplates();
            } catch (error) {
                handleApiError(error, "Error al eliminar plantilla");
            }
        }
    };

    const saveTemplate = async () => {
        if (!currentTemplate.name.trim()) {
            toast.error("El nombre de la plantilla es obligatorio");
            return;
        }

        try {
            if (editingId) {
                await clinicalTemplateService.updateTemplate(editingId, currentTemplate);
                toast.success("Plantilla actualizada");
            } else {
                await clinicalTemplateService.createTemplate(currentTemplate);
                toast.success("Plantilla creada");
            }
            setIsEditing(false);
            loadTemplates();
        } catch (error) {
            handleApiError(error, "Error al guardar plantilla");
        }
    };

    const addField = () => {
        const newField: ClinicalTemplateField = {
            id: `field_${Date.now()}`,
            type: 'text',
            label: 'Nuevo Campo',
            required: false
        };
        setCurrentTemplate(prev => ({
            ...prev,
            schema: {
                fields: [...(prev.schema?.fields || []), newField]
            }
        }));
    };

    const updateField = (index: number, updates: Partial<ClinicalTemplateField>) => {
        setCurrentTemplate(prev => {
            const fields = [...(prev.schema?.fields || [])];
            fields[index] = { ...fields[index], ...updates };
            return { ...prev, schema: { fields } };
        });
    };

    const removeField = (index: number) => {
        setCurrentTemplate(prev => {
            const fields = [...(prev.schema?.fields || [])];
            fields.splice(index, 1);
            return { ...prev, schema: { fields } };
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center text-xs uppercase tracking-widest">Cargando plantillas...</div>;
    }

    if (isEditing) {
        return (
            <div className="max-w-5xl mx-auto py-12 px-6">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-black dark:border-white">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-widest text-black dark:text-white">
                            {editingId ? 'Editar Plantilla' : 'Nueva Plantilla'}
                        </h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
                            Constructor Visual de Fichas Clínicas
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="border-black dark:border-white rounded-none uppercase text-[10px]" onClick={() => setIsEditing(false)}>
                            Cancelar
                        </Button>
                        <Button className="bg-black text-white dark:bg-white dark:text-black rounded-none uppercase text-[10px]" onClick={saveTemplate}>
                            <Save className="w-4 h-4 mr-2" /> Guardar Plantilla
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Panel de Configuración General */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-[#050505] p-6 border border-gray-200 dark:border-gray-800">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center">
                                <Settings className="w-4 h-4 mr-2" /> Configuración Base
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Nombre de Plantilla</label>
                                    <Input 
                                        className="rounded-none border-gray-300 focus-visible:ring-black"
                                        value={currentTemplate.name}
                                        onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                                        placeholder="Ej: Ficha de Deportistas"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Categoría</label>
                                    <Input 
                                        className="rounded-none border-gray-300 focus-visible:ring-black"
                                        value={currentTemplate.category}
                                        onChange={(e) => setCurrentTemplate({...currentTemplate, category: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Descripción</label>
                                    <Input 
                                        className="rounded-none border-gray-300 focus-visible:ring-black"
                                        value={currentTemplate.description}
                                        onChange={(e) => setCurrentTemplate({...currentTemplate, description: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Builder */}
                    <div className="md:col-span-2">
                        <div className="border border-black dark:border-white p-8 bg-white dark:bg-black min-h-[500px]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center">
                                    <FileText className="w-5 h-5 mr-2" /> Constructor de Formulario
                                </h3>
                                <Button onClick={addField} variant="outline" className="rounded-none border-black dark:border-white uppercase text-[10px] h-8">
                                    <PlusCircle className="w-3 h-3 mr-2" /> Añadir Campo
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {currentTemplate.schema?.fields?.length === 0 && (
                                    <div className="text-center py-12 text-gray-400 text-xs uppercase tracking-widest border border-dashed border-gray-300">
                                        No hay campos en esta plantilla. Haz clic en "Añadir Campo".
                                    </div>
                                )}
                                
                                {currentTemplate.schema?.fields?.map((field, index) => (
                                    <div key={field.id} className="border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#0a0a0a] group relative">
                                        <button 
                                            onClick={() => removeField(index)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        
                                        <div className="grid grid-cols-2 gap-4 mr-8">
                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Etiqueta (Pregunta)</label>
                                                <Input 
                                                    className="rounded-none h-8 text-xs bg-white dark:bg-black"
                                                    value={field.label}
                                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Tipo de Campo</label>
                                                <Select value={field.type} onValueChange={(val: any) => updateField(index, { type: val })}>
                                                    <SelectTrigger className="rounded-none h-8 text-xs bg-white dark:bg-black">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">Texto Corto</SelectItem>
                                                        <SelectItem value="textarea">Párrafo Largo</SelectItem>
                                                        <SelectItem value="number">Número</SelectItem>
                                                        <SelectItem value="date">Fecha</SelectItem>
                                                        <SelectItem value="select">Lista Desplegable (Select)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        
                                        {/* Opciones extra si es select */}
                                        {field.type === 'select' && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">
                                                    Opciones (separadas por coma)
                                                </label>
                                                <Input 
                                                    className="rounded-none h-8 text-xs bg-white dark:bg-black"
                                                    value={field.options?.join(', ') || ''}
                                                    onChange={(e) => {
                                                        const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                        updateField(index, { options: opts });
                                                    }}
                                                    placeholder="Apto, No Apto, Evaluación Pendiente"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-black dark:border-white">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-black dark:text-white">
                        Plantillas Clínicas
                    </h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
                        Gestiona los formularios dinámicos para tus consultas
                    </p>
                </div>
                <Button className="bg-black text-white dark:bg-white dark:text-black rounded-none uppercase text-[10px]" onClick={handleNewTemplate}>
                    <Plus className="w-4 h-4 mr-2" /> Crear Plantilla
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(tmpl => (
                    <div key={tmpl.id} className="border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between bg-white dark:bg-black hover:border-black dark:hover:border-white transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
                                    {tmpl.category || 'General'}
                                </span>
                                {tmpl.type === 'SYSTEM' && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-black text-white dark:bg-white dark:text-black">
                                        SISTEMA
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{tmpl.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{tmpl.description}</p>
                            <div className="mt-4 text-[10px] uppercase tracking-widest text-gray-400">
                                {tmpl.schema?.fields?.length || 0} campos definidos
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-900 flex justify-end gap-2">
                            {tmpl.type !== 'SYSTEM' && (
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(tmpl)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteTemplate(tmpl.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                            {tmpl.type === 'SYSTEM' && (
                                <Button variant="ghost" size="sm" className="uppercase text-[10px]" onClick={() => handleEditTemplate(tmpl)}>
                                    Ver Detalle
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
