"use client";

import React from 'react';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useMyFavorites } from '@/hooks/useMyFavorites';
import { useSessionStore } from '@/stores/SessionStore';

export function SmartFavoriteButton({ entityType, entityId, brandColor }: { entityType: any, entityId: number, brandColor?: string }) {
  const { token } = useSessionStore();
  
  // Extraemos todos los IDs favoritos de este tipo (solo si hay sesión)
  const { favoriteIds } = useMyFavorites(entityType);
  
  // Verificamos si este ítem está en los favoritos del usuario
  const isFavorited = favoriteIds.has(entityId);

  return (
    <FavoriteButton 
      entityType={entityType} 
      entityId={entityId}
      initialIsFavorite={isFavorited}
      brandColor={brandColor}
      className="w-14 h-14 md:h-16 flex items-center justify-center border border-black dark:border-white bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
    />
  );
}
