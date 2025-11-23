/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, UploadCloud, X, Loader2, CheckCircle2, ScanFace, Camera 
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
  
  // Estado para archivos y previews
  const [files, setFiles] = useState<{ front: File | null; back: File | null }>({ front: null, back: null });
  const [previews, setPreviews] = useState<{ front: string | null; back: string | null }>({ front: null, back: null });

  // --- ESTADOS PARA LA CÁMARA ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<'front' | 'back' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  // -----------------------------

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE CÁMARA ---
  const startCamera = async (side: 'front' | 'back') => {
    setActiveSide(side);
    setIsCameraOpen(true);
    try {
      // Pedimos video, preferiblemente la cámara trasera ('environment') para documentos
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      toast.error("No se pudo acceder a la cámara. Verifica los permisos.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setActiveSide(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !activeSide) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Configurar canvas al tamaño del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar el frame actual
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convertir a archivo
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${activeSide}_capture.jpg`, { type: 'image/jpeg' });
          handleFileProcess(file, activeSide);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };
  // ------------------------

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file, side);
  };

  const handleFileProcess = (file: File, side: 'front' | 'back') => {
    // Validaciones (Actualizado a 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande. Máximo 15MB.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error("Solo se permiten imágenes (JPG, PNG).");
      return;
    }

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
    if (side === 'front' && frontInputRef.current) frontInputRef.current.value = '';
    if (side === 'back' && backInputRef.current) backInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!files.front) return toast.warn("Debes subir la parte frontal.");
    if (docType === 'ine' && !files.back) return toast.warn("Para INE, sube ambos lados.");

    setIsLoading(true);
    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('front', files.front);
    if (files.back) formData.append('back', files.back);

    try {
      await axios.post('/api/kyc/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      toast.success("Documentos enviados correctamente.");
      setTimeout(() => router.push('/quhealthy/provider/onboarding/checklist'), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al subir documentos.");
    } finally {
      setIsLoading(false);
    }
  };

  const UploadZone = ({ side, label }: { side: 'front' | 'back', label: string }) => (
    <div className="space-y-2">
      <Label className="text-gray-300 font-medium">{label}</Label>
      
      {previews[side] ? (
        <div className="relative group h-48 w-full rounded-xl overflow-hidden border-2 border-purple-500/50">
          <img src={previews[side]!} alt="Vista previa" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="destructive" size="sm" onClick={() => removeFile(side)}><X className="w-4 h-4 mr-2"/> Eliminar</Button>
          </div>
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white"/></div>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Botón de Subir Archivo */}
          <div 
            onClick={() => side === 'front' ? frontInputRef.current?.click() : backInputRef.current?.click()}
            className="flex-1 h-48 rounded-xl border-2 border-dashed border-gray-600 hover:border-purple-500 hover:bg-purple-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
          >
            <div className="p-3 rounded-full bg-gray-800 group-hover:bg-purple-500/20 transition-colors">
              <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
            </div>
            <p className="text-sm text-gray-300">Subir Archivo</p>
          </div>

          {/* Botón de Cámara */}
          <div 
            onClick={() => startCamera(side)}
            className="w-1/3 h-48 rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
          >
            <div className="p-3 rounded-full bg-gray-800 group-hover:bg-blue-500/20 transition-colors">
              <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
            </div>
            <p className="text-sm text-gray-300">Tomar Foto</p>
          </div>
        </div>
      )}
      <input type="file" ref={side === 'front' ? frontInputRef : backInputRef} className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, side)}/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 md:p-8">
      
      {/* MODAL DE CÁMARA */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="relative w-full max-w-2xl h-full md:h-auto aspect-[9/16] md:aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Botones de Control de Cámara */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
                <Button variant="outline" className="rounded-full h-12 w-12 bg-gray-800/50 border-white/20" onClick={stopCamera}>
                  <X className="w-6 h-6 text-white"/>
                </Button>
                <button onClick={capturePhoto} className="h-20 w-20 rounded-full bg-white border-4 border-gray-300 hover:scale-105 transition-transform"></button>
                <div className="w-12"></div> {/* Espaciador para centrar el botón de disparo */}
              </div>
              <div className="absolute top-4 left-0 right-0 text-center text-white/80 text-sm bg-black/30 py-2">
                Asegúrate que el texto sea legible
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="bg-gray-800 border-gray-700 text-white shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl w-fit mb-4 shadow-lg">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Verificación de Identidad</CardTitle>
            <CardDescription className="text-gray-400">Sube o toma una foto de tu identificación.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="flex justify-center">
              <Tabs defaultValue="ine" className="w-full" onValueChange={(v) => setDocType(v as DocType)}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                  <TabsTrigger value="ine">INE / IFE</TabsTrigger>
                  <TabsTrigger value="passport">Pasaporte</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadZone side="front" label="Parte Frontal" />
              {docType === 'ine' && <UploadZone side="back" label="Parte Trasera" />}
            </div>

            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-xs text-blue-200">
              <ScanFace className="w-5 h-5 flex-shrink-0 text-blue-400" />
              <p>Tus documentos se procesan de forma encriptada y se utilizan únicamente para validar tu identidad.</p>
            </div>

            <Button 
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
              onClick={handleSubmit}
              disabled={isLoading || !files.front}
            >
              {isLoading ? <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Analizando...</span></div> : <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /><span>Enviar y Verificar</span></div>}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}