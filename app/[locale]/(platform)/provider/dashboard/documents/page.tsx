"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { FileText, CheckCircle2, Clock, ShieldAlert, LayoutGrid, List } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatBlock } from "@/components/dashboard/documents/StatBlock";
import { DocumentUpload } from "@/components/dashboard/documents/DocumentUpload";
import { Document, DocumentGrid, DocumentList } from "@/components/dashboard/documents/DocumentCard";
import { DocumentDetailModal } from "@/components/dashboard/documents/DocumentDetailModal";
import { useTranslations } from "next-intl";

// Mock Data
const mockDocuments: Document[] = [
  { id: 1, name: "Cédula Profesional.pdf", type: "pdf", url: "#", status: "verified", uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString(), size: "1.2 MB" },
  { id: 2, name: "Diploma Especialidad.jpg", type: "jpg", url: "#", status: "pending", uploadedAt: new Date().toISOString(), size: "3.5 MB" },
  { id: 3, name: "Certificado Vencido.pdf", type: "pdf", url: "#", status: "rejected", uploadedAt: new Date(Date.now() - 86400000 * 100).toISOString(), size: "0.8 MB" }
];

export default function DocumentsManagerPage() {
    const [{ documents, selectedFile, uploadProgress, isUploading, activeTab, viewMode, selectedDoc }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_DOCUMENTS': return { ...state, documents: typeof action.payload === 'function' ? action.payload(state.documents) : action.payload };
      case 'SET_SELECTEDFILE': return { ...state, selectedFile: typeof action.payload === 'function' ? action.payload(state.selectedFile) : action.payload };
      case 'SET_UPLOADPROGRESS': return { ...state, uploadProgress: typeof action.payload === 'function' ? action.payload(state.uploadProgress) : action.payload };
      case 'SET_ISUPLOADING': return { ...state, isUploading: typeof action.payload === 'function' ? action.payload(state.isUploading) : action.payload };
      case 'SET_ACTIVETAB': return { ...state, activeTab: typeof action.payload === 'function' ? action.payload(state.activeTab) : action.payload };
      case 'SET_VIEWMODE': return { ...state, viewMode: typeof action.payload === 'function' ? action.payload(state.viewMode) : action.payload };
      case 'SET_SELECTEDDOC': return { ...state, selectedDoc: typeof action.payload === 'function' ? action.payload(state.selectedDoc) : action.payload };
          default: return state;
        }
      },
      {
        documents: [], selectedFile: null, uploadProgress: 0, isUploading: false, activeTab: "all", viewMode: "grid", selectedDoc: null
      }
    );

    const setDocuments = (val: any) => dispatch({ type: 'SET_DOCUMENTS', payload: val });
    const setSelectedFile = (val: any) => dispatch({ type: 'SET_SELECTEDFILE', payload: val });
    const setUploadProgress = (val: any) => dispatch({ type: 'SET_UPLOADPROGRESS', payload: val });
    const setIsUploading = (val: any) => dispatch({ type: 'SET_ISUPLOADING', payload: val });
    const setActiveTab = (val: any) => dispatch({ type: 'SET_ACTIVETAB', payload: val });
    const setViewMode = (val: any) => dispatch({ type: 'SET_VIEWMODE', payload: val });
    const setSelectedDoc = (val: any) => dispatch({ type: 'SET_SELECTEDDOC', payload: val });







  const t = useTranslations('DashboardDocuments');

  useEffect(() => { setDocuments(mockDocuments); }, []);

  const handleFileUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true); setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev: any) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: Document = { id: Date.now(), name: selectedFile.name, type: selectedFile.name.split(".").pop() || "file", url: "#", status: "pending", uploadedAt: new Date().toISOString(), size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` };
            setDocuments((p: any) => [newDoc, ...p]); setIsUploading(false); setSelectedFile(null);
            toast.success(t('upload.uploaded_success', { defaultValue: 'DOCUMENTO PROCESADO Y ALMACENADO.' }));
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDelete = (id: number) => { setDocuments((p: any) => p.filter((d: any) => d.id !== id)); setSelectedDoc(null); toast.success(t('deleted_toast', { defaultValue: 'REGISTRO ELIMINADO DEL SISTEMA.' })); };
  const handleDownload = (doc: Document) => { toast.info(t('downloading', { name: doc.name, defaultValue: `EXTRAYENDO: ${doc.name}` })); };

  const filteredDocuments = useMemo(() => {
    if (activeTab === "all") return documents;
    return documents.filter((doc: any) => doc.status === activeTab);
  }, [documents, activeTab]);

  return (
    <div className="space-y-12 pb-16 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300 bg-gray-50 dark:bg-[#050505] min-h-screen pt-8">
      
      <div className="max-w-7xl mx-auto space-y-12 px-6 md:px-10">
        
        {/* HEADER ARQUITECTÓNICO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Gestión Operativa
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                {t('title', { defaultValue: 'AUDITORÍA DOCUMENTAL' })}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t('subtitle', { defaultValue: 'SISTEMA DE ALMACENAMIENTO Y VERIFICACIÓN DE CREDENCIALES.' })}
              </p>
            </div>
          </div>
        </div>

        {/* MÉTRICAS (GRID BLUEPRINT) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
          <div className="border-b border-r border-black/20 dark:border-white/20">
            <StatBlock 
              label={t('stats.total', { defaultValue: 'DOCUMENTOS TOTALES' })} 
              value={documents.length} 
              icon={<FileText className="w-4 h-4" strokeWidth={1.5} />} 
            />
          </div>
          <div className="border-b border-r border-black/20 dark:border-white/20">
            <StatBlock 
              label={t('stats.verified', { defaultValue: 'VERIFICADOS' })} 
              value={documents.filter((d: any) => d.status === "verified").length} 
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />} 
              trend={t('stats.active', { defaultValue: 'ACTIVO' })} 
            />
          </div>
          <div className="border-b border-r border-black/20 dark:border-white/20">
            <StatBlock 
              label={t('stats.pending', { defaultValue: 'EN REVISIÓN' })} 
              value={documents.filter((d: any) => d.status === "pending").length} 
              icon={<Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />} 
              trend={t('stats.in_review', { defaultValue: 'AUDITANDO' })} 
            />
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL: DOS COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* UPLOAD COLUMN */}
          <div className="lg:col-span-1 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none transition-colors">
            <div className="p-6 border-b border-black/10 dark:border-white/10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-1">
                {t('upload.title', { defaultValue: 'NUEVO REGISTRO' })}
              </h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                {t('upload.subtitle', { defaultValue: 'INGRESE ARCHIVOS AL SISTEMA' })}
              </p>
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-[#050505]">
              <DocumentUpload 
                selectedFile={selectedFile} 
                uploadProgress={uploadProgress} 
                isUploading={isUploading}
                onFileSelect={setSelectedFile} 
                onFileUpload={handleFileUpload} 
                onClear={() => setSelectedFile(null)} 
              />
            </div>
          </div>

          {/* DOCUMENTS LIST COLUMN */}
          <div className="lg:col-span-2 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] min-h-[500px] flex flex-col rounded-none transition-colors">
            
            {/* Header y Filtros (Pestañas) */}
            <div className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex flex-col">
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-1">
                    {t('files_title', { defaultValue: 'EXPEDIENTES ALMACENADOS' })}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    SISTEMA DE GESTIÓN Y RECUPERACIÓN
                  </p>
                </div>
                
                {/* Controles de Vista (Grid/List) */}
                <div className="flex gap-0 border border-black/20 dark:border-white/20 shrink-0">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center border-r border-black/20 dark:border-white/20 transition-colors",
                      viewMode === 'grid' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-50 dark:bg-[#050505] text-gray-500 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center transition-colors",
                      viewMode === 'list' ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-50 dark:bg-[#050505] text-gray-500 hover:text-black dark:hover:text-white"
                    )}
                  >
                    <List className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* TABS ESTRUCTURALES */}
              <div className="flex overflow-x-auto custom-scrollbar bg-gray-50 dark:bg-[#050505]">
                {[
                  { id: 'all', label: t('tabs.all', { defaultValue: 'TODOS' }) },
                  { id: 'verified', label: t('tabs.verified', { defaultValue: 'VERIFICADOS' }) },
                  { id: 'pending', label: t('tabs.pending', { defaultValue: 'EN REVISIÓN' }) },
                  { id: 'rejected', label: t('tabs.rejected', { defaultValue: 'RECHAZADOS' }) }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-6 h-12 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest border-r border-black/10 dark:border-white/10 transition-colors whitespace-nowrap",
                      activeTab === tab.id 
                        ? "bg-black text-white dark:bg-white dark:text-black" 
                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111] hover:text-black dark:hover:text-white"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CONTENIDO (Grid o Lista) */}
            <div className="flex-1 bg-gray-50 dark:bg-[#050505] overflow-y-auto custom-scrollbar min-h-[400px]">
              <AnimatePresence mode="wait">
                {filteredDocuments.length > 0 ? (
                  viewMode === 'grid' ? (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <DocumentGrid documents={filteredDocuments} onSelect={setSelectedDoc} onDownload={handleDownload} onPreview={setSelectedDoc} />
                    </motion.div>
                  ) : (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <DocumentList documents={filteredDocuments} onSelect={setSelectedDoc} />
                    </motion.div>
                  )
                ) : (
                  <motion.div 
                    key="empty" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex flex-col items-center justify-center p-16 text-center h-full min-h-[400px]"
                  >
                    <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6">
                      <ShieldAlert className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                      REGISTRO VACÍO
                    </h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs mx-auto leading-relaxed">
                      {t('empty', { defaultValue: 'NO EXISTEN DOCUMENTOS COINCIDENTES CON LOS CRITERIOS SELECCIONADOS.' })}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>

      <DocumentDetailModal doc={selectedDoc} isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} onDelete={handleDelete} onDownload={handleDownload} />
    </div>
  );
}