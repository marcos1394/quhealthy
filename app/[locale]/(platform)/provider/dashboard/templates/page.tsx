"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, Filter, FileText, Share2, Globe, User, Clock, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clinicalTemplateService, ClinicalTemplateResponse } from "@/services/clinicalTemplates.service";
import { useSessionStore } from "@/store/useSessionStore";
import { format } from "date-fns";

export default function TemplatesExplorerPage() {
  const t = useTranslations("Templates");
  const [activeTab, setActiveTab] = useState<"personal" | "community">("personal");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSessionStore();
  const providerId = user?.id; // Usamos el ID del provider (el user logueado)

  const [personalTemplates, setPersonalTemplates] = useState<ClinicalTemplateResponse[]>([]);
  const [communityTemplates, setCommunityTemplates] = useState<ClinicalTemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        if (providerId) {
          const personal = await clinicalTemplateService.getTemplates(providerId);
          setPersonalTemplates(personal.filter(t => !t.isPublic)); // Mis plantillas privadas
        }
        
        const community = await clinicalTemplateService.getCommunityTemplates();
        setCommunityTemplates(community);
      } catch (error) {
        console.error("Error fetching templates", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, [providerId]);

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
          <Button className="rounded-none bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-0">
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
              // Lista de Plantillas Personales
              personalTemplates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tpl => (
                <div key={tpl.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] group hover:border-black dark:hover:border-white transition-all flex flex-col h-full cursor-pointer">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        {tpl.category || tpl.type}
                      </span>
                      <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <Share2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight mb-2 leading-tight">
                      {tpl.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                      <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Modificado: {tpl.updatedAt ? format(new Date(tpl.updatedAt), 'yyyy-MM-dd') : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#050505] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-800 rounded-none px-4">
                      <Edit className="w-3.5 h-3.5 mr-2" strokeWidth={1.5}/> Editar
                    </Button>
                    <Button variant="ghost" className="h-8 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 rounded-none px-4">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5}/>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Lista de Plantillas de Comunidad
              communityTemplates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(tpl => (
                <div key={tpl.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] group hover:border-black dark:hover:border-white transition-all flex flex-col h-full cursor-pointer">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400 text-[9px] font-bold uppercase tracking-widest px-2 py-1 border border-blue-200 dark:border-blue-800">
                        {tpl.category || tpl.type}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                        <span className="text-xs font-bold">{tpl.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight mb-2 leading-tight">
                      {tpl.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                      <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{tpl.authorName || 'Anónimo'}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">
                      {tpl.downloads || 0} descargas
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#050505] flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="h-8 text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-none px-4 border-0">
                      Guardar en Mi Biblioteca
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
