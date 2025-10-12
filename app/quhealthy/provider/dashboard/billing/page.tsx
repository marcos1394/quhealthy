/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { motion } from 'framer-motion';
import { Loader2, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import useSWR from 'swr';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';

// Hook para obtener los planes
const fetcher = (url: string) => axios.get(url, { withCredentials: true }).then(res => res.data);

// Carga Stripe fuera del renderizado del componente
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function BillingPage() {
  const { user } = useSessionStore();
  const { data: plans, error, isLoading } = useSWR('/api/plans', fetcher);
  const [isRedirecting, setIsRedirecting] = useState<number | null>(null);

  const handleSubscribe = async (planId: number) => {
    setIsRedirecting(planId);
    try {
      // 1. Pide al backend que cree una sesión de checkout en Stripe
      const { data } = await axios.post('/api/payments/stripe/create-checkout-session', 
        { planId }, 
        { withCredentials: true }
      );
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe.js no se ha cargado.");
      
      // 2. Redirige al usuario a la página de pago de Stripe
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        toast.error(error.message || "No se pudo redirigir a la página de pago.");
      }
    } catch (err) {
      toast.error("Error al iniciar el proceso de suscripción.");
    } finally {
      setIsRedirecting(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  // --- INICIO DE LA CORRECCIÓN ---
  // Si hay un error O si todavía no hay datos de planes, mostramos un estado de error/vacío.
  if (error || !plans) {
    return <div className="text-center text-red-400">Error al cargar los planes. Por favor, intenta de nuevo.</div>;
  }
  // --- FIN DE LA CORRECCIÓN ---

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestiona tu Suscripción</h1>
        <p className="text-gray-400 mt-1">
          {user?.planStatus === 'trial' 
            ? 'Tu período de prueba está por terminar. Elige un plan para continuar.'
            : 'Elige el plan que mejor se adapte a tu negocio.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* No necesitamos optional chaining aquí porque ya lo validamos arriba */}
        {plans.map((plan: any) => (
          <Card key={plan.id} className="bg-gray-800/50 border-gray-700 flex flex-col">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-purple-300">{plan.name}</CardTitle>
              <p className="text-4xl font-bold text-white">${plan.price}<span className="text-base font-normal text-gray-400">/mes</span></p>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <ul className="space-y-2 text-gray-300">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 mt-1 shrink-0"/>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubscribe(plan.id)} 
                disabled={isRedirecting === plan.id}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isRedirecting === plan.id ? <Loader2 className="animate-spin" /> : 'Seleccionar Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}