"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-react19-deprecated-apis */

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";

function getReadableTextColor(hex: string): string {
 const normalized = hex.replace("#", "");

 if (normalized.length !== 6) return "#ffffff";

 const r = parseInt(normalized.slice(0, 2), 16);
 const g = parseInt(normalized.slice(2, 4), 16);
 const b = parseInt(normalized.slice(4, 6), 16);

 const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

 return luminance > 0.6 ? "#000000" : "#ffffff";
}

interface FavoriteButtonProps {
 entityType: "PROVIDER" | "PACKAGE" | "COURSE" | "PRODUCT" | "SERVICE";
 entityId: number;
 initialIsFavorite?: boolean;
 className?: string;
 brandColor?: string;
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
 const { isFavorite, toggleFavorite } = useFavoriteToggle(
 entityType,
 entityId,
 initialIsFavorite
 );

 const [isHovered, setIsHovered] = useState(false);

 const accentColor = brandColor?.trim();
 const accentTextColor = accentColor
 ? getReadableTextColor(accentColor)
 : "#ffffff";

 const handleClick = (e: React.MouseEvent) => {
 e.stopPropagation();
 e.preventDefault();

 if (onAuthRequired) {
 onAuthRequired();
 return;
 }

 toggleFavorite();
 };

 const active = isFavorite || isHovered;

 const dynamicStyles: React.CSSProperties =
 accentColor && active
 ? {
 backgroundColor: accentColor,
 color: accentTextColor,
 }
 : {};

 return (
 <button
 type="button"
 onClick={handleClick}
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 style={dynamicStyles}
 className={cn(
 "relative z-20",
 "flex items-center justify-center",
 "w-11 h-11",
 "rounded-full",
 "backdrop-blur-lg",
 "shadow-lg",
 "ring-1 ring-black/5 dark:ring-white/10",
 "transition-all duration-300 ease-out",
 "hover:scale-105 active:scale-95",

 !active &&
 "bg-white/80 dark:bg-black/45 text-gray-700 dark:text-white",

 className
 )}
 aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
 >
 <Heart
 className={cn(
 "w-5 h-5 transition-all duration-300",
 isFavorite
 ? "fill-current scale-110"
 : "fill-transparent scale-100"
 )}
 strokeWidth={1.8}
 />
 </button>
 );
}