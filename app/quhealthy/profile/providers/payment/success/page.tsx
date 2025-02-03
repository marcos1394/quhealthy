"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  ArrowRight, 
  Home, 
  Download, 
  Share2, 
  Mail, 
  Copy 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import Link from "next/link";


export default function PaymentSuccess() {
  const searchParams = useSearchParams();

  // ✅ Capturar parámetros de la URL
  const orderNumber = searchParams.get("session_id") || "N/A";
  const planName = searchParams.get("planName") || "Plan Estándar";
  const planPrice = searchParams.get("planPrice") || "900";
  const planDuration = searchParams.get("planDuration") || "mes";

  // ✅ URL del comprobante de pago
  const invoiceUrl = `http://localhost:3001/api/payments/invoice/${orderNumber}`;

  // ✅ Función para copiar el enlace al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invoiceUrl);
      toast.success("¡Enlace copiado al portapapeles!");
    } catch (error) {
      toast.error("Error al copiar el enlace");
    }
  };

  // ✅ Función para compartir con Web Share API (Móviles)
  const shareInvoice = () => {
    if (navigator.share) {
      navigator.share({
        title: "Comprobante de Pago - QuHealthy",
        text: `Aquí está tu comprobante de pago de QuHealthy: ${invoiceUrl}`,
        url: invoiceUrl,
      }).catch(err => console.error("Error al compartir:", err));
    } else {
      copyToClipboard(); // Si no es compatible, solo copia el enlace
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
          <CardHeader className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-teal-500/10 backdrop-blur-sm" />
            <div className="relative p-6 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mx-auto mb-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-500/20 rounded-full animate-ping" />
                  <CheckCircle className="w-20 h-20 text-teal-500 mx-auto relative" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">¡Pago Exitoso!</h2>
              <p className="text-gray-400">
                Tu suscripción ha sido activada correctamente
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-white">{planName}</h3>
                  <p 
                    className="text-sm text-gray-400 max-w-[12ch] truncate" 
                    title={orderNumber}
                  >
                    Orden #{orderNumber}
                  </p>
                </div>
                <Badge className="bg-teal-500/20 text-teal-400">
                  ${planPrice}/{planDuration}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="w-4 h-4 text-teal-400" />
                  <span>Confirmación enviada a tu correo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Acceso inmediato a todas las funciones</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
            <Button asChild className="w-full bg-teal-500 hover:bg-teal-600 text-white">
  <Link href="/quhealthy/authentication/providers/onboarding/kyc">
    Continuar
    <ArrowRight className="w-4 h-4 ml-2" />
  </Link>
</Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="text-gray-400 border-gray-700 hover:bg-gray-700"
                  onClick={() => window.open(invoiceUrl, "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar factura
                </Button>

                <Button 
                  variant="outline"
                  className="text-gray-400 border-gray-700 hover:bg-gray-700"
                  onClick={shareInvoice}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-gray-400 hover:bg-gray-700"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar enlace
              </Button>

              <Button 
                variant="ghost" 
                className="w-full text-gray-400 hover:bg-gray-700"
                onClick={() => window.location.href = "/"}
              >
                <Home className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
