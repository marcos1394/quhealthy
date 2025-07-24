"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { OnboardingStatusResponse } from '@/app/quhealthy/types/provider';
import { SuccessHeader } from '@/app/quhealthy/components/payment/success/SuccessHeader';
import { PaymentDetails } from '@/app/quhealthy/components/payment/success/PaymentDetails';
import { ActionButtons } from '@/app/quhealthy/components/payment/success/ActionButtons';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderNumber = searchParams.get("session_id") || searchParams.get("payment_id") || "NoDisponible";
  const planName = searchParams.get("planName") || "Plan Contratado";
  const planPrice = parseFloat(searchParams.get("planPrice") || "0") || 0;
  const planDuration = searchParams.get("planDuration") || "mes";
  const invoiceUrl = orderNumber !== "NoDisponible"
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/payments/invoice/${orderNumber}`
    : "#";

  const handleContinue = async () => {
    setIsNavigating(true);
    setError(null);
    try {
      const response = await axios.get<OnboardingStatusResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/providers/status`,
        { withCredentials: true }
      );
      
      const { onboardingStatus } = response.data;
      let nextRoute = "/quhealthy/profile/providers/dashboard";

      if (!onboardingStatus.kyc.isComplete) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/kyc";
      } else if (onboardingStatus.license.isRequired && !onboardingStatus.license.isComplete) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/validatelicense";
      } else if (!onboardingStatus.marketplace.isConfigured) {
        nextRoute = "/quhealthy/authentication/providers/onboarding/marketplaceconfiguration";
      }
      
      toast.info(`Redirigiendo...`, { autoClose: 1500 });
      router.push(nextRoute);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "No se pudo verificar tu estado.";
      setError(errorMessage);
      toast.error("Error al verificar estado.");
      setIsNavigating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <SuccessHeader />
          <CardContent className="p-6 space-y-6">
            <PaymentDetails 
              planName={planName}
              planPrice={planPrice}
              planDuration={planDuration}
              orderNumber={orderNumber}
            />
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-2.5 text-sm"><Mail className="w-4 h-4 text-purple-400" /><span>Se envió una confirmación a tu correo.</span></div>
              <div className="flex items-center gap-2.5 text-sm"><CheckCircle className="w-4 h-4 text-purple-400" /><span>Acceso a las funciones de tu plan activado.</span></div>
              <div className="flex items-center gap-2.5 text-sm"><Sparkles className="w-4 h-4 text-purple-400" /><span>¡Listo para configurar tu perfil!</span></div>
            </div>
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                <AlertCircle className="h-5 w-5" /><AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <ActionButtons 
              orderNumber={orderNumber}
              planName={planName}
              invoiceUrl={invoiceUrl}
              isNavigating={isNavigating}
              onContinue={handleContinue}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}