"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Store, 
  Palette, 
  BriefcaseMedical, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Users,
  Loader2
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// 🚀 IMPORTAMOS NUESTROS HOOKS REALES
import { useStoreProfile } from "@/hooks/useStoreProfile";
import { useCatalog } from "@/hooks/useCatalog";
import { useStaff } from "@/hooks/useStaff";

export default function StoreSetupPage() {
  const router = useRouter();

  // ==========================================
  // 1. EXTRAER DATOS DEL BACKEND
  // ==========================================
  const { profile, isLoading: loadingProfile } = useStoreProfile();
  const { services, fetchInventory, isLoading: loadingCatalog } = useCatalog();
  const { staff, fetchStaff, isLoading: loadingStaff } = useStaff();

  // Disparamos las llamadas al montar la página
  useEffect(() => {
    fetchInventory();
    fetchStaff();
  }, [fetchInventory, fetchStaff]);

  // Estado de carga global (esperar a que los 3 terminen)
  const isGlobalLoading = loadingProfile || loadingCatalog || loadingStaff;

  // ==========================================
  // 2. LÓGICA DE PROGRESO REAL
  // ==========================================
  // Identidad: Consideramos completa si tiene Nombre y Slug (y opcionalmente Logo)
  const isIdentityComplete = !!profile?.displayName && !!profile?.slug;
  
  // Servicios: Completado si hay al menos 1 servicio creado y guardado en BD
  const realServicesCount = services.filter(s => !s.isNew).length;
  const isServicesComplete = realServicesCount > 0;

  // Políticas: Completado si escribió algo en cancellationPolicy
  const isPoliciesComplete = !!profile?.cancellationPolicy;

  // Equipo: Completado si hay al menos 1 miembro en el staff guardado
  const isStaffComplete = staff.filter(s => !s.isNew).length > 0;

  // ==========================================
  // 3. CONFIGURACIÓN DE LOS PASOS
  // ==========================================
  const steps = [
    {
      id: "identity",
      title: "Identidad Visual",
      description: "Logo, banner, colores y URL de tu tienda.",
      icon: Palette,
      isComplete: isIdentityComplete,
      path: "/provider/store/identity"
    },
    {
      id: "services",
      title: "Catálogo de Servicios",
      description: "Tratamientos, precios y duración de consultas.",
      icon: BriefcaseMedical,
      isComplete: isServicesComplete,
      path: "/provider/store/services",
      badge: realServicesCount > 0 ? `${realServicesCount} creados` : null
    },
    {
      id: "policies",
      title: "Políticas de Cita",
      description: "Reglas de cancelación y reprogramación.",
      icon: ShieldCheck,
      isComplete: isPoliciesComplete,
      path: "/provider/store/policies"
    },
    {
      id: "staff",
      title: "Equipo de Trabajo",
      description: "Agrega especialistas y asistentes a tu consultorio.",
      icon: Users,
      isComplete: isStaffComplete, 
      path: "/provider/store/staff"
    },
  ];

  const completedCount = steps.filter(s => s.isComplete).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);
  const isStoreReady = completedCount === steps.length;

  // ==========================================
  // RENDER
  // ==========================================
  
  if (isGlobalLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-gray-400 font-semibold animate-pulse">Analizando el estado de tu tienda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Store className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Mi Tienda</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Configura cómo los pacientes ven y reservan tus servicios.
          </p>
        </div>
        
        {isStoreReady && (
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/20 font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Publicar Tienda
          </Button>
        )}
      </div>

      {/* Progress Card */}
      <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Progreso de Configuración</h3>
              <p className="text-sm text-gray-400">
                {completedCount} de {steps.length} pasos completados
              </p>
            </div>
            <span className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3 shadow-inner" />
        </CardContent>
      </Card>

      {/* Checklist */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = step.isComplete;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(step.path)}
              className={cn(
                "group p-6 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6",
                isComplete 
                  ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40" 
                  : "bg-gray-900 border-gray-800 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
              )}
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0",
                  isComplete 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-gray-800 border-gray-700 text-gray-400 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 group-hover:text-purple-400"
                )}>
                  {isComplete ? <CheckCircle2 className="w-7 h-7" /> : <Icon className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    {step.badge && (
                      <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                        {step.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-19 sm:pl-0">
                {isComplete ? (
                  <span className="text-sm font-bold text-emerald-400">Completado</span>
                ) : (
                  <span className="text-sm font-bold text-purple-400 flex items-center group-hover:underline">
                    Configurar <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}