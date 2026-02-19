/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowLeft,
  Store,
  Sparkles,
  Shield,
  Info
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Hooks
import { useLicenseOnboarding } from '@/hooks/useLicenseOnboarding';
import { useOnboardingChecklist } from '@/hooks/useOnboardingChecklist';
import { toast } from 'react-toastify';

/**
 * LicensePage Component
 * 
 * LÓGICA INTELIGENTE POR SECTOR:
 * - Sector SALUD (1): "Cédula Profesional" - Obligatoria
 * - Sector BELLEZA (2): "Licencia de Funcionamiento" - Opcional
 * 
 * Textos, íconos y mensajes se adaptan automáticamente
 */

export default function LicensePage() {
  const router = useRouter();
  
  // Hooks
  const { 
    license, 
    isLoading: pageLoading, 
    isUploading, 
    uploadLicense 
  } = useLicenseOnboarding();

  const { userSector } = useOnboardingChecklist(); // Obtenemos el sector del usuario

  // State
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Configuración dinámica según sector
  const config = {
    isSalud: userSector === 1,
    title: userSector === 1 ? 'Cédula Profesional' : 'Licencia de Funcionamiento',
    icon: userSector === 1 ? GraduationCap : Store,
    description: userSector === 1 
      ? 'Sube una foto clara de tu Cédula para habilitar tu perfil'
      : 'Opcional: Sube tu licencia sanitaria o permiso de operación para generar mayor confianza',
    infoText: userSector === 1
      ? 'Validamos tu cédula automáticamente contra el registro oficial para asegurar la calidad de los profesionales en QuHealthy.'
      : 'La licencia de funcionamiento es opcional pero ayuda a generar mayor confianza con tus clientes. Puedes completarla más tarde desde tu perfil.',
    buttonText: userSector === 1 ? 'Validar Cédula' : 'Subir Licencia',
    successTitle: userSector === 1 ? '¡Cédula Verificada!' : '¡Licencia Registrada!',
    color: userSector === 1 ? 'purple' : 'blue'
  };

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      return toast.error("Máximo 10MB.");
    }
    if (!selectedFile.type.startsWith('image/')) {
      return toast.error("Solo imágenes JPG/PNG.");
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
    await uploadLicense(file);
  };

  const handleSkip = () => {
    if (!config.isSalud) {
      toast.info("Puedes completar este paso más tarde desde tu perfil");
      router.push('/onboarding');
    }
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-purple-500" />
        </motion.div>
        <p className="text-gray-400 animate-pulse">Cargando información...</p>
      </div>
    );
  }

  // Approved state
  if (license?.status === 'APPROVED') {
    const IconComponent = config.icon;
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-900/50 border-emerald-500/30 shadow-2xl shadow-emerald-900/20">
            <CardContent className="pt-10 pb-8 text-center space-y-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className="mx-auto bg-emerald-500/10 p-6 rounded-2xl w-fit border border-emerald-500/20"
              >
                <CheckCircle2 className="w-20 h-20 text-emerald-500" />
              </motion.div>
              
              <div>
                <h2 className="text-3xl font-black mb-2 text-white">{config.successTitle}</h2>
                <p className="text-gray-400">Tu documentación ha sido verificada exitosamente</p>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-6 text-left border border-gray-700 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Número de Licencia</p>
                  <p className="text-white font-bold text-lg">{license.licenseNumber}</p>
                </div>
                {license.careerName && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Especialidad</p>
                    <p className="text-white font-medium">{license.careerName}</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => router.push('/onboarding')} 
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold h-12 shadow-xl"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Continuar con Onboarding
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Pending state
  if (license?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 shadow-2xl">
            <CardContent className="pt-10 pb-8 text-center space-y-6">
              <div className="mx-auto bg-yellow-500/10 p-6 rounded-2xl w-fit border border-yellow-500/20">
                <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />
              </div>
              
              <div>
                <h2 className="text-2xl font-black mb-2 text-white">Documento en Revisión</h2>
                <p className="text-gray-400">
                  Estamos validando tu {config.isSalud ? 'cédula' : 'licencia'} manualmente. 
                  Te notificaremos cuando esté lista.
                </p>
              </div>

              <Button 
                variant="outline" 
                onClick={() => router.push('/onboarding')} 
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 h-11"
              >
                Volver al Onboarding
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Upload form (Default or REJECTED)
  const IconComponent = config.icon;
  
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className={cn(
            "absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl",
            config.isSalud ? "bg-purple-500/10" : "bg-blue-500/10"
          )}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-xl relative z-10 space-y-6"
      >
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white pl-0 hover:bg-transparent"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 
            Volver
          </Button>

          {!config.isSalud && (
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Info className="w-3 h-3 mr-1" />
              Paso Opcional
            </Badge>
          )}
        </div>

        {/* Rejection Alert */}
        <AnimatePresence>
          {license?.status === 'REJECTED' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-bold text-base">Verificación No Exitosa</AlertTitle>
                <AlertDescription className="text-sm leading-relaxed mt-2">
                  {license.rejectionReason || "El documento no es legible. Intenta con una foto más clara y sin reflejos."}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <Card className="bg-gradient-to-br from-gray-900/95 to-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-6 bg-gradient-to-br from-gray-900 to-gray-800/50 border-b border-gray-800/50">
            <div className={cn(
              "mx-auto p-5 rounded-2xl w-fit mb-4 border",
              config.isSalud 
                ? "bg-purple-500/10 border-purple-500/20" 
                : "bg-blue-500/10 border-blue-500/20"
            )}>
              <IconComponent className={cn(
                "w-12 h-12",
                config.isSalud ? "text-purple-400" : "text-blue-400"
              )} />
            </div>
            
            <CardTitle className="text-3xl font-black text-white mb-2">
              {config.title}
            </CardTitle>
            <CardDescription className="text-gray-400 text-base max-w-md mx-auto">
              {config.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-8 p-8">
            
            {/* File Input */}
            <div className="space-y-3">
              <Label className="text-gray-300 font-semibold text-sm">
                Archivo de Imagen *
              </Label>
              
              {preview ? (
                <div className="relative group h-80 w-full rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-xl bg-black">
                  <img 
                    src={preview} 
                    alt="Vista previa" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      variant="destructive" 
                      onClick={removeFile}
                      className="shadow-xl"
                    >
                      <X className="w-4 h-4 mr-2" /> 
                      Cambiar Imagen
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "h-80 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group",
                    config.isSalud
                      ? "border-gray-700 hover:border-purple-500 hover:bg-purple-500/5"
                      : "border-gray-700 hover:border-blue-500 hover:bg-blue-500/5"
                  )}
                >
                  <div className={cn(
                    "p-5 rounded-2xl transition-colors mb-4",
                    config.isSalud
                      ? "bg-gray-800 group-hover:bg-purple-500/20"
                      : "bg-gray-800 group-hover:bg-blue-500/20"
                  )}>
                    <UploadCloud className={cn(
                      "w-10 h-10 transition-colors",
                      config.isSalud
                        ? "text-gray-400 group-hover:text-purple-400"
                        : "text-gray-400 group-hover:text-blue-400"
                    )} />
                  </div>
                  <p className="text-gray-400 font-semibold group-hover:text-white text-lg">
                    Haz clic para subir imagen
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    JPG o PNG (Máx 10MB)
                  </p>
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

            {/* Info Box */}
            <div className={cn(
              "border rounded-2xl p-5 flex gap-4 text-sm",
              config.isSalud
                ? "bg-blue-900/10 border-blue-900/30 text-blue-200"
                : "bg-emerald-900/10 border-emerald-900/30 text-emerald-200"
            )}>
              <BookOpen className={cn(
                "w-6 h-6 flex-shrink-0",
                config.isSalud ? "text-blue-400" : "text-emerald-400"
              )} />
              <p className="leading-relaxed">
                {config.infoText}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {!config.isSalud && (
                <Button 
                  variant="outline"
                  className="flex-1 h-12 border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={handleSkip}
                >
                  Omitir por Ahora
                </Button>
              )}
              
              <Button 
                className={cn(
                  "h-12 text-base font-bold shadow-xl transition-all",
                  !config.isSalud ? "flex-1" : "w-full",
                  config.isSalud
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-900/20"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-blue-900/20"
                )}
                onClick={handleSubmit}
                disabled={isUploading || !file}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analizando con IA...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>{config.buttonText}</span>
                  </div>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Tus documentos están encriptados y protegidos</span>
        </div>
      </motion.div>
    </div>
  );
}