"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Navigation, ShoppingBag, Package, BookOpen, Stethoscope, Calendar, CreditCard, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DiscoverItem } from '@/types/discover';

import { FavoriteButton } from '@/components/ui/FavoriteButton';

export const DiscoverItemCard = ({ 
  item,
  isFavorited = false,
  onAuthRequired,
  canUseFavorites = true
}: { 
  item: DiscoverItem;
  isFavorited?: boolean;
  onAuthRequired?: () => void;
  canUseFavorites?: boolean;
}) => {
  const router = useRouter();

  const handleProviderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/store/${item.providerSlug}`);
  };

  const handleItemClick = () => {
    router.push(`/store/${item.providerSlug}?autoShow=${item.id}&type=${item.type}`);
  };

  // CTA: acción primaria según tipo de item
  const handleCTA = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'SERVICE') {
      // Reservar cita
      router.push(`/store/${item.providerSlug}?autoBook=${item.id}&type=SERVICE`);
    } else if (item.type === 'PRODUCT') {
      // Comprar producto
      router.push(`/checkout?itemId=${item.id}&type=PRODUCT&slug=${item.providerSlug}`);
    } else if (item.type === 'PACKAGE') {
      // Contratar paquete
      router.push(`/checkout?itemId=${item.id}&type=PACKAGE&slug=${item.providerSlug}`);
    } else if (item.type === 'COURSE') {
      // Inscribirse a curso
      router.push(`/checkout?itemId=${item.id}&type=COURSE&slug=${item.providerSlug}`);
    }
  };

  const getTypeConfig = () => {
    switch (item.type) {
      case 'SERVICE': return {
        icon: <Stethoscope className="w-3 h-3 mr-1" />,
        label: 'Servicio',
        ctaLabel: 'Reservar Cita',
        ctaIcon: <Calendar className="w-3.5 h-3.5 mr-1.5" />,
        ctaStyle: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200',
      };
      case 'PRODUCT': return {
        icon: <ShoppingBag className="w-3 h-3 mr-1" />,
        label: 'Producto',
        ctaLabel: 'Comprar',
        ctaIcon: <CreditCard className="w-3.5 h-3.5 mr-1.5" />,
        ctaStyle: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200',
      };
      case 'PACKAGE': return {
        icon: <Package className="w-3 h-3 mr-1" />,
        label: 'Paquete',
        ctaLabel: 'Contratar',
        ctaIcon: <CreditCard className="w-3.5 h-3.5 mr-1.5" />,
        ctaStyle: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200',
      };
      case 'COURSE': return {
        icon: <BookOpen className="w-3 h-3 mr-1" />,
        label: 'Curso',
        ctaLabel: 'Inscribirme',
        ctaIcon: <GraduationCap className="w-3.5 h-3.5 mr-1.5" />,
        ctaStyle: 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200',
      };
      default: return {
        icon: null,
        label: 'Item',
        ctaLabel: 'Ver',
        ctaIcon: null,
        ctaStyle: 'bg-black text-white',
      };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <div
      onClick={handleItemClick}
      className="group flex flex-col w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.05)] hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff]"
    >
      {/* IMAGEN */}
      <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-900 overflow-hidden border-b border-gray-200 dark:border-gray-800">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 font-bold tracking-widest uppercase text-xs flex items-center">
              {typeConfig.icon} {typeConfig.label}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-col items-start">
          <Badge className="bg-white/90 text-black dark:bg-black/90 dark:text-white border-black dark:border-white text-[9px] uppercase font-bold tracking-widest rounded-none shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]">
            <span className="flex items-center">{typeConfig.icon} {typeConfig.label}</span>
          </Badge>
          <div className="flex gap-1">
            {item.modality && (
              <Badge className="bg-black text-white dark:bg-white dark:text-black text-[9px] uppercase font-bold tracking-widest rounded-none border-none">
                {item.modality === 'IN_PERSON' ? 'Presencial' : item.modality === 'ONLINE' ? 'En Línea' : 'Híbrido'}
              </Badge>
            )}
            {(item.discountPercentage ?? 0) > 0 && (
              <Badge className="bg-green-500 text-white text-[9px] uppercase font-bold tracking-widest rounded-none border-none">
                -{item.discountPercentage}%
              </Badge>
            )}
          </div>
        </div>

        {/* Botón de Favorito */}
        <div className="absolute top-2 right-2 z-20">
          <FavoriteButton
            entityType={item.type as 'SERVICE' | 'PRODUCT' | 'PACKAGE' | 'COURSE'}
            entityId={item.id}
            initialIsFavorite={isFavorited}
            brandColor={item.providerColor || '#000'}
            onAuthRequired={!canUseFavorites ? onAuthRequired : undefined}
          />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-4 flex flex-col flex-1">
        {/* Nombre y descripción */}
        <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-widest line-clamp-2 mb-1">
          {item.name}
        </h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest line-clamp-1 mb-3">
          {item.category || item.description}
        </p>

        {/* Proveedor */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
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

        {/* Separador */}
        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-3" />

        {/* Precio + Duración */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              {item.type === 'SERVICE' ? 'Tarifa' : item.type === 'COURSE' ? 'Inscripción' : 'Precio'}
            </span>
            <div className="flex items-baseline gap-1">
              {item.price > 0 ? (
                <>
                  <span className="text-base font-bold text-black dark:text-white">${item.price.toLocaleString()}</span>
                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                    <span className="text-[9px] text-gray-400 line-through">${item.compareAtPrice.toLocaleString()}</span>
                  )}
                </>
              ) : (
                <span className="text-[10px] font-bold text-black dark:text-white tracking-widest uppercase">Previa Valoración</span>
              )}
            </div>
          </div>
          {item.durationMinutes && (item.type === 'SERVICE' || item.type === 'COURSE') && (
            <div className="flex items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              <Clock className="w-3 h-3 mr-1" /> {item.durationMinutes} MIN
            </div>
          )}
        </div>

        {/* CTA BUTTON */}
        <Button
          onClick={handleCTA}
          className="w-full rounded-none h-10 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center border-0 transition-all text-white hover:opacity-90"
          style={{ backgroundColor: item.providerColor || '#000' }}
        >
          {typeConfig.ctaIcon}
          {typeConfig.ctaLabel}
        </Button>
      </div>
    </div>
  );
};
