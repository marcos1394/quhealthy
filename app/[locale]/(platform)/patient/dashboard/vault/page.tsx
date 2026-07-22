"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FolderOpen, FileText, Syringe, Search, BrainCircuit, AlertTriangle, Pill, ChevronRight, Home, Plus } from 'lucide-react';

// Hooks & Components
import { useHealthVault } from '@/hooks/useHealthVault';
import { HealthVaultDropzone } from '@/components/vault/HealthVaultDropzone';
import { HealthVaultDocumentCard } from '@/components/vault/HealthVaultDocumentCard';
import { HealthVaultFolderCard } from '@/components/vault/HealthVaultFolderCard';
import { DigitalVaccinationCard } from '@/components/vault/DigitalVaccinationCard';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';
import { useFamily } from '@/hooks/useFamily';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableFolderWrapper({ id, motionProps, cardProps }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : 'auto', position: 'relative' as any };
  return (
    <div ref={setNodeRef} style={style}>
      <motion.div {...motionProps} layout={false}>
        <HealthVaultFolderCard
          {...cardProps}
          setDragHandleRef={setActivatorNodeRef}
          dragHandleAttributes={attributes}
          dragHandleListeners={listeners}
        />
      </motion.div>
    </div>
  );
}

function SortableDocumentWrapper({ id, motionProps, cardProps }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : 'auto', position: 'relative' as any };
  return (
    <div ref={setNodeRef} style={style}>
      <motion.div {...motionProps} layout={false}>
        <HealthVaultDocumentCard
          {...cardProps}
          setDragHandleRef={setActivatorNodeRef}
          dragHandleAttributes={attributes}
          dragHandleListeners={listeners}
        />
      </motion.div>
    </div>
  );
}


