"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, Filter, FileText, Share2, Globe, User, Clock, Star, Edit, Trash2, Settings, Edit2, Save, PlusCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { clinicalTemplateService, ClinicalTemplateResponse, ClinicalTemplateRequest, ClinicalTemplateField, ClinicalTemplateSchema } from "@/services/clinicalTemplates.service";
import { catalogService } from "@/services/catalog.service";
import { CatalogItemDTO } from "@/types/catalog";
import { useSessionStore } from "@/stores/SessionStore";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { handleApiError } from "@/lib/handleApiError";

export default function TemplatesExplorerPage() {
  const t = useTranslations("Templates");
  const [activeTab, setActiveTab] = useState<"personal" | "community">("personal");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSessionStore();
  const providerId = user?.id; // Usamos el ID del provider (el user logueado)

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
        setPersonalTemplates(personal.filter(t => !t.isPublic)); // Mis plantillas privadas
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
      toast.success("Plantilla guardada en tu biblioteca");
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
      if (service) {
        if (!service.metadata) service.metadata = {};
        service.metadata.clinicalTemplateId = templateToLink.id;
        
        await catalogService.updateItem(service.id, service);
        toast.success(`Plantilla vinculada a ${service.name}`);
        setLinkServiceModalOpen(false);
      }
    } catch (err) {
      handleApiError(err, "Error al vincular plantilla");
    }
  };

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pb-24 font-sans">
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
              <div className="bg-white dark:bg-[#0a0a0a] p-6 border border-gray-200 dark:border-gray-800">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center text-black dark:text-white">
                  <Settings className="w-4 h-4 mr-2" /> Configuración Base
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Nombre de Plantilla</label>
                    <Input 
                      className="rounded-none border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus-visible:ring-black dark:focus-visible:ring-white"
                      value={currentTemplate.name}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                      placeholder="Ej: Ficha de Deportistas"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Categoría</label>
                    <Input 
                      className="rounded-none border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus-visible:ring-black dark:focus-visible:ring-white"
                      value={currentTemplate.category}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Descripción</label>
                    <Input 
                      className="rounded-none border-gray-300 dark:border-gray-700 bg-white dark:bg-black focus-visible:ring-black dark:focus-visible:ring-white"
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
                  <h3 className="text-sm font-bold uppercase tracking-widest flex items-center text-black dark:text-white">
                    <FileText className="w-5 h-5 mr-2" /> Constructor de Formulario
                  </h3>
                  <Button onClick={addField} variant="outline" className="rounded-none border-black dark:border-white text-black dark:text-white uppercase text-[10px] h-8">
                    <PlusCircle className="w-3 h-3 mr-2" /> Añadir Campo
                  </Button>
                </div>

                <div className="space-y-4">
                  {currentTemplate.schema?.fields?.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-xs uppercase tracking-widest border border-dashed border-gray-300 dark:border-gray-700">
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
                            className="rounded-none h-8 text-xs bg-white dark:bg-black border-gray-200 dark:border-gray-800 focus-visible:ring-black dark:focus-visible:ring-white"
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Tipo de Campo</label>
                          <Select value={field.type} onValueChange={(val: any) => updateField(index, { type: val })}>
                            <SelectTrigger className="rounded-none h-8 text-xs bg-white dark:bg-black border-gray-200 dark:border-gray-800">
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
                            className="rounded-none h-8 text-xs bg-white dark:bg-black border-gray-200 dark:border-gray-800 focus-visible:ring-black dark:focus-visible:ring-white"
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pb-24 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase">
              Explorador de Plantillas
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2 max-w-xl">
              Gestiona tus plantillas clínicas personales o descubre protocolos compartidos por la comunidad médica de Quhealthy.
            </p>
          </div>
          <Button 
            onClick={handleNewTemplate}
            className="rounded-none bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-0"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} /> Nueva Plantilla
          </Button>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col lg:flex-row gap-4 items-center bg-white dark:bg-[#0a0a0a] p-4 border border-gray-200 dark:border-gray-800">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
            <input 
              type="text" 
              placeholder="Buscar plantillas por nombre, especialidad o tipo..."
              className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all text-black dark:text-white placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full lg:w-auto rounded-none border border-gray-200 dark:border-gray-800 h-12 text-[10px] font-bold uppercase tracking-widest px-6 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} /> Filtros
          </Button>
        </div>

        {/* Pestañas */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab("personal")}
            className={`px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "personal" 
              ? "border-b-2 border-black text-black dark:border-white dark:text-white" 
              : "text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" strokeWidth={1.5} /> Mis Plantillas
            </span>
          </button>
          <button 
            onClick={() => setActiveTab("community")}
            className={`px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === "community" 
              ? "border-b-2 border-black text-black dark:border-white dark:text-white" 
              : "text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" strokeWidth={1.5} /> Comunidad
            </span>
          </button>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "personal" ? (
              // Lista de Plantillas Personales usando el nuevo diseño de tarjetas
              personalTemplates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tmpl => (
                <div key={tmpl.id} className="border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-colors">
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
                    <h3 className="font-bold text-lg mb-2 text-black dark:text-white leading-tight">{tmpl.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{tmpl.description || 'Sin descripción'}</p>
                    <div className="mt-4 text-[10px] uppercase tracking-widest text-gray-400">
                      {tmpl.schema?.fields?.length || 0} campos definidos
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-900 flex justify-end gap-2">
                    {tmpl.type !== 'SYSTEM' && (
                      <div className="flex w-full gap-2">
                        <Button variant="ghost" size="sm" className="uppercase text-[10px] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none w-full border border-gray-200 dark:border-gray-800" onClick={() => handleOpenLinkModal(tmpl)}>
                          Vincular a Servicio
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white rounded-none border border-gray-200 dark:border-gray-800" onClick={() => handleEditTemplate(tmpl)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none border border-gray-200 dark:border-gray-800" onClick={() => handleDeleteTemplate(tmpl.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {tmpl.type === 'SYSTEM' && (
                      <Button variant="ghost" size="sm" className="uppercase text-[10px] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-800" onClick={() => setPreviewTemplate(tmpl)}>
                        Ver Detalle
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // Lista de Plantillas de Comunidad
              communityTemplates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tmpl => (
                <div key={tmpl.id} className="border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 text-[9px] font-bold uppercase tracking-widest px-2 py-1 border border-blue-200 dark:border-blue-800">
                        {tmpl.category || tmpl.type}
                      </span>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-red-500 cursor-pointer" onClick={() => handleLike(tmpl.id)}>
                          <Heart className="w-4 h-4 fill-current" strokeWidth={1.5} />
                          <span className="text-xs font-bold">{tmpl.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                          <span className="text-xs font-bold">{tmpl.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-black dark:text-white leading-tight">{tmpl.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{tmpl.description || 'Sin descripción'}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                      <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{tmpl.authorName || (tmpl.type === 'SYSTEM' ? 'Sistema QuHealthy' : 'Anónimo')}</span>
                    </div>
                    <div className="mt-4 text-[10px] uppercase tracking-widest text-gray-400">
                      {tmpl.schema?.fields?.length || 0} campos definidos • {tmpl.downloads || 0} descargas
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-900 flex justify-end">
                    {tmpl.type === 'SYSTEM' ? (
                        <Button variant="ghost" size="sm" className="uppercase text-[10px] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none border border-gray-200 dark:border-gray-800 w-full" onClick={() => setPreviewTemplate(tmpl)}>
                          Ver Detalle
                        </Button>
                    ) : (
                        <div className="flex w-full gap-2">
                          <Button variant="ghost" size="sm" className="uppercase text-[10px] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none w-1/3 border border-gray-200 dark:border-gray-800" onClick={() => setPreviewTemplate(tmpl)}>
                            Ver Detalle
                          </Button>
                          <Button className="h-8 text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none px-4 border-0 w-2/3" onClick={() => handleClone(tmpl)}>
                            Guardar en Mi Biblioteca
                          </Button>
                        </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal de Vista Previa */}
        <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-none border-black dark:border-white">
            <DialogHeader>
              <DialogTitle className="text-xl uppercase tracking-widest">{previewTemplate?.name}</DialogTitle>
              <DialogDescription className="text-xs uppercase tracking-widest">{previewTemplate?.description}</DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-4">
              {previewTemplate?.schema?.fields?.map((field) => (
                <div key={field.id} className="border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#0a0a0a]">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                     <textarea disabled className="w-full h-20 bg-white dark:bg-black border-gray-200 dark:border-gray-800 p-2 text-xs" />
                  ) : field.type === 'select' ? (
                     <Select disabled>
                        <SelectTrigger className="rounded-none h-8 text-xs bg-white dark:bg-black border-gray-200 dark:border-gray-800"><SelectValue placeholder="Seleccionar opción..." /></SelectTrigger>
                     </Select>
                  ) : (
                     <Input disabled type={field.type} className="rounded-none h-8 text-xs bg-white dark:bg-black border-gray-200 dark:border-gray-800" />
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Vinculación */}
        <Dialog open={linkServiceModalOpen} onOpenChange={setLinkServiceModalOpen}>
          <DialogContent className="rounded-none border-black dark:border-white">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-widest">Vincular a Servicio</DialogTitle>
              <DialogDescription className="text-xs">Selecciona un servicio para usar esta plantilla por defecto en la consulta.</DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">Servicios disponibles</label>
              <Select value={selectedServiceId.toString()} onValueChange={(val: any) => setSelectedServiceId(Number(val))}>
                <SelectTrigger className="rounded-none h-10 bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="Elige un servicio..." />
                </SelectTrigger>
                <SelectContent>
                  {providerServices.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
               <Button variant="outline" className="rounded-none uppercase text-[10px] h-10" onClick={() => setLinkServiceModalOpen(false)}>Cancelar</Button>
               <Button className="rounded-none uppercase text-[10px] h-10 bg-black text-white dark:bg-white dark:text-black" onClick={handleLinkService}>Vincular</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
