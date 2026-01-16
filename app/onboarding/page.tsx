"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  FileText
} from "lucide-react";
import { toast } from "react-toastify";

// Hooks
import { useOnboardingChecklist, OnboardingStep } from "@/hooks/useOnboardingChecklist";

// ShadCN UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// --- Helper: Mapeo de Iconos según el ID del paso ---
const getIconForStep = (id: string) => {
  switch (id) {
    case 'profile': return UserCheck;
    case 'kyc': return ShieldCheck;
    case 'license': return FileText;
    case 'marketplace': return Store;
    default: return ClipboardList;
  }
};

// --- Sub-componente: Item de la Lista ---
const StepItem = ({ step, index, onAction }: { step: OnboardingStep; index: number; onAction: (path?: string) => void }) => {
  const Icon = getIconForStep(step.id);
  
  // Lógica visual basada en los datos del backend
  const isCompleted = step.isComplete;
  const isLocked = step.actionDisabled && !isCompleted;
  const isCurrent = !isCompleted && !isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border transition-all duration-300
        ${isCurrent ? "bg-purple-900/20 border-purple-500/50 shadow-lg shadow-purple-900/10" : "bg-gray-900/40 border-gray-800"}
        ${isLocked ? "opacity-60 grayscale" : "opacity-100"}
        ${isCompleted ? "border-emerald-500/30 bg-emerald-900/5" : ""}
      `}
    >
      {/* Icono de Estado */}
      <div className={`
        flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0
        ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : ""}
        ${isCurrent ? "border-purple-500 text-purple-400 bg-purple-500/10" : ""}
        ${isLocked ? "border-gray-700 text-gray-600 bg-gray-800" : ""}
      `}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className={`font-semibold truncate ${isCompleted ? "text-emerald-400" : "text-white"}`}>
            {step.title}
          </h3>
          {isCurrent && <Badge className="bg-purple-600 hover:bg-purple-700 text-[10px] h-5 border-0">Siguiente</Badge>}
          {step.isRequired && !isCompleted && <Badge variant="outline" className="text-[10px] h-5 border-gray-600 text-gray-500">Requerido</Badge>}
        </div>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
          {step.description}
        </p>
        {/* Status Text del Backend */}
        <p className={`text-xs mt-2 font-medium ${isLocked ? "text-gray-500" : isCompleted ? "text-emerald-500" : "text-purple-300"}`}>
            Estado: {step.statusText}
        </p>
      </div>

      {/* Botón de Acción */}
      <div className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
        {isCompleted ? (
          <Button variant="ghost" disabled className="w-full sm:w-auto text-emerald-500 hover:text-emerald-500 hover:bg-transparent px-0 sm:px-4 cursor-default">
             Completado
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={isLocked}
            onClick={() => onAction(step.actionPath)}
            className={`w-full sm:w-auto ${
              isCurrent 
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-900/20" 
                : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
            }`}
          >
            {isLocked ? "Bloqueado" : "Continuar"}
            {!isLocked && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// --- Página Principal ---
export default function OnboardingChecklistPage() {
  const router = useRouter();
  
  // 1. Usamos el Hook Real
  const { steps, isLoading, error, refetch } = useOnboardingChecklist();

  // 2. Calcular progreso (useMemo para optimizar)
  const { completedSteps, totalRequiredSteps, progressPercentage } = useMemo(() => {
    // Si steps es undefined (carga inicial), valores a 0
    if (!steps || steps.length === 0) return { completedSteps: 0, totalRequiredSteps: 0, progressPercentage: 0 };

    const required = steps.filter(step => step.isRequired);
    const completed = required.filter(step => step.isComplete);
    const total = required.length;
    const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    
    return {
      completedSteps: completed.length,
      totalRequiredSteps: total,
      progressPercentage: progress
    };
  }, [steps]);

  // 3. Manejar navegación
  const handleAction = (path?: string) => {
    if (path) {
        router.push(path);
    } else {
        toast.info("Esta acción no tiene una ruta configurada.");
    }
  };

  // Render: Carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 animate-pulse">Sincronizando perfil...</p>
      </div>
    );
  }

  // Render: Error (Botón de reintentar)
  if (error) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <Card className="bg-gray-900 border-gray-800 max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Error de Carga
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-300">{error}</p>
                    <Button onClick={refetch} variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">
                        <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
                    </Button>
                </CardContent>
            </Card>
        </div>
      );
  }

  // Render: Éxito (Lista de Pasos)
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-gray-950 to-gray-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        <div className="mb-8 text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Bienvenido a QuHealthy</h1>
            <p className="text-gray-400 max-w-lg mx-auto">
                Para activar tu cuenta y comenzar a recibir pacientes, necesitamos que completes la siguiente información.
            </p>
        </div>

        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl">
          <CardHeader className="pb-6 border-b border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <ClipboardList className="w-5 h-5 text-purple-500" />
                    </div>
                    Lista de Verificación
                </CardTitle>
                <div className="text-right">
                    <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
                    <span className="text-sm text-gray-500 ml-2">Completado</span>
                </div>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-gray-800" />
            <p className="text-xs text-gray-500 mt-2 text-right">
                {completedSteps} de {totalRequiredSteps} pasos obligatorios completados
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {steps.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No hay pasos pendientes. ¡Todo listo!
                </div>
            ) : (
                steps.map((step, index) => (
                <StepItem 
                    key={step.id || index} // Fallback key si id no viene
                    step={step} 
                    index={index} 
                    onAction={handleAction} 
                />
                ))
            )}
          </CardContent>
        </Card>

        {/* Botón de Salida / Dashboard (Si todo está completo) */}
        {progressPercentage === 100 && (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
             >
                <Button 
                    size="lg" 
                    onClick={() => router.push('/dashboard')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-emerald-900/20"
                >
                    Ir a mi Dashboard <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
             </motion.div>
        )}

      </motion.div>
    </div>
  );
}