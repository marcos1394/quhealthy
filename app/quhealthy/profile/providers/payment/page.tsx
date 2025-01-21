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
  ShoppingCart
} from "lucide-react";

const PaymentMethodSelector = () => {
  const searchParams = useSearchParams();

  // Extrae los parámetros de la URL
  const planId = searchParams.get("planId") || "";
  const planName = searchParams.get("planName") || "";
  const planPrice = parseFloat(searchParams.get("planPrice") || "0");
  const planDuration = searchParams.get("planDuration") || "";
  const transactionFee = parseFloat(searchParams.get("transactionFee") || "0");

  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "mercadopago" | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: "stripe",
      name: "Stripe",
      description: "Pago seguro con tarjeta de crédito/débito",
      icon: <CreditCard className="w-6 h-6" />,
      features: [
        "Pagos internacionales",
        "Proceso seguro y encriptado",
        "Soporte 24/7",
        "Sin cargos adicionales",
      ],
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      description: "La plataforma líder en América Latina",
      icon: <ShoppingCart className="w-6 h-6" />,
      features: [
        "Múltiples métodos de pago",
        "Pagos en cuotas",
        "Proceso seguro",
        "Soporte local",
      ],
    },
  ];

  const handlePaymentSelection = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    try {
      // Simulación del proceso de pago
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error processing payment:", error);
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
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Elige el método que prefieras para completar tu suscripción
          </p>

          <div className="mt-4">
            <Badge className="bg-teal-500/20 text-teal-400">
              {planName} - ${planPrice}/{planDuration}
            </Badge>
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
                  className={`h-full bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? "ring-2 ring-teal-500 shadow-teal-500/20 shadow-lg"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedMethod(method.id as "stripe" | "mercadopago")
                  }
                >
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-teal-400">{method.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {method.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="text-teal-400 w-5 h-5" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3">
                      {method.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <CheckCircle className="text-teal-400 w-4 h-4" />
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

        <div className="flex justify-center">
          <Button
            onClick={handlePaymentSelection}
            disabled={!selectedMethod || loading}
            className="bg-teal-500 hover:bg-teal-600 min-w-[200px]"
          >
            {loading ? (
              "Procesando..."
            ) : (
              <>
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
