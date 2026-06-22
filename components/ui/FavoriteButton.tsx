"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-react19-deprecated-apis */;;

import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';

interface FavoriteButtonProps {
    entityType: 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'PRODUCT' | 'SERVICE';
    entityId: number;
    initialIsFavorite?: boolean;
    className?: string;
}

export function FavoriteButton({ entityType, entityId, initialIsFavorite = false, className }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavoriteToggle(entityType, entityId, initialIsFavorite);

    return (
        <button
            onClick={toggleFavorite}
            className={cn(
                "flex items-center justify-center w-10 h-10 transition-colors z-20 group rounded-none border",
                isFavorite 
                    ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black" 
                    : "bg-white border-gray-300 dark:bg-[#0a0a0a] dark:border-gray-700 hover:border-black dark:hover:border-white text-gray-500 hover:text-black dark:hover:text-white",
                className
            )}
        >
            <Heart 
                className={cn(
                    "w-4 h-4 transition-all duration-300",
                    isFavorite ? "fill-current scale-110" : "fill-transparent scale-100"
                )} 
                strokeWidth={isFavorite ? 0 : 1.5}
            />
        </button>
    );
}