"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Loader2, 
  Shield, 
  Crown, 
  Zap, 
  TrendingUp,
  Check,
  RefreshCw,
  CreditCard,
  Lock
} from "lucide-react";

// Importa los tipos y los componentes necesarios
import { Plan, BillingCycle } from '@/app/quhealthy/types/plans';
import { PlansHeader } from '@/app/quhealthy/components/plans/PlansHeader';
import { PricingCard } from '@/app/quhealthy/components/plans/PricingCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function PlansPage() {
  // --- ESTADOS DEL COMPONENTE ---
  const [apiPlans, setApiPlans] = useState<Plan[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [retryCount, setRetryCount] = useState(0);

  // --- FUNCIÓN DE CARGA CON RETRY ---
  const loadPlans = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/plans`;
      
      const response = await axios.get(apiUrl, {
        withCredentials: true,
        timeout: 10000, // 10 segundos de timeout
      });

      setApiPlans(response.data);
      setRetryCount(0); // Reset retry count on success

    } catch (err) {
      console.error("Error al obtener los planes:", err);
      
      let errorMessage = "Hubo un error al cargar los planes.";
      
      if (axios.isAxiosError(err)) {
  if (err.code === 'ECONNABORTED') {
    errorMessage = "La conexión tardó demasiado. Verifica tu conexión a internet.";
  } else if (err.response?.status === 401) {
    errorMessage = "Sesión expirada. Por favor, inicia sesión nuevamente.";
  } else if (err.response?.status === 403) {
    errorMessage = "No tienes permisos para ver los planes disponibles.";
  } 
  // --- CORRECCIÓN AQUÍ ---
  else if (err.response && err.response.status >= 500) { 
    errorMessage = "Nuestros servidores están experimentando problemas. Intenta de nuevo en unos minutos.";
  }
}
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- EFECTO PARA OBTENER DATOS DE LA API ---
  useEffect(() => {
    loadPlans();
  }, []);

  // --- FUNCIÓN DE RETRY ---
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadPlans(true);
  };

  // --- CÁLCULO DE PRECIOS CON USEMEMO ---
  const plans: Plan[] = useMemo(() => {
    return apiPlans.map(plan => {
      if (billingCycle === 'annual' && plan.annualDiscount) {
        return {
          ...plan,
          price: Math.round(plan.price * 12 * (1 - plan.annualDiscount / 100)),
          duration: 'año',
        };
      }
      return {
        ...plan,
        duration: 'mes',
      };
    });
  }, [apiPlans, billingCycle]);

  // --- COMPONENTE DE LOADING MEJORADO ---
  const LoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center space-y-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-teal-500 rounded-2xl flex items-center justify-center"
            variants={pulseVariants}
            animate="pulse"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.div
            className="absolute -inset-2 bg-gradient-to-br from-purple-500/20 to-teal-500/20 rounded-3xl blur-xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="text-center space-y-3">
          <motion.div
            className="flex items-center justify-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            <h2 className="text-xl font-semibold text-white">
              Cargando planes disponibles
            </h2>
          </motion.div>
          
          <motion.p
            className="text-gray-400 text-sm max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Estamos preparando las mejores opciones para tu práctica profesional
          </motion.p>
        </div>

        {/* Progress indicators */}
        <motion.div
          className="flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );

  // --- COMPONENTE DE ERROR MEJORADO ---
  const ErrorState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/10 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-red-500/20 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">
                Oops! Algo salió mal
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {error}
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={handleRetry}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reintentando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Reintentar</span>
                  </>
                )}
              </motion.button>

              {retryCount > 0 && (
                <motion.p
                  className="text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Intento {retryCount + 1}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // --- RENDERIZADO CONDICIONAL ---
  if (loading && apiPlans.length === 0) {
    return <LoadingState />;
  }

  if (error && apiPlans.length === 0) {
    return <ErrorState />;
  }

  // --- RENDERIZADO PRINCIPAL MEJORADO ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-40" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Banner (si hay error pero ya tenemos datos cargados) */}
          <AnimatePresence>
            {error && apiPlans.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="mb-6"
              >
                <Alert className="bg-yellow-900/20 border-yellow-500/30 text-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Algunos datos podrían no estar actualizados: {error}</span>
                    <button
                      onClick={handleRetry}
                      className="ml-4 text-yellow-400 hover:text-yellow-300 underline"
                    >
                      Actualizar
                    </button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header mejorado */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <PlansHeader billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
            </motion.div>

            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
              variants={itemVariants}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">100%</p>
                    <p className="text-gray-400 text-sm">Seguro y Confiable</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">+40%</p>
                    <p className="text-gray-400 text-sm">Más Pacientes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className="text-gray-400 text-sm">Soporte Técnico</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Plans Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-12"
              variants={containerVariants}
            >
           {plans.map((plan, index) => (
    <motion.div
      key={plan.id + billingCycle}
      variants={itemVariants}
      transition={{ delay: index * 0.1 }}
    >
      <PricingCard
        plan={plan}
        isPopular={plan.popular}
        index={index} // <-- AÑADE ESTA LÍNEA
      />
    </motion.div>
  ))}
</motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
              variants={itemVariants}
            >
              {/* Security Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Lock className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Pagos Seguros
                    </h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Encriptación SSL de 256 bits</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Certificación PCI DSS Level 1</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Garantía de devolución 30 días</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Métodos de Pago
                    </h3>
                    <ul className="space-y-2 text-gray-400 text-sm">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-blue-400" />
                        <span>Tarjetas de crédito y débito</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-blue-400" />
                        <span>PayPal y transferencias bancarias</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-blue-400" />
                        <span>OXXO Pay y otros métodos locales</span>
                      </li>
                    </ul>
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