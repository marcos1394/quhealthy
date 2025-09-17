"use client";

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface CheckoutFormProps {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Datos de la Tarjeta</label>
        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
          <CardElement options={{ style: { base: { color: '#FFF' } } }} />
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
      <Button type="submit" disabled={!stripe || isLoading} className="w-full h-12 text-base bg-purple-600 hover:bg-purple-700">
        {isLoading ? <Loader2 className="animate-spin" /> : 'Pagar y Confirmar Cita'}
      </Button>
    </form>
  );
};