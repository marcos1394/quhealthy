"use client";

import React, { useState, Suspense } from "react"; // Importa Suspense
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SiStripe, SiMercadopago } from 'react-icons/si';
import { CreditCard, ShoppingCart, Shield, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { PaymentMethod, PaymentMethodId } from "@/app/quhealthy/types/payment"; // Asegúrate que la ruta sea correcta
import { PlanSummary } from "@/app/quhealthy/components/payment/PlanSummary"; // Asegúrate que la ruta sea correcta
import { PaymentMethodCard } from "@/app/quhealthy/components/payment/PaymentMethodCard"; // Asegúrate que la ruta sea correcta

const paymentMethods: PaymentMethod[] = [
  { id: "stripe", name: "Stripe", description: "Pago seguro con Tarjeta de Crédito/Débito", logo: <SiStripe size={75} className="text-purple-500" />, icon: <CreditCard className="w-5 h-5" />, features: ["Acepta Visa, MasterCard, Amex", "Pagos internacionales", "Proceso seguro y encriptado"], badge: "Recomendado" },
  { id: "mercadopago", name: "Mercado Pago", description: "Plataforma líder en América Latina", logo: <SiMercadopago size={85} className="text-purple-500" />, icon: <ShoppingCart className="w-5 h-5" />, features: ["Múltiples métodos de pago", "Pagos en cuotas (si aplica)", "Integración para LATAM"] }
];

// Componente hijo que contiene la lógica que usa 'useSearchParams'
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
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Ocurrió un error al procesar el pago.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto relative z-10">
        <PlanSummary planName={planName} planPrice={planPrice} planDuration={planDuration} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10"
        >
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={selectedMethod === method.id}
              onSelect={() => setSelectedMethod(method.id)}
            />
          ))}
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} className="mb-6">
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <Button onClick={handlePaymentSelection} disabled={!selectedMethod || loading} size="lg" className="bg-purple-600 hover:bg-purple-700 min-w-[250px] h-14 text-lg">
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /><span>Procesando...</span></>
            ) : (
              <>Continuar con {selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.name : 'Pago'}<ArrowRight className="w-5 h-5 ml-2" /></>
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

// Página principal que exportas, ahora con Suspense
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}