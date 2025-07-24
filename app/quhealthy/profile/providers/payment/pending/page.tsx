"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentPending } from '@/app/quhealthy/components/payment/PaymentPending'; // Asegúrate que la ruta sea correcta
import { Loader2 } from 'lucide-react';

function PaymentPendingContent() {
  const searchParams = useSearchParams();

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

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}