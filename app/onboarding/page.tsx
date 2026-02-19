"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  UserCheck, 
  Store, 
  ShieldCheck,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  FileText,
  Sparkles,
  Trophy,
  Zap,
  Lock,
  Circle,
  Star,
  Gift,
  ChevronRight,
  Info,
  Target
} from "lucide-react";
import { toast } from "react-toastify";
import Confetti from 'react-confetti';

// Hooks
import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { OnboardingStepUI } from '@/types/onboarding';

// ShadCN UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * OnboardingChecklistPage Component
 * 
 * LÓGICA INTELIGENTE POR SECTOR:
 * - Sector SALUD (1): 100% = Profile + KYC + License (3 pasos)
 * - Sector BELLEZA (2): 100% = Profile + KYC (2 pasos, License opcional)
 * 
 * El cálculo del porcentaje solo cuenta pasos OBLIGATORIOS (isRequired)
 */

// Icon mapping
const getIconForStep = (id: string) => {
  switch (id) {
    case 'profile': return UserCheck;
    case 'kyc': return ShieldCheck;
    case 'license': return FileText;
    case 'marketplace': return Store;
    default: return ClipboardList;
  }
};

// Step Item Component
const StepItem = ({ 
  step, 
  index, 
  onAction,
  isNext 
}: { 
  step: OnboardingStepUI;
  index: number; 
  onAction: (path?: string) => void;
  isNext: boolean;
}) => {
  const Icon = getIconForStep(step.id);
  
  const isCompleted = step.isComplete;
  const isLocked = step.isLocked; 
  const isCurrent = !isCompleted && !isLocked && isNext;
  const isOptional = !step.isRequired; // Nueva propiedad

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.08 }}
      layout
      className="relative"
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border-2 group hover:shadow-2xl",
        isCurrent ? "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/50 shadow-2xl shadow-purple-900/20 ring-2 ring-purple-500/20" : "bg-gradient-to-br from-gray-900/30 to-gray-900/10 border-gray-800",
        isCompleted ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 shadow-lg shadow-emerald-900/10" : "",
        isLocked ? "bg-gray-900/30 border-gray-800 opacity-60 cursor-not-allowed" : "",
        !isCurrent && !isCompleted && !isLocked ? "bg-gradient-to-br from-gray-900/50 to-gray-900/30 border-gray-800 hover:border-gray-700" : ""
      )}>
        <CardContent className="p-0">
          <div className="flex items-start gap-6 p-6 md:p-8">
            
            {/* Step Number & Icon */}
            <div className="relative flex-shrink-0">
              <motion.div 
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-xl",
                  isCompleted ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-emerald-500/40" : "",
                  isCurrent ? "bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 text-white shadow-purple-500/40" : "",
                  isLocked ? "bg-gray-800 border-gray-700 text-gray-600 shadow-none" : "",
                  !isCurrent && !isCompleted && !isLocked ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-gray-400 hover:border-gray-600" : ""
                )}
                animate={isCurrent ? { 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ 
                  duration: 2, 
                  repeat: isCurrent ? Infinity : 0,
                  repeatDelay: 1
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : isLocked ? (
                  <Lock className="w-7 h-7" />
                ) : (
                  <Icon className="w-7 h-7" />
                )}
              </motion.div>
              
              {/* Step Number Badge */}
              <motion.div 
                className={cn(
                  "absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 shadow-lg",
                  isCompleted ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/30" : "",
                  isCurrent ? "bg-purple-600 border-purple-500 text-white shadow-purple-500/30" : "",
                  isLocked ? "bg-gray-700 border-gray-600 text-gray-400" : "",
                  !isCurrent && !isCompleted && !isLocked ? "bg-gray-800 border-gray-700 text-gray-400" : ""
                )}
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 1 }}
              >
                {index + 1}
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      "font-black text-xl",
                      isCompleted ? "text-emerald-400" : "",
                      isCurrent ? "text-white" : "",
                      isLocked ? "text-gray-500" : "",
                      !isCurrent && !isCompleted && !isLocked ? "text-gray-300" : ""
                    )}>
                      {step.title}
                    </h3>
                    
                    {isCurrent && (
                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg animate-pulse">
                        <Zap className="w-3 h-3 mr-1" />
                        En Progreso
                      </Badge>
                    )}
                    
                    {/* Badge de Opcional */}
                    {isOptional && !isCompleted && (
                      <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">
                        <Info className="w-3 h-3 mr-1" />
                        Opcional
                      </Badge>
                    )}
                    
                    {/* Badge de Requerido */}
                    {!isOptional && !isCompleted && !isLocked && !isCurrent && (
                      <Badge variant="outline" className="border-orange-500/40 text-orange-400 bg-orange-500/10">
                        <Target className="w-3 h-3 mr-1" />
                        Requerido
                      </Badge>
                    )}
                    
                    {isCompleted && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completado
                      </Badge>
                    )}

                    {isLocked && (
                      <Badge variant="outline" className="border-gray-700 text-gray-500 bg-gray-800/50">
                        <Lock className="w-3 h-3 mr-1" />
                        Bloqueado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Status & Actions */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Circle className={cn(
                    "w-2 h-2 fill-current",
                    isCompleted ? "text-emerald-500" : "",
                    isCurrent ? "text-purple-500 animate-pulse" : "",
                    isLocked ? "text-gray-600" : "",
                    !isCurrent && !isCompleted && !isLocked ? "text-gray-500" : ""
                  )} />
                  <span className={cn(
                    "text-xs font-semibold",
                    isCompleted ? "text-emerald-500" : "",
                    isCurrent ? "text-purple-400" : "",
                    isLocked ? "text-gray-600" : "",
                    !isCurrent && !isCompleted && !isLocked ? "text-gray-500" : ""
                  )}>
                    {step.statusText}
                  </span>
                </div>

                {/* Action Button */}
                {isCompleted ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-400">Completado</span>
                  </div>
                ) : (
                  <Button
                    disabled={isLocked}
                    onClick={() => onAction(step.actionPath)}
                    size="sm"
                    className={cn(
                      "group/btn shadow-lg h-10 px-5",
                      isCurrent 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/30" 
                        : isLocked
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600"
                    )}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Bloqueado
                      </>
                    ) : (
                      <>
                        {isCurrent ? 'Continuar' : 'Comenzar'}
                        <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Page Component
export default function OnboardingChecklistPage() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  
  // Hook
  const { steps, percentage, isLoading, error, userSector, refetch,
    finalize, // Función para finalizar onboarding
    isFinalizing // Estado de finalización para mostrar loader
   } = useOnboardingChecklist();

  // Calculate UI data
  const { completedSteps, totalRequiredSteps, nextStep, progressPercentage, canProceedToDashboard } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return { 
        completedSteps: 0, 
        totalRequiredSteps: 0, 
        nextStep: null,
        progressPercentage: 0,
        canProceedToDashboard: false
      };
    }

    // Solo cuenta pasos OBLIGATORIOS (isRequired)
    const requiredSteps = steps.filter(step => step.isRequired);
    const completedRequired = requiredSteps.filter(step => step.isComplete).length;
    const next = steps.find(step => !step.isComplete && !step.isLocked);

    // Can proceed si todos los pasos OBLIGATORIOS están completos
    const canProceed = requiredSteps.every(step => step.isComplete);

    return {
      completedSteps: completedRequired,
      totalRequiredSteps: requiredSteps.length,
      nextStep: next,
      progressPercentage: percentage,
      canProceedToDashboard: canProceed
    };
  }, [steps, percentage]);

  // Show confetti on completion
  useEffect(() => {
    if (canProceedToDashboard && !hasShownConfetti) {
      setShowConfetti(true);
      setHasShownConfetti(true);
      toast.success("🎉 ¡Felicidades! Has completado los pasos obligatorios", {
        position: "top-center",
        autoClose: 5000
      });
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [canProceedToDashboard, hasShownConfetti]);

  // Handle action
  const handleAction = (path?: string) => {
    if (path) {
      router.push(path);
    } else {
      toast.info("Esta acción no tiene una ruta configurada");
    }
  };

  const onFinalizeAndProceed = async () => {
    // Disparamos la sincronización en Java
    const success = await finalize();
    
    // Si la base de datos se actualizó correctamente, lo mandamos al dashboard
    if (success) {
      router.push('/provider/dashboard');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-16 h-16 text-purple-500" />
        </motion.div>
        <p className="text-gray-400 animate-pulse text-lg">Sincronizando tu perfil...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-gray-800 max-w-md w-full shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <AlertCircle className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-red-400 text-xl font-black">Error de Carga</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">No pudimos cargar tu información</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">{error}</p>
              <Button 
                onClick={refetch} 
                variant="outline" 
                className="w-full border-gray-700 text-white hover:bg-gray-800 h-11"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar Carga
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 relative overflow-hidden">
      
      {/* Confetti */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

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
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-6 py-3 mb-2 shadow-lg shadow-purple-500/10">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-bold text-purple-400">Configuración Inicial</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Bienvenido a QuHealthy
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Completa estos pasos para activar tu cuenta profesional y comenzar a recibir clientes
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl">
            <CardHeader className="pb-8 border-b border-gray-800/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
                    <ClipboardList className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white font-black">
                      Tu Progreso de Onboarding
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1 font-semibold">
                      {completedSteps} de {totalRequiredSteps} pasos obligatorios completados
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {canProceedToDashboard ? (
                    <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg">
                      <Trophy className="w-7 h-7 text-emerald-400" />
                      <span className="text-2xl font-black text-emerald-400">¡Completo!</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                        {progressPercentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Progress value={progressPercentage} className="h-4 shadow-inner" />
                {nextStep && !canProceedToDashboard && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                  >
                    <Zap className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-400">
                      Siguiente paso: {nextStep.title}
                    </span>
                  </motion.div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-8">
              <AnimatePresence mode="popLayout">
                {steps.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <Trophy className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                    <p className="text-xl font-bold text-white mb-2">
                      ¡No hay pasos pendientes!
                    </p>
                    <p className="text-gray-400">Todo está listo para comenzar tu experiencia</p>
                  </motion.div>
                ) : (
                  steps.map((step, index) => (
                    <StepItem 
                      key={step.id}
                      step={step} 
                      index={index} 
                      onAction={handleAction}
                      isNext={nextStep ? step.id === nextStep.id : false}
                    />
                  ))
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completion CTA */}
        <AnimatePresence>
          {canProceedToDashboard && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-emerald-500/30 shadow-2xl">
                <CardContent className="p-10 text-center space-y-8">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <Trophy className="w-24 h-24 text-emerald-400 mx-auto" />
                  </motion.div>
                  
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-white">
                      ¡Felicitaciones! 🎉
                    </h3>
                    <p className="text-gray-300 max-w-lg mx-auto text-lg leading-relaxed">
                      Has completado todos los pasos obligatorios. Tu cuenta está verificada y lista para comenzar.
                    </p>
                  </div>

                  <Separator className="bg-emerald-500/20" />

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
  size="lg"
  onClick={onFinalizeAndProceed}
  disabled={isFinalizing}
  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black px-10 py-6 text-lg shadow-2xl shadow-emerald-500/20 group h-14"
>
  {isFinalizing ? (
    <>
      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
      Sincronizando cuenta...
    </>
  ) : (
    <>
      <Sparkles className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
      Ir a mi Dashboard
      <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
    </>
  )}
</Button>
                  </div>

                  <div className="flex items-center justify-center gap-8 text-sm text-gray-400 pt-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold text-yellow-400">Cuenta Verificada</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <Gift className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-purple-400">Beneficios Activos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-blue-500/5 border-blue-500/20 shadow-lg">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl flex-shrink-0">
                <Info className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm text-blue-300/80 leading-relaxed">
                <p className="font-bold text-blue-400 mb-2 text-base">¿Necesitas ayuda con el onboarding?</p>
                <p>
                  Si tienes dudas sobre algún paso o necesitas asistencia, nuestro equipo de soporte está disponible para ayudarte. Contáctanos en{' '}
                  <a href="mailto:support@quhealthy.com" className="underline hover:text-blue-300 font-semibold">
                    support@quhealthy.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}