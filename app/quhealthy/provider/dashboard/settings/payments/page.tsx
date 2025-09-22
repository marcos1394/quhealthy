"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function PaymentSettingsPage() {
  const router = useRouter();
  const { data: statusData, isLoading: pageLoading, error } = useOnboardingStatus();
  const [loading, setLoading] = useState(false);

  // Derivamos el estado de la conexión de Stripe desde los datos cargados
const isStripeConnected = !!statusData?.providerDetails?.stripeAccountId;

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      // Llamamos al endpoint del backend que creamos
      const { data } = await axios.post('/api/connect/stripe/create-account-link', {}, {
        withCredentials: true,
      });

      // Redirigimos al usuario a la URL de onboarding de Stripe
      if (data.url) {
        router.push(data.url);
      } else {
        toast.error("No se pudo obtener el enlace de conexión. Inténtalo de nuevo.");
      }

    } catch (err) {
      console.error("Error al crear el enlace de cuenta de Stripe:", err);
      toast.error("Ocurrió un error al iniciar el proceso con Stripe.");
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }
  
  if (error) {
    return <div className="text-red-400 text-center">{error}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <CreditCard className="w-6 h-6 mr-3 text-purple-400" />
            Configuración de Pagos
          </CardTitle>
          <CardDescription>
            Conecta tus cuentas para recibir pagos de tus clientes de forma segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className={`p-6 rounded-lg border flex items-center justify-between ${isStripeConnected ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-700/50 border-gray-600'}`}>
            <div>
              <h3 className="font-semibold text-white">Stripe</h3>
              <p className={`text-sm ${isStripeConnected ? 'text-green-300' : 'text-gray-400'}`}>
                {isStripeConnected 
                  ? "Tu cuenta está conectada y lista para recibir pagos." 
                  : "Conecta con Stripe para aceptar pagos con tarjeta de forma global."
                }
              </p>
            </div>
            <Button onClick={handleConnectStripe} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 
               isStripeConnected ? (
                 <>
                   Gestionar Cuenta <ExternalLink className="w-4 h-4 ml-2" />
                 </>
                ) : 'Conectar con Stripe'
              }
            </Button>
          </div>
          {/* Aquí podrías añadir la sección para Mercado Pago Connect en el futuro */}
        </CardContent>
      </Card>
    </motion.div>
  );
}