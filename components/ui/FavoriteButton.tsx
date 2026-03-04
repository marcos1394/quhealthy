// src/components/ui/FavoriteButton.tsx
import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';

interface FavoriteButtonProps {
    entityType: 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'PRODUCT';
    entityId: number;
    initialIsFavorite?: boolean;
    className?: string;
}

export function FavoriteButton({ entityType, entityId, initialIsFavorite = false, className }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavoriteToggle(entityType, entityId, initialIsFavorite);

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleFavorite}
            className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md border transition-all duration-300 shadow-sm z-20",
                isFavorite 
                    ? "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/50" 
                    : "bg-black/20 dark:bg-black/50 border-white/20 hover:bg-black/40",
                className
            )}
        >
            <motion.div
                initial={false}
                animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Heart 
                    className={cn(
                        "w-4 h-4 transition-colors",
                        isFavorite 
                            ? "fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400" 
                            : "fill-transparent text-white"
                    )} 
                />
            </motion.div>
        </motion.button>
    );
}