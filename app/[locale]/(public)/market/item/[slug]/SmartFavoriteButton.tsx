"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useMyFavorites } from "@/hooks/useMyFavorites";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SmartFavoriteButton({
  entityType,
  entityId,
  brandColor,
  className,
}: {
  entityType: any;
  entityId: number;
  brandColor?: string;
  className?: string;
}) {
  const { favoriteIds } = useMyFavorites(entityType);
  const isFavorited = favoriteIds.has(entityId);
  const { toggleFavorite } = useFavoriteToggle(entityType, entityId, isFavorited);

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggleFavorite}
      className={
        className ||
        cn(
          "flex-1 h-12 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs",
          isFavorited
            ? "text-rose-600 border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
        )
      }
      title={isFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-transform",
          isFavorited ? "fill-rose-600 text-rose-600 scale-110" : "text-gray-500 dark:text-gray-400"
        )}
        strokeWidth={1.75}
      />
      <span>{isFavorited ? "Guardado" : "Guardar"}</span>
    </Button>
  );
}
