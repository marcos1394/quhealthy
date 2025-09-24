/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { CheckoutForm } from './CheckoutForm';
import axios from 'axios';
import { Loader2, X, Package } from 'lucide-react';
import { ServicePackage } from '@/app/quhealthy/types/marketplace';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';


interface PackageCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: ServicePackage | null;
    providerId: number; // <-- AÑADE ESTA LÍNEA

}

export const PackageCheckoutModal: React.FC<PackageCheckoutModalProps> = ({ isOpen, onClose, pkg }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && pkg) {
      setLoading(true);
      // Llama al endpoint que ya creamos para iniciar el pago
      axios.post('/api/packages/purchase', { packageId: pkg.id }, { withCredentials: true })
        .then(res => {
          setClientSecret(res.data.clientSecret);
        })
        .catch(err => {
          console.error("Error creating package payment intent", err);
          toast.error("No se pudo iniciar el proceso de compra.");
          onClose();
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, pkg, onClose]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Llama al endpoint que creamos para confirmar la compra después del pago
      await axios.post('/api/packages/confirm-purchase', {
        packageId: pkg?.id,
        paymentIntentId,
      }, { withCredentials: true });
      
      toast.success("¡Paquete comprado exitosamente!");
      router.push('/consumer/packages'); // Redirigir a una futura página "Mis Paquetes"
    } catch (error) {
      toast.error("El pago se realizó, pero no se pudo registrar tu paquete. Contacta a soporte.");
    }
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
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Package/> Confirmar Compra de Paquete</h2>
            <button onClick={onClose}><X className="text-gray-400"/></button>
          </div>
          <div className="p-6">
            {isLoading || !clientSecret ? (
              <div className="text-center py-8"><Loader2 className="animate-spin mx-auto"/></div>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="font-semibold text-white">{pkg?.name}</h3>
                  <p className="text-2xl font-bold text-purple-300">${pkg?.price}</p>
                </div>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    onPaymentSuccess={handlePaymentSuccess}
                    isPolicyAccepted={true} // No hay política que aceptar al comprar un paquete
                  />
                </Elements>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};