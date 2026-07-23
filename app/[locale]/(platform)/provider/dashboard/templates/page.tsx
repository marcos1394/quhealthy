"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  Globe, 
  User, 
  Star, 
  Trash2, 
  Settings, 
  Edit2, 
  Save, 
  PlusCircle, 
  Heart,
  ArrowLeft,
  X,
  Link2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { 
  clinicalTemplateService, 
  ClinicalTemplateResponse, 
  ClinicalTemplateRequest, 
  ClinicalTemplateField 
} from "@/services/clinicalTemplates.service";
import { catalogService } from "@/services/catalog.service";
import { CatalogItemDTO } from "@/types/catalog";
import { useSessionStore } from "@/stores/SessionStore";
import { handleApiError } from "@/lib/handleApiError";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export default function TemplatesExplorerPage() {
  const t = useTranslations("Templates");
  const [activeTab, setActiveTab] = useState<"personal" | "community">("personal");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSessionStore();
  const providerId = user?.id;

  const [personalTemplates, setPersonalTemplates] = useState<ClinicalTemplateResponse[]>([]);
  const [communityTemplates, setCommunityTemplates] = useState<ClinicalTemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [previewTemplate, setPreviewTemplate] = useState<ClinicalTemplateResponse | null>(null);
  
  const [linkServiceModalOpen, setLinkServiceModalOpen] = useState(false);
  const [templateToLink, setTemplateToLink] = useState<ClinicalTemplateResponse | null>(null);
  const [providerServices, setProviderServices] = useState<CatalogItemDTO[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<ClinicalTemplateRequest>({
    name: '',
    description: '',
    type: 'CUSTOM',
    category: 'General',
    schema: { fields: [] }
  });

  useEffect(() => {
    if (providerId) {
      loadTemplates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      if (providerId) {
        const personal = await clinicalTemplateService.getTemplates(providerId);
        setPersonalTemplates(personal.filter(t => !t.isPublic));
      }
      
      const community = await clinicalTemplateService.getCommunityTemplates();
      setCommunityTemplates(community);
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
      providerId: providerId,
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
        toast.success("Plantilla eliminada exitosamente", { theme: "colored" });
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
        toast.success("Plantilla actualizada", { theme: "colored" });
      } else {
        await clinicalTemplateService.createTemplate(currentTemplate);
        toast.success("Plantilla creada", { theme: "colored" });
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

  const handleLike = async (id: number) => {
    try {
      await clinicalTemplateService.likeTemplate(id);
      toast.success("¡Te ha gustado esta plantilla!");
      loadTemplates();
    } catch(err) {
      handleApiError(err, "Error al dar me gusta");
    }
  };

  const handleClone = async (tmpl: ClinicalTemplateResponse) => {
    if (!providerId) return;
    try {
      await clinicalTemplateService.cloneTemplate(tmpl.id, providerId);
      toast.success("Plantilla guardada en tu biblioteca", { theme: "colored" });
      loadTemplates();
      setActiveTab("personal");
    } catch(err) {
      handleApiError(err, "Error al clonar la plantilla");
    }
  };

  const handleOpenLinkModal = async (tmpl: ClinicalTemplateResponse) => {
    setTemplateToLink(tmpl);
    setLinkServiceModalOpen(true);
    try {
      const services = await catalogService.getMyCatalog();
      setProviderServices(services.filter(s => s.type === 'SERVICE'));
    } catch (err) {
      toast.error("Error al cargar servicios");
    }
  };

  const handleLinkService = async () => {
    if (!selectedServiceId || !templateToLink) return;
    try {
      const service = providerServices.find(s => s.id === Number(selectedServiceId));
      if (service && service.id) {
        if (!service.metadata) service.metadata = {};
        service.metadata.clinicalTemplateId = templateToLink.id;
        
        await catalogService.updateItem(service.id, service);
        toast.success(`Plantilla vinculada a ${service.name}`, { theme: "colored" });
        setLinkServiceModalOpen(false);
      }
    } catch (err) {
      handleApiError(err, "Error al vincular plantilla");
    }
  };

  // =========================================================================
  // VISTA 1: CONSTRUCTOR DE FORMULARIO (MODO EDICIÓN/CREACIÓN)
  // =========================================================================
  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-4 md:px-10 pb-16 transition-colors duration-500 font-sans">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Form Builder */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" strokeWidth={2} />
              </button>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">Constructor Visual de Fichas Clínicas</p>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {editingId ? 'Editar Plantilla' : 'Nueva Plantilla'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>Guardar Plantilla</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Panel Izquierdo: Configuración Base */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Configuración Base
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Nombre de la Plantilla
                    </label>
                    <input 
                      type="text"
                      className="w-full h-11 px-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                      value={currentTemplate.name}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                      placeholder="Ej. Ficha de Evaluación Deportiva"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Categoría
                    </label>
                    <input 
                      type="text"
                      className="w-full h-11 px-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                      value={currentTemplate.category}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, category: e.target.value})}
                      placeholder="Ej. Cardiología, General..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Descripción
                    </label>
                    <textarea 
                      rows={3}
                      className="w-full p-3 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                      value={currentTemplate.description}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, description: e.target.value})}
                      placeholder="Breve resumen del propósito clínico..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Derecho: Form Builder */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm min-h-[500px] flex flex-col justify-between">
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Estructura de Campos
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={addField}
                      className="h-9 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" strokeWidth={2} />
                      <span>Añadir Campo</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {currentTemplate.schema?.fields?.length === 0 && (
                      <div className="text-center py-12 text-gray-400 text-xs font-semibold border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8">
                        No hay campos definidos en esta plantilla. Haz clic en "Añadir Campo" para estructurar la evaluación.
                      </div>
                    )}
                    
                    {currentTemplate.schema?.fields?.map((field, index) => (
                      <div key={field.id} className="bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800/80 p-4 rounded-2xl relative group shadow-sm space-y-3">
                        
                        <button 
                          type="button"
                          onClick={() => removeField(index)}
                          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                              Etiqueta / Pregunta
                            </label>
                            <input 
                              type="text"
                              className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                              Tipo de Campo
                            </label>
                            <Select value={field.type} onValueChange={(val: any) => updateField(index, { type: val })}>
                              <SelectTrigger className="w-full h-10 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white shadow-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
                                <SelectItem value="text" className="text-xs font-semibold">Texto Corto</SelectItem>
                                <SelectItem value="textarea" className="text-xs font-semibold">Párrafo Largo</SelectItem>
                                <SelectItem value="number" className="text-xs font-semibold">Número</SelectItem>
                                <SelectItem value="date" className="text-xs font-semibold">Fecha</SelectItem>
                                <SelectItem value="select" className="text-xs font-semibold">Lista Desplegable (Select)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Opciones extra si es select */}
                        {field.type === 'select' && (
                          <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800">
                            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                              Opciones (separadas por coma)
                            </label>
                            <input 
                              type="text"
                              className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                              value={field.options?.join(', ') || ''}
                              onChange={(e) => {
                                const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                updateField(index, { options: opts });
                              }}
                              placeholder="Ej. Apto, No Apto, Evaluación Pendiente"
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
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: EXPLORADOR Y BIBLIOTECA (MODO VISTA DE LISTA/GRID)
  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-4 md:px-10 pb-16 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Estructura & Protocolos Clínicos
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                Explorador de Plantillas
              </h1>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleNewTemplate}
            className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-xs md:text-sm shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Nueva Plantilla</span>
          </button>
        </div>

        {/* Buscador y Control de Pestañas */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white dark:bg-[#0a0a0a] p-3 md:p-4 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
          
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, especialidad o concepto..."
              className="w-full h-11 pl-10 pr-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selector de Pestañas Pill */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800/50 p-1 rounded-2xl shrink-0">
            <button 
              type="button"
              onClick={() => setActiveTab("personal")}
              className={cn(
                "h-9 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all",
                activeTab === "personal"
                  ? "bg-white text-emerald-700 dark:bg-[#0a0a0a] dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <User className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>Mis Plantillas</span>
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("community")}
              className={cn(
                "h-9 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all",
                activeTab === "community"
                  ? "bg-white text-emerald-700 dark:bg-[#0a0a0a] dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <Globe className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
              <span>Comunidad</span>
            </button>
          </div>

        </div>

        {/* Contenido Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] gap-4 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
            <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-semibold text-gray-500 animate-pulse">Cargando biblioteca de plantillas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "personal" ? (
              
              // Plantillas Personales
              personalTemplates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tmpl => (
                <div 
                  key={tmpl.id} 
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 shadow-sm">
                        {tmpl.category || 'General'}
                      </span>
                      {tmpl.type === 'SYSTEM' && (
                        <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg border border-gray-200 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 shadow-sm">
                          Sistema
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {tmpl.name}
                    </h3>

                    <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                      {tmpl.description || 'Sin descripción asignada.'}
                    </p>

                    <div className="text-[11px] font-semibold text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                      {tmpl.schema?.fields?.length || 0} campos estructurados
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    {tmpl.type !== 'SYSTEM' ? (
                      <div className="flex items-center w-full gap-2">
                        <button 
                          type="button"
                          onClick={() => handleOpenLinkModal(tmpl)}
                          className="flex-1 h-9 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm truncate flex items-center justify-center gap-1.5"
                        >
                          <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
                          <span className="truncate">Vincular Servicio</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleEditTemplate(tmpl)}
                          className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors flex items-center justify-center shrink-0 shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={2} />
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          className="w-9 h-9 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setPreviewTemplate(tmpl)}
                        className="w-full h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
                      >
                        Ver Detalle
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              
              // Plantillas de Comunidad
              communityTemplates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tmpl => (
                <div 
                  key={tmpl.id} 
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg border border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40 shadow-sm">
                        {tmpl.category || tmpl.type}
                      </span>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => handleLike(tmpl.id)}
                          className="flex items-center gap-1 text-red-500 hover:scale-105 transition-transform"
                        >
                          <Heart className="w-4 h-4 fill-current" strokeWidth={2} />
                          <span className="text-xs font-bold">{tmpl.likes || 0}</span>
                        </button>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
                          <span className="text-xs font-bold">{tmpl.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {tmpl.name}
                    </h3>

                    <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                      {tmpl.description || 'Sin descripción provista por el autor.'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80 text-[11px] font-semibold text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{tmpl.authorName || (tmpl.type === 'SYSTEM' ? 'Sistema QuHealthy' : 'Anónimo')}</span>
                      </span>
                      <span>{tmpl.schema?.fields?.length || 0} campos</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setPreviewTemplate(tmpl)}
                      className="w-1/3 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
                    >
                      Detalle
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleClone(tmpl)}
                      className="w-2/3 h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Usar Plantilla</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- MODAL VISTA PREVIA --- */}
        <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            
            <div className="flex items-center justify-between p-6 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {previewTemplate?.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-gray-500">
                    {previewTemplate?.description || "Vista previa de estructura clínica"}
                  </DialogDescription>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setPreviewTemplate(null)} 
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-[#050505] custom-scrollbar">
              {previewTemplate?.schema?.fields?.map((field) => (
                <div key={field.id} className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea disabled className="w-full h-16 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 text-xs text-gray-400 resize-none" />
                  ) : field.type === 'select' ? (
                    <div className="w-full h-10 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 flex items-center text-xs text-gray-400">
                      Seleccionar opción...
                    </div>
                  ) : (
                    <input disabled type={field.type} className="w-full h-10 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 text-xs text-gray-400" />
                  )}
                </div>
              ))}
            </div>

          </DialogContent>
        </Dialog>

        {/* --- MODAL VINCULACIÓN A SERVICIO --- */}
        <Dialog open={linkServiceModalOpen} onOpenChange={setLinkServiceModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between p-6 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    Vincular a Servicio
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-gray-500">
                    Asocia esta plantilla a una prestación activa de tu catálogo.
                  </DialogDescription>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setLinkServiceModalOpen(false)} 
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 bg-white dark:bg-[#0a0a0a] space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Servicios Disponibles en Catálogo
                </label>
                <Select value={selectedServiceId.toString()} onValueChange={(val: any) => setSelectedServiceId(Number(val))}>
                  <SelectTrigger className="w-full h-11 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                    <SelectValue placeholder="Selecciona un servicio..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl">
                    {providerServices.map(s => s.id ? (
                      <SelectItem key={s.id} value={s.id.toString()} className="text-xs font-semibold">{s.name}</SelectItem>
                    ) : null)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setLinkServiceModalOpen(false)}
                className="h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleLinkService}
                disabled={!selectedServiceId}
                className="h-10 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span>Vincular</span>
              </button>
            </div>

          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}