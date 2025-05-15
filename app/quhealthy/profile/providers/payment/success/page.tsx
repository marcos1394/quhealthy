"use client";

import React, { useState } from "react"; // Importar useState
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Para errores de API
import {
  CheckCircle,
  ArrowRight,
  Home,
  Download,
  Share2,
  Mail,
  Copy,
  LayoutDashboard,
  Loader2,     // Para el estado de carga del botón
  Sparkles,    // Para el botón "Comenzar"
  AlertCircle  // Para el componente Alert
} from "lucide-react";
import { toast } from "react-toastify";
// Link ya no es necesario para el botón principal
// import Link from "next/link";
import axios from "axios"; // Necesario para llamar al API

// --- Interfaz de Respuesta del API (como la definimos antes) ---
type KycStatusValue = 'pending' | 'in_review' | 'approved' | 'rejected' | 'not_started' | 'verified';
type LicenseStatusValue = 'pending' | 'verified' | 'rejected';
type PlanLimit = number | "Ilimitados";

interface KycStatusInfo { status: KycStatusValue; isComplete: boolean; }
interface LicenseStatusInfo { isRequired: boolean; status: LicenseStatusValue; isComplete: boolean; }
interface MarketplaceStatusInfo { isConfigured: boolean; }
interface BlocksStatusInfo { isConfigured: boolean; }
interface OnboardingStatusDetail { kyc: KycStatusInfo; license: LicenseStatusInfo; marketplace: MarketplaceStatusInfo; blocks: BlocksStatusInfo; }
interface PlanPermissionsInfo { quMarketAccess: boolean; quBlocksAccess: boolean; marketingLevel: number; supportLevel: number; advancedReports: boolean; userManagement: number; allowAdvancePayments: boolean; maxAppointments: PlanLimit; maxProducts: PlanLimit; maxCourses: PlanLimit; }
interface PlanDetailsInfo { planId: number | null; planName: string; hasActivePlan: boolean; endDate: string | null; permissions: PlanPermissionsInfo; }
interface ProviderDetailsInfo { parentCategoryId: number | null; email: string; name: string; }

interface OnboardingStatusResponse {
  onboardingStatus: OnboardingStatusDetail;
  planDetails: PlanDetailsInfo;
  providerDetails: ProviderDetailsInfo;
}
// -------------------------------------------------------------


