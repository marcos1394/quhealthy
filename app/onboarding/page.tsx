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
  Info
} from "lucide-react";
import { toast } from "react-toastify";
import Confetti from 'react-confetti';

// Hooks
import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { OnboardingStepUI } from '@/types/onboarding'; // 1. Importar el tipo correcto

// ShadCN UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


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
  step: OnboardingStepUI; // 2. Actualizar el tipo de la prop
  index: number; 
  onAction: (path?: string) => void;
  isNext: boolean;
}) => {
  const Icon = getIconForStep(step.id);
  
  // 3. AJUSTE DE LÓGICA
  const isCompleted = step.isComplete;
  
  // Antes: const isLocked = step.actionDisabled && !isCompleted;
  // Ahora: Usamos directo la propiedad del nuevo tipo
  const isLocked = step.isLocked; 
  
  const isCurrent = !isCompleted && !isLocked && isNext;
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
        "overflow-hidden transition-all duration-300 border-2 group",
        isCurrent ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/50 shadow-xl shadow-purple-900/20 ring-2 ring-purple-500/20" : "",
        isCompleted ? "bg-emerald-500/5 border-emerald-500/30" : "",
        isLocked ? "bg-gray-900/20 border-gray-800 opacity-60" : "",
        !isCurrent && !isCompleted && !isLocked ? "bg-gray-900/40 border-gray-800 hover:border-gray-700" : ""
      )}>
        <CardContent className="p-0">
          <div className="flex items-start gap-4 p-6">
            
            {/* Step Number & Icon */}
            <div className="relative flex-shrink-0">
              <motion.div 
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "",
                  isCurrent ? "bg-gradient-to-br from-purple-600 to-pink-600 border-purple-500 text-white shadow-lg shadow-purple-500/30" : "",
                  isLocked ? "bg-gray-800 border-gray-700 text-gray-600" : "",
                  !isCurrent && !isCompleted && !isLocked ? "bg-gray-800 border-gray-700 text-purple-400" : ""
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
                  <CheckCircle2 className="w-7 h-7" />
                ) : isLocked ? (
                  <Lock className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </motion.div>
              
              {/* Step Number Badge */}
              <div className={cn(
                "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border-2",
                isCompleted ? "bg-emerald-500 border-emerald-400 text-white" : "",
                isCurrent ? "bg-purple-600 border-purple-500 text-white"  : "",
                isLocked ? "bg-gray-700 border-gray-600 text-gray-400" : "",
                !isCurrent && !isCompleted && !isLocked ? "bg-gray-800 border-gray-700 text-gray-400" : ""
              )}>
                {index + 1}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn(
                    "font-black text-lg",
                    isCompleted ? "text-emerald-400" : "",
                    isCurrent ? "text-white" : "",
                    isLocked ? "text-gray-500" : "",
                    !isCurrent && !isCompleted && !isLocked ? "text-gray-300" : ""
                  )}>
                    {step.title}
                  </h3>
                  
                  {isCurrent && (
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 animate-pulse">
                      <Zap className="w-3 h-3 mr-1" />
                      Actual
                    </Badge>
                  )}
                  
                  {/* Al ser onboarding, todo es requerido por defecto si no está completo */}
                  {!isCompleted && (
                    <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10">
                      Requerido
                    </Badge>
                  )}
                  
                  {isCompleted && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completado
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-3">
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
                  <div className="flex items-center gap-2 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">Completado</span>
                  </div>
                ) : (
                  <Button
                    disabled={isLocked}
                    onClick={() => onAction(step.actionPath)}
                    size="sm"
                    className={cn(
                      "group/btn",
                      isCurrent 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg" 
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                    )}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Bloqueado
                      </>
                    ) : (
                      <>
                        Continuar
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
const { steps, percentage, isLoading, error, refetch } = useOnboardingChecklist();

// 2. Cálculos de UI: Derivamos los contadores para el Card
  const { completedSteps, totalRequiredSteps, nextStep, progressPercentage } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return { 
        completedSteps: 0, 
        totalRequiredSteps: 0, 
        nextStep: null,
        progressPercentage: 0
      };
    }

    // Calculamos completados
    const completed = steps.filter(step => step.isComplete).length;
    const total = steps.length;
    
    // Buscamos el siguiente paso lógico (El primero que no esté completo ni bloqueado)
    // OJO: Si hay uno REJECTED, ese debería ser el prioritario (depende de tu lógica, pero isLocked lo maneja)
    const next = steps.find(step => !step.isComplete && !step.isLocked);

    return {
      completedSteps: completed,
      totalRequiredSteps: total,
      nextStep: next,
      progressPercentage: percentage // Usamos el porcentaje real que calculó el backend (o hook)
    };
  }, [steps, percentage]);

