"use client";

import React, { useState, ReactNode } from "react"; // Import ReactNode
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert components
import { motion } from "framer-motion";
import { SiStripe, SiMercadopago } from 'react-icons/si';

import {
  CreditCard,
  CheckCircle,
  ArrowRight,
  ShoppingCart, // Icono para MercadoPago
  Shield, // Icono para Stripe y seguridad general
  Loader2, // Icono de carga
  AlertCircle // Icono para errores
} from "lucide-react";
import StripeLogo from "@/public/stripelogo.png"; // Asumiendo ruta correcta
import MercadoPagoLogo from "@/public/mercadopagologo.jpg"; // Asumiendo ruta correcta
import Image from "next/image";
import axios from "axios";
import { toast } from "react-toastify"; // Importar toast

// --- Interfaces TypeScript ---
interface PaymentMethod {
  id: "stripe" | "mercadopago";
  name: string;
  description: string;
  logo: ReactNode; // Logo como nodo React
  icon: ReactNode; // Icono pequeño representativo
  features: string[]; // Lista de características (texto simple)
  badge?: string; // Insignia opcional (ej: Recomendado)
  // Ya no se usan bgColor/textColor, se usa tema oscuro
}

// --- Animación ---
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// --- Componente Principal (Homologado y Completo) ---
export default function PaymentMethodSelector() {
  const searchParams = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "mercadopago" | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Estado para errores

  // Obtener datos del plan desde los query params
  const planId = searchParams.get("planId") || "";
  const planName = searchParams.get("planName") || "Plan Desconocido";
  const planPrice = parseFloat(searchParams.get("planPrice") || "0");
  const planDuration = searchParams.get("planDuration") || "mes"; // Default a 'mes'

  // Definición de métodos de pago
  const paymentMethods: PaymentMethod[] = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Pago seguro con Tarjeta de Crédito/Débito",
      logo: (
        // Usando SiStripe con tamaño y color púrpura del tema
        <SiStripe size={75} className="text-purple-500" />
      ),
      icon: <CreditCard className="w-5 h-5" />, // Icono representativo pequeño
      features: [
        "Acepta Visa, MasterCard, Amex",
        "Pagos internacionales soportados",
        "Proceso seguro y encriptado SSL",
        "Experiencia de pago integrada", // Ajustado feature
      ],
      badge: "Recomendado",
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      description: "Plataforma líder en América Latina",
      logo: (
         // Usando SiMercadopago con tamaño y color púrpura del tema
         // Ajusta el tamaño si es necesario para la proporción del logo
        <SiMercadopago size={85} className="text-purple-500" />
      ),
      icon: <ShoppingCart className="w-5 h-5" />, // Icono representativo pequeño
      features: [
        "Múltiples métodos (Tarjeta, Efectivo, etc.)",
        "Pagos en cuotas (si aplica)",
        "Plataforma confiable y reconocida",
        "Integración optimizada para LATAM", // Ajustado feature
      ],
      // No tiene badge en este ejemplo
    },
  ];

  // Función para manejar el proceso de pago
  const handlePaymentSelection = async () => {
    if (!selectedMethod || !planId) {
        setError("Por favor, selecciona un método de pago.");
        toast.warn("Por favor, selecciona un método de pago.", { position: "top-right" });
        return;
    }
    setLoading(true);
    setError(null); // Limpiar errores previos

    try {
      let redirectUrl: string | null = null;
      let apiEndpoint: string | null = null;
      let payload: object = {};

      if (selectedMethod === "stripe") {
        apiEndpoint = "http://localhost:3001/api/payments/stripe/create-checkout-session";
        payload = { planId: Number(planId) }; // Asegurar que planId sea número si el backend lo espera
      } else if (selectedMethod === "mercadopago") {
        apiEndpoint = "http://localhost:3001/api/payments/mercadopago/create-preference";
        payload = { planId: Number(planId) }; // Asegurar que planId sea número
      }

      if (!apiEndpoint) {
          throw new Error("Método de pago no válido seleccionado internamente.");
      }

      console.log(`Enviando petición a ${apiEndpoint} con payload:`, payload);

      const response = await axios.post(
        apiEndpoint,
        payload,
        { withCredentials: true } // Enviar cookies de sesión si son necesarias para autenticar
      );

      console.log("Respuesta del backend:", response);

      // Verificar respuesta exitosa (2xx) y si contiene la URL
      if (response.status >= 200 && response.status < 300 && response.data?.url) {
        redirectUrl = response.data.url;
        window.location.href = redirectUrl!; // Añadimos '!' para decirle a TS que no será null
      } else {
        // Lanzar error si la respuesta no es exitosa o no contiene la URL
        throw new Error(response.data?.message || `Error al iniciar el pago con ${selectedMethod}. Código: ${response.status}`);
      }

    } catch (error: any) {
      console.error("Error al procesar el pago:", error);
      const errorMessage = error.response?.data?.message || error.message || `Ocurrió un error al procesar el pago con ${selectedMethod}. Intenta de nuevo.`;
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Formateador de precios
   const formatPrice = (price: number): string => {
    return price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8 relative overflow-hidden">
      {/* Blobs animados de fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500 opacity-[0.12] blur-3xl animate-pulse rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500 opacity-[0.12] blur-3xl animate-pulse delay-1000 rounded-full" />
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div className="text-center mb-12" {...fadeIn}>
          <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
            Finalizar Suscripción
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Estás a un paso de potenciar tu práctica. Selecciona tu método de pago preferido.
          </p>

          {/* Resumen del Plan */}
          <div className="inline-block bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-base px-4 py-1">
                {planName}
              </Badge>
              <div className="flex items-baseline">
                 <div className="text-2xl font-bold text-white">{formatPrice(planPrice)}</div>
                 <div className="text-gray-400 ml-1.5">/ {planDuration}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selector de Métodos de Pago */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10"
         >
           {paymentMethods.map((method) => (
             <motion.div
               key={method.id}
               whileHover={{ scale: 1.02 }} // Efecto hover sutil
             >
               <Card
                 className={`
                    h-full bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-xl cursor-pointer
                    transition-all duration-200 relative overflow-hidden group shadow-md
                    ${selectedMethod === method.id
                       ? "ring-2 ring-purple-500 shadow-purple-500/20" // Estilo seleccionado
                       : "hover:border-gray-600 hover:shadow-lg" // Estilo hover
                    }
                 `}
                 onClick={() => setSelectedMethod(method.id)}
               >
                 {/* Indicador de selección */}
                 {selectedMethod === method.id && (
                     <div className="absolute top-3 right-3 bg-purple-500/20 text-purple-300 p-1.5 rounded-full">
                        <CheckCircle className="w-5 h-5" />
                     </div>
                 )}

                 <CardHeader className="p-6 flex flex-row justify-between items-center">
                    {/* Logo */}
                    {method.logo}
                    {/* Insignia opcional */}
                    {method.badge && (
                      <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300 text-xs">
                        {method.badge}
                      </Badge>
                    )}
                 </CardHeader>

                 <CardContent className="p-6 pt-0">
                   <h3 className="text-lg font-semibold text-white mb-1">{method.name}</h3>
                   <p className="text-sm text-gray-400 mb-4">{method.description}</p>
                   <div className="space-y-2 border-t border-gray-700 pt-4">
                     {method.features.map((feature, index) => (
                       <div
                         key={index}
                         className="flex items-center gap-2 text-sm text-gray-300"
                       >
                         {/* Icono púrpura */}
                         <CheckCircle className="text-purple-400 w-4 h-4 shrink-0" />
                         <span>{feature}</span>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
           ))}
        </motion.div>

         {/* Alerta de Error */}
         {error && (
            <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} className="mb-6">
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </motion.div>
         )}

        {/* Botón de Continuar */}
        <motion.div className="flex flex-col items-center gap-3" {...fadeIn} transition={{ delay: 0.3 }}>
          <Button
            onClick={handlePaymentSelection}
            disabled={!selectedMethod || loading}
            size="lg" // Botón más grande
            className="bg-purple-600 hover:bg-purple-700 min-w-[250px] h-14 text-lg font-semibold shadow-lg disabled:opacity-60"
          >
            {loading ? (
               <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                Continuar con {selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.name : 'Pago'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-sm text-gray-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-purple-400" />
            Pago 100% seguro y encriptado
          </p>
        </motion.div>
      </div>
    </div>
  );
}