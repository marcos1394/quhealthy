"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { SiStripe, SiMercadopago } from 'react-icons/si';
import { 
  CreditCard, 
  ShoppingCart, 
  Shield, 
  Loader2, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
  Clock
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { PaymentMethod, PaymentMethodId } from "@/app/quhealthy/types/payment";
import { PlanSummary } from "@/app/quhealthy/components/payment/PlanSummary";

const paymentMethods: PaymentMethod[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Pago seguro con Tarjeta de Crédito/Débito",
    logo: <SiStripe size={75} className="text-purple-500" />,
    icon: <CreditCard className="w-5 h-5" />,
    features: ["Acepta Visa, MasterCard, Amex", "Pagos internacionales", "Proceso seguro y encriptado"],
    badge: "Recomendado"
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Plataforma líder en América Latina",
    logo: <SiMercadopago size={85} className="text-purple-500" />,
    icon: <ShoppingCart className="w-5 h-5" />,
    features: ["Múltiples métodos de pago", "Pagos en cuotas (si aplica)", "Integración para LATAM"]
  }
];

// Componente de loading mejorado
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-4 h-4 bg-purple-500 rounded-full" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" />
        </div>
        <div className="space-y-2">
          <div className="text-white font-medium">Cargando información del pago</div>
          <div className="text-purple-300 text-sm">Por favor espera un momento...</div>
        </div>
      </div>
    </div>
  );
}

// Componente mejorado de método de pago
function ImprovedPaymentMethodCard({ method, isSelected, onSelect }: {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer"
      onClick={onSelect}
    >
      {/* Background glow effect */}
      {isSelected && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse" />
      )}

      <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-xl ${
        isSelected 
          ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 via-gray-900/60 to-blue-900/40 shadow-2xl' 
          : 'border-gray-700/50 bg-gray-900/60 hover:border-gray-600/70 hover:bg-gray-800/60'
      }`}>
        {/* Badge */}
        {method.badge && (
          <div className="absolute -top-3 -right-3 z-10">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {method.badge}
            </div>
          </div>
        )}

        {/* Selection indicator */}
        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
          isSelected 
            ? 'border-purple-500 bg-purple-500' 
            : 'border-gray-400/50 bg-transparent'
        }`}>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </div>

        {/* Logo */}
        <div className="mb-4 flex justify-center">
          {method.logo}
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold text-white">{method.name}</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {method.description}
          </p>

          {/* Features */}
          <div className="space-y-2 pt-2">
            {method.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selection overlay */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl"
          />
        )}
      </div>
    </motion.div>
  );
}

// Componente principal de contenido
function PaymentContent() {
  const searchParams = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const planId = searchParams.get("planId") || "";
  const planName = searchParams.get("planName") || "Plan Desconocido";
  const planPrice = parseFloat(searchParams.get("planPrice") || "0");
  const planDuration = searchParams.get("planDuration") || "mes";

  const handlePaymentSelection = async () => {
    if (!selectedMethod || !planId) {
      toast.warn("Por favor, selecciona un método de pago.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const apiEndpoint = selectedMethod === 'stripe'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/payments/stripe/create-checkout-session`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/payments/mercadopago/create-preference`;
      
      const response = await axios.post(apiEndpoint, { planId: Number(planId) }, { withCredentials: true });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No se recibió una URL de redirección del servidor.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Ocurrió un error al procesar el pago.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-2 mb-6">
              <Lock className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Pago Seguro</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200">
                Finalizar
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Suscripción
              </span>
            </h1>

            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Selecciona tu método de pago preferido y comienza a transformar tu práctica profesional
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Plan Summary */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <PlanSummary 
                planName={planName} 
                planPrice={planPrice} 
                planDuration={planDuration} 
              />
            </motion.div>

            {/* Payment Methods */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                    Método de Pago
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paymentMethods.map((method) => (
                      <ImprovedPaymentMethodCard
                        key={method.id}
                        method={method}
                        isSelected={selectedMethod === method.id}
                        onSelect={() => setSelectedMethod(method.id)}
                      />
                    ))}
                  </div>
                </div>

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

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    onClick={handlePaymentSelection}
                    disabled={!selectedMethod || loading}
                    size="lg"
                    className={`w-full h-16 text-lg font-semibold rounded-xl transition-all duration-300 ${
                      selectedMethod && !loading
                        ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 hover:from-purple-500 hover:via-purple-400 hover:to-blue-400 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Procesando pago seguro...</span>
                      </div>
                    ) : selectedMethod ? (
                      <div className="flex items-center gap-3">
                        <span>Continuar con {paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    ) : (
                      <span>Selecciona un método de pago</span>
                    )}
                  </Button>

                  {/* Security info */}
                  <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span>Encriptación SSL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-400" />
                      <span>Datos Protegidos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Activación Inmediata</span>
                    </div>
                  </div>

                  {/* Back button */}
                  <div className="text-center pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => window.history.back()}
                      className="text-gray-400 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver a los planes
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Página principal con Suspense
export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentContent />
    </Suspense>
  );
}