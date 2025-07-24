"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentFailure } from '@/app/quhealthy/components/payment/PaymentFailure'; // Asegúrate que la ruta sea correcta

// Esta es la página real que se renderiza en la URL.
// Es "Serverless", por lo que no puede tener lógica compleja.
// Su única tarea es leer los parámetros de la URL y pasarlos al componente cliente.
export default function PaymentErrorPage() {
  const searchParams = useSearchParams();

  // Obtenemos los datos de la URL
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