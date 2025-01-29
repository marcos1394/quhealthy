"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  CheckCircle, 
  ArrowRight,
  ShoppingCart,
  Shield
} from "lucide-react";
import StripeLogo from "@/public/stripelogo.png";
import MercadoPagoLogo from "@/public/mercadopagologo.jpg";
import Image from "next/image";
import axios from "axios";


const PaymentMethodSelector = () => {
  const searchParams = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "mercadopago" | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const planId = searchParams.get("planId") || "";
  const planName = searchParams.get("planName") || "";
  const planPrice = parseFloat(searchParams.get("planPrice") || "0");
  const planDuration = searchParams.get("planDuration") || "";

  const paymentMethods = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Pago seguro con tarjeta de crédito/débito",
      logo: (
        <div className="relative w-64 h-24">
          <Image
            src={StripeLogo}
            alt="Stripe Logo"
            fill
            className="object-contain"
          />
        </div>
      ),
      icon: <Shield className="w-6 h-6" />,
      features: [
        "Pagos internacionales",
        "Proceso seguro y encriptado",
        "Soporte 24/7",
        "Sin cargos adicionales",
      ],
      badge: "Recomendado",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      textColor: "text-gray-800",
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      description: "La plataforma líder en América Latina",
      logo: (
        <div className="relative w-64 h-24">
          <Image
            src={MercadoPagoLogo}
            alt="Mercado Pago Logo"
            fill
            className="object-contain"
          />
        </div>
      ),
      icon: <ShoppingCart className="w-6 h-6" />,
      features: [
        "Múltiples métodos de pago",
        "Pagos en cuotas",
        "Proceso seguro",
        "Soporte local",
      ],
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      textColor: "text-gray-800",
    },
  ];

  const handlePaymentSelection = async () => {
    if (!selectedMethod || !planId) return;
    setLoading(true);
  
    try {
      if (selectedMethod === "stripe") {
        const response = await axios.post(
          "http://localhost:3001/api/payments/stripe/create-checkout-session",
          { planId, planName, planPrice },
          { withCredentials: true }
        );
  
        if (response.status !== 200) {
          throw new Error("Error al crear sesión de Stripe");
        }
  
        window.location.href = response.data.url; // Redirigir al checkout de Stripe
      } else if (selectedMethod === "mercadopago") {
        const response = await axios.post(
          "http://localhost:3001/api/payments/mercadopago/create-preference",
          { planId },
          { withCredentials: true }
        );
  
        if (response.status !== 200) {
          throw new Error("Error al crear preferencia de MercadoPago");
        }
  
        window.location.href = response.data.url; // Redirigir a MercadoPago
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Ocurrió un error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Selecciona tu método de pago
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
            Elige el método que prefieras para completar tu suscripción
          </p>

          <div className="inline-block bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white">${planPrice}</div>
              <div className="text-gray-400">/{planDuration}</div>
              <Badge className="bg-teal-500/20 text-teal-400 ml-2">
                {planName}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <AnimatePresence>
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  className={`h-full ${method.bgColor} border-gray-200/30 backdrop-blur-sm cursor-pointer transition-all hover:border-teal-500/50 ${
                    selectedMethod === method.id
                      ? "ring-2 ring-teal-500 shadow-teal-500/20 shadow-lg"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() =>
                    setSelectedMethod(method.id as "stripe" | "mercadopago")
                  }
                >
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg">
                          <div>{method.logo}</div>
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <div className="flex items-center gap-2 bg-teal-500/20 text-teal-600 px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Seleccionado</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xl font-bold ${method.textColor}`}>
                          {method.name}
                        </h3>
                        {method.badge && (
                          <Badge className="bg-blue-500/20 text-blue-600">
                            {method.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {method.description}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3">
                      {method.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="text-teal-600 w-4 h-4 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handlePaymentSelection}
            disabled={!selectedMethod || loading}
            className="bg-teal-500 hover:bg-teal-600 min-w-[200px] h-12 text-lg"
          >
            {loading ? (
              "Procesando..."
            ) : (
              <>
                Continuar con el pago
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Pago 100% seguro y encriptado
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;