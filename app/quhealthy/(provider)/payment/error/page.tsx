"use client";

import React, { Suspense } from 'react'; // <--- Importa Suspense
import { useSearchParams } from 'next/navigation';
import { PaymentFailure } from '@/app/quhealthy/components/payment/PaymentFailure'; // Asegúrate que la ruta sea correcta
import { Loader2 } from 'lucide-react';

// Este componente SÍ puede usar el hook porque estará dentro de Suspense
function PaymentErrorContent() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get('orderNumber') || 'No disponible';
  const errorMessage = searchParams.get('error') || 'Tu pago no pudo ser procesado.';
  const planName = searchParams.get('planName') || 'Plan QuHealthy';
  const planPrice = Number(searchParams.get('planPrice')) || 0;

  return (
    <PaymentFailure 
      orderNumber={orderNumber}
      errorMessage={errorMessage}
      planName={planName}
      planPrice={planPrice}
    />
  );
}

// Esta es la página principal que se exporta
export default function PaymentErrorPage() {
  return (
    // Envolvemos el contenido en Suspense con un fallback
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <PaymentErrorContent />
    </Suspense>
  );
}