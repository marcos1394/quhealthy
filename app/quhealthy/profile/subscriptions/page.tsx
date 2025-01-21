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

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    features: Array<{
      title: string;
      description: string;
      icon: React.ReactNode;
    }>;
    target: "consumers" | "providers";
    category?: "basic" | "premium" | "enterprise" | "market";
    popular?: boolean;
    savings?: number;
    maxClients?: number | "Ilimitados";
    maxAppointments?: number | "Ilimitados";
    maxProducts?: number | "Ilimitados";
  }
  
  interface SubscriptionsProps {
    role: "paciente" | "proveedor";
    providerType?: "medico" | "esteticista" | "nutricionista";
  }
  

const PricingCard = ({ plan, onSelect, isPopular }: { 
  plan: Plan; 
  onSelect: (plan: Plan) => void;
  isPopular: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative ${isPopular ? 'scale-105' : ''}`}
    >
      <Card className={`
        h-full bg-gray-800 border-gray-700 overflow-hidden
        ${isPopular ? 'ring-2 ring-teal-500 shadow-teal-500/20 shadow-lg' : ''}
      `}>
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
            {plan.savings && (
              <Badge className="mt-2 bg-teal-500/20 text-teal-400">
                Ahorra ${plan.savings}/año
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-teal-400 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{feature.title}</p>
                  <p className="text-xs text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => onSelect(plan)}
            className={`
              w-full mt-6
              ${isPopular 
                ? 'bg-teal-500 hover:bg-teal-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'}
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

  useEffect(() => {
    setLoading(true);
    // Simulación de carga de planes
    setTimeout(() => {
      setPlans([
        // Planes para consumidores
        {
          id: "basic-consumer",
          name: "Plan Básico",
          description: "Acceso esencial a servicios de salud y belleza",
          price: billingCycle === "monthly" ? 15 : 144,
          duration: billingCycle === "monthly" ? "mes" : "año",
          savings: billingCycle === "yearly" ? 36 : undefined,
          target: "consumers",
          category: "basic",
          features: [
            {
              title: "Búsqueda de servicios",
              description: "Acceso a catálogo de profesionales",
              icon: <Search className="w-4 h-4" />
            },
            {
              title: "Historial médico digital",
              description: "Almacenamiento seguro de documentos",
              icon: <FileText className="w-4 h-4" />
            },
            {
              title: "Chat básico",
              description: "Comunicación con profesionales",
              icon: <MessageSquare className="w-4 h-4" />
            }
          ]
        },
        {
          id: "premium-consumer",
          name: "Plan Premium",
          description: "Experiencia completa de salud y belleza",
          price: billingCycle === "monthly" ? 29 : 278,
          duration: billingCycle === "monthly" ? "mes" : "año",
          savings: billingCycle === "yearly" ? 70 : undefined,
          target: "consumers",
          category: "premium",
          popular: true,
          features: [
            {
              title: "Todo del plan básico",
              description: "Incluye todas las características básicas",
              icon: <CheckCircle className="w-4 h-4" />
            },
            {
              title: "Citas prioritarias",
              description: "Prioridad en agenda de profesionales",
              icon: <Zap className="w-4 h-4" />
            },
            {
              title: "Teleconsultas ilimitadas",
              description: "Consultas virtuales sin límite",
              icon: <Video className="w-4 h-4" />
            },
            {
              title: "Descuentos exclusivos",
              description: "Hasta 25% en servicios y productos",
              icon: <Gift className="w-4 h-4" />
            }
          ]
        },
        {
          id: "vip-consumer",
          name: "Plan VIP",
          description: "Máxima atención y beneficios exclusivos",
          price: billingCycle === "monthly" ? 49 : 470,
          duration: billingCycle === "monthly" ? "mes" : "año",
          savings: billingCycle === "yearly" ? 118 : undefined,
          target: "consumers",
          category: "enterprise",
          features: [
            {
              title: "Todo del plan premium",
              description: "Incluye todas las características premium",
              icon: <Crown className="w-4 h-4" />
            },
            {
              title: "Asistente personal",
              description: "Coordinador dedicado 24/7",
              icon: <UserPlus className="w-4 h-4" />
            },
            {
              title: "Servicios de emergencia",
              description: "Atención prioritaria en emergencias",
              icon: <HeartPulse className="w-4 h-4" />
            },
            {
              title: "Beneficios VIP",
              description: "Acceso a eventos y servicios exclusivos",
              icon: <Star className="w-4 h-4" />
            }
          ]
        },
        // Planes para proveedores
        {
          id: "basic-provider",
          name: "Profesional Básico",
          description: "Inicio perfecto para profesionales",
          price: billingCycle === "monthly" ? 49 : 470,
          duration: billingCycle === "monthly" ? "mes" : "año",
          target: "providers",
          category: "basic",
          maxClients: 50,
          maxAppointments: 100,
          maxProducts: 10,
          features: [
            {
              title: "Perfil profesional",
              description: "Perfil verificado en la plataforma",
              icon: <Shield className="w-4 h-4" />
            },
            {
              title: "Gestión de citas",
              description: "Hasta 100 citas mensuales",
              icon: <Calendar className="w-4 h-4" />
            },
            {
              title: "Productos básicos",
              description: "Hasta 10 productos en QuMarket",
              icon: <ShoppingCart className="w-4 h-4" />
            }
          ]
        },
        {
          id: "premium-provider",
          name: "Profesional Premium",
          description: "Impulsa tu práctica profesional",
          price: billingCycle === "monthly" ? 99 : 950,
          duration: billingCycle === "monthly" ? "mes" : "año",
          target: "providers",
          category: "premium",
          popular: true,
          maxClients: 200,
          maxAppointments: "Ilimitados",
          maxProducts: 50,
          features: [
            {
              title: "Todo del plan básico",
              description: "Incluye todas las características básicas",
              icon: <CheckCircle className="w-4 h-4" />
            },
            {
              title: "Marketing avanzado",
              description: "Posicionamiento destacado",
              icon: <Sparkles className="w-4 h-4" />
            },
            {
              title: "Analytics pro",
              description: "Estadísticas y reportes detallados",
              icon: <PieChart className="w-4 h-4" />
            },
            {
              title: "QuMarket premium",
              description: "Hasta 50 productos con prioridad",
              icon: <ShoppingCart className="w-4 h-4" />
            }
          ]
        },
        {
          id: "enterprise-provider",
          name: "Clínica Enterprise",
          description: "Solución completa para clínicas y spa",
          price: billingCycle === "monthly" ? 199 : 1910,
          duration: billingCycle === "monthly" ? "mes" : "año",
          target: "providers",
          category: "enterprise",
          maxClients: "Ilimitados",
          maxAppointments: "Ilimitados",
          maxProducts: "Ilimitados",
          features: [
            {
              title: "Todo del plan premium",
              description: "Incluye todas las características premium",
              icon: <Crown className="w-4 h-4" />
            },
            {
              title: "Multi-ubicación",
              description: "Gestión de múltiples sucursales",
              icon: <Building className="w-4 h-4" />
            },
            {
              title: "Panel enterprise",
              description: "Dashboard completo de operaciones",
              icon: <Layout className="w-4 h-4" />
            },
            {
              title: "API dedicada",
              description: "Integración con sistemas propios",
              icon: <Share2 className="w-4 h-4" />
            }
          ]
        },
        {
          id: "market-provider",
          name: "QuMarket Pro",
          description: "Maximiza tus ventas en QuMarket",
          price: billingCycle === "monthly" ? 79 : 758,
          duration: billingCycle === "monthly" ? "mes" : "año",
          target: "providers",
          category: "market",
          maxProducts: "Ilimitados",
          features: [
            {
              title: "Productos ilimitados",
              description: "Sin límite de productos en QuMarket",
              icon: <ShoppingCart className="w-4 h-4" />
            },
            {
              title: "Analytics de ventas",
              description: "Estadísticas detalladas de ventas",
              icon: <Activity className="w-4 h-4" />
            },
            {
              title: "Gestión de inventario",
              description: "Control completo de inventario",
              icon: <Briefcase className="w-4 h-4" />
            },
            {
              title: "Promociones especiales",
              description: "Herramientas de marketing y ofertas",
              icon: <Coins className="w-4 h-4" />
            }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [billingCycle]);

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => plan.target === (role === "paciente" ? "consumers" : "providers"));
  }, [plans, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <Progress value={50} className="w-1/3" />
        <p className="text-gray-400">Cargando planes disponibles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="text-red-500 w-12 h-12" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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
            {filteredPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onSelect={setSelectedPlan}
                isPopular={plan.popular || false}
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