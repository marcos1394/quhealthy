"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { AnimatePresence } from "framer-motion";

// Importa los tipos y los nuevos componentes
import { Document, UserRole } from '@/app/quhealthy/types/documents';
import { StatBlock } from '@/app/quhealthy/components/documents/StatBlock';
import { DocumentUpload } from '@/app/quhealthy/components/documents/DocumentUpload';
import { DocumentCard } from '@/app/quhealthy/components/documents/DocumentCard';
import { DocumentDetailModal } from '@/app/quhealthy/components/documents/DocumentDetailModal';

// Esta página ya no necesita props, obtendrá el rol de la sesión del usuario.
export default function DocumentsManagerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Simulación de datos (en el futuro, esto será una llamada a la API)
  useEffect(() => {
    const fetchDocs = () => {
      // ... tu lógica para obtener documentos ...
    };
    // fetchDocs();
  }, []);
  
  const handleFileUpload = () => {
    // Aquí iría tu lógica real para subir el archivo
    console.log("Subiendo archivo:", selectedFile?.name);
    // Simular progreso de carga
    setUploadProgress(0);
    const interval = setInterval(() => {
        setUploadProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 10;
        });
    }, 200);
  };
  
  const filteredDocuments = useMemo(() => {
    if (activeTab === 'all') return documents;
    return documents.filter(doc => doc.status === activeTab);
  }, [documents, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-900 text-white p-4 md:p-8">
      <Card className="max-w-6xl mx-auto bg-gray-800 border-gray-700 shadow-xl">
        <CardContent className="p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatBlock 
              label="Documentos Totales" 
              value={documents.length} 
              icon={<FileText className="text-teal-400 w-8 h-8" />} 
            />
            <StatBlock 
              label="Verificados" 
              value={documents.filter(d => d.status === "verified").length} 
              icon={<CheckCircle className="text-emerald-400 w-8 h-8" />} 
            />
            <StatBlock 
              label="Pendientes" 
              value={documents.filter(d => d.status === "pending").length} 
              icon={<Clock className="text-amber-400 w-8 h-8" />} 
            />
          </div>

          <div className="mb-8">
            <DocumentUpload
              selectedFile={selectedFile}
              uploadProgress={uploadProgress}
              onFileSelect={setSelectedFile}
              onFileUpload={handleFileUpload}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-gray-700/50">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="verified">Verificados</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="rejected">Rechazados</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredDocuments.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} onSelect={setSelectedDoc} />
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>

      <DocumentDetailModal
        doc={selectedDoc}
        onOpenChange={(isOpen) => { if (!isOpen) setSelectedDoc(null); }}
      />
    </div>
  );
};