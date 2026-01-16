"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { FileText, CheckCircle, Clock, ShieldAlert } from "lucide-react";
import { AnimatePresence } from "framer-motion";

// ShadCN UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Componentes Personalizados (Rutas Correctas)
import { StatBlock } from "@/components/dashboard/documents/StatBlock";
import { DocumentUpload } from "@/components/dashboard/documents/DocumentUpload";
import { DocumentCard, Document } from "@/components/dashboard/documents/DocumentCard";
import { DocumentDetailModal } from "@/components/dashboard/documents/DocumentDetailModal";

// Mock Data
const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Cédula Profesional.pdf",
    type: "pdf",
    url: "#",
    status: "verified",
    uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    size: "1.2 MB"
  },
  {
    id: 2,
    name: "Diploma Especialidad.jpg",
    type: "jpg",
    url: "#",
    status: "pending",
    uploadedAt: new Date().toISOString(),
    size: "3.5 MB"
  },
  {
    id: 3,
    name: "Certificado Vencido.pdf",
    type: "pdf",
    url: "#",
    status: "rejected",
    uploadedAt: new Date(Date.now() - 86400000 * 100).toISOString(),
    size: "0.8 MB"
  }
];

export default function DocumentsManagerPage() {
  // Estados
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Carga inicial (Simulada)
  useEffect(() => {
    // Aquí iría el fetch real
    setDocuments(mockDocuments);
  }, []);

  // Handlers
  const handleFileUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);

    // Simulación de subida
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Completado
          setTimeout(() => {
            const newDoc: Document = {
                id: Date.now(),
                name: selectedFile.name,
                type: selectedFile.name.split('.').pop() || 'file',
                url: '#',
                status: 'pending',
                uploadedAt: new Date().toISOString(),
                size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
            };
            setDocuments(prevDocs => [newDoc, ...prevDocs]);
            setIsUploading(false);
            setSelectedFile(null);
            toast.success("Documento subido correctamente.");
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDelete = (id: number) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    setSelectedDoc(null);
    toast.success("Documento eliminado.");
  };

  const handleDownload = (doc: Document) => {
    toast.info(`Descargando ${doc.name}...`);
    // Lógica real de descarga
  };

  // Filtrado
  const filteredDocuments = useMemo(() => {
    if (activeTab === 'all') return documents;
    return documents.filter(doc => doc.status === activeTab);
  }, [documents, activeTab]);

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
        
        <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Gestor de Documentos</h1>
                <p className="text-gray-400 mt-2">Sube y verifica tus credenciales profesionales.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBlock 
                    label="Total Documentos" 
                    value={documents.length} 
                    icon={<FileText className="w-6 h-6" />} 
                />
                <StatBlock 
                    label="Verificados" 
                    value={documents.filter(d => d.status === "verified").length} 
                    icon={<CheckCircle className="w-6 h-6 text-emerald-400" />} 
                    trend="Activos"
                />
                <StatBlock 
                    label="Pendientes" 
                    value={documents.filter(d => d.status === "pending").length} 
                    icon={<Clock className="w-6 h-6 text-amber-400" />} 
                    trend="En revisión"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Columna Izquierda: Upload */}
                <div className="lg:col-span-1">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Subir Nuevo</CardTitle>
                            <CardDescription>Asegúrate de que sean legibles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DocumentUpload
                                selectedFile={selectedFile}
                                uploadProgress={uploadProgress}
                                isUploading={isUploading}
                                onFileSelect={setSelectedFile}
                                onFileUpload={handleFileUpload}
                                onClear={() => setSelectedFile(null)}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha: Lista */}
                <div className="lg:col-span-2">
                    <Card className="bg-gray-900 border-gray-800 min-h-[500px]">
                        <CardHeader>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <CardTitle className="text-white text-lg">Mis Archivos</CardTitle>
                                </div>
                                <TabsList className="bg-gray-800 border-gray-700 w-full justify-start overflow-x-auto">
                                    <TabsTrigger value="all">Todos</TabsTrigger>
                                    <TabsTrigger value="verified" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">Verificados</TabsTrigger>
                                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">Pendientes</TabsTrigger>
                                    <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">Rechazados</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredDocuments.length > 0 ? (
                                        filteredDocuments.map((doc) => (
                                            <DocumentCard 
                                                key={doc.id} 
                                                doc={doc} 
                                                onSelect={setSelectedDoc} 
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                                            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p>No hay documentos en esta categoría.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>

        {/* Modal de Detalle */}
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