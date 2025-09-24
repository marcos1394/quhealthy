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
import { useRouter } from 'next/navigation';

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
  const [isLoading, setIsLoading] = useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const router = useRouter();
    const [acceptedPolicy, setAcceptedPolicy] = useState(false); // <-- AÑADE ESTA LÍNEA


  useEffect(() => {
    if (isOpen && service && providerId && selectedSlot) {
      setIsLoading(true);
      setClientSecret(null);
      setBookingConfirmed(false);

      // 1. Llamamos a nuestro endpoint "inteligente" SIN un paymentIntentId
      // para que el backend decida si se necesita un pago o se usa un crédito.
      axios.post('/api/appointments/book', {
        providerId,
        serviceId: service.id,
        startTime: selectedSlot.toISOString(),
      }, { withCredentials: true })
      .then(res => {
        const { requiresPayment, clientSecret: secret, appointment } = res.data;
        
        if (requiresPayment) {
          // 2. El backend nos pide un pago, así que guardamos el clientSecret para Stripe
          setClientSecret(secret);
        } else {
          // 3. El backend confirma que la cita se creó con un crédito.
          toast.success("¡Cita confirmada con tu crédito!");
          setBookingConfirmed(true);
          // Cerramos y redirigimos después de un momento
          setTimeout(() => {
            onClose();
            router.push(`/booking/success/${appointment.appointment.id}`);
          }, 2000);
        }
      })
      .catch(err => {
        toast.error(err.response?.data?.message || "No se pudo iniciar la reserva.");
        onClose();
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [isOpen, service, providerId, selectedSlot, onClose, router]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // 4. Si el pago fue exitoso, llamamos DE NUEVO al endpoint, 
      // pero ahora CON el ID de pago.
      const response = await axios.post('/api/appointments/book', {
        providerId,
        serviceId: service?.id,
        startTime: selectedSlot?.toISOString(),
        paymentIntentId, // <-- Ahora enviamos el ID del pago
      }, { withCredentials: true });

      const newAppointment = response.data.appointment;
      if (newAppointment && newAppointment.id) {
        // Redirigimos a la página de éxito
        window.location.href = `/booking/success/${newAppointment.id}`;
      } else {
        throw new Error("La API no devolvió una cita válida tras el pago.");
      }
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
            {isLoading || !clientSecret ? (
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