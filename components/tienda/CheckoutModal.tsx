/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { CheckoutForm } from './CheckoutForm';
import axios from 'axios';
import {  X, Calendar, Clock, DollarSign, Shield, Sparkles, CreditCard } from 'lucide-react';
import { Service } from '@/app/quhealthy/types/marketplace';
import { toast } from 'react-toastify';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  providerId: number;
  selectedSlot: Date | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  service, 
  providerId, 
  selectedSlot 
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
    const [acceptedPolicy, setAcceptedPolicy] = useState(false); // <-- AÑADE ESTA LÍNEA


  useEffect(() => {
    if (isOpen && service && providerId) {
      setLoading(true);
      setClientSecret(null);

      const payload = {
        serviceId: service.id,
        providerId: providerId,
      };
      
      console.log("Enviando a /create-intent:", payload);

      axios.post('/api/payments/create-intent', payload, { withCredentials: true })
        .then(res => {
          setClientSecret(res.data.clientSecret);
        })
        .catch(err => {
          console.error("Error al crear la intención de pago:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, service, providerId]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
  try {
    // --- INICIO DE LA CORRECCIÓN ---
    // 1. Capturamos la respuesta de la API, que contiene la nueva cita
    const response = await axios.post('/api/appointments/book', {
      providerId,
      serviceId: service?.id,
      startTime: selectedSlot?.toISOString(),
      paymentIntentId,
    }, { withCredentials: true });

    // 2. Extraemos la cita y su ID de la respuesta
    const newAppointment = response.data;

    if (newAppointment && newAppointment.id) {
      // 3. Construimos la URL dinámica y redirigimos
      const successUrl = `/booking/success/${newAppointment.id}`;
      // Usamos window.location.href para una redirección completa
      window.location.href = successUrl;
    } else {
      // Si por alguna razón la API no devuelve la cita, redirigimos a una página genérica
      console.error("La API no devolvió una cita válida tras el pago.");
      window.location.href = '/consumer/appointments'; // A la lista de citas como fallback
    }
    // --- FIN DE LA CORRECCIÓN ---

  } catch (error) {
    toast.error("El pago se realizó, pero no se pudo agendar tu cita. Contacta a soporte.");
  }
};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-3xl border border-purple-500/20 w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Decorative gradient line */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"></div>
          
          {/* Header */}
          <div className="p-8 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Confirmar Reserva
                  </h2>
                  <p className="text-slate-400 mt-1">Finaliza tu cita con pago seguro</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-xl"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading || !clientSecret ? (
              <div className="text-center py-12 space-y-6">
                <div className="relative mx-auto w-16 h-16">
                  <div className="w-16 h-16 border-4 border-purple-200/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Preparando tu pago</h3>
                  <p className="text-slate-400">Configurando la pasarela de pago segura...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Booking Summary */}
                {service && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      Resumen de tu Cita
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-white">{service.name}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{selectedSlot.toLocaleDateString('es-MX')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-2xl font-bold text-white">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            {service.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Payment Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                     {/* --- INICIO DE LA MODIFICACIÓN --- */}
      <div className="mb-6 flex items-start space-x-3">
        <input
          id="accept-policy"
          type="checkbox"
          checked={acceptedPolicy}
          onChange={(e) => setAcceptedPolicy(e.target.checked)}
          className="h-5 w-5 rounded border-gray-500 bg-gray-600 text-purple-500 focus:ring-purple-600"
        />
        <div className="text-sm">
          <label htmlFor="accept-policy" className="font-medium text-gray-300">
            Acepto la política de cancelación del servicio.
          </label>
        </div>
      </div>
                    <CheckoutForm 
                      clientSecret={clientSecret} 
                      onPaymentSuccess={handlePaymentSuccess} 
                      isPolicyAccepted={acceptedPolicy} 

                    />
                  </Elements>
                </motion.div>

                {/* Security Notice */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <Shield className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-green-300 font-medium text-sm">Pago 100% Seguro</p>
                      <p className="text-slate-400 text-xs">Procesado con encriptación SSL por Stripe</p>
                    </div>
                    <Sparkles className="w-5 h-5 text-green-400 animate-pulse ml-auto" />
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};