// Show confetti on completion
  useEffect(() => {
    // Usamos 'percentage' directo del hook
    if (percentage === 100 && !hasShownConfetti) {
      setShowConfetti(true);
      setHasShownConfetti(true);
      toast.success("🎉 ¡Felicidades! Has completado el onboarding", {
        position: "top-center",
        autoClose: 5000
      });
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [percentage, hasShownConfetti]);

  // Handle action
  const handleAction = (path?: string) => {
    if (path) {
      router.push(path);
    } else {
      toast.info("Esta acción no tiene una ruta configurada");
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
          <Sparkles className="w-12 h-12 text-purple-500" />
        </motion.div>
        <p className="text-gray-400 animate-pulse">Sincronizando tu perfil...</p>
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
          <Card className="bg-gray-900 border-gray-800 max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <CardTitle className="text-red-400">Error de Carga</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">{error}</p>
              <Button 
                onClick={refetch} 
                variant="outline" 
                className="w-full border-gray-700 text-white hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
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

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">Configuración Inicial</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Bienvenido a QuHealthy
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Completa estos pasos para activar tu cuenta y comenzar a recibir pacientes
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border-gray-800 shadow-2xl">
            <CardHeader className="pb-6 border-b border-gray-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">
                      Tu Progreso
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      {/* Usamos las variables calculadas en el useMemo */}
                      {completedSteps} de {totalRequiredSteps} pasos completados
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Usamos 'percentage' (del hook) o 'progressPercentage' (del useMemo), ambos funcionan */}
                  {progressPercentage === 100 ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Trophy className="w-6 h-6" />
                      <span className="text-2xl font-black">¡Completo!</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {progressPercentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Progress value={progressPercentage} className="h-3" />
                {nextStep && (
                  <div className="flex items-center gap-2 text-sm text-purple-400">
                    <Zap className="w-4 h-4" />
                    <span>Siguiente: {nextStep.title}</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              <AnimatePresence mode="popLayout">
                {steps.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-white">
                      ¡No hay pasos pendientes!
                    </p>
                    <p className="text-gray-400 mt-2">Todo está listo para comenzar</p>
                  </motion.div>
                ) : (
                  steps.map((step, index) => (
                    <StepItem 
                      key={step.id} // ✅ Corrección: step.id ahora es un string único
                      step={step} 
                      index={index} 
                      onAction={handleAction} // ✅ Corrección: Pasa la función que espera (path: string)
                      isNext={nextStep ? step.id === nextStep.id : false} // ✅ Corrección: Comparación segura de IDs
                    />
                  ))
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completion CTA */}
        <AnimatePresence>
          {progressPercentage === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-emerald-500/30 shadow-xl">
                <CardContent className="p-8 text-center space-y-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Trophy className="w-20 h-20 text-emerald-400 mx-auto" />
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">
                      ¡Felicitaciones!
                    </h3>
                    <p className="text-gray-300 max-w-md mx-auto">
                      Has completado todos los pasos requeridos. Ya puedes acceder a tu dashboard y comenzar a recibir pacientes.
                    </p>
                  </div>

                  <Separator className="bg-emerald-500/20" />

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      size="lg"
                      onClick={() => router.push('/dashboard')}
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold px-8 shadow-xl group"
                    >
                      <Sparkles className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Ir a mi Dashboard
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>Cuenta Verificada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-400" />
                      <span>Beneficios Activos</span>
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
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300/80">
                <p className="font-semibold text-blue-400 mb-1">¿Necesitas ayuda?</p>
                <p>
                  Si tienes dudas sobre algún paso, puedes contactar a nuestro equipo de soporte en{' '}
                  <a href="mailto:support@quhealthy.com" className="underline hover:text-blue-300">
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