"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, CheckCircle, Star, Crown, Calendar, Video,
  Users, Sparkles, Shield, Gift, Zap, Clock, Building,
  CreditCard, ArrowRight, MessageSquare, Award, Search,
  Briefcase, Activity, HeartPulse, ShoppingCart, Stethoscope,
  UserPlus, Coins, FileText, PieChart, Layout, Share2
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: string; // Duración como "mes" (siempre mensual en este caso).
    maxAppointments?: number | "Ilimitados"; // Citas máximas por plan.
    maxServices?: number | "Ilimitados"; // Servicios máximos.
    marketingLevel: number; // Nivel de marketing (1 a 3).
    supportLevel: number; // Nivel de soporte (1 a 4).
    qumarketAccess: boolean; // Acceso a QuMarket.
    qublocksAccess: boolean; // Acceso a QuBlocks.
    userManagement?: number; // Cantidad de usuarios gestionados (solo en empresarial).
    advancedReports: boolean; // Reportes avanzados habilitados.
    transactionFee: number, //comisión por transacción
    maxProducts?:number, //maximo de productos a vender o configurar
    maxCourses?: number, //maximo numero de cursos a configurar
    annualDiscount?: number; // Nuevo campo para ahorro,
    allowAdvancePayments: boolean, //permitir adelantos de pagos
    defaultAdvancePaymentPercentage?: number, //número predeterminado de adelanto de pago
    popular: boolean; // Duración como "mes" (siempre mensual en este caso).

    features: Array<{
      title: string;
      description: string;
      icon: React.ReactNode;
    }>; // Características dinámicas para mostrar en la UI.
  }
  
  
  interface SubscriptionsProps {
    role: "paciente" | "proveedor";
    providerType?: "medico" | "esteticista" | "nutricionista";
  }
  

  const PricingCard = ({
    plan,
    isPopular,
    onSelect,
  }: {
    plan: Plan;
    isPopular: boolean;
    onSelect: (plan: Plan) => void; // Propiedad para manejar selección
  }) => {
    const router = useRouter();
  
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
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative ${isPopular ? "scale-105" : ""}`}
      >
        <Card
          className={`
            h-full bg-gray-800 border-gray-700 overflow-hidden
            ${isPopular ? "ring-2 ring-teal-500 shadow-teal-500/20 shadow-lg" : ""}
          `}
        >
          {isPopular && (
            <div className="absolute top-0 right-0 bg-teal-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
              Popular
            </div>
          )}
  
          <CardHeader className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">${plan.price}</span>
                <span className="text-gray-400 ml-2">/{plan.duration}</span>
              </div>
              {plan.annualDiscount && (
                <Badge className="mt-2 bg-teal-500/20 text-teal-400">
                  Ahorra ${plan.annualDiscount}/año
                </Badge>
              )}
            </div>
          </CardHeader>
  
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-teal-400 mt-1">{feature.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{feature.title}</p>
                    <p className="text-xs text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
  
            <Button
  onClick={handleSelectPlan} // Redirige al método de pago con los queryParams
  className={`
    w-full mt-6
    ${isPopular
      ? "bg-teal-500 hover:bg-teal-600 text-white"
      : "bg-gray-700 hover:bg-gray-600 text-white"}
  `}
>
  Seleccionar plan
  <ArrowRight className="w-4 h-4 ml-2" />
</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };
  

export default function Subscriptions({ role }: SubscriptionsProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const router = useRouter(); // Declara useRouter aquí

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setPlans([
        {
          id: 1,
          name: "Plan Básico",
          description: "Ideal para profesionales individuales que están comenzando.",
          price: billingCycle === "monthly" ? 450 : 450 * 12 * 0.8, // 20% descuento anual
          duration: billingCycle === "monthly" ? "mes" : "año",
          maxAppointments: 100,
          maxServices: 5,
          marketingLevel: 1,
          supportLevel: 1,
          qumarketAccess: false,
          qublocksAccess: false,
          userManagement: 0,
          advancedReports: false,
          transactionFee: 5.0,
          popular: false,
          maxProducts: 10,
          maxCourses: 5,
          annualDiscount: 20.0,
          allowAdvancePayments: false,
          defaultAdvancePaymentPercentage: undefined,
          features: [
            { title: "Citas mensuales", description: "Hasta 100 citas mensuales", icon: <Calendar className="w-4 h-4" /> },
            { title: "Servicios publicados", description: "Hasta 5 servicios disponibles", icon: <ShoppingCart className="w-4 h-4" /> },
            { title: "Marketing básico", description: "Nivel 1 de marketing", icon: <Sparkles className="w-4 h-4" /> },
            { title: "Chatbots básicos", description: "Respuestas automáticas simples", icon: <MessageSquare className="w-4 h-4" /> },
            { title: "Análisis básico con IA", description: "Recomendaciones simples basadas en datos", icon: <PieChart className="w-4 h-4" /> },
            { title: "Soporte técnico", description: "Nivel 1 de soporte (48 horas)", icon: <Shield className="w-4 h-4" /> },
            { title: "Comisión por transacción", description: "8% por cada operación", icon: <Coins className="w-4 h-4" /> },
  
        ],
        },
        {
          id: 2,
          name: "Plan Estándar",
          description: "Para profesionales con un volumen moderado de citas y ventas.",
          price: billingCycle === "monthly" ? 900 : 900 * 12 * 0.8, // 20% descuento anual
          duration: billingCycle === "monthly" ? "mes" : "año",
          maxAppointments: 500,
          maxServices: 15,
          marketingLevel: 2,
          supportLevel: 2,
          qumarketAccess: true,
          qublocksAccess: true,
          userManagement: 0,
          advancedReports: false,
          transactionFee: 3.0,
          popular: true,
          maxProducts: 50,
          maxCourses: 20,
          annualDiscount: 15.0,
          allowAdvancePayments: true,
          defaultAdvancePaymentPercentage: 20.0,
          features: [
            { title: "Citas mensuales", description: "Hasta 500 citas mensuales", icon: <Calendar className="w-4 h-4" /> },
            { title: "Servicios publicados", description: "Hasta 15 servicios disponibles", icon: <ShoppingCart className="w-4 h-4" /> },
            { title: "Productos configurados", description: "Hasta 50 productos disponibles", icon: <Briefcase className="w-4 h-4" /> },
            { title: "Cursos configurados", description: "Hasta 20 cursos disponibles", icon: <Video className="w-4 h-4" /> },
            { title: "Marketing estándar", description: "Nivel 2 de marketing", icon: <Sparkles className="w-4 h-4" /> },
            { title: "Anticipos permitidos", description: "Anticipo del 20%", icon: <CreditCard className="w-4 h-4" /> },
            { title: "Chatbots avanzados", description: "Respuestas personalizadas y soporte avanzado", icon: <MessageSquare className="w-4 h-4" /> },
            { title: "Análisis avanzado con IA", description: "Análisis detallado de datos y tendencias", icon: <PieChart className="w-4 h-4" /> },
            { title: "Generación de contenido", description: "Publicaciones avanzadas y optimización automática", icon: <FileText className="w-4 h-4" /> },
            { title: "Soporte técnico", description: "Nivel 2 de soporte (24 horas)", icon: <Shield className="w-4 h-4" /> },
            { title: "Comisión por transacción", description: "5% por cada operación", icon: <Coins className="w-4 h-4" /> },
  
        ],
        },
        {
          id: 3,
          name: "Plan Premium",
          description: "Para profesionales con un volumen alto de citas y ventas.",
          price: billingCycle === "monthly" ? 1800 : 1800 * 12 * 0.8, // 20% descuento anual
          duration: billingCycle === "monthly" ? "mes" : "año",
          maxAppointments: undefined, // Ilimitado
          maxServices: 30,
          marketingLevel: 3,
          supportLevel: 3,
          qumarketAccess: true,
          qublocksAccess: true,
          userManagement: 0,
          advancedReports: true,
          transactionFee: 2.0,
          popular: false,
          maxProducts: undefined, // Ilimitado
          maxCourses: 50,
          annualDiscount: 10.0,
          allowAdvancePayments: true,
          defaultAdvancePaymentPercentage: 30.0,
          features: [
            { title: "Citas ilimitadas", description: "Sin límite de citas mensuales", icon: <Calendar className="w-4 h-4" /> },
            { title: "Servicios publicados", description: "Hasta 30 servicios disponibles", icon: <ShoppingCart className="w-4 h-4" /> },
            { title: "Productos configurados", description: "Productos ilimitados", icon: <Briefcase className="w-4 h-4" /> },
            { title: "Cursos configurados", description: "Hasta 50 cursos disponibles", icon: <Video className="w-4 h-4" /> },
            { title: "Marketing avanzado", description: "Nivel 3 de marketing", icon: <Sparkles className="w-4 h-4" /> },
            { title: "Anticipos permitidos", description: "Anticipo del 30%", icon: <CreditCard className="w-4 h-4" /> },
            { title: "Chatbots premium", description: "IA avanzada con análisis en tiempo real", icon: <MessageSquare className="w-4 h-4" /> },
            { title: "Análisis premium con IA", description: "Predicciones avanzadas y análisis en tiempo real", icon: <PieChart className="w-4 h-4" /> },
            { title: "Generación personalizada", description: "Contenidos personalizados con IA avanzada", icon: <FileText className="w-4 h-4" /> },
            { title: "Reportes avanzados", description: "Acceso a reportes detallados", icon: <PieChart className="w-4 h-4" /> },
            { title: "Soporte técnico", description: "Nivel 3 de soporte (12 horas)", icon: <Shield className="w-4 h-4" /> },
            { title: "Comisión por transacción", description: "4% por cada operación", icon: <Coins className="w-4 h-4" /> },
  
        ],
        },
        {
          id: 4,
          name: "Plan Empresarial",
          description: "Para clínicas y empresas médicas que requieren funcionalidades empresariales.",
          price: billingCycle === "monthly" ? 3000 : 3000 * 12 * 0.8, // 20% descuento anual
          duration: billingCycle === "monthly" ? "mes" : "año",
          maxAppointments: undefined, // Ilimitado
          maxServices: undefined, // Ilimitado
          marketingLevel: 3,
          supportLevel: 4,
          qumarketAccess: true,
          qublocksAccess: true,
          userManagement: 10,
          advancedReports: true,
          transactionFee: 1.0,
          popular: true,
          maxProducts: undefined, // Ilimitado
          maxCourses: undefined, // Ilimitado
          annualDiscount: 5.0,
          allowAdvancePayments: true,
          defaultAdvancePaymentPercentage: 50.0,
          features: [
            { title: "Citas ilimitadas", description: "Sin límite de citas mensuales", icon: <Calendar className="w-4 h-4" /> },
            { title: "Servicios ilimitados", description: "Sin límite de servicios disponibles", icon: <ShoppingCart className="w-4 h-4" /> },
            { title: "Productos configurados", description: "Productos ilimitados", icon: <Briefcase className="w-4 h-4" /> },
            { title: "Cursos configurados", description: "Cursos ilimitados", icon: <Video className="w-4 h-4" /> },
            { title: "Marketing Avanzado", description: "Nivel 3 de marketing", icon: <Sparkles className="w-4 h-4" /> },
            { title: "Gestión empresarial", description: "Hasta 10 usuarios gestionados", icon: <Users className="w-4 h-4" /> },
            { title: "Anticipos permitidos", description: "Anticipo del 50%", icon: <CreditCard className="w-4 h-4" /> },
            { title: "Chatbots empresariales", description: "Respuestas personalizadas con IA avanzada", icon: <MessageSquare className="w-4 h-4" /> },
            { title: "Análisis empresarial con IA", description: "Modelos personalizados con análisis en tiempo real", icon: <PieChart className="w-4 h-4" /> },
            { title: "Generación empresarial", description: "Contenidos avanzados con análisis de impacto", icon: <FileText className="w-4 h-4" /> },
            { title: "Soporte técnico premium", description: "Nivel 4 de soporte (prioritario)", icon: <Shield className="w-4 h-4" /> },
            { title: "Comisión por transacción", description: "2% por cada operación", icon: <Coins className="w-4 h-4" /> }, 
        ],
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [billingCycle]);
  
  
  


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {role === "paciente" 
              ? "Planes diseñados para tu bienestar" 
              : "Haz crecer tu negocio con quhealthy"}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {role === "paciente"
              ? "Selecciona el plan perfecto para tu journey de salud y belleza"
              : "Impulsa tu negocio con nuestras herramientas profesionales"}
          </p>
          
          <div className="flex justify-center mt-8">
            <div className="bg-gray-800 p-1 rounded-lg">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                onClick={() => setBillingCycle("monthly")}
                className="mr-2"
              >
                Mensual
              </Button>
              <Button
                variant={billingCycle === "yearly" ? "default" : "ghost"}
                onClick={() => setBillingCycle("yearly")}
              >
                Anual
                <Badge className="ml-2 bg-teal-500/20 text-teal-400">-20%</Badge>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <AnimatePresence>
  {plans.map((plan) => (
    <PricingCard
      key={plan.id}
      plan={plan}
      isPopular={plan.popular || false}
      onSelect={(selectedPlan) => {
        setSelectedPlan(selectedPlan);
        const queryParams = new URLSearchParams({
          planId: selectedPlan.id.toString(),
          planName: selectedPlan.name,
          planPrice: selectedPlan.price.toString(),
          planDuration: selectedPlan.duration,
          transactionFee: selectedPlan.transactionFee.toString(),
        }).toString();

        router.push(`/quhealthy/profile/providers/payment?${queryParams}`);
      }}
    />
  ))}
</AnimatePresence>

</div>

      </div>

      {selectedPlan && (
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="text-teal-400 w-5 h-5" />
                <span>Confirmar suscripción</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{selectedPlan.name}</h3>
                  <Badge className="bg-teal-500/20 text-teal-400">
                    ${selectedPlan.price}/{selectedPlan.duration}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="text-teal-400 w-4 h-4" />
                      <span>{feature.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => {
                    // Lógica de pago
                    console.log('Procesando pago...');
                  }}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceder al pago
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedPlan(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}