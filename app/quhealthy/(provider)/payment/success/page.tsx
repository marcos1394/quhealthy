"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Mail,  
  AlertCircle, 
  Loader2,
  Download,
  ArrowRight,
  Shield,
  Crown,
  Zap,
  Star,
  Gift,
  Clock
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { OnboardingStatusResponse } from '@/app/quhealthy/types/provider';

// Componente de loading mejorado
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/10 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-500/30 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-4 h-4 bg-green-500 rounded-full" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-400 rounded-full animate-spin" />
        </div>
        <div className="space-y-2">
          <div className="text-white font-medium">Procesando confirmación...</div>
          <div className="text-green-300 text-sm">Validando tu pago exitoso</div>
        </div>
      </div>
    </div>
  );
}

// Componente de header de éxito mejorado
function ImprovedSuccessHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-600/20 via-emerald-500/10 to-green-700/20 p-8 text-center">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-green-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10">
        {/* Success icon with animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            delay: 0.2 
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-2xl shadow-green-500/30 mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        {/* Success badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2 mb-4"
        >
          <Crown className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">Pago Exitoso</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl lg:text-4xl font-bold mb-3"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500">
            ¡Bienvenido a QuHealthy!
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-300 text-lg"
        >
          Tu suscripción ha sido activada exitosamente
        </motion.p>
      </div>
    </div>
  );
}

// Componente de detalles de pago mejorado
function ImprovedPaymentDetails({ planName, planPrice, planDuration, orderNumber }: {
  planName: string;
  planPrice: number;
  planDuration: string;
  orderNumber: string;
}) {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/30"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Detalles de Suscripción</h3>
        <div className="flex items-center gap-2 text-green-400">
          <Shield className="w-4 h-4" />
          <span className="text-sm">Verificado</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-600/30">
          <span className="text-gray-300">Plan</span>
          <span className="text-white font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            {planName}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-600/30">
          <span className="text-gray-300">Precio</span>
          <span className="text-white font-bold text-lg">{formatPrice(planPrice)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-600/30">
          <span className="text-gray-300">Duración</span>
          <span className="text-white font-medium capitalize">{planDuration}</span>
        </div>
        
        {orderNumber !== "NoDisponible" && (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-300">Orden</span>
            <span className="text-green-400 font-mono text-sm">{orderNumber}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Componente de características activadas
function ActivatedFeatures() {
  const features = [
    {
      icon: <Mail className="w-5 h-5 text-blue-400" />,
      text: "Confirmación enviada a tu correo",
      delay: 0.8
    },
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      text: "Acceso completo a funciones activado",
      delay: 0.9
    },
    {
      icon: <Gift className="w-5 h-5 text-purple-400" />,
      text: "Configuración de perfil disponible",
      delay: 1.0
    },
    {
      icon: <Clock className="w-5 h-5 text-green-400" />,
      text: "Activación inmediata sin esperas",
      delay: 1.1
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-white mb-4">¿Qué tienes disponible ahora?</h3>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: feature.delay }}
            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-800/40 to-transparent hover:from-gray-800/60 transition-all duration-200"
          >
            <div className="flex-shrink-0">
              {feature.icon}
            </div>
            <span className="text-gray-300">{feature.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Botones de acción mejorados
function ImprovedActionButtons({ orderNumber, planName, invoiceUrl, isNavigating, onContinue }: {
  orderNumber: string;
  planName: string;
  invoiceUrl: string;
  isNavigating: boolean;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="space-y-4"
    >
      {/* Main CTA */}
      <Button
        onClick={onContinue}
        disabled={isNavigating}
        size="lg"
        className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 hover:from-green-500 hover:via-green-400 hover:to-emerald-400 shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isNavigating ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Configurando tu experiencia...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span>Continuar Configuración</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        )}
      </Button>

      {/* Secondary action */}
      {orderNumber !== "NoDisponible" && (
        <Button
          variant="outline"
          asChild
          className="w-full h-12 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4 mr-2" />
            Descargar Comprobante
          </a>
        </Button>
      )}

      {/* Info text */}
      <div className="text-center pt-2">
        <p className="text-sm text-gray-400">
          🎉 Tu suscripción a <strong className="text-green-400">{planName}</strong> está activa
        </p>
      </div>
    </motion.div>
  );
}

// Componente principal de contenido
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderNumber = searchParams.get("session_id") || searchParams.get("payment_id") || "NoDisponible";
  const planName = searchParams.get("planName") || "Plan Contratado";
  const planPrice = parseFloat(searchParams.get("planPrice") || "0") || 0;
  const planDuration = searchParams.get("planDuration") || "mes";
  const invoiceUrl = orderNumber !== "NoDisponible"
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/invoice/${orderNumber}`
    : "#";

  const handleContinue = async () => {
    setIsNavigating(true);
    setError(null);
    
    try {
      const response = await axios.get<OnboardingStatusResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/status`,
        { withCredentials: true }
      );
      
      const { onboardingStatus } = response.data;
      let nextRoute = "/quhealthy/profile/providers/dashboard";

      if (!onboardingStatus.kyc.isComplete) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/kyc";
      } else if (onboardingStatus.license.isRequired && !onboardingStatus.license.isComplete) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/validatelicense";
      } else if (!onboardingStatus.marketplace.isConfigured) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/marketplaceconfiguration";
      }
      
      toast.success("¡Redirigiendo a tu configuración!", { autoClose: 1500 });
      
      setTimeout(() => {
        router.push(nextRoute);
      }, 1000);
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "No se pudo verificar tu estado.";
      setError(errorMessage);
      toast.error("Error al verificar estado.");
      setIsNavigating(false);
    }
  };

  // Auto-redirect after success animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isNavigating && !error) {
        toast.info("💡 Tip: Completa tu perfil para empezar a recibir pacientes");
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isNavigating, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/5 to-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 p-4 md:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <ImprovedSuccessHeader />
            
            <CardContent className="p-8 space-y-8">
              <ImprovedPaymentDetails 
                planName={planName}
                planPrice={planPrice}
                planDuration={planDuration}
                orderNumber={orderNumber}
              />
              
              <ActivatedFeatures />

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Alert className="bg-red-500/10 border-red-500/50">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <AlertDescription className="text-red-300">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <ImprovedActionButtons 
                orderNumber={orderNumber}
                planName={planName}
                invoiceUrl={invoiceUrl}
                isNavigating={isNavigating}
                onContinue={handleContinue}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Página principal con Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}