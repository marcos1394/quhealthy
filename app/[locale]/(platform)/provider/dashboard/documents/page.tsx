"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useMemo, useReducer } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldAlert,
  LayoutGrid,
  List,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { StatBlock } from "@/components/dashboard/documents/StatBlock";
import { DocumentUpload } from "@/components/dashboard/documents/DocumentUpload";
import {
  Document,
  DocumentGrid,
  DocumentList,
} from "@/components/dashboard/documents/DocumentCard";
import { DocumentDetailModal } from "@/components/dashboard/documents/DocumentDetailModal";
import { documentService } from "@/services/document.service";
import { useSessionStore } from "@/stores/SessionStore";

interface State {
  documents: Document[];
  isLoading: boolean;
  selectedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  activeTab: string;
  viewMode: "grid" | "list";
  selectedDoc: Document | null;
  selectedType: string;
}

type Action =
  | { type: "SET_DOCUMENTS"; payload: any }
  | { type: "SET_IS_LOADING"; payload: boolean }
  | { type: "SET_SELECTEDFILE"; payload: any }
  | { type: "SET_UPLOADPROGRESS"; payload: any }
  | { type: "SET_ISUPLOADING"; payload: any }
  | { type: "SET_ACTIVETAB"; payload: any }
  | { type: "SET_VIEWMODE"; payload: "grid" | "list" }
  | { type: "SET_SELECTEDDOC"; payload: any }
  | { type: "SET_SELECTEDTYPE"; payload: string };

const initialState: State = {
  documents: [],
  isLoading: true,
  selectedFile: null,
  uploadProgress: 0,
  isUploading: false,
  activeTab: "all",
  viewMode: "grid",
  selectedDoc: null,
  selectedType: "general",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DOCUMENTS":
      return {
        ...state,
        documents:
          typeof action.payload === "function"
            ? action.payload(state.documents)
            : action.payload,
      };
    case "SET_IS_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SELECTEDFILE":
      return {
        ...state,
        selectedFile:
          typeof action.payload === "function"
            ? action.payload(state.selectedFile)
            : action.payload,
      };
    case "SET_UPLOADPROGRESS":
      return {
        ...state,
        uploadProgress:
          typeof action.payload === "function"
            ? action.payload(state.uploadProgress)
            : action.payload,
      };
    case "SET_ISUPLOADING":
      return {
        ...state,
        isUploading:
          typeof action.payload === "function"
            ? action.payload(state.isUploading)
            : action.payload,
      };
    case "SET_ACTIVETAB":
      return {
        ...state,
        activeTab:
          typeof action.payload === "function"
            ? action.payload(state.activeTab)
            : action.payload,
      };
    case "SET_VIEWMODE":
      return { ...state, viewMode: action.payload };
    case "SET_SELECTEDDOC":
      return {
        ...state,
        selectedDoc:
          typeof action.payload === "function"
            ? action.payload(state.selectedDoc)
            : action.payload,
      };
    case "SET_SELECTEDTYPE":
      return { ...state, selectedType: action.payload };
    default:
      return state;
  }
}

