"use client";

import React, { useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CatalogItemDTO } from '@/types/catalog';
import { useBookingStore } from '@/hooks/useBookingStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StorefrontItem } from '@/types/storefront';

interface AddToCartButtonProps {
  item: CatalogItemDTO;
}

export function AddToCartButton({ item }: AddToCartButtonProps) {
  const t = useTranslations('Marketplace');
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useBookingStore(state => state.addItem);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Convert CatalogItemDTO to StorefrontItem for the store
    const storefrontItem: StorefrontItem = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      currency: item.currency || 'MXN',
      imageUrl: item.imageUrl,
      type: item.type,
      modality: item.modality,
      category: item.category,
      providerId: item.providerId,
      status: item.status || 'ACTIVE'
    };

    // Simulate network delay for UX
    setTimeout(() => {
      addItem(storefrontItem);
      setIsAdding(false);
    }, 400);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={cn(
        "w-full h-14 md:h-16 text-sm md:text-base font-bold tracking-widest uppercase transition-all duration-300",
        "bg-black hover:bg-black/90 text-white rounded-none border border-black",
        "dark:bg-white dark:hover:bg-gray-200 dark:text-black dark:border-white",
        "flex items-center justify-center gap-3"
      )}
    >
      {isAdding ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          {t('addToCart', { fallback: 'Agregar al Carrito' })}
        </>
      )}
    </Button>
  );
}
