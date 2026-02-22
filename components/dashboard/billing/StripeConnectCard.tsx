"use client";

import { useStripeConnect } from "@/hooks/useStripeConnect";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Loader2, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StripeConnectCard() {
  const { status, isLoadingStatus, isRedirecting, handleOnboarding } = useStripeConnect();

  // El loading inicial ahora se maneja en el Suspense de la página,
  // pero dejamos este por seguridad si el fetchStatus tarda mucho.
  if (isLoadingStatus && !status) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6 animate-pulse">
            <div className="h-16 w-16 rounded-2xl bg-gray-800" />
            <div className="space-y-3 flex-1">
              <div className="h-5 w-64 rounded-lg bg-gray-800" />
              <div className="h-4 w-96 rounded-lg bg-gray-800" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isReady = status?.ready === true;
  const isPending = status?.status === "PENDING";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "bg-gradient-to-br overflow-hidden shadow-2xl border-2 transition-all duration-300 hover:shadow-3xl",
        isReady 
          ? "from-gray-900 to-gray-900/50 border-emerald-500/30 hover:border-emerald-500/40" 
          : "from-gray-900 to-gray-900/50 border-gray-800 hover:border-purple-500/30"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            
            {/* Información del Estado */}
            <div className="flex items-start gap-6 flex-1">
              
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex-shrink-0"
              >
                {isReady ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                    <AlertCircle className="h-8 w-8 text-purple-400" />
                  </div>
                )}
              </motion.div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-black text-white">
                    Cobros y Transferencias
                  </h3>
                  {isReady ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-md">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Activo
                    </Badge>
                  ) : isPending ? (
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-md">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Verificación Pendiente
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-800 text-gray-400 border-gray-700 shadow-md">
                      No Configurado
                    </Badge>
                  )}
                </div>
                
                <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
                  {isReady 
                    ? "Tu cuenta bancaria está vinculada correctamente. Estás listo para recibir los pagos de tus consultas directamente en tu cuenta."
                    : "Para poder cobrar por tus servicios, necesitas vincular una cuenta bancaria y verificar tu identidad de forma segura."}
                </p>

                {/* Sub-badges para mostrar qué falta en caso de estar pendiente */}
                {isPending && status && (
                  <div className="flex gap-3 mt-4">
                    <span className={cn("text-xs px-2 py-1 rounded-md border", status.charges_enabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-gray-800 border-gray-700 text-gray-500")}>
                      Cobros: {status.charges_enabled ? 'Habilitados' : 'Pendientes'}
                    </span>
                    <span className={cn("text-xs px-2 py-1 rounded-md border", status.payouts_enabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-gray-800 border-gray-700 text-gray-500")}>
                      Depósitos: {status.payouts_enabled ? 'Habilitados' : 'Pendientes'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de Acción */}
            <div className="flex-shrink-0 pt-2 lg:pt-0">
              <Button
                onClick={handleOnboarding}
                disabled={isRedirecting}
                size="lg"
                className={cn(
                  "w-full lg:w-auto h-14 px-8 text-base font-bold shadow-xl transition-all duration-300 group",
                  isReady 
                    ? "bg-gray-800 text-white border-2 border-gray-700 hover:bg-gray-700 hover:border-gray-600" 
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105"
                )}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : isReady ? (
                  <>
                    Gestionar en Stripe
                    <ExternalLink className="ml-2 h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Vincular Cuenta Bancaria
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        
        {/* Footer de seguridad */}
        {!isReady && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 px-8 py-5 border-t border-gray-800/50"
          >
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Shield className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Tus datos están protegidos y encriptados por Stripe Connect
              </p>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}