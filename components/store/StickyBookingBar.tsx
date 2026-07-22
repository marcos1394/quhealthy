"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/hooks/useBookingStore';

interface StickyBookingBarProps {
  providerSlug: string;
  brandColor?: string;
}

export const StickyBookingBar: React.FC<StickyBookingBarProps> = ({ providerSlug, brandColor = '#000000' }) => {
  const router = useRouter();
  const locale = useLocale();
  const { cart } = useBookingStore();

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.cartQuantity || 1), 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * (item.cartQuantity || 1)), 0);
  }, [cart]);

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none animate-in slide-in-from-bottom-8 duration-300">
      <div 
        className="max-w-3xl mx-auto bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-4 flex items-center justify-between pointer-events-auto transition-transform duration-300 translate-y-0"
      >
        <div className="flex items-center gap-4">
          <div 
            className="hidden sm:flex w-12 h-12 items-center justify-center text-white"
            style={{ backgroundColor: brandColor !== '#ffffff' ? brandColor : '#000000' }}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Tu Selección</p>
            <p className="text-lg font-bold uppercase tracking-tight text-black dark:text-white leading-none">
              {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'} <span className="text-gray-300 mx-1">•</span> ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <Button 
          onClick={() => router.push(`/${locale}/patient/booking/${providerSlug}`)}
          className="rounded-none h-12 px-6 sm:px-8 text-[9px] font-bold uppercase tracking-widest border-0 text-white transition-transform hover:scale-105"
          style={{ backgroundColor: brandColor !== '#ffffff' ? brandColor : '#000000' }}
        >
          <span className="hidden sm:inline">Agendar Cita</span>
          <span className="inline sm:hidden">Agendar</span>
          <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
};