// --- Animación ---
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// --- Componente Principal (con Lógica de Onboarding en Botón) ---
export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false); // Estado de carga para el botón
  const [error, setError] = useState<string | null>(null);     // Estado para error de API

  // Captura de parámetros (sin cambios)
  const orderNumber = searchParams.get("session_id") || searchParams.get("payment_id") || "NoDisponible";
  const planName = searchParams.get("planName") || "Plan Contratado";
  const planPriceString = searchParams.get("planPrice") || "0";
  const planDuration = searchParams.get("planDuration") || "mes";
  const planPrice = parseFloat(planPriceString) || 0;

  // Formateador de precios (sin cambios)
  const formatPrice = (price: number): string => {
    return price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  // URL del comprobante (sin cambios)
  const invoiceUrl = orderNumber !== "NoDisponible"
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/invoice/${orderNumber}`
    : "#";

      // Función para copiar enlace

      const copyToClipboard = async () => {
    
        if (orderNumber === "NoDisponible") {
    
            toast.error("Número de orden no disponible para copiar enlace.");
    
            return;
    
        }
    
        try {
    
          await navigator.clipboard.writeText(invoiceUrl);
    
          toast.success("¡Enlace de factura copiado!");
    
        } catch (error) {
    
          console.error("Error al copiar enlace:", error);
    
          toast.error("No se pudo copiar el enlace.");
    
        }
    
      };
    
    
    
      // Función para compartir
    
      const shareInvoice = () => {
    
         if (orderNumber === "NoDisponible") {
    
            toast.error("Número de orden no disponible para compartir.");
    
            return;
    
        }
    
        if (navigator.share) {
    
          navigator.share({
    
            title: "Comprobante de Pago - QuHealthy",
    
            text: `Aquí está tu comprobante de pago para el plan ${planName} de QuHealthy: ${invoiceUrl}`,
    
            url: invoiceUrl,
    
          }).catch(err => {
    
              // No mostrar error si el usuario cancela la acción de compartir
    
              if (err.name !== 'AbortError') {
    
                 console.error("Error al compartir:", err);
    
                 toast.error("No se pudo compartir el enlace.");
    
              }
    
          });
    
        } else {
    
          // Fallback para navegadores sin Web Share API
    
          copyToClipboard();
    
          toast.info("Enlace copiado. Puedes pegarlo para compartir.");
    
        }
    
      };
    
    
    
       // Función para descargar factura (abre en nueva pestaña)
    
       const downloadInvoice = () => {
    
         if (orderNumber === "NoDisponible") {
    
            toast.error("Número de orden no disponible para descargar factura.");
    
            return;
    
        }
    
        window.open(invoiceUrl, "_blank");
    
       };
    
    

  // --- NUEVA FUNCIÓN: Manejar clic en botón principal ---
  const handleContinue = async () => {
    setIsNavigating(true);
    setError(null);

    try {
      console.log("🚀 Llamando a /api/providers/status para determinar siguiente paso...");
      const response = await axios.get<OnboardingStatusResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/providers/status`,
        { withCredentials: true } // Esencial para enviar la cookie de sesión
      );
      console.log("✅ Respuesta de /api/providers/status:", response.data);

      const { onboardingStatus } = response.data;
      let nextRoute = "/quhealthy/profile/providers/dashboard"; // Ruta por defecto

      // Lógica para determinar la siguiente ruta de onboarding
      if (!onboardingStatus.kyc.isComplete) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/kyc";
        console.log("🚦 Próximo paso: KYC");
      } else if (onboardingStatus.license.isRequired && !onboardingStatus.license.isComplete) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/validatelicense";
        console.log("🚦 Próximo paso: Licencia");
      } else if (!onboardingStatus.marketplace.isConfigured) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/marketplaceconfiguration";
        console.log("🚦 Próximo paso: Marketplace");
      }
      // Aquí podrías añadir la lógica para QuBlocks si fuera un paso requerido del onboarding inicial
      // else if (!onboardingStatus.blocks.isConfigured) { nextRoute = "/ruta/configurar/blocks"; }
      else {
         console.log("✅ Onboarding esencial completo. Redirigiendo al Dashboard.");
      }

      // Navegar a la ruta determinada
      toast.info(`Redirigiendo a ${nextRoute.split('/').pop()}...`, { autoClose: 1500 }); // Feedback visual
      router.push(nextRoute);

    } catch (err: any) {
      console.error("❌ Error al obtener el estado del proveedor:", err);
      const errorMessage = err.response?.data?.message || err.message || "No se pudo verificar tu estado actual. Por favor, intenta ir al panel manualmente.";
      setError(errorMessage); // Mostrar error en la UI
      toast.error("Error al verificar estado.", { autoClose: 4000 });
    } finally {
      // Asegurar que el estado de carga se quite incluso si hay error de navegación
      // Puede que necesitemos un pequeño delay si la navegación es muy rápida
      setTimeout(() => setIsNavigating(false), 500);
    }
  };
  // -------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500 opacity-[0.12] blur-3xl animate-pulse rounded-full" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500 opacity-[0.12] blur-3xl animate-pulse delay-1000 rounded-full" />
        </div>

        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-lg relative z-10"
        >
            <Card className="bg-gray-800/90 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                <CardHeader className="relative overflow-hidden p-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-purple-500/10 to-transparent backdrop-blur-sm" />
                    <div className="relative p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            className="mx-auto mb-5"
                        >
                            <div className="relative inline-block">
                                <div className="absolute -inset-2 bg-purple-500/30 rounded-full animate-ping opacity-75" />
                                <div className="relative bg-purple-500/20 p-4 rounded-full inline-block">
                                    <CheckCircle className="w-16 h-16 text-purple-400 mx-auto" strokeWidth={1.5}/>
                                </div>
                            </div>
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white mb-2">¡Pago Exitoso!</h2>
                        <p className="text-gray-300 text-lg">
                            Tu suscripción a QuHealthy ha sido activada.
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    <div className="bg-gray-700/60 rounded-lg p-4 border border-gray-600/50">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-3">
                            <h3 className="font-semibold text-lg text-white">{planName}</h3>
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-medium px-3 py-1">
                                {formatPrice(planPrice)} / {planDuration}
                            </Badge>
                        </div>
                        <p
                           className="text-xs text-gray-400 text-center sm:text-left"
                           title={orderNumber !== "NoDisponible" ? `Número de Orden: ${orderNumber}` : 'Número de Orden no disponible'}
                        >
                           {orderNumber !== "NoDisponible" ? `Orden #${orderNumber.substring(0, 25)}...` : 'ID de Orden no encontrado'}
                        </p>
                    </div>

                    <div className="space-y-3 text-gray-300">
                         <div className="flex items-center gap-2.5 text-sm">
                            <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span>Se envió una confirmación a tu correo electrónico.</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                            <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span>Acceso inmediato a las funciones de tu plan activado.</span>
                        </div>
                         <div className="flex items-center gap-2.5 text-sm">
                            <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <span>¡Estás listo/a para configurar tu perfil!</span>
                        </div>
                    </div>

                     {/* Alerta de Error de Navegación */}
                     {error && (
                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                     )}

                    {/* Botones de Acción */}
                    <div className="space-y-3 pt-4 border-t border-gray-700">
                        {/* Botón Principal: Continuar con Onboarding/Dashboard */}
                        <Button
                            size="lg"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base shadow-md flex items-center justify-center transition-all duration-200"
                            onClick={handleContinue}
                            disabled={isNavigating}
                        >
                            {isNavigating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    <span>Verificando estado...</span>
                                </>
                            ) : (
                                <>
                                    Comenzar Configuración
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>

                        {/* Botones Secundarios */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="text-gray-300 border-gray-600 hover:bg-purple-900/30 hover:border-purple-700 hover:text-purple-300 transition-colors duration-200"
                                onClick={downloadInvoice}
                                disabled={orderNumber === "NoDisponible" || isNavigating}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar Factura
                            </Button>
                            <Button
                                variant="outline"
                                className="text-gray-300 border-gray-600 hover:bg-purple-900/30 hover:border-purple-700 hover:text-purple-300 transition-colors duration-200"
                                onClick={shareInvoice}
                                disabled={orderNumber === "NoDisponible" || isNavigating}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Compartir Factura
                            </Button>
                        </div>

                        {/* Botones Terciarios */}
                         <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="ghost"
                                className="w-full text-gray-400 hover:bg-purple-900/30 hover:text-purple-300 transition-colors duration-200"
                                onClick={copyToClipboard}
                                disabled={orderNumber === "NoDisponible" || isNavigating}
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Enlace Factura
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-gray-400 hover:bg-purple-900/30 hover:text-purple-300 transition-colors duration-200"
                                onClick={() => router.push("/")}
                                disabled={isNavigating}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Volver al Inicio
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    </div>
  );
}