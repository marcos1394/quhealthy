"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { CheckoutForm } from './CheckoutForm';
import axios from 'axios';
import { Loader2, X } from 'lucide-react';
import { Service } from '@/app/quhealthy/types/marketplace'; // Importa tus tipos

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  providerId: number;
  selectedSlot: Date | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, service, providerId, selectedSlot }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Solo se ejecuta si el modal está abierto y tenemos un servicio y providerId
  if (isOpen && service && providerId) {
    setLoading(true);
    setClientSecret(null); // Resetea el estado anterior

    // --- INICIO DE LA CORRECCIÓN ---
    // Creamos el 'payload' (cuerpo de la petición) con los datos necesarios
    const payload = {
      serviceId: service.id,
      providerId: providerId,
    };
    // --- FIN DE LA CORRECCIÓN ---
    
    console.log("Enviando a /create-intent:", payload);

    axios.post('/api/payments/create-intent', payload, { withCredentials: true })
    .then(res => {
      setClientSecret(res.data.clientSecret);
    })
    .catch(err => {
      console.error("Error al crear la intención de pago:", err);
      // Aquí podrías cerrar el modal y mostrar un toast de error
    })
    .finally(() => {
      setLoading(false);
    });
  }
}, [isOpen, service, providerId]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // 1. El pago fue exitoso en Stripe, ahora creamos la cita en nuestra BD
    await axios.post('/api/appointments/book', {
      providerId,
      serviceId: service?.id,
      startTime: selectedSlot?.toISOString(),
      paymentIntentId, // Para referencia
    }, { withCredentials: true });

    // 2. Redirigimos a una página de éxito
    window.location.href = '/booking/success';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md"
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Confirmar Cita</h2>
            <button onClick={onClose}><X className="text-gray-400"/></button>
          </div>
          <div className="p-6">
            {loading || !clientSecret ? (
              <div className="text-center py-8"><Loader2 className="animate-spin mx-auto"/></div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};