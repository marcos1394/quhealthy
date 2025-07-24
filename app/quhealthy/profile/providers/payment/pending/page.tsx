"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentPending } from '@/app/quhealthy/components/payment/PaymentPending'; // Asegúrate que la ruta sea correcta

// Esta es la página real que maneja la URL.
// Su única tarea es leer los parámetros de la URL y pasarlos como props al componente.
export default function PaymentPendingPage() {
  const searchParams = useSearchParams();

  // Obtenemos los datos de la URL que podríamos necesitar
  const orderNumber = searchParams.get('orderNumber') || 'No disponible';
  const planName = searchParams.get('planName') || 'Plan QuHealthy';
  const planPrice = Number(searchParams.get('planPrice')) || 0;

  return (
    <PaymentPending 
      orderNumber={orderNumber}
      planName={planName}
      planPrice={planPrice}
    />
  );
}