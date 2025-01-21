"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Trash2, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: "verified" | "pending" | "rejected";
  downloadUrl: string;
  description?: string;
  thumbnailUrl?: string;
}

interface DocumentsManagerProps {
  role: "paciente" | "profesional";
  profesionalType?: "medico" | "esteticista" | "nutricionista";
}

const DocumentsManager: React.FC<DocumentsManagerProps> = ({ role, profesionalType }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Función simulada para obtener documentos
  const fetchDocuments = async () => {
    // ... (mantenemos la lógica existente)
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return "📄";
      case "imagen": return "🖼️";
      case "certificado": return "📜";
      default: return "📋";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-emerald-500";
      case "pending": return "bg-amber-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const DocumentCard = ({ doc }: { doc: Document }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all cursor-pointer"
      onClick={() => setSelectedDoc(doc)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{getDocumentTypeIcon(doc.type)}</div>
          <div>
            <h3 className="font-medium text-white">{doc.name}</h3>
            <p className="text-sm text-gray-400">
              {new Date(doc.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)} text-white`}>
          {doc.status === "verified" ? "Verificado" : 
           doc.status === "pending" ? "Pendiente" : "Rechazado"}
        </div>
      </div>
    </motion.div>
  );

  function handleFileUpload(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.");
    }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <Card className="max-w-6xl mx-auto bg-gray-800 border-gray-700 shadow-xl">
        <CardContent className="p-6">
          {/* Header con estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Documentos Totales</p>
                  <h3 className="text-2xl font-bold text-white">{documents.length}</h3>
                </div>
                <FileText className="text-teal-400 w-8 h-8" />
              </div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Verificados</p>
                  <h3 className="text-2xl font-bold text-emerald-400">
                    {documents.filter(d => d.status === "verified").length}
                  </h3>
                </div>
                <CheckCircle className="text-emerald-400 w-8 h-8" />
              </div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Pendientes</p>
                  <h3 className="text-2xl font-bold text-amber-400">
                    {documents.filter(d => d.status === "pending").length}
                  </h3>
                </div>
                <Clock className="text-amber-400 w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-teal-400 mb-4" />
                <p className="text-lg font-medium text-gray-300">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  PDF, JPG, PNG hasta 10MB
                </p>
              </label>
              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-teal-400">{selectedFile.name}</p>
                  {uploadProgress > 0 && (
                    <Progress value={uploadProgress} className="mt-2" />
                  )}
                  <Button
                    onClick={handleFileUpload}
                    className="mt-4 bg-teal-500 hover:bg-teal-600"
                  >
                    Subir archivo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs y Filtros */}
          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="bg-gray-700/50">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="verified">Verificados</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="rejected">Rechazados</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {documents.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Similar TabsContent para otros estados */}
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de detalle del documento */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
              {getDocumentTypeIcon(selectedDoc?.type || "")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Tipo</p>
                <p className="font-medium">{selectedDoc?.type}</p>
              </div>
              <div>
                <p className="text-gray-400">Fecha</p>
                <p className="font-medium">
                  {selectedDoc?.uploadedAt && new Date(selectedDoc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-teal-500 hover:bg-teal-600">
                <Eye className="w-4 h-4 mr-2" />
                Ver documento
              </Button>
              <Button className="bg-red-500 hover:bg-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsManager;