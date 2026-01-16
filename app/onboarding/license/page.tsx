/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  UploadCloud, 
  X, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  Clock, 
  AlertTriangle,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type LicenseStatus = 'pending' | 'processing_ai' | 'in_review' | 'verified' | 'rejected';

export default function LicensePage() {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [status, setStatus] = useState<LicenseStatus>('pending');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Cargar estado inicial
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Simulamos llamada a API real
        const { data } = await axios.get('/api/license/status');
        setStatus(data.status);
        if (data.status === 'rejected') setRejectionReason(data.rejectionReason);
      } catch (error) {
        console.warn("API no disponible, usando estado 'pending' (Demo Mode)");
        setStatus('pending');
      } finally {
        setPageLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // --- HANDLERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) return toast.error("Máximo 10MB.");
    if (!selectedFile.type.startsWith('image/')) return toast.error("Solo imágenes JPG/PNG.");

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('license', file);

    try {
      // Llamada real
      await axios.post('/api/license/upload', formData);
      toast.success("Cédula enviada a verificación.");
      setStatus('in_review'); // Optimistic update
      
      setTimeout(() => router.push('/onboarding'), 1500);

    } catch (error: any) {
      console.error(error);
      // Fallback Demo
      toast.info("Modo Demo: Cédula enviada.");
      setTimeout(() => router.push('/onboarding'), 1500);
    } finally {
      setIsUploading(false);
    }
  };

  // --- RENDERIZADO CONDICIONAL ---

  if (pageLoading) {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500"/>
        </div>
    );
  }

  // Vista: Verificado
  if (status === 'verified') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-emerald-500/30 shadow-2xl shadow-emerald-900/10">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto bg-emerald-500/10 p-4 rounded-full w-fit mb-4 border border-emerald-500/20">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">¡Cédula Verificada!</h2>
            <p className="text-gray-400 mb-8">
              Tu perfil profesional está habilitado y cuenta con la insignia de verificación.
            </p>
            <Button onClick={() => router.push('/onboarding')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista: En Revisión
  if (status === 'in_review' || status === 'processing_ai') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-center">
          <CardContent className="pt-8">
            <div className="mx-auto bg-yellow-500/10 p-4 rounded-full w-fit mb-4 border border-yellow-500/20">
              <Clock className="w-12 h-12 text-yellow-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">En Revisión</h2>
            <p className="text-gray-400 mb-6">
              Estamos validando tu documento. Este proceso suele tomar menos de 24 horas.
            </p>
            <Button variant="outline" onClick={() => router.push('/onboarding')} className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
              Volver al Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista: Formulario de Carga
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Fondo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/10 via-gray-950 to-gray-950 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-xl relative z-10"
      >
        <Button 
            variant="ghost" 
            className="mb-6 text-gray-400 hover:text-white pl-0 hover:bg-transparent"
            onClick={() => router.back()}
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

        {/* Alerta de Rechazo */}
        {status === 'rejected' && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900 text-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verificación Rechazada</AlertTitle>
                <AlertDescription>
                    {rejectionReason || "El documento no era legible. Por favor intenta con una foto más clara."}
                </AlertDescription>
            </Alert>
        )}

        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-purple-500/10 p-4 rounded-full w-fit mb-4 border border-purple-500/20">
              <GraduationCap className="w-10 h-10 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Cédula Profesional</CardTitle>
            <CardDescription className="text-gray-400">
              Sube una foto clara de tu Cédula para habilitar tu perfil.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            
            <div className="space-y-3">
              <Label className="text-gray-300">Archivo de Imagen</Label>
              
              {preview ? (
                <div className="relative group h-64 w-full rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-lg">
                  <img src={preview} alt="Vista previa" className="w-full h-full object-contain bg-black/50"/>
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="destructive" onClick={removeFile}>
                      <X className="w-4 h-4 mr-2" /> Cambiar Imagen
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => inputRef.current?.click()}
                  className="h-64 w-full border-2 border-dashed border-gray-700 hover:border-purple-500 hover:bg-purple-500/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <div className="p-4 rounded-full bg-gray-800 group-hover:bg-purple-500/20 transition-colors mb-3">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
                  </div>
                  <p className="text-gray-400 font-medium group-hover:text-white">Haz clic para subir imagen</p>
                  <p className="text-xs text-gray-600 mt-1">JPG o PNG (Máx 10MB)</p>
                </div>
              )}
              <input 
                type="file" 
                ref={inputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleFileChange} 
              />
            </div>

            <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex gap-3 text-xs text-blue-200">
              <BookOpen className="w-5 h-5 flex-shrink-0 text-blue-400" />
              <p>
                Validamos tu cédula automáticamente contra el registro oficial para asegurar la calidad de los profesionales.
              </p>
            </div>

            <Button 
              className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/20"
              onClick={handleSubmit}
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Validar Cédula</span>
                </div>
              )}
            </Button>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}