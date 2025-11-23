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
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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

  // 1. Cargar el estado actual al entrar
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get('/api/license/status', { withCredentials: true });
        setStatus(data.status);
        if (data.status === 'rejected') {
          setRejectionReason(data.rejectionReason);
        }
      } catch (error) {
        console.error("Error al cargar estado de licencia");
      } finally {
        setPageLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validaciones
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      return toast.error("El archivo es demasiado grande (Máx 10MB).");
    }
    if (!selectedFile.type.startsWith('image/')) {
      return toast.error("Por favor sube una imagen (JPG o PNG).");
    }

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
      const { data } = await axios.post('/api/license/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      // Verificamos la respuesta de la IA
      if (data.status === 'verified') {
        toast.success("¡Cédula verificada exitosamente!");
        setStatus('verified');
      } else {
        toast.info("Cédula recibida. Pasó a revisión manual.");
        setStatus('in_review');
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al subir la cédula.");
    } finally {
      setIsUploading(false);
    }
  };

  if (pageLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-500"/></div>;
  }

  // --- VISTA: APROBADO ---
  if (status === 'verified') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-green-500/30 text-white text-center p-8 shadow-2xl shadow-green-900/20">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="mx-auto bg-green-500/10 p-4 rounded-full w-fit mb-4"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-green-400">¡Perfil Profesional Verificado!</h2>
          <p className="text-gray-400 mb-8">
            Hemos validado tu Cédula Profesional. Tu perfil ahora mostrará la insignia de verificación.
          </p>
          <Button onClick={() => router.push('/provider/onboarding/checklist')} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
            Continuar
          </Button>
        </Card>
      </div>
    );
  }

  // --- VISTA: EN REVISIÓN ---
  if (status === 'in_review' || status === 'processing_ai') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white text-center p-8">
          <div className="mx-auto bg-yellow-500/10 p-4 rounded-full w-fit mb-4">
            <Clock className="w-12 h-12 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2">En Revisión</h2>
          <p className="text-gray-400 mb-6">
            Hemos recibido tu documento y nuestro equipo (o la IA) lo está analizando. Te notificaremos en cuanto esté listo.
          </p>
          <Button variant="outline" onClick={() => router.push('/provider/onboarding/checklist')} className="w-full border-gray-600 text-gray-300">
            Volver al Checklist
          </Button>
        </Card>
      </div>
    );
  }

  // --- VISTA: FORMULARIO DE SUBIDA ---
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-xl"
      >
        {/* Alerta de Rechazo */}
        {status === 'rejected' && (
           <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div>
                  <h4 className="font-bold text-red-400">Verificación Rechazada</h4>
                  <p className="text-sm text-red-200">{rejectionReason || "El documento no era legible o no corresponde a una Cédula Profesional válida."}</p>
              </div>
           </div>
        )}

        <Card className="bg-gray-800 border-gray-700 text-white shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-purple-500/10 p-4 rounded-full w-fit mb-4">
              <GraduationCap className="w-10 h-10 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Cédula Profesional</CardTitle>
            <CardDescription className="text-gray-400">
              Sube una foto clara de tu Cédula (física o digital) para habilitar tu perfil.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            
            <div className="space-y-2">
              <Label className="text-gray-300">Documento</Label>
              
              {preview ? (
                <div className="relative group h-64 w-full rounded-xl overflow-hidden border-2 border-purple-500/50">
                  <img src={preview} alt="Cédula" className="w-full h-full object-contain bg-black/50"/>
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="destructive" onClick={removeFile}>
                      <X className="w-4 h-4 mr-2" /> Cambiar Imagen
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => inputRef.current?.click()}
                  className="h-64 w-full border-2 border-dashed border-gray-600 hover:border-purple-500 hover:bg-purple-500/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <div className="p-4 rounded-full bg-gray-800 group-hover:bg-purple-500/20 transition-colors mb-3">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
                  </div>
                  <p className="text-gray-300 font-medium">Haz clic para subir imagen</p>
                  <p className="text-xs text-gray-500 mt-1">JPG o PNG (Máx 10MB)</p>
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

            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 flex gap-3 text-xs text-purple-200">
              <BookOpen className="w-5 h-5 flex-shrink-0 text-purple-400" />
              <p>
                Validamos tu cédula automáticamente con Inteligencia Artificial para asegurar la calidad de los profesionales en QuHealthy.
              </p>
            </div>

            <Button 
              className="w-full h-12 text-lg font-semibold bg-purple-600 hover:bg-purple-700 shadow-lg"
              onClick={handleSubmit}
              disabled={isUploading || !file}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verificando con IA...</span>
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