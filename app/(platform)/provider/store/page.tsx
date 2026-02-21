"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
  Trophy,
  Info,
  ExternalLink
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Hooks
import { useStoreProfile } from "@/hooks/useStoreProfile";
import { useCatalog } from "@/hooks/useCatalog";
import { useStaff } from "@/hooks/useStaff";

export default function StoreSetupPage() {
  const router = useRouter();

  // ==========================================
  // 1. EXTRAER DATOS DEL BACKEND
  // ==========================================
  const { profile, isLoading: loadingProfile, updateProfile } = useStoreProfile();
  const { services, fetchInventory, isLoading: loadingCatalog } = useCatalog();
  const { staff, fetchStaff, isLoading: loadingStaff } = useStaff();
  const [isPublishing, setIsPublishing] = React.useState(false);

  // Disparamos las llamadas al montar la página
  useEffect(() => {
    fetchInventory();
    fetchStaff();
  }, [fetchInventory, fetchStaff]);

  // Estado de carga global
  const isGlobalLoading = loadingProfile || loadingCatalog || loadingStaff;

  // ==========================================
  // 2. LÓGICA DE PROGRESO REAL
  // ==========================================
  const isIdentityComplete = !!profile?.displayName && !!profile?.slug;
  const realServicesCount = services.filter(s => !s.isNew).length;
  const isServicesComplete = realServicesCount > 0;
  const isPoliciesComplete = !!profile?.cancellationPolicy;
  const isStaffComplete = staff.filter(s => !s.isNew).length > 0;

  const handlePublishStore = async () => {
    setIsPublishing(true);
    const success = await updateProfile({ marketplaceVisible: true });
    if (success) {
      window.open(`/provicer/store/${profile?.slug}`, '_blank'); 
    }
    setIsPublishing(false);
  };

  // ==========================================
  // 3. CONFIGURACIÓN DE LOS PASOS
  // ==========================================
  const steps = [
    {
      id: "identity",
      title: "Identidad Visual",
      description: "Logo, banner, colores y URL de tu tienda",
      icon: Palette,
      isComplete: isIdentityComplete,
      path: "/provider/store/identity",
      color: "purple"
    },
    {
      id: "services",
      title: "Catálogo de Servicios",
      description: "Tratamientos, precios y duración de consultas",
      icon: BriefcaseMedical,
      isComplete: isServicesComplete,
      path: "/provider/store/services",
      badge: realServicesCount > 0 ? `${realServicesCount} creados` : null,
      color: "blue"
    },
    {
      id: "policies",
      title: "Políticas de Cita",
      description: "Reglas de cancelación y reprogramación",
      icon: ShieldCheck,
      isComplete: isPoliciesComplete,
      path: "/provider/store/policies",
      color: "emerald"
    },
    {
      id: "staff",
      title: "Equipo de Trabajo",
      description: "Agrega especialistas y asistentes a tu consultorio",
      icon: Users,
      isComplete: isStaffComplete, 
      path: "/provider/store/staff",
      color: "pink"
    },
  ];

  const completedCount = steps.filter(s => s.isComplete).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);
  const isStoreReady = completedCount === steps.length;

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (isGlobalLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-16 h-16 text-purple-500" />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-gray-300 font-bold text-lg">Analizando tu tienda</p>
          <p className="text-gray-500 text-sm animate-pulse">Sincronizando servicios y configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 shadow-lg shadow-purple-500/20">
              <Store className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Mi Tienda</h1>
              <Badge className="mt-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Marketplace
              </Badge>
            </div>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Configura tu tienda pública para que los clientes puedan descubrir y reservar tus servicios fácilmente
          </p>
        </div>
        
        <AnimatePresence>
          {isStoreReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                onClick={handlePublishStore}
                disabled={isPublishing || profile?.marketplaceVisible}
                size="lg"
                className={cn(
                  "h-14 px-8 text-base font-bold shadow-2xl transition-all group",
                  profile?.marketplaceVisible
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/30 hover:scale-105"
                )}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                    Publicando...
                  </>
                ) : profile?.marketplaceVisible ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> 
                    Tienda Activa
                    <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" /> 
                    Publicar Tienda
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-900/90 border-gray-800 shadow-2xl overflow-hidden relative">
          {/* Animated Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl rounded-full" />
          
          <CardContent className="p-8 md:p-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Trophy className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">Progreso de Configuración</h3>
                  <p className="text-sm text-gray-400 font-semibold">
                    {completedCount} de {steps.length} secciones completadas
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {isStoreReady ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
                  >
                    <Trophy className="w-6 h-6 text-emerald-400" />
                    <span className="text-xl font-black text-emerald-400">¡Completo!</span>
                  </motion.div>
                ) : (
                  <span className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {progressPercentage}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Progress value={progressPercentage} className="h-4 shadow-inner" />
              
              {!isStoreReady && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
                >
                  <Info className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <p className="text-sm text-purple-300 font-medium">
                    Completa todas las secciones para poder publicar tu tienda
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Steps Checklist */}
      <div className="space-y-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = step.isComplete;
          const isNext = !isComplete && index === steps.findIndex(s => !s.isComplete);

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card
                onClick={() => router.push(step.path)}
                className={cn(
                  "group cursor-pointer transition-all duration-300 border-2 overflow-hidden relative",
                  isComplete 
                    ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 shadow-lg shadow-emerald-900/10 hover:shadow-xl hover:shadow-emerald-900/20" 
                    : isNext
                    ? "bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/50 shadow-xl shadow-purple-900/20 ring-2 ring-purple-500/20"
                    : "bg-gradient-to-br from-gray-900/50 to-gray-900/30 border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-purple-500/10"
                )}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 md:p-8">
                    
                    {/* Left Side - Icon & Content */}
                    <div className="flex items-start gap-5 flex-1">
                      {/* Icon */}
                      <motion.div 
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all flex-shrink-0 shadow-lg",
                          isComplete 
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-emerald-500/30" 
                            : isNext
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 text-white shadow-purple-500/30"
                            : "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-gray-400 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 group-hover:text-purple-400"
                        )}
                        animate={isNext ? { 
                          scale: [1, 1.05, 1],
                        } : {}}
                        transition={{ 
                          duration: 2, 
                          repeat: isNext ? Infinity : 0,
                          repeatDelay: 1
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-8 h-8" />
                        ) : (
                          <Icon className="w-8 h-8" />
                        )}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className={cn(
                            "text-xl font-black",
                            isComplete ? "text-emerald-400" : isNext ? "text-white" : "text-gray-300"
                          )}>
                            {step.title}
                          </h3>
                          
                          {isNext && (
                            <Badge className="bg-purple-600 text-white border-0 shadow-md animate-pulse">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Siguiente
                            </Badge>
                          )}
                          
                          {step.badge && (
                            <Badge variant="secondary" className="bg-gray-800/80 text-gray-300 border border-gray-700">
                              {step.badge}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Right Side - Status & Action */}
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:justify-center pl-20 sm:pl-0">
                      {isComplete ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">Completado</span>
                        </div>
                      ) : (
                        <span className={cn(
                          "text-sm font-bold flex items-center gap-1 group-hover:underline transition-colors",
                          isNext ? "text-purple-400" : "text-gray-400 group-hover:text-purple-400"
                        )}>
                          {isNext ? 'Continuar' : 'Configurar'}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Completion CTA */}
      <AnimatePresence>
        {isStoreReady && !profile?.marketplaceVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-purple-500/30 shadow-2xl">
              <CardContent className="p-8 md:p-10 text-center space-y-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <Trophy className="w-20 h-20 text-purple-400 mx-auto" />
                </motion.div>
                
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white">
                    ¡Tu tienda está lista! 🎉
                  </h3>
                  <p className="text-gray-300 max-w-lg mx-auto text-lg leading-relaxed">
                    Has completado toda la configuración. Ahora puedes publicar tu tienda y comenzar a recibir reservas.
                  </p>
                </div>

                <Separator className="bg-purple-500/20" />

                <Button 
                  onClick={handlePublishStore}
                  disabled={isPublishing}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black px-12 py-6 text-lg shadow-2xl shadow-purple-500/30 h-16 group"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Publicando tu tienda...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Publicar Mi Tienda
                      <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl flex-shrink-0">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-sm text-blue-300/80 leading-relaxed">
              <p className="font-bold text-blue-400 mb-2 text-base">¿Necesitas ayuda con tu tienda?</p>
              <p>
                Si tienes dudas sobre cómo configurar tu tienda o necesitas asistencia, nuestro equipo está aquí para ayudarte. Contáctanos en{' '}
                <a href="mailto:support@quhealthy.com" className="underline hover:text-blue-300 font-semibold">
                  support@quhealthy.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}