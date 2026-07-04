"use client"
import React, { useState, useRef, useEffect } from 'react';
import { GalleryImage } from '@/types/store';
import { cn } from '@/lib/utils';
import { ArrowLeftRight } from 'lucide-react';

interface BeforeAfterComparatorProps {
 imagePair: GalleryImage;
 className?: string;
}

export function BeforeAfterComparator({ imagePair, className }: BeforeAfterComparatorProps) {
 const [sliderPosition, setSliderPosition] = useState(50);
 const [isDragging, setIsDragging] = useState(false);
 const containerRef = useRef<HTMLDivElement>(null);

 if (imagePair.galleryType !== 'BEFORE_AFTER' || !imagePair.beforeImageUrl || !imagePair.afterImageUrl) {
 return null;
 }

 const handleMove = (clientX: number) => {
 if (!containerRef.current) return;
 const rect = containerRef.current.getBoundingClientRect();
 const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
 const percentage = (x / rect.width) * 100;
 setSliderPosition(percentage);
 };

 const handleMouseMove = (e: React.MouseEvent) => {
 if (isDragging) handleMove(e.clientX);
 };

 const handleTouchMove = (e: React.TouchEvent) => {
 if (isDragging) handleMove(e.touches[0].clientX);
 };

 const handleInteractionStart = (clientX: number) => {
 setIsDragging(true);
 handleMove(clientX);
 };

 const handleInteractionEnd = () => {
 setIsDragging(false);
 };

 useEffect(() => {
 const handleMouseUp = () => setIsDragging(false);
 window.addEventListener('mouseup', handleMouseUp);
 window.addEventListener('touchend', handleMouseUp);
 return () => {
 window.removeEventListener('mouseup', handleMouseUp);
 window.removeEventListener('touchend', handleMouseUp);
 };
 }, []);

 return (
 <div className={cn("flex flex-col space-y-3", className)}>
 <div 
 ref={containerRef}
 className="relative w-full aspect-[4/3] rounded-xl overflow-hidden select-none cursor-ew-resize bg-muted"
 onMouseMove={handleMouseMove}
 onTouchMove={handleTouchMove}
 onMouseDown={(e) => handleInteractionStart(e.clientX)}
 onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX)}
 >
 {/* AFTER Image (Background) */}
 <div className="absolute inset-0">
 <img 
 src={imagePair.afterImageUrl} 
 alt="Después" 
 className="w-full h-full object-cover"
 draggable={false}
 />
 </div>

 {/* BEFORE Image (Foreground clipped) */}
 <div 
 className="absolute inset-0"
 style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
 >
 <img 
 src={imagePair.beforeImageUrl} 
 alt="Antes" 
 className="w-full h-full object-cover"
 draggable={false}
 />
 </div>

 {/* Labels */}
 <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold uppercase tracking-wider">
 Antes
 </div>
 <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 backdrop-blur-md rounded-full text-white text-xs font-semibold uppercase tracking-wider shadow-lg shadow-primary/20">
 Después
 </div>

 {/* Slider Handle */}
 <div 
 className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
 style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
 >
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
 <ArrowLeftRight size={16} className="text-slate-800" />
 </div>
 </div>
 </div>
 
 {imagePair.caption && (
 <p className="text-sm text-center text-muted-foreground font-medium">
 {imagePair.caption}
 </p>
 )}
 </div>
 );
}
