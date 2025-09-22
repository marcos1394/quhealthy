"use client";

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Lock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
    isPolicyAccepted: boolean; // <-- Nueva prop

}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onPaymentSuccess, isPolicyAccepted  }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (paymentError) {
      setError(paymentError.message || "Ocurrió un error con el pago.");
      toast.error(paymentError.message || "Error en el pago.");
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success("¡Pago realizado con éxito!");
      onPaymentSuccess(paymentIntent.id);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#94a3b8',
        },
        iconColor: '#a78bfa',
      },
      invalid: {
        iconColor: '#ef4444',
        color: '#ef4444',
      },
      complete: {
        iconColor: '#22c55e',
      }
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Card Input Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <CreditCard className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <label className="block text-lg font-semibold text-white">
              Información de la Tarjeta
            </label>
            <p className="text-sm text-slate-400">
              Ingresa los datos de tu tarjeta de crédito o débito
            </p>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-6 transition-all duration-300 focus-within:border-purple-500/50 focus-within:shadow-lg focus-within:shadow-purple-500/20">
            <CardElement 
              options={cardElementOptions}
              onChange={(event) => {
                setCardComplete(event.complete);
                if (event.error) {
                  setError(event.error.message);
                } else {
                  setError(null);
                }
              }}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Card Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-full transition-colors ${
            cardComplete ? 'bg-green-500 animate-pulse' : 'bg-slate-600'
          }`}></div>
          <span className={`font-medium transition-colors ${
            cardComplete ? 'text-green-400' : 'text-slate-400'
          }`}>
            {cardComplete ? 'Tarjeta válida' : 'Completa la información de tu tarjeta'}
          </span>
          {cardComplete && <CheckCircle className="w-4 h-4 text-green-400" />}
        </div>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Lock className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-green-300 font-medium text-sm">SSL Seguro</p>
            <p className="text-slate-400 text-xs">Encriptación 256-bit</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-blue-300 font-medium text-sm">Powered by</p>
            <p className="text-slate-400 text-xs font-bold">STRIPE</p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="space-y-4">
        <Button 
          type="submit" 
      disabled={!stripe || isLoading || !isPolicyAccepted}
          className="group w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 border-0 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Loader2 className="w-6 h-6 animate-spin" />
                <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-blue-300 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
              </div>
              <span>Procesando pago...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <span>Pagar y Confirmar Cita</span>
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            </div>
          )}
        </Button>

        {/* Terms notice */}
        <p className="text-center text-xs text-slate-500 leading-relaxed">
          Al completar el pago, aceptas nuestros{' '}
          <span className="text-purple-400 hover:text-purple-300 cursor-pointer">
            términos de servicio
          </span>{' '}
          y{' '}
          <span className="text-purple-400 hover:text-purple-300 cursor-pointer">
            política de cancelación
          </span>.
        </p>
      </div>
    </form>
  );
};