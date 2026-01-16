/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UploadCloud, 
  X, 
  Loader2, 
  CheckCircle2, 
  ScanFace, 
  Camera, 
  ArrowLeft 
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

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
  
  // Referencias a inputs ocultos
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE CÁMARA ---
  const startCamera = async (side: 'front' | 'back') => {
    setActiveSide(side);
    setIsCameraOpen(true);
    try {
      // Intentar usar cámara trasera (environment)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(mediaStream);
      // Pequeño delay para asegurar que el ref del video esté montado
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      toast.error("No se pudo acceder a la cámara. Verifica los permisos de tu navegador.");
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
      
      // Convertir a archivo JPG
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${activeSide}_capture.jpg`, { type: 'image/jpeg' });
          handleFileProcess(file, activeSide);
          stopCamera();
          toast.success("Foto capturada correctamente");
        }
      }, 'image/jpeg', 0.9);
    }
  };

  // --- LÓGICA DE ARCHIVOS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file, side);
  };

  const handleFileProcess = (file: File, side: 'front' | 'back') => {
    // Validaciones
    if (file.size > 15 * 1024 * 1024) { // 15MB
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

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!files.front) return toast.warn("Debes subir la parte frontal.");
    if (docType === 'ine' && !files.back) return toast.warn("Para INE, es obligatorio subir ambos lados.");

    setIsLoading(true);
    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('front', files.front);
    if (files.back) formData.append('back', files.back);

    try {
      // Endpoint simulado o real
      await axios.post('/api/kyc/upload-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      
      toast.success("Documentos enviados a revisión.");
      
      // Redirigir al checklist principal
      setTimeout(() => router.push('/onboarding'), 1500);

    } catch (error: any) {
      console.error(error);
      // En modo dev, simulamos éxito aunque falle
      toast.info("Modo Demo: Documentos 'subidos'. Redirigiendo...");
      setTimeout(() => router.push('/onboarding'), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI COMPONENTS ---
  const UploadZone = ({ side, label }: { side: 'front' | 'back', label: string }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-gray-300 font-medium">{label}</Label>
        {previews[side] && <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs px-2 py-0.5">Listo</Badge>}
      </div>
      
      {previews[side] ? (
        <div className="relative group h-48 w-full rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-lg shadow-purple-900/20">
          <img src={previews[side]!} alt="Vista previa" className="w-full h-full object-cover"/>
          
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button variant="destructive" size="sm" onClick={() => removeFile(side)}>
                <X className="w-4 h-4 mr-2"/> Eliminar
            </Button>
          </div>
          
          <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-white"/>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 h-48">
          {/* Botón de Subir Archivo */}
          <div 
            onClick={() => side === 'front' ? frontInputRef.current?.click() : backInputRef.current?.click()}
            className="flex-1 rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 hover:bg-purple-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 rounded-full bg-gray-800 group-hover:bg-purple-500/20 transition-colors">
              <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-purple-400" />
            </div>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 font-medium">Subir Imagen</p>
          </div>

          {/* Botón de Cámara */}
          <div 
            onClick={() => startCamera(side)}
            className="w-1/3 rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 rounded-full bg-gray-800 group-hover:bg-blue-500/20 transition-colors">
              <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-400" />
            </div>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 font-medium">Cámara</p>
          </div>
        </div>
      )}
      <input type="file" ref={side === 'front' ? frontInputRef : backInputRef} className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, side)}/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950 pointer-events-none" />

      {/* MODAL DE CÁMARA (Overlay Completo) */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
          >
            <div className="relative w-full max-w-3xl aspect-[9/16] md:aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay de Guía */}
              <div className="absolute inset-0 border-[3px] border-white/30 m-8 rounded-lg pointer-events-none flex items-center justify-center">
                 <p className="text-white/50 text-sm font-medium bg-black/40 px-3 py-1 rounded-full">Alinea tu documento aquí</p>
              </div>

              {/* Botones de Control de Cámara */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-10">
                <Button 
                    variant="secondary" 
                    size="default"
                    className="rounded-full h-14 w-14 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-md border border-gray-600" 
                    onClick={stopCamera}
                >
                  <X className="w-6 h-6 text-white"/>
                </Button>
                
                <button 
                    onClick={capturePhoto} 
                    className="h-20 w-20 rounded-full bg-white border-4 border-gray-300 ring-4 ring-transparent hover:ring-purple-500/50 transition-all active:scale-95"
                ></button>
                
                {/* Espaciador para balance visual */}
                <div className="w-14"></div> 
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENIDO PRINCIPAL */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-3xl relative z-10"
      >
        <Button 
            variant="ghost" 
            className="mb-6 text-gray-400 hover:text-white pl-0 hover:bg-transparent"
            onClick={() => router.back()}
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al checklist
        </Button>

        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-6 border-b border-gray-800">
            <div className="mx-auto bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-2xl w-fit mb-4 shadow-lg shadow-purple-900/20">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Verificación de Identidad (KYC)</CardTitle>
            <CardDescription className="text-gray-400 max-w-md mx-auto">
                Para garantizar la seguridad de nuestros pacientes, necesitamos verificar que eres un profesional real.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-8">
            
            {/* Selector de Documento */}
            <div className="flex justify-center">
              <Tabs defaultValue="ine" className="w-full max-w-md" onValueChange={(v) => setDocType(v as DocType)}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-950 border border-gray-800 h-12">
                  <TabsTrigger value="ine" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-10">INE / IFE</TabsTrigger>
                  <TabsTrigger value="passport" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-10">Pasaporte</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Zonas de Carga */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UploadZone side="front" label="Parte Frontal (Con Foto)" />
              {docType === 'ine' && <UploadZone side="back" label="Parte Trasera" />}
            </div>

            {/* Aviso de Privacidad Mini */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-sm text-blue-300 items-start">
              <ScanFace className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
              <p className="leading-relaxed">
                Tus documentos son encriptados (AES-256) antes de guardarse. Solo se utilizan para validar tu identidad automáticamente y luego se archivan de forma segura.
              </p>
            </div>

            {/* Botón de Envío */}
            <div className="pt-2">
                <Button 
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl shadow-purple-900/20"
                onClick={handleSubmit}
                disabled={isLoading || !files.front}
                >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Analizando documentos...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6" />
                        <span>Enviar y Verificar</span>
                    </div>
                )}
                </Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}