"use client";

import React, { useState, useEffect, useMemo, ReactNode } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Importado para errores
import { motion } from "framer-motion";
import {
  AlertCircle, CheckCircle, Calendar, Video, Users, Sparkles, Shield,
  CreditCard, ArrowRight, MessageSquare, Briefcase, Coins, FileText,
  PieChart, Layout, ShoppingCart, Loader2 // Icono de carga
  // Quité iconos no usados directamente en esta versión (Star, Crown, etc.)
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- Interfaces TypeScript (Revisadas y Completas) ---
interface PlanFeature {
  title: string;
  description: string;
  icon: ReactNode;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: "mes" | "año"; // Tipo específico para duración
  maxAppointments?: number | "Ilimitados";
  maxServices?: number | "Ilimitados";
  marketingLevel: number;
  supportLevel: number;
  qumarketAccess: boolean;
  qublocksAccess: boolean;
  userManagement?: number; // Es 0 o un número, no undefined si no aplica
  advancedReports: boolean;
  transactionFee: number;
  maxProducts?: number | "Ilimitados";
  maxCourses?: number | "Ilimitados";
  annualDiscount?: number; // Porcentaje de descuento
  allowAdvancePayments: boolean;
  defaultAdvancePaymentPercentage?: number;
  popular: boolean;
  features: PlanFeature[];
}

interface SubscriptionsProps {
  // Asumiendo que esta página es principalmente para proveedores
  role: "proveedor";
  // providerType podría no ser necesario si los planes son generales
}

// --- Animación (Consistente) ---
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// --- Componente PricingCard (Interno y Homologado) ---
const PricingCard = ({
  plan,
  isPopular,
}: {
  plan: Plan;
  isPopular: boolean;
}) => {
  const router = useRouter();

  // Función para manejar la selección y redirigir al pago
  const handleSelectPlan = () => {
    const queryParams = new URLSearchParams({
      planId: plan.id.toString(),
      planName: plan.name,
      planPrice: plan.price.toString(),
      planDuration: plan.duration,
      transactionFee: plan.transactionFee.toString(),
    }).toString();
    router.push(`/quhealthy/profile/providers/payment?${queryParams}`);
  };

  // Formateador de precios (ejemplo para MXN)
  const formatPrice = (price: number): string => {
    return price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  // Formateador de límites para mostrar en features
  const formatFeatureDescription = (feature: PlanFeature, plan: Plan): string => {
    let desc = feature.description; // Descripción base
    if (feature.title.toLowerCase().includes('citas') && plan.maxAppointments === "Ilimitados") desc = "Sin límite mensual";
    if (feature.title.toLowerCase().includes('servicios') && plan.maxServices === "Ilimitados") desc = "Sin límite de servicios";
    if (feature.title.toLowerCase().includes('productos') && plan.maxProducts === "Ilimitados") desc = "Sin límite de productos";
    if (feature.title.toLowerCase().includes('cursos') && plan.maxCourses === "Ilimitados") desc = "Sin límite de cursos";
    if (feature.title.toLowerCase().includes('gestión') && typeof plan.userManagement === 'number' && plan.userManagement > 0) desc = `Hasta ${plan.userManagement} miembros`;
    if (feature.title.toLowerCase().includes('comisión') && typeof plan.transactionFee === 'number') desc = `${plan.transactionFee}% por operación`;
    if (feature.title.toLowerCase().includes('adelanto') && plan.allowAdvancePayments && plan.defaultAdvancePaymentPercentage) desc = `Permite hasta ${plan.defaultAdvancePaymentPercentage}%`;
    if (feature.title.toLowerCase().includes('marketing') && plan.marketingLevel) desc = `Visibilidad Nivel ${plan.marketingLevel}${plan.qumarketAccess ? ' + QuMarket' : ''}`;
    if (feature.title.toLowerCase().includes('soporte') && plan.supportLevel) {
        const responseTimes = { 1: '48h', 2: '24h', 3: '12h', 4: 'Prioritario' };
        desc = `Respuesta ${responseTimes[plan.supportLevel as keyof typeof responseTimes] || 'Estándar'}`;
    }
    // Añade más lógica de formato si es necesario
    return desc;
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative h-full flex flex-col" // Asegura altura y flexión
    >
      <Card
        className={`
          flex flex-col flex-grow h-full bg-gray-800 border border-gray-700 overflow-hidden rounded-xl shadow-md
          ${isPopular ? "ring-2 ring-purple-500 shadow-purple-500/20 shadow-lg scale-[1.03]" : "hover:border-gray-600 transition-colors duration-200"}
        `}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 rounded-bl-xl rounded-tr-lg text-sm font-semibold z-10 tracking-wide">
            POPULAR
          </div>
        )}

        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="text-sm text-gray-400 mt-1 min-h-[40px]">{plan.description}</p> {/* Altura mínima para alinear */}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-white">{formatPrice(plan.price)}</span>
              <span className="text-gray-400 ml-1.5 text-sm">/ {plan.duration}</span>
            </div>
            {plan.duration === 'año' && plan.annualDiscount && (
              <Badge variant="outline" className="mt-2 bg-purple-500/10 border-purple-500/30 text-purple-300 font-medium">
                Ahorra {plan.annualDiscount}%
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 flex flex-col flex-grow">
          <div className="space-y-3 flex-grow mb-6"> {/* Espacio y crecimiento */}
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-purple-400 mt-0.5 flex-shrink-0 w-4 h-4">{feature.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">{feature.title}</p>
                  {/* Usar descripción formateada */}
                  <p className="text-xs text-gray-400">{formatFeatureDescription(feature, plan)}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSelectPlan}
            variant={isPopular ? "default" : "secondary"} // Usa variantes de Shadcn si están configuradas
            className={`
              w-full mt-auto 
              ${isPopular
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg" // Estilo botón popular
                : "bg-gray-700 hover:bg-gray-600 text-gray-200"} // Estilo botón normal
              transition-all duration-200 py-3 text-base font-semibold // Tamaño y fuente
            `}
          >
            Seleccionar Plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- Componente Principal Subscriptions (Homologado y Completo) ---
export default function Subscriptions({ role }: SubscriptionsProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Datos de los planes (simulados o podrían venir de una API)
  const providerPlansData = useMemo((): Plan[] => [
    {
        id: 1,
        name: "Básico",
        description: "Ideal para profesionales independientes iniciando.",
        price: billingCycle === "monthly" ? 450 : Math.round(450 * 12 * 0.8),
        duration: billingCycle === "monthly" ? "mes" : "año",
        maxAppointments: 100, maxServices: 5, marketingLevel: 1, supportLevel: 1,
        qumarketAccess: false, qublocksAccess: false, userManagement: 0, advancedReports: false,
        transactionFee: 8.0, popular: false, maxProducts: 10, maxCourses: 5,
        annualDiscount: 20, allowAdvancePayments: false, defaultAdvancePaymentPercentage: undefined,
        features: [
            { title: "Citas", description: "", icon: <Calendar className="w-4 h-4" /> },
            { title: "Servicios", description: "", icon: <ShoppingCart className="w-4 h-4" /> },
            { title: "Productos", description: "", icon: <Briefcase className="w-4 h-4" /> },
            { title: "Cursos", description: "", icon: <Video className="w-4 h-4" /> },
            { title: "Marketing", description: "", icon: <Sparkles className="w-4 h-4" /> },
            { title: "Soporte", description: "", icon: <Shield className="w-4 h-4" /> },
            { title: "Comisión", description: "", icon: <Coins className="w-4 h-4" /> },
        ],
      },
      {
        id: 2,
        name: "Estándar",
        description: "Perfecto para consultorios en crecimiento.",
        price: billingCycle === "monthly" ? 900 : Math.round(900 * 12 * 0.85),
        duration: billingCycle === "monthly" ? "mes" : "año",
        maxAppointments: 500, maxServices: 15, marketingLevel: 2, supportLevel: 2,
        qumarketAccess: true, qublocksAccess: true, userManagement: 0, advancedReports: false,
        transactionFee: 5.0, popular: true, maxProducts: 50, maxCourses: 20,
        annualDiscount: 15, allowAdvancePayments: true, defaultAdvancePaymentPercentage: 20,
        features: [
            { title: "Citas", description: "", icon: <Calendar className="w-4 h-4" /> },
            { title: "Servicios", description: "", icon: <ShoppingCart className="w-4 h-4" /> },
            { title: "Productos", description: "", icon: <Briefcase className="w-4 h-4" /> },
            { title: "Cursos", description: "", icon: <Video className="w-4 h-4" /> },
            { title: "Marketing", description: "", icon: <Sparkles className="w-4 h-4" /> },
            { title: "QuBlocks Básico", description: "Acceso a herramientas IA", icon: <Layout className="w-4 h-4" /> },
            { title: "Adelanto de Pagos", description: "", icon: <CreditCard className="w-4 h-4" /> },
            { title: "Soporte", description: "", icon: <Shield className="w-4 h-4" /> },
            { title: "Comisión", description: "", icon: <Coins className="w-4 h-4" /> },
        ],
      },
      {
        id: 3,
        name: "Premium",
        description: "Para profesionales y clínicas con alto volumen.",
        price: billingCycle === "monthly" ? 1800 : Math.round(1800 * 12 * 0.9),
        duration: billingCycle === "monthly" ? "mes" : "año",
        maxAppointments: "Ilimitados", maxServices: 30, marketingLevel: 3, supportLevel: 3,
        qumarketAccess: true, qublocksAccess: true, userManagement: 0, advancedReports: true,
        transactionFee: 4.0, popular: false, maxProducts: "Ilimitados", maxCourses: 50,
        annualDiscount: 10, allowAdvancePayments: true, defaultAdvancePaymentPercentage: 30,
        features: [
            { title: "Citas", description: "", icon: <Calendar className="w-4 h-4" /> },
            { title: "Servicios", description: "", icon: <ShoppingCart className="w-4 h-4" /> },
            { title: "Productos", description: "", icon: <Briefcase className="w-4 h-4" /> },
            { title: "Cursos", description: "", icon: <Video className="w-4 h-4" /> },
            { title: "Marketing", description: "", icon: <Sparkles className="w-4 h-4" /> },
             { title: "QuBlocks Avanzado", description: "Funciones IA completas", icon: <Layout className="w-4 h-4" /> },
            { title: "Adelanto de Pagos", description: "", icon: <CreditCard className="w-4 h-4" /> },
            { title: "Reportes Avanzados", description: "Analíticas detalladas", icon: <PieChart className="w-4 h-4" /> },
            { title: "Soporte", description: "", icon: <Shield className="w-4 h-4" /> },
            { title: "Comisión", description: "", icon: <Coins className="w-4 h-4" /> },
        ],
      },
       {
        id: 4,
        name: "Empresarial",
        description: "Solución integral para clínicas y negocios grandes.",
        price: billingCycle === "monthly" ? 3000 : Math.round(3000 * 12 * 0.95),
        duration: billingCycle === "monthly" ? "mes" : "año",
        maxAppointments: "Ilimitados", maxServices: "Ilimitados", marketingLevel: 3, supportLevel: 4,
        qumarketAccess: true, qublocksAccess: true, userManagement: 10, advancedReports: true,
        transactionFee: 2.0, popular: false, maxProducts: "Ilimitados", maxCourses: "Ilimitados",
        annualDiscount: 5, allowAdvancePayments: true, defaultAdvancePaymentPercentage: 50,
        features: [
            { title: "Citas", description: "", icon: <Calendar className="w-4 h-4" /> },
            { title: "Servicios", description: "", icon: <ShoppingCart className="w-4 h-4" /> },
            { title: "Productos", description: "", icon: <Briefcase className="w-4 h-4" /> },
            { title: "Cursos", description: "", icon: <Video className="w-4 h-4" /> },
            { title: "Marketing", description: "", icon: <Sparkles className="w-4 h-4" /> },
            { title: "Gestión de Usuarios", description: "", icon: <Users className="w-4 h-4" /> },
            { title: "QuBlocks Empresarial", description: "Acceso total IA + API", icon: <Layout className="w-4 h-4" /> },
            { title: "Adelanto de Pagos", description: "", icon: <CreditCard className="w-4 h-4" /> },
            { title: "Reportes Personalizados", description: "Analíticas a medida", icon: <PieChart className="w-4 h-4" /> },
            { title: "Soporte", description: "", icon: <Shield className="w-4 h-4" /> },
            { title: "Comisión", description: "", icon: <Coins className="w-4 h-4" /> },
        ],
      },
  ], [billingCycle]);

  // Actualiza el estado de los planes (simulando fetch)
  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      try {
        // No es necesario formatear aquí si se hace en PricingCard
        setPlans(providerPlansData);
      } catch (err) {
        console.error("Error processing plans:", err);
        setError("Hubo un error al cargar los planes.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [providerPlansData]); // Depende de los datos calculados

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
         <Alert variant="destructive" className="max-w-md bg-red-500/10 border-red-500/50 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
      </div>
    );
  }

  // Renderizado Principal
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 relative overflow-hidden">
      {/* Blobs animados de fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 opacity-[0.12] blur-3xl animate-pulse rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 opacity-[0.12] blur-3xl animate-pulse delay-1000 rounded-full" />
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.h1
              {...fadeIn} // Usar spread para aplicar animación
              className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4" // Título con gradiente
           >
            Potencia tu Práctica Profesional
          </motion.h1>
          <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-gray-300 text-lg max-w-3xl mx-auto"
           >
            Elige el plan QuHealthy que impulsa tu crecimiento. Gestiona citas, pacientes, marketing y finanzas con herramientas inteligentes.
          </motion.p>

          {/* Toggle Mensual/Anual */}
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mt-10"
           >
            <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 p-1.5 rounded-lg flex space-x-2 shadow-md">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${billingCycle === "monthly" ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
              >
                Mensual
              </Button>
              <Button
                variant={billingCycle === "yearly" ? "default" : "ghost"}
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${billingCycle === "yearly" ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
              >
                Anual
                <Badge variant="outline" className="ml-2 bg-purple-500/20 border-purple-500/50 text-purple-300 text-xs px-1.5 py-0.5 font-semibold tracking-wide">
                    {/* Muestra el mayor descuento posible */}
                    AHORRA HASTA 20%
                </Badge>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Grid de Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-12">
            {plans.map((plan) => (
                <PricingCard
                key={plan.id + billingCycle} // Key única para re-render en cambio de ciclo
                plan={plan}
                isPopular={plan.popular}
                />
            ))}
        </div>

         {/* Podrías añadir una sección de FAQ o contacto aquí si lo deseas */}

      </div>
    </div>
  );
}