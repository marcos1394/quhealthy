"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Navigation, MapPin, Building, Star, Package, BookOpen, ShoppingBag, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DiscoverItem } from '@/types/discover';

export const DiscoverItemCard = ({ item }: { item: DiscoverItem }) => {
  const router = useRouter();

  const handleProviderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/store/${item.providerSlug}`);
  };

  const handleItemClick = () => {
    router.push(`/store/${item.providerSlug}?autoShow=${item.id}&type=${item.type}`);
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'SERVICE': return <Stethoscope className="w-3 h-3 mr-1" />;
      case 'PRODUCT': return <ShoppingBag className="w-3 h-3 mr-1" />;
      case 'PACKAGE': return <Package className="w-3 h-3 mr-1" />;
      case 'COURSE': return <BookOpen className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'SERVICE': return 'Servicio';
      case 'PRODUCT': return 'Producto';
      case 'PACKAGE': return 'Paquete';
      case 'COURSE': return 'Curso';
      default: return 'Item';
    }
  };

  return (
    <div 
      onClick={handleItemClick}
      className="group flex flex-col w-[260px] md:w-full flex-shrink-0 snap-center bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)] hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff]"
    >
      <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-900 overflow-hidden border-b border-gray-200 dark:border-gray-800">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 font-bold tracking-widest uppercase text-xs flex items-center">
              {getTypeIcon()} {getTypeLabel()}
            </span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1 flex-col items-start">
          <Badge className="bg-white/90 text-black dark:bg-black/90 dark:text-white border-black dark:border-white text-[9px] uppercase font-bold tracking-widest rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] mb-1">
            <span className="flex items-center">{getTypeIcon()} {getTypeLabel()}</span>
          </Badge>
          <div className="flex gap-1">
            {item.modality && (
              <Badge className="bg-black text-white dark:bg-white dark:text-black text-[9px] uppercase font-bold tracking-widest rounded-none border-none">
                {item.modality === 'IN_PERSON' ? 'Presencial' : item.modality === 'ONLINE' ? 'En Línea' : 'Híbrido'}
              </Badge>
            )}
            {item.discountPercentage && item.discountPercentage > 0 && (
              <Badge className="bg-green-500 text-white text-[9px] uppercase font-bold tracking-widest rounded-none border-none">
                -{item.discountPercentage}%
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-widest line-clamp-2 mb-1">
          {item.name}
        </h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest line-clamp-2 mb-3">
          {item.category || item.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            {item.providerLogoUrl && (
              <img src={item.providerLogoUrl} alt={item.providerName} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span 
              onClick={handleProviderClick}
              className="text-[9px] font-bold text-black dark:text-white uppercase tracking-widest truncate hover:underline"
            >
              {item.providerName}
            </span>
            {item.distanceKm !== undefined && (
              <span className="text-[8px] text-gray-500 uppercase tracking-widest flex items-center">
                <Navigation className="w-2 h-2 mr-1" /> {item.distanceKm.toFixed(1)} KM
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex justify-between items-end border-t border-gray-100 dark:border-gray-800 pt-3">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Inversión</span>
            <div className="flex items-baseline gap-1">
              {item.price > 0 ? (
                <>
                  <span className="text-sm font-bold text-black dark:text-white">${item.price}</span>
                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                    <span className="text-[9px] text-gray-400 line-through">${item.compareAtPrice}</span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-bold text-black dark:text-white tracking-widest uppercase">Previa Valoración</span>
              )}
            </div>
          </div>
          {item.durationMinutes && item.type === 'SERVICE' && (
            <div className="flex items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              <Clock className="w-3 h-3 mr-1" /> {item.durationMinutes} MIN
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
