"use client";

import React, { useEffect, useMemo, ReactNode } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, AlertCircle, CheckCircle2, XCircle, ArrowRight,
  UserCheck, Clock, GraduationCap, Store, ClipboardCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useOnboardingChecklist, OnboardingStep } from '@/hooks/useOnboardingChecklist'; // 1. Importamos el hook y el tipo

// --- Animaciones (sin cambios) ---
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};
const stepVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  })
};

// --- Componente para renderizar un paso individual (Buena práctica) ---
// Este componente se encarga de la lógica visual de cada tarea
const OnboardingStepItem: React.FC<{ step: OnboardingStep, index: number }> = ({ step, index }) => {
  const router = useRouter();
  
  // Mapeamos el statusText a íconos y colores para mantener el componente principal limpio
  const getStatusDisplayProps = (): { icon: ReactNode; color: string } => {
    switch (step.statusText) {
      case "En Revisión":
        return { icon: <Clock className="w-4 h-4" />, color: "text-yellow-400" };
      case "Acción Requerida":
        return { icon: <XCircle className="w-4 h-4" />, color: "text-red-400" };
      case "Completado":
        return { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-400" };
      default:
        return { icon: <AlertCircle className="w-4 h-4" />, color: "text-gray-400" };
    }
  };
  
  const statusDisplay = getStatusDisplayProps();

  const stepIcons = {
    kyc: <UserCheck className="w-6 h-6" />,
    license: <GraduationCap className="w-6 h-6" />,
    marketplace: <Store className="w-6 h-6" />,
  };

  return (
    <motion.div custom={index} variants={stepVariant} initial="hidden" animate="visible">
      <Card className={`bg-gray-700/50 border border-gray-600/70 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-opacity duration-300 ${step.actionDisabled && !step.isComplete ? 'opacity-60' : 'opacity-100'}`}>
        <div className={`p-2 rounded-full bg-purple-500/10 border border-purple-500/20 ${step.isComplete ? 'text-green-400' : 'text-purple-400'} self-start sm:self-center flex-shrink-0`}>
          {step.isComplete ? <CheckCircle2 className="w-6 h-6" /> : stepIcons[step.id]}
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-white">{step.title}</h3>
          <p className="text-sm text-gray-400 mb-1">{step.description}</p>
          <div className={`flex items-center text-xs gap-1 ${statusDisplay.color}`}>
            {statusDisplay.icon}
            <span>{step.statusText}</span>
          </div>
        </div>
        <div className="w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0">
          {!step.isComplete ? (
            <Button
              size="sm"
              className={`w-full sm:w-auto transition-all duration-200 whitespace-nowrap ${step.actionDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'}`}
              onClick={() => !step.actionDisabled && step.actionPath && router.push(step.actionPath)}
              disabled={step.actionDisabled}
              aria-label={step.title} // Usamos el título para accesibilidad
            >
              {step.actionDisabled ? step.statusText : 'Continuar'}
              {!step.actionDisabled && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </Button>
          ) : (
            <span className="text-sm font-medium text-green-400 flex items-center justify-end gap-1.5 w-full sm:w-auto">
              <CheckCircle2 className="w-4 h-4"/>
              Completado
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
};


// --- Componente Principal de la Página ---
export default function OnboardingChecklistPage(): React.JSX.Element {
  // 2. Usamos el nuevo hook para obtener la lista de tareas y el estado de la carga.
  const { steps: onboardingSteps, isLoading: loading, error, refetch } = useOnboardingChecklist();
  const router = useRouter();

  // 3. Usamos useMemo para calcular el progreso solo cuando los pasos cambian.
  const { completedSteps, totalRequiredSteps, progressPercentage } = useMemo(() => {
    const required = onboardingSteps.filter(step => step.isRequired);
    const completed = required.filter(step => step.isComplete);
    const total = required.length;
    const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    return {
      completedSteps: completed.length,
      totalRequiredSteps: total,
      progressPercentage: progress
    };
  }, [onboardingSteps]);

  // 4. Redirección automática si todo está completo.
  useEffect(() => {
    if (!loading && totalRequiredSteps > 0 && completedSteps === totalRequiredSteps) {
      console.log("✅ Onboarding completo! Redirigiendo al Dashboard...");
      toast.success("¡Configuración completa! Bienvenido/a.", { autoClose: 2000 });
      setTimeout(() => {
        router.replace('/quhealthy/profile/providers/dashboard');
      }, 1500);
    }
  }, [loading, completedSteps, totalRequiredSteps, router]);

  // Renderizado de Carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Renderizado de Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
        <Card className="bg-gray-800/90 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl max-w-md p-6">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} variant="outline" className="mt-4 w-full text-gray-300 border-gray-600 hover:bg-purple-900/30 hover:border-purple-700 hover:text-purple-300">
            Reintentar Carga
          </Button>
        </Card>
      </div>
    );
  }

  // Renderizado Principal del Tablero
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500 opacity-[0.12] blur-3xl animate-pulse rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500 opacity-[0.12] blur-3xl animate-pulse delay-1000 rounded-full" />
      </div>

      <motion.div
        {...fadeIn}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="bg-gray-800/90 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl">
          <CardHeader className="text-center items-center flex flex-col pt-8 pb-6">
            <div className="mx-auto bg-purple-500/10 border border-purple-500/20 p-4 rounded-full w-fit shadow-inner mb-4">
              <ClipboardCheck className="w-10 h-10 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Completa tu Configuración</CardTitle>
            <CardDescription className="text-gray-300 text-sm px-4">
              Sigue estos pasos para activar todas las funcionalidades de tu cuenta QuHealthy.
            </CardDescription>
            <div className="w-full px-6 pt-4">
              <Progress value={progressPercentage} className="w-full h-2 bg-gray-700 [&>div]:bg-purple-500" />
              <p className="text-xs text-purple-300 mt-1 text-right">
                {progressPercentage}% completado ({completedSteps}/{totalRequiredSteps} requeridos)
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-8">
            {onboardingSteps.map((step, index) => (
              // Usamos nuestro nuevo componente de item
              <OnboardingStepItem key={step.id} step={step} index={index} />
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}