export default function DocumentsManagerPage() {
  const t = useTranslations("DashboardDocuments");
  const { user } = useSessionStore();
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    documents,
    isLoading,
    selectedFile,
    uploadProgress,
    isUploading,
    activeTab,
    viewMode,
    selectedDoc,
    selectedType,
  } = state;

  const setDocuments = (val: any) =>
    dispatch({ type: "SET_DOCUMENTS", payload: val });
  const setIsLoading = (val: boolean) =>
    dispatch({ type: "SET_IS_LOADING", payload: val });
  const setSelectedFile = (val: any) =>
    dispatch({ type: "SET_SELECTEDFILE", payload: val });
  const setUploadProgress = (val: any) =>
    dispatch({ type: "SET_UPLOADPROGRESS", payload: val });
  const setIsUploading = (val: any) =>
    dispatch({ type: "SET_ISUPLOADING", payload: val });
  const setActiveTab = (val: any) =>
    dispatch({ type: "SET_ACTIVETAB", payload: val });
  const setViewMode = (val: "grid" | "list") =>
    dispatch({ type: "SET_VIEWMODE", payload: val });
  const setSelectedDoc = (val: any) =>
    dispatch({ type: "SET_SELECTEDDOC", payload: val });
  const setSelectedType = (val: string) =>
    dispatch({ type: "SET_SELECTEDTYPE", payload: val });

  // Carga inicial de documentos desde la API/Servicio
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.getUserDocuments(
        user?.id?.toString()
      );
      setDocuments(data || []);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  // Carga real de archivo
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (user?.id) {
        formData.append("userId", user.id.toString());
      }

      await documentService.uploadDocument(formData, (progress: number) => {
        setUploadProgress(progress);
      });

      toast.success(t("upload.uploaded_success"));
      setSelectedFile(null);
      await fetchDocuments();
    } catch (error: any) {
      console.error("Error al subir el documento:", error);
      toast.error(
        error.response?.data?.message || t("upload.validation_error")
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Eliminación real
  const handleDelete = async (id: number | string) => {
    try {
      await documentService.deleteDocument(id.toString());
      setDocuments((prev: Document[]) => prev.filter((d) => d.id !== id));
      setSelectedDoc(null);
      toast.success(t("deleted_toast"));
    } catch (error: any) {
      console.error("Error al eliminar documento:", error);
      toast.error(error.response?.data?.message || "Error al eliminar");
    }
  };

  // Descarga real
  const handleDownload = async (doc: Document) => {
    try {
      toast.info(t("downloading", { name: doc.name }));
      if (doc.url && doc.url !== "#") {
        window.open(doc.url, "_blank");
      } else {
        await documentService.downloadDocument(doc.id.toString(), doc.name);
      }
    } catch (error) {
      console.error("Error al descargar documento:", error);
    }
  };

  const filteredDocuments = useMemo(() => {
    if (activeTab === "all") return documents;
    return documents.filter((doc) => doc.status === activeTab);
  }, [documents, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── MÉTRICAS DE RESUMEN ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBlock
            label={t("stats.total")}
            value={documents.length}
            icon={<FileText className="w-5 h-5 text-gray-500" strokeWidth={2} />}
          />
          <StatBlock
            label={t("stats.verified")}
            value={documents.filter((d) => d.status === "verified").length}
            icon={
              <CheckCircle2
                className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2}
              />
            }
            trend={t("stats.active")}
          />
          <StatBlock
            label={t("stats.pending")}
            value={documents.filter((d) => d.status === "pending").length}
            icon={
              <Clock
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
                strokeWidth={2}
              />
            }
            trend={t("stats.in_review")}
          />
        </div>

        {/* ── CONTENIDO PRINCIPAL EN 2 COLUMNAS ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMNA 1: SUBIR ARCHIVO */}
          <div className="lg:col-span-1 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {t("upload.title")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                {t("upload.subtitle")}
              </p>
            </div>
            <div className="flex-1 p-6 sm:p-8 bg-gray-50/50 dark:bg-[#050505]">
              <DocumentUpload
                selectedFile={selectedFile}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                onFileSelect={setSelectedFile}
                onFileUpload={handleFileUpload}
                onClear={() => setSelectedFile(null)}
                selectedType={selectedType}
                onTypeSelect={setSelectedType}
              />
            </div>
          </div>

          {/* COLUMNA 2: LISTA Y EXPEDIENTES */}
          <div className="lg:col-span-2 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm min-h-[500px] flex flex-col overflow-hidden">
            
            {/* Header Lista de Archivos */}
            <div className="border-b border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  {t("files_title")}
                </h2>
              </div>

              {/* Controles Modo Vista */}
              <div className="flex items-center gap-1 bg-gray-100/70 dark:bg-gray-800/40 p-1 rounded-xl shrink-0">
                <Button
                  variant="ghost"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "w-8 h-8 p-0 rounded-lg text-xs font-bold transition-all",
                    viewMode === "grid"
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" strokeWidth={2} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "w-8 h-8 p-0 rounded-lg text-xs font-bold transition-all",
                    viewMode === "list"
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <List className="w-4 h-4" strokeWidth={2} />
                </Button>
              </div>
            </div>

            {/* Pestañas de Filtro */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto bg-gray-50/50 dark:bg-[#050505] p-1.5 gap-1">
              {[
                { id: "all", label: t("tabs.all") },
                { id: "verified", label: t("tabs.verified") },
                { id: "pending", label: t("tabs.pending") },
                { id: "rejected", label: t("tabs.rejected") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido Grid / Lista */}
            <div className="flex-1 p-6 sm:p-8 bg-gray-50/50 dark:bg-[#050505] min-h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[350px] gap-3">
                  <QhSpinner size="lg" />
                  <p className="text-xs font-semibold text-gray-500 animate-pulse">
                    {t("files_title")}...
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {filteredDocuments.length > 0 ? (
                    viewMode === "grid" ? (
                      <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <DocumentGrid
                          documents={filteredDocuments}
                          onSelect={setSelectedDoc}
                          onDownload={handleDownload}
                          onPreview={setSelectedDoc}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <DocumentList
                          documents={filteredDocuments}
                          onSelect={setSelectedDoc}
                        />
                      </motion.div>
                    )
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[350px]"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                        <ShieldAlert className="w-7 h-7" strokeWidth={2} />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        {t("empty")}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── MODAL DETALLE DOCUMENTO ──────────────────────────────────── */}
      <DocumentDetailModal
        doc={selectedDoc}
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
    </div>
  );
}