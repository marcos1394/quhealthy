"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { SuccessHeader } from '@/components/dashboard/subscription/success/SuccessHeader';
import { NextStepsList } from '@/components/dashboard/subscription/success/NextStepsList';
import { SuccessActions } from '@/components/dashboard/subscription/success/SuccessActions';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Lanzar un poco de confetti al cargar la página si el pago fue exitoso
  useEffect(() => {
    if (sessionId) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#3b82f6', '#0ea5e9']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#3b82f6', '#0ea5e9']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [sessionId]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto space-y-10">
        <SuccessHeader />
        <NextStepsList />
        <SuccessActions />
      </div>
    </div>
  );
}