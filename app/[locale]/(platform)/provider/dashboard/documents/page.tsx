"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { FileText, CheckCircle, Clock, ShieldAlert, LayoutGrid, List } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatBlock } from "@/components/dashboard/documents/StatBlock";
import { DocumentUpload } from "@/components/dashboard/documents/DocumentUpload";
import { DocumentCard, Document, DocumentGrid, DocumentList } from "@/components/dashboard/documents/DocumentCard";
import { DocumentDetailModal } from "@/components/dashboard/documents/DocumentDetailModal";
import { useTranslations } from "next-intl";

// Mock Data
const mockDocuments: Document[] = [
  { id: 1, name: "Cédula Profesional.pdf", type: "pdf", url: "#", status: "verified", uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString(), size: "1.2 MB" },
  { id: 2, name: "Diploma Especialidad.jpg", type: "jpg", url: "#", status: "pending", uploadedAt: new Date().toISOString(), size: "3.5 MB" },
  { id: 3, name: "Certificado Vencido.pdf", type: "pdf", url: "#", status: "rejected", uploadedAt: new Date(Date.now() - 86400000 * 100).toISOString(), size: "0.8 MB" }
];

export default function DocumentsManagerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const t = useTranslations('DashboardDocuments');

  useEffect(() => { setDocuments(mockDocuments); }, []);

  const handleFileUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true); setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: Document = { id: Date.now(), name: selectedFile.name, type: selectedFile.name.split(".").pop() || "file", url: "#", status: "pending", uploadedAt: new Date().toISOString(), size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` };
            setDocuments(p => [newDoc, ...p]); setIsUploading(false); setSelectedFile(null);
            toast.success(t('upload.uploaded_success'));
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDelete = (id: number) => { setDocuments(p => p.filter(d => d.id !== id)); setSelectedDoc(null); toast.success(t('deleted_toast')); };
  const handleDownload = (doc: Document) => { toast.info(t('downloading', { name: doc.name })); };

  const filteredDocuments = useMemo(() => {
    if (activeTab === "all") return documents;
    return documents.filter(doc => doc.status === activeTab);
  }, [documents, activeTab]);

  return (
    <div className="space-y-6 pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-medical-600 dark:text-medical-400" />{t('title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-light">{t('subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatBlock label={t('stats.total')} value={documents.length} icon={<FileText className="w-5 h-5" />} />
          <StatBlock label={t('stats.verified')} value={documents.filter(d => d.status === "verified").length} icon={<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} trend={t('stats.active')} />
          <StatBlock label={t('stats.pending')} value={documents.filter(d => d.status === "pending").length} icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />} trend={t('stats.in_review')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Column */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white text-base font-semibold">{t('upload.title')}</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 font-light text-sm">{t('upload.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUpload selectedFile={selectedFile} uploadProgress={uploadProgress} isUploading={isUploading}
                  onFileSelect={setSelectedFile} onFileUpload={handleFileUpload} onClear={() => setSelectedFile(null)} />
              </CardContent>
            </Card>
          </div>

          {/* Documents List Column */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] transition-colors">
              <CardHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex justify-between items-center mb-3">
                    <CardTitle className="text-slate-900 dark:text-white text-base font-semibold">{t('files_title')}</CardTitle>
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                      <Button variant="ghost" size="sm" className={cn("px-2 py-1 h-7 rounded-md", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-sm text-medical-600 dark:text-medical-400" : "text-slate-500")} onClick={() => setViewMode('grid')}>
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className={cn("px-2 py-1 h-7 rounded-md", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-sm text-medical-600 dark:text-medical-400" : "text-slate-500")} onClick={() => setViewMode('list')}>
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <TabsList className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-sm">{t('tabs.all')}</TabsTrigger>
                    <TabsTrigger value="verified" className="data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 text-sm">{t('tabs.verified')}</TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-sm">{t('tabs.pending')}</TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-sm">{t('tabs.rejected')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {filteredDocuments.length > 0 ? (
                      viewMode === 'grid' ? (
                        <DocumentGrid key="grid" documents={filteredDocuments} onSelect={setSelectedDoc} onDownload={handleDownload} onPreview={setSelectedDoc} />
                      ) : (
                        <DocumentList key="list" documents={filteredDocuments} onSelect={setSelectedDoc} />
                      )
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium text-slate-500">{t('empty') || "No documents found."}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <DocumentDetailModal doc={selectedDoc} isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} onDelete={handleDelete} onDownload={handleDownload} />
    </div>
  );
}