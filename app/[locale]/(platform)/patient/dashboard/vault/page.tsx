"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  FolderOpen,
  FileText,
  Syringe,
  Search,
  BrainCircuit,
  Home,
  Plus,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { useHealthVault } from "@/hooks/useHealthVault";
import { HealthVaultDropzone } from "@/components/vault/HealthVaultDropzone";
import { HealthVaultDocumentCard } from "@/components/vault/HealthVaultDocumentCard";
import { HealthVaultFolderCard } from "@/components/vault/HealthVaultFolderCard";
import { DigitalVaccinationCard } from "@/components/vault/DigitalVaccinationCard";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { useFamily } from "@/hooks/useFamily";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── DnD Wrappers ─────────────────────────────────────────────────────────────

function SortableFolderWrapper({ id, motionProps, cardProps }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : ("auto" as any),
    position: "relative" as any,
  };

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : ("auto" as any),
    position: "relative" as any,
  };

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

// ── Componente Principal ──────────────────────────────────────────────────────

export default function PatientVaultPage() {
  const t = useTranslations("HealthVault");
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
    getPanoramaHistory,
  } = useHealthVault();

  const { family } = useFamily();

  const [activeTab, setActiveTab] = useState<string>("titular");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [panoramaData, setPanoramaData] = useState<{
    [key: string]: {
      clinicalSummary: string;
      careRecommendations: string[];
      createdAt?: string;
    } | null;
  }>({});
  const [isGeneratingPanorama, setIsGeneratingPanorama] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [panoramaHistory, setPanoramaHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Cargar los documentos al montar
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Cargar el último panorama al cambiar de pestaña
  useEffect(() => {
    const fetchLatest = async () => {
      const dependentId =
        activeTab === "titular" ? undefined : Number(activeTab);
      const latest = await getLatestPanorama(dependentId);
      if (latest) {
        setPanoramaData((prev) => ({ ...prev, [activeTab]: latest }));
      }
    };
    if (!panoramaData[activeTab]) {
      fetchLatest();
    }
  }, [activeTab, getLatestPanorama, panoramaData]);

  // Cargar el historial al abrir el modal
  useEffect(() => {
    if (isHistoryOpen) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const dependentId =
          activeTab === "titular" ? undefined : Number(activeTab);
        const history = await getPanoramaHistory(dependentId);
        setPanoramaHistory(history || []);
        setIsLoadingHistory(false);
      };
      fetchHistory();
    }
  }, [isHistoryOpen, activeTab, getPanoramaHistory]);

  // Limpiar ruta al cambiar de pestaña
  useEffect(() => {
    setCurrentFolderId(null);
  }, [activeTab]);

  const activeDependentId =
    activeTab === "titular" ? undefined : Number(activeTab);

  const activeDependent = useMemo(() => {
    if (!family || activeDependentId === undefined) return undefined;
    return family.find((m) => m.id === activeDependentId);
  }, [family, activeDependentId]);

  const activeDependentAge = useMemo(() => {
    if (!activeDependent?.dateOfBirth) return undefined;
    const dob = new Date(activeDependent.dateOfBirth);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  }, [activeDependent]);

  const showVaccinationCard =
    activeDependentId !== undefined &&
    activeDependentAge !== undefined &&
    activeDependentAge <= 12;

  // Manejador de soltar documento
  const handleDropDocument = async (
    documentId: string,
    targetFolderId: string | null
  ) => {
    if (documentId) {
      if (targetFolderId) {
        await updateDocument(documentId, { folderId: targetFolderId });
      } else {
        await updateDocument(documentId, { clearFolder: true } as any);
      }
    }
  };

  // Crear carpeta
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(
      newFolderName,
      currentFolderId || undefined,
      activeDependentId
    );
    setIsNewFolderOpen(false);
    setNewFolderName("");
  };

  // Filtrar documentos y carpetas según paciente, búsqueda y ruta
  const { visibleDocuments, visibleFolders } = useMemo(() => {
    const dependentId = activeTab === "titular" ? null : Number(activeTab);

    const memberDocs = documents.filter((doc) => {
      if (dependentId === null) return doc.dependentId == null;
      return doc.dependentId === dependentId;
    });

    const memberFolders = folders.filter((folder) => {
      if (dependentId === null) return folder.dependentId == null;
      return folder.dependentId === dependentId;
    });

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const filteredDocs = memberDocs.filter((doc) => {
        if (doc.title?.toLowerCase().includes(searchLower)) return true;
        if (doc.fileName?.toLowerCase().includes(searchLower)) return true;
        if (doc.noteContent?.toLowerCase().includes(searchLower)) return true;

        const ai = doc.aiExtractedData as any;
        if (ai) {
          if (ai.summary?.toLowerCase().includes(searchLower)) return true;
          if (
            ai.medicalConditions?.some((c: string) =>
              c.toLowerCase().includes(searchLower)
            )
          )
            return true;
          if (
            ai.medications?.some((m: string) =>
              m.toLowerCase().includes(searchLower)
            )
          )
            return true;
        }
        return false;
      });

      const filteredFolders = memberFolders
        .filter((folder) => folder.name.toLowerCase().includes(searchLower))
        .map((f) => ({
          id: f.id,
          name: f.name,
          path: f.id,
          count: documents.filter((d) => d.folderId === f.id).length,
        }));

      return { visibleDocuments: filteredDocs, visibleFolders: filteredFolders };
    }

    const exactDocs = memberDocs.filter((doc) => {
      if (currentFolderId === null) {
        return doc.folderId == null;
      } else {
        return doc.folderId === currentFolderId;
      }
    });

    const exactFolders = memberFolders
      .filter((folder) => {
        if (currentFolderId === null) {
          return folder.parentFolderId == null;
        } else {
          return folder.parentFolderId === currentFolderId;
        }
      })
      .map((f) => ({
        id: f.id,
        name: f.name,
        path: f.id,
        count: documents.filter((d) => d.folderId === f.id).length,
      }));

    return {
      visibleDocuments: exactDocs,
      visibleFolders: exactFolders,
    };
  }, [documents, folders, activeTab, searchQuery, currentFolderId]);

  // Migas de pan
  const breadcrumbs = useMemo(() => {
    const path: { id: string; name: string }[] = [];
    let curr = currentFolderId;
    while (curr) {
      const f = folders.find((f) => f.id === curr);
      if (f) {
        path.unshift({ id: f.id, name: f.name });
        curr = f.parentFolderId || null;
      } else {
        break;
      }
    }
    return path;
  }, [currentFolderId, folders]);

  // Generación de panorama
  const handleGeneratePanorama = async () => {
    const dependentId =
      activeTab === "titular" ? undefined : Number(activeTab);
    setIsGeneratingPanorama(true);
    try {
      const result = await generatePanorama(dependentId);
      if (result) {
        setPanoramaData((prev) => ({
          ...prev,
          [activeTab]: result,
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
      const oldIndex = visibleFolders.findIndex((f) => f.id === active.id);
      const newIndex = visibleFolders.findIndex((f) => f.id === over.id);
      const newFolders = arrayMove(visibleFolders, oldIndex, newIndex);

      const payload = newFolders.map((f, idx) => ({
        id: f.id,
        displayOrder: idx,
      }));
      reorderFolders(payload);
    }
  };

  const handleDocumentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = visibleDocuments.findIndex((d) => d.id === active.id);
      const newIndex = visibleDocuments.findIndex((d) => d.id === over.id);
      const newDocs = arrayMove(visibleDocuments, oldIndex, newIndex);

      const payload = newDocs.map((d, idx) => ({
        id: d.id,
        displayOrder: idx,
      }));
      reorderDocuments(payload);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-6 py-10 sm:py-12 lg:px-12 space-y-10"
      >
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 max-w-2xl">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* ── SELECCIÓN DE PACIENTE (PESTAÑAS) ─────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex overflow-x-auto bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl h-12 w-full justify-start p-1.5 no-scrollbar gap-1 mb-8 shadow-sm">
            <TabsTrigger
              value="titular"
              className="rounded-xl data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-900/40 border border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-bold px-5 h-full"
            >
              {t("my_record")}
            </TabsTrigger>
            {family?.map((member) => (
              <TabsTrigger
                key={member.id}
                value={member.id.toString()}
                className="rounded-xl data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:border data-[state=active]:border-emerald-200 dark:data-[state=active]:border-emerald-900/40 border border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-xs font-bold px-5 h-full whitespace-nowrap"
              >
                {member.firstName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-10 focus-visible:ring-0 outline-none">
            
            {/* ── ZONA DE SUBIDA ────────────────────────────────────────── */}
            <section>
              <HealthVaultDropzone
                onUpload={(file, title) =>
                  uploadDocument(
                    file,
                    title,
                    "GENERAL",
                    activeDependentId,
                    currentFolderId || undefined
                  )
                }
                onCreateNote={(title, content) =>
                  createNote(
                    title,
                    content,
                    activeDependentId,
                    currentFolderId || undefined
                  )
                }
                isUploading={isUploading}
              />
            </section>

            {/* ── PANORAMA CLÍNICO INTELIGENTE ──────────────────────────── */}
            <section className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-sm">
                    <BrainCircuit className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      {t("panorama_title")}
                    </h2>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      {t("panorama_subtitle")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {panoramaData[activeTab] && (
                    <Dialog
                      open={isHistoryOpen}
                      onOpenChange={setIsHistoryOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="px-4 py-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#111] transition-all h-10 rounded-xl shadow-sm"
                        >
                          {t("btn_view_history")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-white font-bold text-base">
                            {t("history_title")}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                          {isLoadingHistory ? (
                            <div className="flex justify-center p-8">
                              <QhSpinner size="sm" />
                            </div>
                          ) : panoramaHistory.length === 0 ? (
                            <p className="text-xs text-gray-500 italic text-center">
                              {t("no_history")}
                            </p>
                          ) : (
                            panoramaHistory.map((hist, idx) => (
                              <div
                                key={idx}
                                className="border-l-2 border-teal-500 pl-4 space-y-1.5"
                              >
                                <h4 className="text-[11px] font-mono font-semibold text-gray-400">
                                  {new Date(hist.createdAt).toLocaleDateString()}{" "}
                                  •{" "}
                                  {new Date(hist.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" }
                                  )}
                                </h4>
                                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                  {hist.clinicalSummary}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="ghost"
                            onClick={() => setIsHistoryOpen(false)}
                            className="rounded-xl font-bold text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
                          >
                            {t("btn_close")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button
                    onClick={handleGeneratePanorama}
                    disabled={isGeneratingPanorama}
                    className="px-5 h-10 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 rounded-xl border-0 shadow-sm"
                  >
                    {isGeneratingPanorama ? (
                      <>
                        <QhSpinner size="sm" />
                        <span>{t("btn_generating_panorama")}</span>
                      </>
                    ) : (
                      <span>{t("btn_generate_panorama")}</span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                {!panoramaData[activeTab] ? (
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 italic py-4 text-center">
                    {t("empty_panorama")}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {t("latest_panorama_label")}
                        </h3>
                        {panoramaData[activeTab]?.createdAt && (
                          <span className="text-[10px] font-mono text-gray-400">
                            {new Date(
                              panoramaData[activeTab]!.createdAt!
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                        {panoramaData[activeTab]?.clinicalSummary}
                      </p>
                    </div>

                    {panoramaData[activeTab]!.careRecommendations &&
                      panoramaData[activeTab]!.careRecommendations.length >
                        0 && (
                        <div>
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                            {t("care_recommendations_title")}
                          </h3>
                          <ul className="space-y-1.5">
                            {panoramaData[
                              activeTab
                            ]?.careRecommendations.map((rec, idx) => (
                              <li
                                key={idx}
                                className="text-xs font-medium text-gray-800 dark:text-gray-200 flex items-start gap-2"
                              >
                                <span className="text-emerald-500 font-bold">•</span>
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

            {/* ── CARTILLA DIGITAL (MENORES DE 12 AÑOS) ────────────────── */}
            {showVaccinationCard && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Syringe className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span>{t("vaccination_section_title")}</span>
                  </h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="vaccination-card"
                    className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-sm transition-colors"
                  >
                    <AccordionTrigger className="bg-gray-50/50 dark:bg-[#111]/30 px-6 py-4 hover:no-underline transition-colors border-b border-transparent data-[state=open]:border-gray-100 dark:data-[state=open]:border-gray-800">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                          <Syringe className="w-4.5 h-4.5 text-amber-500" strokeWidth={2} />
                        </div>
                        <div className="text-left">
                          <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                            {t("vaccination_card_title")}
                          </h2>
                          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                            {t("vaccination_card_subtitle")}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-gray-400" />
                    </AccordionTrigger>
                    <AccordionContent className="p-0 border-t-0">
                      <DigitalVaccinationCard
                        memberId={activeDependentId}
                        hideHeader={true}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
            )}

            {/* ── DOCUMENTOS Y NAVEGACIÓN DE CARPETAS ──────────────────── */}
            <section className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FolderOpen className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span>{t("documents_section_title")}</span>
                  </h2>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder={t("search_placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 w-full sm:w-64 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
                      />
                    </div>

                    <Dialog
                      open={isNewFolderOpen}
                      onOpenChange={setIsNewFolderOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="rounded-xl border-gray-200 dark:border-gray-800 h-10 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#111] shadow-sm flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                          <span>{t("btn_new_folder")}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-xl">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-white font-bold text-base">
                            {t("dialog_new_folder_title")}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            placeholder={t("placeholder_folder_name")}
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCreateFolder();
                            }}
                            className="rounded-xl border-gray-200 dark:border-gray-800 h-11 text-xs focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                            autoFocus
                          />
                        </div>
                        <DialogFooter className="gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => setIsNewFolderOpen(false)}
                            className="rounded-xl font-bold text-xs text-gray-500"
                          >
                            {t("btn_cancel")}
                          </Button>
                          <Button
                            onClick={handleCreateFolder}
                            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-bold text-xs px-5 h-10 border-0 shadow-sm"
                          >
                            {t("btn_create")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Migas de pan */}
                <div className="flex bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-2.5 items-center flex-wrap gap-2 text-xs font-bold text-gray-500 no-scrollbar overflow-x-auto shadow-sm">
                  <div
                    className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setCurrentFolderId(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const documentId = e.dataTransfer.getData("documentId");
                      if (documentId) handleDropDocument(documentId, null);
                    }}
                  >
                    <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t("my_unit")}</span>
                  </div>

                  {breadcrumbs.map((crumb, idx, arr) => {
                    const isLast = idx === arr.length - 1;

                    return (
                      <React.Fragment key={crumb.id}>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        <div
                          className={cn(
                            "flex items-center cursor-pointer transition-colors",
                            isLast
                              ? "text-gray-900 dark:text-white"
                              : "hover:text-gray-900 dark:hover:text-white"
                          )}
                          onClick={() => setCurrentFolderId(crumb.id)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const documentId =
                              e.dataTransfer.getData("documentId");
                            if (documentId)
                              handleDropDocument(documentId, crumb.id);
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
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm">
                  <QhSpinner size="lg" />
                  <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
                    {t("loading")}
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
                        items={visibleFolders.map((f) => f.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                          {visibleFolders.map((folder, index) => (
                            <SortableFolderWrapper
                              key={`folder-${folder.path}`}
                              id={folder.id}
                              motionProps={{
                                initial: { opacity: 0, scale: 0.95, y: 16 },
                                animate: { opacity: 1, scale: 1, y: 0 },
                                exit: { opacity: 0, scale: 0.95 },
                                transition: {
                                  duration: 0.3,
                                  delay: index * 0.04,
                                  ease: "easeOut",
                                },
                              }}
                              cardProps={{
                                folderName: folder.name,
                                folderPath: folder.path,
                                itemCount: folder.count,
                                onClick: () => setCurrentFolderId(folder.id),
                                onDropDocument: (docId: string) =>
                                  handleDropDocument(docId, folder.id),
                                onRename: async (newName: string) => {
                                  await renameFolder(folder.id, newName);
                                },
                                onDelete: async () => {
                                  await deleteFolder(folder.id);
                                },
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
                        items={visibleDocuments.map((d) => d.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {visibleDocuments.map((doc, index) => (
                            <SortableDocumentWrapper
                              key={doc.id}
                              id={doc.id}
                              motionProps={{
                                initial: { opacity: 0, scale: 0.95, y: 16 },
                                animate: { opacity: 1, scale: 1, y: 0 },
                                exit: { opacity: 0, scale: 0.95 },
                                transition: {
                                  duration: 0.3,
                                  delay: index * 0.04,
                                  ease: "easeOut",
                                },
                              }}
                              cardProps={{
                                document: doc,
                                onView: viewDocument,
                                onUpdate: (docId: string, data: any) =>
                                  updateDocument(docId, data),
                                onDelete: deleteDocument,
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
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl text-center shadow-sm"
                    >
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                        <FileText className="w-8 h-8" strokeWidth={2} />
                      </div>

                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                        {t("empty_docs_title")}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                        {searchQuery
                          ? t("empty_docs_search_desc")
                          : t("empty_docs_folder_desc")}
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