export default function PatientVaultPage() {
 const t = useTranslations('HealthVault');
 const {
 documents,
 folders,
 isLoading,
 isUploading,
 fetchDocuments,
 uploadDocument,
 createNote,
 viewDocument,
 updateDocument,
 generatePanorama,
 deleteDocument,
 createFolder,
 renameFolder,
 deleteFolder,
 reorderFolders,
 reorderDocuments,
 getLatestPanorama,
 getPanoramaHistory
 } = useHealthVault();

 const { family } = useFamily();

  const [activeTab, setActiveTab] = useState<string>('titular');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

 const [panoramaData, setPanoramaData] = useState<{ [key: string]: { clinicalSummary: string; careRecommendations: string[], createdAt?: string } | null }>({});
 const [isGeneratingPanorama, setIsGeneratingPanorama] = useState(false);
 const [isHistoryOpen, setIsHistoryOpen] = useState(false);
 const [panoramaHistory, setPanoramaHistory] = useState<any[]>([]);
 const [isLoadingHistory, setIsLoadingHistory] = useState(false);

 // Cargar los documentos al montar la página
 useEffect(() => {
 fetchDocuments();
 }, [fetchDocuments]);

 // Cargar el último panorama al cambiar de tab
 useEffect(() => {
    const fetchLatest = async () => {
        const dependentId = activeTab === 'titular' ? undefined : Number(activeTab);
        const latest = await getLatestPanorama(dependentId);
        if (latest) {
            setPanoramaData(prev => ({ ...prev, [activeTab]: latest }));
        }
    };
    if (!panoramaData[activeTab]) {
        fetchLatest();
    }
 }, [activeTab, getLatestPanorama, panoramaData]);

 // Cargar el historial cuando se abre el modal
 useEffect(() => {
    if (isHistoryOpen) {
        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            const dependentId = activeTab === 'titular' ? undefined : Number(activeTab);
            const history = await getPanoramaHistory(dependentId);
            setPanoramaHistory(history || []);
            setIsLoadingHistory(false);
        };
        fetchHistory();
    }
 }, [isHistoryOpen, activeTab, getPanoramaHistory]);

  // Reset path on tab change
  useEffect(() => {
    setCurrentFolderId(null);
  }, [activeTab]);

  // Manejador de soltar documento en miga de pan o en carpeta
  const handleDropDocument = async (documentId: string, targetFolderId: string | null) => {
    if (documentId) {
      if (targetFolderId) {
        await updateDocument(documentId, { folderId: targetFolderId });
      } else {
        await updateDocument(documentId, { clearFolder: true } as any);
      }
    }
  };

  const handleDropFolder = async (draggedFolderId: string, targetFolderId: string | null) => {
    // Mover carpeta (requeriría endpoint en backend para cambiar parentFolderId, por ahora no implementado o se puede hacer con renameFolder si actualizamos el DTO)
    // omitiendo por ahora la complejidad de Drag&Drop de carpetas a nivel anidado
  };

  // Crear carpeta
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName, currentFolderId || undefined, activeDependentId);
    setIsNewFolderOpen(false);
    setNewFolderName('');
  };

  // Filtrar documentos y carpetas según paciente, búsqueda y ruta
  const { visibleDocuments, visibleFolders } = useMemo(() => {
    const dependentId = activeTab === 'titular' ? null : Number(activeTab);
    
    const memberDocs = documents.filter(doc => {
      if (dependentId === null) return doc.dependentId == null;
      return doc.dependentId === dependentId;
    });

    const memberFolders = folders.filter(folder => {
      if (dependentId === null) return folder.dependentId == null;
      return folder.dependentId === dependentId;
    });

    if (searchQuery) {
      // Búsqueda Profunda (Aplanada)
      const searchLower = searchQuery.toLowerCase();
      const filteredDocs = memberDocs.filter(doc => {
        if (doc.title?.toLowerCase().includes(searchLower)) return true;
        if (doc.fileName?.toLowerCase().includes(searchLower)) return true;
        if (doc.noteContent?.toLowerCase().includes(searchLower)) return true;
        
        const ai = doc.aiExtractedData as any;
        if (ai) {
          if (ai.summary?.toLowerCase().includes(searchLower)) return true;
          if (ai.medicalConditions?.some((c: string) => c.toLowerCase().includes(searchLower))) return true;
          if (ai.medications?.some((m: string) => m.toLowerCase().includes(searchLower))) return true;
        }
        return false;
      });

      const filteredFolders = memberFolders.filter(folder => 
        folder.name.toLowerCase().includes(searchLower)
      ).map(f => ({
        id: f.id,
        name: f.name,
        path: f.id,
        count: documents.filter(d => d.folderId === f.id).length
      }));

      return { visibleDocuments: filteredDocs, visibleFolders: filteredFolders };
    }

    // Navegación por IDs de Carpeta
    const exactDocs = memberDocs.filter(doc => {
      if (currentFolderId === null) {
        return doc.folderId == null;
      } else {
        return doc.folderId === currentFolderId;
      }
    });

    const exactFolders = memberFolders.filter(folder => {
      if (currentFolderId === null) {
        return folder.parentFolderId == null;
      } else {
        return folder.parentFolderId === currentFolderId;
      }
    }).map(f => ({
      id: f.id,
      name: f.name,
      path: f.id,
      count: documents.filter(d => d.folderId === f.id).length
    }));

    return { 
      visibleDocuments: exactDocs, 
      visibleFolders: exactFolders
    };
  }, [documents, folders, activeTab, searchQuery, currentFolderId]);

 const activeDependentId = activeTab === 'titular' ? undefined : Number(activeTab);

 const activeDependent = useMemo(() => {
 if (!family || activeDependentId === undefined) return undefined;
 return family.find(m => m.id === activeDependentId);
 }, [family, activeDependentId]);

 const activeDependentAge = useMemo(() => {
 if (!activeDependent?.dateOfBirth) return undefined;
 const dob = new Date(activeDependent.dateOfBirth);
 const diff_ms = Date.now() - dob.getTime();
 const age_dt = new Date(diff_ms); 
 return Math.abs(age_dt.getUTCFullYear() - 1970);
 }, [activeDependent]);

 const showVaccinationCard = activeDependentId !== undefined && activeDependentAge !== undefined && activeDependentAge <= 12;

 // Helper to build breadcrumb path
 const breadcrumbs = useMemo(() => {
   const path: { id: string, name: string }[] = [];
   let curr = currentFolderId;
   while (curr) {
     const f = folders.find(f => f.id === curr);
     if (f) {
       path.unshift({ id: f.id, name: f.name });
       curr = f.parentFolderId || null;
     } else {
       break;
     }
   }
   return path;
 }, [currentFolderId, folders]);

 // Manejar generación del panorama
  const handleGeneratePanorama = async () => {
  const dependentId = activeTab === 'titular' ? undefined : Number(activeTab);
  setIsGeneratingPanorama(true);
  try {
  const result = await generatePanorama(dependentId);
  if (result) {
  setPanoramaData(prev => ({
  ...prev,
  [activeTab]: result
  }));
  }
  } finally {
  setIsGeneratingPanorama(false);
  }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFolderDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = visibleFolders.findIndex(f => f.id === active.id);
      const newIndex = visibleFolders.findIndex(f => f.id === over.id);
      const newFolders = arrayMove(visibleFolders, oldIndex, newIndex);
      
      const payload = newFolders.map((f, idx) => ({ id: f.id, displayOrder: idx }));
      reorderFolders(payload);
    }
  };

  const handleDocumentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = visibleDocuments.findIndex(d => d.id === active.id);
      const newIndex = visibleDocuments.findIndex(d => d.id === over.id);
      const newDocs = arrayMove(visibleDocuments, oldIndex, newIndex);
      
      const payload = newDocs.map((d, idx) => ({ id: d.id, displayOrder: idx }));
      reorderDocuments(payload);
    }
  };

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12"
 >
 {/* --- CABECERA EDITORIAL --- */}
 <div className="flex flex-col md:flex-row md:items-center gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
 <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
 <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
 </div>
 <div>
 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
 {t('title', { defaultValue: 'Expediente Clínico' })}
 </h1>
 <p className="text-gray-500 dark:text-gray-400 mt-2 text-base font-medium max-w-2xl">
 {t('subtitle', { defaultValue: 'Tu bóveda de salud encriptada para toda la familia. Sube estudios o recetas y nuestra IA extraerá los datos automáticamente.' })}
 </p>
 </div>
 </div>

 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
 <TabsList className="flex overflow-x-auto bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl h-14 w-full justify-start p-1 hide-scrollbar gap-1 mb-8">
 <TabsTrigger 
 value="titular"
 className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-[#111111] dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm border-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all text-sm font-semibold px-6 h-full"
 >
 Mi Expediente
 </TabsTrigger>
 {family?.map(member => (
 <TabsTrigger 
 key={member.id}
 value={member.id.toString()}
 className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-[#111111] dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm border-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all text-sm font-semibold px-6 h-full whitespace-nowrap"
 >
 {member.firstName}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value={activeTab} className="space-y-12">
 
 {/* --- ZONA DE SUBIDA (DROPZONE) --- */}
 <section>
 <HealthVaultDropzone
 onUpload={(file, title) => uploadDocument(file, title, 'GENERAL', activeDependentId, currentFolderId || undefined)}
 onCreateNote={(title, content) => createNote(title, content, activeDependentId, currentFolderId || undefined)}
 isUploading={isUploading}
 />
 </section>

 {/* --- RESUMEN DE IA (HEALTH SUMMARY) --- */}
 <section className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 space-y-4">
 <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 gap-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center shrink-0">
 <BrainCircuit className="w-6 h-6 text-teal-600 dark:text-teal-400" strokeWidth={2} />
 </div>
 <div>
 <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
 Panorama Clínico Inteligente
 </h2>
 <p className="text-sm text-gray-500 font-medium mt-0.5">
 Generado por IA en base a todo el expediente (notas, vacunas y estudios).
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3">
     {panoramaData[activeTab] && (
         <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
             <DialogTrigger asChild>
                 <Button variant="outline" className="px-5 py-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors h-11 rounded-xl">
                     Ver Historial
                 </Button>
             </DialogTrigger>
             <DialogContent className="rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] max-h-[80vh] overflow-y-auto">
                 <DialogHeader>
                     <DialogTitle className="text-gray-900 dark:text-white font-bold text-lg">Historial de Análisis Clínicos</DialogTitle>
                 </DialogHeader>
                 <div className="py-4 space-y-6">
                     {isLoadingHistory ? (
                         <div className="flex justify-center p-8"><QhSpinner size="sm" /></div>
                     ) : panoramaHistory.length === 0 ? (
                         <p className="text-sm text-gray-500 italic text-center">No hay historial disponible.</p>
                     ) : (
                         panoramaHistory.map((hist, idx) => (
                             <div key={idx} className="border-l-2 border-teal-500 pl-4 space-y-2">
                                 <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                     {new Date(hist.createdAt).toLocaleDateString()} a las {new Date(hist.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </h4>
                                 <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                     {hist.clinicalSummary}
                                 </p>
                             </div>
                         ))
                     )}
                 </div>
                 <DialogFooter>
                     <Button variant="ghost" onClick={() => setIsHistoryOpen(false)} className="rounded-xl font-semibold text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
                         Cerrar
                     </Button>
                 </DialogFooter>
             </DialogContent>
         </Dialog>
     )}
     <button
     onClick={handleGeneratePanorama}
     disabled={isGeneratingPanorama}
     className="px-6 py-2 bg-teal-600 dark:bg-teal-500 text-white text-sm font-bold hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50 h-11 flex items-center rounded-xl"
     >
     {isGeneratingPanorama ? 'Generando...' : 'Generar Análisis'}
     </button>
 </div>
 </div>

 <div className="pt-2">
 {!panoramaData[activeTab] ? (
 <div className="text-sm text-gray-500 italic py-4 text-center">
 Aún no se ha generado un panorama clínico. Haz clic en "Generar Panorama" para consultar a la IA.
 </div>
 ) : (
 <div className="space-y-6">
 <div>
 <div className="flex items-center justify-between mb-2">
     <h3 className="text-xs font-bold uppercase text-gray-400">Último Panorama General</h3>
     {panoramaData[activeTab]?.createdAt && (
         <span className="text-[10px] text-gray-400 font-medium">
             {new Date(panoramaData[activeTab]!.createdAt!).toLocaleDateString()}
         </span>
     )}
 </div>
 <p className="text-sm text-black dark:text-white leading-relaxed">
 {panoramaData[activeTab]?.clinicalSummary}
 </p>
 </div>
 {panoramaData[activeTab]!.careRecommendations && panoramaData[activeTab]!.careRecommendations.length > 0 && (
 <div>
 <h3 className="text-xs font-bold uppercase text-blue-400 mb-2">Recomendaciones de Cuidado</h3>
 <ul className="space-y-2">
 {panoramaData[activeTab]?.careRecommendations.map((rec, idx) => (
 <li key={idx} className="text-sm text-black dark:text-white flex items-start gap-2">
 <span className="text-blue-400 mt-1">•</span>
 <span className="leading-relaxed">{rec}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 )}
 </div>
 </section>

 {/* --- CARTILLA DIGITAL DEL PACIENTE ACTIVO (SOLO <= 12 AÑOS) --- */}
 {showVaccinationCard && (
 <section className="space-y-6 pt-4">
 <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
 <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
 <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
 <Syringe className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />
 </div>
 Cartillas de Salud
 </h2>
 </div>
 <Accordion type="single" collapsible className="grid grid-cols-1 gap-6">
 <AccordionItem 
 value="vaccination-card" 
 className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-sm transition-colors"
 >
 <AccordionTrigger className="bg-gray-50/50 dark:bg-gray-900/50 px-6 py-5 hover:no-underline hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors border-b border-transparent data-[state=open]:border-gray-100 dark:data-[state=open]:border-gray-800 [&[data-state=open]>svg]:rotate-180">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0">
 <Syringe className="w-5 h-5 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
 </div>
 <div className="text-left">
 <h2 className="text-sm font-bold text-gray-900 dark:text-white">
 Cartilla Digital
 </h2>
 <p className="text-sm text-gray-500 mt-0.5">
 Haz clic para ver el historial de dosis
 </p>
 </div>
 </div>
 <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-gray-500" />
 </AccordionTrigger>
 <AccordionContent className="p-0 border-t-0">
 <DigitalVaccinationCard memberId={activeDependentId} hideHeader={true} />
 </AccordionContent>
 </AccordionItem>
 </Accordion>
 </section>
 )}

 {/* --- LISTA DE DOCUMENTOS CON FILTROS --- */}
 <section className="space-y-6">
 <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
 <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
 <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
 </div>
 Documentos
 </h2>
  <div className="flex items-center gap-3">
  <div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <Input 
  placeholder="Buscar documento..." 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="pl-10 h-11 w-full sm:w-64 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-colors"
  />
  </div>

  <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
    <DialogTrigger asChild>
      <Button variant="outline" className="rounded-xl border-gray-200 dark:border-gray-800 h-11 text-sm font-semibold">
        <Plus className="w-4 h-4 mr-2" />
        Nueva Carpeta
      </Button>
    </DialogTrigger>
    <DialogContent className="rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white font-bold text-lg">Crear Nueva Carpeta</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <Input 
          placeholder="Nombre de la carpeta"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); }}
          className="rounded-xl border-gray-200 dark:border-gray-800 h-12 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
          autoFocus
        />
      </div>
      <DialogFooter className="gap-3">
        <Button variant="ghost" onClick={() => setIsNewFolderOpen(false)} className="rounded-xl font-semibold text-sm text-gray-500">
          Cancelar
        </Button>
        <Button onClick={handleCreateFolder} className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm px-6">
          Crear
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  </div>
  </div>
  <div className="flex bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-2.5 items-center flex-wrap gap-2 text-sm font-medium text-gray-500 overflow-x-auto hide-scrollbar">
    <div 
      className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
      onClick={() => setCurrentFolderId(null)}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
      onDrop={(e) => {
        e.preventDefault();
        const documentId = e.dataTransfer.getData('documentId');
        if (documentId) handleDropDocument(documentId, null);
      }}
    >
      <Home className="w-4 h-4" />
      <span>Mi Unidad</span>
    </div>
    
    {breadcrumbs.map((crumb, idx, arr) => {
      const isLast = idx === arr.length - 1;
      
      return (
        <React.Fragment key={crumb.id}>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-700" />
          <div 
            className={cn("flex items-center cursor-pointer transition-colors", isLast ? "text-black dark:text-white" : "hover:text-black dark:hover:text-white")}
            onClick={() => setCurrentFolderId(crumb.id)}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDrop={(e) => {
              e.preventDefault();
              const documentId = e.dataTransfer.getData('documentId');
              if (documentId) handleDropDocument(documentId, crumb.id);
            }}
          >
            {crumb.name}
          </div>
        </React.Fragment>
      );
    })}
  </div>
  </div>
  {/* Estado: Cargando Inicial */}
 {isLoading ? (
 <div className="flex flex-col items-center justify-center py-32 gap-6">
 <div className="border border-gray-200 dark:border-gray-800 p-6">
 <QhSpinner size="lg" />
 </div>
 <p className="text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase text-[10px]">
 {t('loading', { defaultValue: 'Desencriptando tu bóveda...' })}
 </p>
 </div>
 ) : (
  <AnimatePresence mode="popLayout">
  {visibleFolders.length > 0 && (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleFolderDragEnd}
    >
      <SortableContext 
        items={visibleFolders.map(f => f.id)} 
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {visibleFolders.map((folder, index) => (
            <SortableFolderWrapper
              key={`folder-${folder.path}`}
              id={folder.id}
              motionProps={{
                initial: { opacity: 0, scale: 0.95, y: 20 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.95 },
                transition: { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
              }}
              cardProps={{
                folderName: folder.name,
                folderPath: folder.path,
                itemCount: folder.count,
                onClick: () => setCurrentFolderId(folder.id),
                onDropDocument: (docId: string) => handleDropDocument(docId, folder.id),
                onDropFolder: (draggedPath: string) => handleDropFolder(draggedPath, folder.id),
                onRename: async (newName: string) => { await renameFolder(folder.id, newName); },
                onDelete: async () => { await deleteFolder(folder.id); }
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )}

  {visibleDocuments.length > 0 ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDocumentDragEnd}
    >
      <SortableContext 
        items={visibleDocuments.map(d => d.id)} 
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {visibleDocuments.map((doc, index) => (
            <SortableDocumentWrapper
              key={doc.id}
              id={doc.id}
              motionProps={{
                initial: { opacity: 0, scale: 0.95, y: 20 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.95 },
                transition: { duration: 0.4, delay: index * 0.05, ease: "easeOut" }
              }}
              cardProps={{
                document: doc,
                onView: viewDocument,
                onUpdate: (docId: string, data: any) => updateDocument(docId, data),
                onDelete: deleteDocument
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  ) : (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-[#0a0a0a] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-none text-center"
 >
 <div className="p-6 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] mb-6">
 <FileText className="w-10 h-10 text-gray-400 dark:text-gray-600" strokeWidth={1.5} />
 </div>

 <h3 className="text-lg font-bold uppercase tracking-widest text-black dark:text-white mb-3">
 No se encontraron documentos
 </h3>
 <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto font-light leading-relaxed">
  {searchQuery 
  ? 'No hay archivos que coincidan con la búsqueda profunda.' 
  : 'Esta carpeta está vacía. Sube un archivo usando el recuadro de arriba.'}
  </p>
 </motion.div>
 )}
 </AnimatePresence>
 )}
 </section>
 </TabsContent>
 </Tabs>
 </motion.div>
 </div>
 );
}