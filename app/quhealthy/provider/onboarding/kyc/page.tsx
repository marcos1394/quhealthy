/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  UploadCloud, 
  X, 
  Loader2, 
  CheckCircle2, 
  ScanFace 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DocType = 'ine' | 'passport';

export default function KycPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [docType, setDocType] = useState<DocType>('ine');
  
  // Estado para los archivos y sus previsualizaciones
  const [files, setFiles] = useState<{ front: File | null; back: File | null }>({
    front: null,
    back: null,
  });
  const [previews, setPreviews] = useState<{ front: string | null; back: string | null }>({
    front: null,
    back: null,
  });

  // Referencias para los inputs de archivo ocultos
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones básicas
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande. Máximo 5MB.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error("Solo se permiten imágenes (JPG, PNG).");
      return;
    }

    // Generar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [side]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    setFiles(prev => ({ ...prev, [side]: file }));
  };

  const removeFile = (side: 'front' | 'back') => {
    setFiles(prev => ({ ...prev, [side]: null }));
    setPreviews(prev => ({ ...prev, [side]: null }));
    // Limpiar el input para permitir subir el mismo archivo de nuevo si se desea
    if (side === 'front' && frontInputRef.current) frontInputRef.current.value = '';
    if (side === 'back' && backInputRef.current) backInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!files.front) {
      return toast.warn("Debes subir al menos la parte frontal de tu documento.");
    }
    if (docType === 'ine' && !files.back) {
      return toast.warn("Para INE, es necesario subir ambos lados.");
    }

    setIsLoading(true);
    
    // Creamos el FormData para enviar archivos binarios
    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('front', files.front);
    if (files.back) {
      formData.append('back', files.back);
    }

    try {
      const { data } = await axios.post('/api/kyc/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success("Documentos subidos y analizados correctamente.");
      
      // Pequeña pausa para que el usuario lea el mensaje antes de redirigir
      setTimeout(() => {
        router.push('/provider/onboarding/checklist');
      }, 1500);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al subir los documentos.");
    } finally {
      setIsLoading(false);
    }
  };

  // Componente auxiliar para la zona de carga
  const UploadZone = ({ side, label }: { side: 'front' | 'back', label: string }) => (
    <div className="space-y-2">
      <Label className="text-gray-300 font-medium">{label}</Label>
      
      {previews[side] ? (
        // Estado: Archivo cargado
        <div className="relative group h-48 w-full rounded-xl overflow-hidden border-2 border-purple-500/50">
          <img 
            src={previews[side]!} 
            alt={`Vista previa ${side}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => removeFile(side)}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Eliminar
            </Button>
          </div>
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        </div>
      ) : (
        // Estado: Esperando carga
        <div 
          onClick={() => side === 'front' ? frontInputRef.current?.click() : backInputRef.current?.click()}
          className="h-48 w-full rounded-xl border-2 border-dashed border-gray-600 hover:border-purple-500 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 group"
        >
          <div className="p-3 rounded-full bg-gray-800 group-hover:bg-purple-500/20 transition-colors">
            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-gray-300 group-hover:text-purple-300">
              Haz clic para subir imagen
            </p>
            <p className="text-xs text-gray-500 mt-1">JPG o PNG (Máx 5MB)</p>
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        ref={side === 'front' ? frontInputRef : backInputRef}
        className="hidden" 
        accept="image/png, image/jpeg"
        onChange={(e) => handleFileChange(e, side)}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 md:p-8">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gray-800 border-gray-700 text-white shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl w-fit mb-4 shadow-lg">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Verificación de Identidad</CardTitle>
            <CardDescription className="text-gray-400">
              Sube una foto clara de tu identificación oficial. Nuestra IA validará tus datos automáticamente.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            
            {/* Selector de Tipo de Documento */}
            <div className="flex justify-center">
              <Tabs defaultValue="ine" className="w-full" onValueChange={(v) => setDocType(v as DocType)}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                  <TabsTrigger value="ine">INE / IFE</TabsTrigger>
                  <TabsTrigger value="passport">Pasaporte</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Zonas de Carga */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadZone side="front" label="Parte Frontal (Con foto)" />
              {docType === 'ine' && (
                <UploadZone side="back" label="Parte Trasera" />
              )}
            </div>

            {/* Aviso de Privacidad Simplificado */}
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-xs text-blue-200">
              <ScanFace className="w-5 h-5 flex-shrink-0 text-blue-400" />
              <p>
                Tus documentos se procesan de forma encriptada y se utilizan únicamente para validar tu identidad. No compartimos esta información con terceros.
              </p>
            </div>

            {/* Botón de Envío */}
            <Button 
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
              onClick={handleSubmit}
              disabled={isLoading || !files.front}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analizando con IA...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Enviar y Verificar</span>
                </div>
              )}
            </Button>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}