"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  AlertCircle,
  FileCheck
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Hooks & Types
import { useKycOnboarding } from '@/hooks/useKycOnboarding';
import { DocumentType, KycDocumentResponse, VerificationStatus } from '@/types/onboarding';

// Tipo interno para la UI (No confundir con el del Backend)
type UiDocType = 'ine' | 'passport';

export default function KycPage() {
  const router = useRouter();
  
  // Hook de Lógica de Negocio
  const { 
    documents, 
    uploadingState, 
    uploadDocument, 
    isKycComplete,
    isLoading: isInitialLoading 
  } = useKycOnboarding();

  // Estado UI Local
  const [activeTab, setActiveTab] = useState<UiDocType>('ine');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeCaptureType, setActiveCaptureType] = useState<DocumentType | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null); // ✅ Ref para limpiar stream correctamente
  
  // Inputs ocultos
  const ineFrontInput = useRef<HTMLInputElement>(null);
  const ineBackInput = useRef<HTMLInputElement>(null);
  const passportInput = useRef<HTMLInputElement>(null);
  const selfieInput = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE CÁMARA ---
  const startCamera = async (docType: DocumentType) => {
    setActiveCaptureType(docType);
    setIsCameraOpen(true);
    try {
      const isSelfie = docType === 'SELFIE';
      const constraints = {
        video: { 
          facingMode: isSelfie ? 'user' : 'environment',
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error cámara:", err);
      toast.error("No se pudo acceder a la cámara.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setActiveCaptureType(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !activeCaptureType) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      // Si es selfie, espejear horizontalmente para UX natural
      if (activeCaptureType === 'SELFIE') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${activeCaptureType}_capture.jpg`, { type: 'image/jpeg' });
          handleUpload(file, activeCaptureType);
          stopCamera();
        }
      }, 'image/jpeg', 0.9); // Calidad 90%
    }
  };

  // --- MANEJO DE ARCHIVOS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file, type);
  };

  const handleUpload = async (file: File, type: DocumentType) => {
    // Validaciones básicas antes de llamar al hook
    if (file.size > 10 * 1024 * 1024) { 
      toast.warning("El archivo es muy pesado (Máx 10MB).");
      return;
    }
    
    // Llamada al Hook (Sube a S3 + Analiza con Gemini)
    await uploadDocument(file, type);
  };

  // --- RENDERIZADO DE ESTADO ---
  const getStatusBadge = (status?: VerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Aprobado ✅</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rechazado ❌</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse">Analizando AI 🤖</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500 border-gray-700">Pendiente</Badge>;
    }
  };

  // Componente Reutilizable de Zona de Carga
  const UploadZone = ({ 
    type, 
    label, 
    description,
    inputRef 
  }: { 
    type: DocumentType, 
    label: string, 
    description?: string,
    inputRef: React.RefObject<HTMLInputElement | null> 
  }) => {
    const docData = documents[type];
    const isUploading = uploadingState[type];
    const isApproved = docData?.verificationStatus === 'APPROVED';
    const isRejected = docData?.verificationStatus === 'REJECTED';

    return (
      <div className={cn(
        "relative group rounded-xl border-2 transition-all p-4 flex flex-col gap-3",
        isApproved 
          ? "border-emerald-500/30 bg-emerald-500/5" 
          : isRejected 
            ? "border-red-500/30 bg-red-500/5"
            : "border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50"
      )}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Label className={cn("font-semibold text-base", isApproved ? "text-emerald-400" : "text-gray-200")}>
              {label}
            </Label>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
          {getStatusBadge(docData?.verificationStatus)}
        </div>

        {/* Feedback de Error */}
        {isRejected && docData?.rejectionReason && (
          <div className="bg-red-900/20 p-2 rounded-lg border border-red-500/20 flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300">{docData.rejectionReason}</p>
          </div>
        )}

        {/* Preview o Acciones */}
        {docData?.fileUrl ? (
          <div className="relative h-40 w-full mt-2 rounded-lg overflow-hidden bg-black/50 border border-gray-700 group/preview">
            <img src={docData.fileUrl} alt="Preview" className="w-full h-full object-contain" />
            
            {/* Overlay para Reintentar si falló */}
            {!isApproved && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                 <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
                    <UploadCloud className="w-4 h-4 mr-2" /> Reintentar
                 </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3 h-32 mt-2">
             {/* Botón Subir */}
             <div 
                onClick={() => !isUploading && inputRef.current?.click()}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-purple-500/10 hover:border-purple-500/30 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all"
             >
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-purple-500" /> : <UploadCloud className="w-6 h-6 text-gray-400" />}
                <span className="text-xs text-gray-400 font-medium">{isUploading ? "Subiendo..." : "Subir Imagen"}</span>
             </div>

             {/* Botón Cámara */}
             <div 
                onClick={() => !isUploading && startCamera(type)}
                className="w-1/3 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-blue-500/10 hover:border-blue-500/30 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all"
             >
                <Camera className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">Cámara</span>
             </div>
          </div>
        )}

        {/* Input Oculto */}
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/png, image/jpeg, image/jpg" 
          onChange={(e) => handleFileChange(e, type)}
        />
      </div>
    );
  };

  // --- LÓGICA DE FINALIZACIÓN ---
  const handleFinishStep = () => {
    // Validación final
    if (isKycComplete()) {
        toast.success("¡Identidad Verificada! Avanzando...");
        router.push('/onboarding');
        router.refresh();
    } else {
        toast.warn("Aún tienes documentos pendientes o rechazados.");
    }
  };

  // --- RENDER ---
  if (isInitialLoading) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        </div>
    );
  }

  // ¿Ya se aprobó la identidad base (INE/Pasaporte)?
  const isIdentityApproved = 
    (documents['INE_FRONT']?.verificationStatus === 'APPROVED' && documents['INE_BACK']?.verificationStatus === 'APPROVED') ||
    documents['PASSPORT']?.verificationStatus === 'APPROVED';

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-x-hidden font-sans">
      
      {/* Fondo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black pointer-events-none" />

      {/* --- MODAL CÁMARA --- */}
      <AnimatePresence>
        {isCameraOpen && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
            >
                <div className="relative w-full h-full md:h-[90vh] md:w-auto md:aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Overlay Guía */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                         <div className={cn(
                            "border-2 border-white/50 rounded-2xl",
                            activeCaptureType === 'SELFIE' ? "w-64 h-80 rounded-full" : "w-80 h-52"
                         )} />
                         <p className="mt-4 bg-black/50 px-4 py-2 rounded-full text-white text-sm backdrop-blur-md">
                            {activeCaptureType === 'SELFIE' ? "Centra tu rostro" : "Centra el documento"}
                         </p>
                    </div>

                    {/* Controles */}
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
                        <Button variant="ghost" size="default" onClick={stopCamera} className="rounded-full bg-gray-800/50 text-white hover:bg-gray-700">
                            <X className="w-6 h-6" />
                        </Button>
                        <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white bg-white/20 active:scale-95 transition-transform" />
                        <div className="w-10" /> {/* Spacer */}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENIDO --- */}
      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        
        {/* Header de Navegación */}
        <div className="flex items-center justify-between">
            <Button variant="ghost" className="text-gray-400 hover:text-white pl-0" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 w-4 h-4" /> Volver al checklist
            </Button>
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                Paso 2 de 4
            </Badge>
        </div>

        <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Verificación de Identidad
            </h1>
            <p className="text-gray-400">
                Nuestra IA validará tus documentos en segundos. Asegúrate de que las fotos sean claras y sin reflejos.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUMNA IZQUIERDA: DOCUMENTOS */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. SECCIÓN IDENTIFICACIÓN */}
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                            <ShieldCheck className="w-5 h-5 text-blue-500" /> 
                            1. Identificación Oficial
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UiDocType)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-950 border border-gray-800">
                                <TabsTrigger value="ine" disabled={isIdentityApproved}>INE / IFE</TabsTrigger>
                                <TabsTrigger value="passport" disabled={isIdentityApproved}>Pasaporte</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* INE FLOW */}
                        {activeTab === 'ine' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UploadZone 
                                    type="INE_FRONT" 
                                    label="Frente" 
                                    inputRef={ineFrontInput} 
                                />
                                <UploadZone 
                                    type="INE_BACK" 
                                    label="Reverso" 
                                    inputRef={ineBackInput} 
                                />
                            </div>
                        )}

                        {/* PASSPORT FLOW */}
                        {activeTab === 'passport' && (
                            <UploadZone 
                                type="PASSPORT" 
                                label="Página de Datos" 
                                description="Sube la página donde aparece tu foto y datos personales."
                                inputRef={passportInput} 
                            />
                        )}
                    </CardContent>
                </Card>

                {/* 2. SECCIÓN PRUEBA DE VIDA (Solo se habilita si ID está OK) */}
                <Card className={cn("border-gray-800 transition-colors", isIdentityApproved ? "bg-gray-900/50" : "bg-gray-900/20 opacity-50")}>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2 text-lg text-white">
                            <ScanFace className={cn("w-5 h-5", isIdentityApproved ? "text-purple-500" : "text-gray-600")} /> 
                            2. Prueba de Vida
                        </CardTitle>
                        <CardDescription>
                            Compararemos tu rostro con la foto de tu identificación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isIdentityApproved ? (
                            <UploadZone 
                                type="SELFIE" 
                                label="Selfie en Vivo" 
                                description="Tómate una foto ahora mismo. Sin lentes ni gorras."
                                inputRef={selfieInput}
                            />
                        ) : (
                            <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-200 text-sm flex gap-3 items-center">
                                <AlertCircle className="w-4 h-4" />
                                <span>Completa el paso 1 para desbloquear la prueba de vida.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* COLUMNA DERECHA: RESUMEN Y ACCIÓN */}
            <div className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800 sticky top-8">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Estado del Proceso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Identificación</span>
                                {isIdentityApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-gray-600">-</span>}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Prueba de Vida</span>
                                {documents['SELFIE']?.verificationStatus === 'APPROVED' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-gray-600">-</span>}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                             <Button 
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                disabled={!isKycComplete()}
                                onClick={handleFinishStep}
                             >
                                Confirmar y Finalizar
                             </Button>
                             {!isKycComplete() && (
                                <p className="text-xs text-center text-gray-500 mt-2">
                                    Completa todos los pasos requeridos para continuar.
                                </p>
                             )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}