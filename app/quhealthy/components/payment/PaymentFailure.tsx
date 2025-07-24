"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RotateCcw, AlertCircle, PhoneCall, HelpCircle, CreditCard, Mail, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentFailureProps {
  orderNumber?: string;
  errorMessage?: string;
  planName?: string;
  planPrice?: number;
  planDuration?: string;
}

export const PaymentFailure: React.FC<PaymentFailureProps> = ({ 
  orderNumber = "123456",
  errorMessage = "No se pudo procesar el pago",
  planName = "Plan Estándar",
  planPrice = 900,
  planDuration = "mes"
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
          <CardHeader className="relative overflow-hidden p-0">
            <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm" />
            <div className="relative p-6 text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mx-auto mb-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
                  <XCircle className="w-20 h-20 text-red-500 mx-auto relative" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Error en el Pago</h2>
              <p className="text-gray-400">Lo sentimos, ha ocurrido un problema</p>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Alert className="bg-red-500/10 border-red-500/20 text-red-400 mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-white">{planName}</h3>
                  <p className="text-sm text-gray-400">Orden #{orderNumber}</p>
                </div>
                <Badge className="bg-red-500/20 text-red-400">${planPrice}/{planDuration}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300"><CreditCard className="w-4 h-4 text-red-400" /><span>Verifica los datos de tu tarjeta</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-300"><Mail className="w-4 h-4 text-red-400" /><span>Te enviamos el detalle por correo</span></div>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={() => window.location.href = "/checkout"}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Intentar nuevamente
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="text-gray-400 border-gray-700 hover:bg-gray-700" onClick={() => window.location.href = "/support"}>
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Contactar soporte
                </Button>
                <Button variant="outline" className="text-gray-400 border-gray-700 hover:bg-gray-700" onClick={() => window.location.href = "/faq"}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ver ayuda
                </Button>
              </div>
              <Button variant="ghost" className="w-full text-gray-400 hover:bg-gray-700" onClick={() => window.location.href = "/"}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};