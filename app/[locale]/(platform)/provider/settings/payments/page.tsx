/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, ExternalLink, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Hooks
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

export default function PaymentSettingsPage() {
  const { data: statusData, isLoading: pageLoading, error } = useOnboardingStatus();
  const [loadingStripe, setLoadingStripe] = useState(false);

  // Estado de conexión
  const isStripeConnected = !!(statusData?.providerDetails as any)?.stripeAccountId;

  const handleConnectStripe = async () => {
    setLoadingStripe(true);
    try {
      // 1. Solicitar enlace de onboarding al backend
      const { data } = await axios.post('/api/connect/stripe/create-account-link', {}, {
        withCredentials: true,
      });

      // 2. Redirigir a Stripe
      if (data.url) {
        window.location.href = data.url; // Usamos window.location para salir de la app hacia Stripe
      } else {
        toast.error("No se pudo iniciar la conexión con Stripe.");
      }

    } catch (err) {
      console.error(err);
      toast.error("Error de conexión. Intenta más tarde.");
    } finally {
      setLoadingStripe(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-900/10 rounded-xl border border-red-900/20">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        Error al cargar la configuración de pagos.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Configuración de Pagos</h1>
        <p className="text-gray-400 mt-2">
          Conecta tus cuentas bancarias para recibir los pagos de tus consultas automáticamente.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-6"
      >
        
        {/* STRIPE CONNECT CARD */}
        <Card className={`
            border-2 transition-all
            ${isStripeConnected ? 'bg-gray-900 border-green-500/30' : 'bg-gray-900 border-gray-800'}
        `}>
          <CardHeader>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#635BFF]/10 rounded-xl border border-[#635BFF]/20">
                        {/* Icono Simulado de Stripe (o usar librería de iconos) */}
                        <CreditCard className="w-6 h-6 text-[#635BFF]" />
                    </div>
                    <div>
                        <CardTitle className="text-white text-lg">Stripe Connect</CardTitle>
                        <CardDescription className="text-gray-400">Procesamiento de tarjetas de crédito y débito global.</CardDescription>
                    </div>
                </div>
                {isStripeConnected && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" /> Activo
                    </Badge>
                )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-950/50 rounded-lg border border-gray-800">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-white">Estado de la cuenta</p>
                    <p className="text-xs text-gray-500">
                        {isStripeConnected 
                            ? "Tu cuenta está vinculada y lista para recibir depósitos." 
                            : "Vincula tu cuenta bancaria para habilitar los pagos en línea."}
                    </p>
                </div>
                
                <Button 
                    onClick={handleConnectStripe} 
                    disabled={loadingStripe}
                    variant={isStripeConnected ? "outline" : "default"}
                    className={isStripeConnected 
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "bg-[#635BFF] hover:bg-[#5349E8] text-white"
                    }
                >
                    {loadingStripe ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isStripeConnected ? (
                        <>Gestionar en Stripe <ExternalLink className="w-4 h-4 ml-2" /></>
                    ) : (
                        "Conectar Cuenta"
                    )}
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* MERCADO PAGO (Placeholder / Roadmap) */}
        <Card className="bg-gray-900/50 border border-gray-800 opacity-75">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 grayscale">
                            <Wallet className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-gray-400 text-lg flex items-center gap-2">
                                Mercado Pago
                                <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-700">Próximamente</Badge>
                            </CardTitle>
                            <CardDescription className="text-gray-500">Pagos locales y código QR.</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="p-4 bg-gray-950/30 rounded-lg border border-gray-800/50 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Esta integración estará disponible en la próxima actualización.</p>
                    <Button disabled variant="ghost" className="text-gray-600">No disponible</Button>
                </div>
            </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}