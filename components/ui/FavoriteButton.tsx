"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-react19-deprecated-apis */;;

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';

function getReadableTextColor(hex: string): string {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return '#ffffff';
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#ffffff';
}

interface FavoriteButtonProps {
    entityType: 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'PRODUCT' | 'SERVICE';
    entityId: number;
    initialIsFavorite?: boolean;
    className?: string;
    /** Store/provider brand color for active and hover states */
    brandColor?: string;
    /** Callback invoked instead of toggleFavorite when user is not authenticated.
     *  The parent component can use this to show an AuthGateModal. */
    onAuthRequired?: () => void;
}

export function FavoriteButton({
    entityType,
    entityId,
    initialIsFavorite = false,
    className,
    brandColor,
    onAuthRequired,
}: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavoriteToggle(entityType, entityId, initialIsFavorite);
    const [isHovered, setIsHovered] = useState(false);

    const accentColor = brandColor?.trim() || undefined;
    const accentTextColor = accentColor ? getReadableTextColor(accentColor) : undefined;
    const useBrandAccent = !!accentColor;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onAuthRequired) {
            onAuthRequired();
            return;
        }
        toggleFavorite();
    };

    const brandStyles: React.CSSProperties | undefined = useBrandAccent
        ? isFavorite || isHovered
            ? {
                backgroundColor: accentColor,
                borderColor: accentColor,
                color: accentTextColor,
            }
            : {
                borderColor: accentColor,
                color: accentColor,
            }
        : undefined;

    return (
        <button
            type="button"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={brandStyles}
            className={cn(
                "flex items-center justify-center w-10 h-10 transition-colors z-20 rounded-none border shrink-0",
                useBrandAccent
                    ? "bg-white dark:bg-[#0a0a0a]"
                    : isFavorite
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
