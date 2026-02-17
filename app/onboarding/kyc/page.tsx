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
  FileCheck,
  Sparkles,
  Shield,
  Info
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Hooks & Types
import { useKycOnboarding } from '@/hooks/useKycOnboarding';
import { DocumentType, KycDocumentResponse, VerificationStatus } from '@/types/onboarding';

// Tipo interno para la UI
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
  const streamRef = useRef<MediaStream | null>(null);
  
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
      }, 'image/jpeg', 0.9);
    }
  };

  // --- MANEJO DE ARCHIVOS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file, type);
  };

  const handleUpload = async (file: File, type: DocumentType) => {
    if (file.size > 10 * 1024 * 1024) { 
      toast.warning("El archivo es muy pesado (Máx 10MB).");
      return;
    }
    
    await uploadDocument(file, type);
  };

  // --- RENDERIZADO DE ESTADO ---
  const getStatusBadge = (status?: VerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/30 font-semibold">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-semibold animate-pulse">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Verificando
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500 border-gray-700 font-semibold">
            Pendiente
          </Badge>
        );
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
    const isProcessing = docData?.verificationStatus === 'PROCESSING';

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative group rounded-2xl border-2 transition-all p-5 flex flex-col gap-4",
          isApproved ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-lg shadow-emerald-500/10" : "",
          isRejected ? "border-red-500/40 bg-gradient-to-br from-red-500/10 to-red-500/5 shadow-lg shadow-red-500/10" : "",
          isProcessing ? "border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-lg shadow-blue-500/10 animate-pulse" : "",
          !isApproved && !isRejected && !isProcessing ? "border-dashed border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/30 hover:shadow-xl hover:shadow-purple-500/5" : ""
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Label className={cn(
              "font-bold text-base block mb-1",
              isApproved ? "text-emerald-400" : "",
              isRejected ? "text-red-400" : "",
              !isApproved && !isRejected ? "text-gray-200" : ""
            )}>
              {label}
            </Label>
            {description && (
              <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            )}
          </div>
          {getStatusBadge(docData?.verificationStatus)}
        </div>

        {/* Feedback de Error */}
        <AnimatePresence>
          {isRejected && docData?.rejectionReason && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-900/20 p-3 rounded-xl border border-red-500/30 flex gap-3 items-start"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">Motivo del rechazo:</p>
                <p className="text-xs text-red-300/80 leading-relaxed">{docData.rejectionReason}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview o Acciones */}
        {docData?.fileUrl ? (
          <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gray-950 border border-gray-800 group/preview shadow-inner">
            <img 
              src={docData.fileUrl} 
              alt="Preview" 
              className="w-full h-full object-contain"
            />
            
            {/* Overlay para Reintentar si falló */}
            {!isApproved && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-center p-4 opacity-0 group-hover/preview:opacity-100 transition-all duration-300">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => inputRef.current?.click()}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shadow-xl"
                >
                  <UploadCloud className="w-4 h-4 mr-2" /> 
                  Cambiar imagen
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3 h-36">
            {/* Botón Subir */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isUploading && inputRef.current?.click()}
              className="flex-1 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-pink-500/10 hover:border-purple-500/50 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all shadow-inner group/upload"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <span className="text-xs text-purple-400 font-semibold">Subiendo...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-gray-400 group-hover/upload:text-purple-400 transition-colors" />
                  <div className="text-center">
                    <span className="text-sm text-gray-300 font-semibold block">Subir Imagen</span>
                    <span className="text-xs text-gray-500">PNG, JPG (Max 10MB)</span>
                  </div>
                </>
              )}
            </motion.div>

            {/* Botón Cámara */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !isUploading && startCamera(type)}
              className="w-32 rounded-xl border-2 border-dashed border-gray-700 bg-gray-900/50 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-cyan-500/10 hover:border-blue-500/50 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all shadow-inner group/camera"
            >
              <Camera className="w-8 h-8 text-gray-400 group-hover/camera:text-blue-400 transition-colors" />
              <span className="text-xs text-gray-300 font-semibold">Cámara</span>
            </motion.div>
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
      </motion.div>
    );
  };

  // --- LÓGICA DE FINALIZACIÓN ---
  const handleFinishStep = () => {
    if (isKycComplete()) {
      toast.success("¡Identidad Verificada! Avanzando...");
      router.push('/onboarding');
      router.refresh();
    } else {
      toast.warn("Aún tienes documentos pendientes o rechazados.");
    }
  };

  // Calcular progreso
  const calculateProgress = () => {
    const totalSteps = 2;
    let completed = 0;
    
    const isIdentityApproved = 
      (documents['INE_FRONT']?.verificationStatus === 'APPROVED' && documents['INE_BACK']?.verificationStatus === 'APPROVED') ||
      documents['PASSPORT']?.verificationStatus === 'APPROVED';
    
    if (isIdentityApproved) completed++;
    if (documents['SELFIE']?.verificationStatus === 'APPROVED') completed++;
    
    return (completed / totalSteps) * 100;
  };

  // --- RENDER ---
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-16 h-16 text-purple-500" />
        </motion.div>
        <p className="text-gray-400 animate-pulse">Cargando verificación...</p>
      </div>
    );
  }

  const isIdentityApproved = 
    (documents['INE_FRONT']?.verificationStatus === 'APPROVED' && documents['INE_BACK']?.verificationStatus === 'APPROVED') ||
    documents['PASSPORT']?.verificationStatus === 'APPROVED';

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* --- MODAL CÁMARA --- */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
            <div className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-800">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay Guía */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn(
                    "border-4 border-white/60 shadow-2xl",
                    activeCaptureType === 'SELFIE' ? "w-64 h-80 rounded-full" : "w-96 h-60 rounded-3xl"
                  )} 
                />
                <div className="mt-6 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <p className="text-white text-sm font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {activeCaptureType === 'SELFIE' ? "Centra tu rostro en el óvalo" : "Centra el documento en el marco"}
                  </p>
                </div>
              </div>

              {/* Controles */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={stopCamera} 
                  className="rounded-full w-14 h-14 bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700 border-2 border-gray-700"
                >
                  <X className="w-6 h-6" />
                </Button>
                
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto} 
                  className="w-20 h-20 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm active:bg-white/30 transition-all shadow-2xl flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-white" />
                </motion.button>
                
                <div className="w-14" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENIDO --- */}
      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white hover:bg-gray-800 px-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> 
            Volver
          </Button>
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 px-4 py-2">
            <Sparkles className="w-3 h-3 mr-2" />
            Paso 2 de 4
          </Badge>
        </div>

        {/* Title & Progress */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">Verificación con IA</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Verificación de Identidad
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Nuestra IA validará tus documentos en segundos. Asegúrate de que las fotos sean claras y sin reflejos.
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progreso</span>
              <span className="font-bold text-purple-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: DOCUMENTOS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. SECCIÓN IDENTIFICACIÓN */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border-gray-800 shadow-2xl">
                <CardHeader className="border-b border-gray-800 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <ShieldCheck className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white font-black">
                        Identificación Oficial
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Sube tu INE/IFE o Pasaporte vigente
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UiDocType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-950 border border-gray-800 h-12 p-1 rounded-xl">
                      <TabsTrigger 
                        value="ine" 
                        disabled={isIdentityApproved}
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-10 rounded-lg transition-all font-semibold"
                      >
                        INE / IFE
                      </TabsTrigger>
                      <TabsTrigger 
                        value="passport" 
                        disabled={isIdentityApproved}
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-10 rounded-lg transition-all font-semibold"
                      >
                        Pasaporte
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* INE FLOW */}
                  {activeTab === 'ine' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UploadZone 
                        type="INE_FRONT" 
                        label="Frente de INE" 
                        description="Foto del lado frontal de tu credencial"
                        inputRef={ineFrontInput} 
                      />
                      <UploadZone 
                        type="INE_BACK" 
                        label="Reverso de INE" 
                        description="Foto del lado trasero de tu credencial"
                        inputRef={ineBackInput} 
                      />
                    </div>
                  )}

                  {/* PASSPORT FLOW */}
                  {activeTab === 'passport' && (
                    <UploadZone 
                      type="PASSPORT" 
                      label="Página de Datos del Pasaporte" 
                      description="Sube la página donde aparece tu foto y datos personales"
                      inputRef={passportInput} 
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 2. SECCIÓN PRUEBA DE VIDA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className={cn(
                "border-gray-800 transition-all",
                isIdentityApproved 
                  ? "bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl shadow-2xl" 
                  : "bg-gray-900/20 opacity-60 cursor-not-allowed"
              )}>
                <CardHeader className="border-b border-gray-800 pb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-xl",
                      isIdentityApproved ? "bg-purple-500/10" : "bg-gray-800"
                    )}>
                      <ScanFace className={cn(
                        "w-6 h-6",
                        isIdentityApproved ? "text-purple-400" : "text-gray-600"
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white font-black">
                        Prueba de Vida
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Compararemos tu rostro con tu identificación
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isIdentityApproved ? (
                    <UploadZone 
                      type="SELFIE" 
                      label="Selfie en Vivo" 
                      description="Tómate una foto ahora mismo. Sin lentes, gorras ni accesorios."
                      inputRef={selfieInput}
                    />
                  ) : (
                    <div className="p-6 rounded-2xl border-2 border-dashed border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 flex gap-4 items-start">
                      <div className="p-2 bg-yellow-500/10 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-yellow-400 font-semibold mb-1">Paso bloqueado</p>
                        <p className="text-sm text-yellow-200/80">
                          Completa y aprueba el paso 1 (Identificación Oficial) para desbloquear la prueba de vida.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* COLUMNA DERECHA: RESUMEN */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border-gray-800 shadow-2xl sticky top-8">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-lg font-black flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-purple-400" />
                  Estado del Proceso
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Checklist */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2",
                        isIdentityApproved 
                          ? "bg-emerald-500 border-emerald-500" 
                          : "bg-gray-800 border-gray-700"
                      )}>
                        {isIdentityApproved ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <span className={cn(
                        "font-semibold",
                        isIdentityApproved ? "text-emerald-400" : "text-gray-400"
                      )}>
                        Identificación
                      </span>
                    </div>
                    {isIdentityApproved && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">OK</Badge>}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-950 border border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2",
                        documents['SELFIE']?.verificationStatus === 'APPROVED'
                          ? "bg-emerald-500 border-emerald-500" 
                          : "bg-gray-800 border-gray-700"
                      )}>
                        {documents['SELFIE']?.verificationStatus === 'APPROVED' ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <ScanFace className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <span className={cn(
                        "font-semibold",
                        documents['SELFIE']?.verificationStatus === 'APPROVED' ? "text-emerald-400" : "text-gray-400"
                      )}>
                        Prueba de Vida
                      </span>
                    </div>
                    {documents['SELFIE']?.verificationStatus === 'APPROVED' && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">OK</Badge>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 border-t border-gray-800 space-y-4">
                  <Button 
                    className={cn(
                      "w-full h-12 font-bold shadow-xl transition-all",
                      isKycComplete()
                        ? "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                    )}
                    disabled={!isKycComplete()}
                    onClick={handleFinishStep}
                  >
                    {isKycComplete() ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Confirmar y Continuar
                      </>
                    ) : (
                      <>
                        Completar documentos
                      </>
                    )}
                  </Button>
                  
                  {!isKycComplete() && (
                    <p className="text-xs text-center text-gray-500 leading-relaxed">
                      Completa y aprueba todos los pasos requeridos para continuar con tu registro
                    </p>
                  )}
                </div>

                {/* Security Info */}
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-300/80 leading-relaxed">
                    <p className="font-semibold text-blue-400 mb-1">Datos protegidos</p>
                    <p>Tus documentos están encriptados y solo se usan para verificación. Nunca los compartimos con terceros.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}