"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Navigation, ShoppingBag, Package, BookOpen, Stethoscope, Calendar, CreditCard, GraduationCap, Star, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, generateSlug } from '@/lib/utils';
import { DiscoverItem } from '@/types/discover';
import { useBookingStore } from '@/hooks/useBookingStore';
import { StorefrontItem } from '@/types/storefront';

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
 const params = useParams();
 const locale = params?.locale || 'es';

 const handleProviderClick = (e: React.MouseEvent) => {
 e.stopPropagation();
 router.push(`/store/${item.providerSlug}`);
 };

 const handleItemClick = () => {
 router.push(`/store/${item.providerSlug}?autoShow=${item.id}&type=${item.type}`);
 };

 const { setProvider, addToCart } = useBookingStore();

 // CTA: acción primaria según tipo de item
 const handleCTA = (e: React.MouseEvent) => {
 e.stopPropagation();
 
 setProvider(item.providerId, item.providerSlug, item.providerName, item.providerColor);
 
 const cartItem: StorefrontItem = {
 id: item.id,
 type: item.type,
 category: item.category || '',
 name: item.name,
 description: item.description,
 price: item.price,
 imageUrl: item.imageUrl,
 durationMinutes: item.durationMinutes,
 modality: item.modality as any,
 compareAtPrice: item.compareAtPrice,
 quantity: item.stockQuantity,
 isDigital: item.isDigital,
 requiresEvaluation: item.requiresEvaluation
 };

 addToCart(cartItem, item.providerSlug);
 
 if (item.type === 'SERVICE') {
 router.push(`/patient/booking/${item.providerSlug}?serviceId=${item.id}`);
 } else {
 router.push(`/store/${item.providerSlug}?openCart=true`);
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
      className="group flex flex-col w-full bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1"
    >
      {/* IMAGEN */}
      <div className="relative aspect-video w-full bg-gray-50 dark:bg-black overflow-hidden rounded-t-2xl border-b border-gray-100 dark:border-gray-800">
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
        <Badge className="bg-white/90 text-gray-800 dark:bg-black/90 dark:text-gray-200 border border-black/5 dark:border-white/10 text-[10px] font-semibold tracking-wide rounded-full shadow-sm backdrop-blur-md">
          <span className="flex items-center">{typeConfig.icon} {typeConfig.label}</span>
        </Badge>
        <div className="flex gap-1">
          {item.modality && (
            <Badge className="bg-gray-800 text-white dark:bg-gray-200 dark:text-black text-[9px] font-semibold tracking-wide rounded-full border-none shadow-sm">
              {item.modality === 'IN_PERSON' ? 'Presencial' : item.modality === 'ONLINE' ? 'En Línea' : 'Híbrido'}
            </Badge>
          )}
          {(item.discountPercentage ?? 0) > 0 && (
            <Badge className="bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 text-[9px] font-bold tracking-wide rounded-full border-none shadow-sm backdrop-blur-md">
              -{item.discountPercentage}% OFF
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
 
      {/* Rating Block */}
      {(item.averageRating !== undefined && item.averageRating > 0) ? (
        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1.5 z-20 shadow-sm border border-black/5 dark:border-white/10">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
          <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-none mt-0.5">{item.averageRating.toFixed(1)}</span>
          {item.reviewCount !== undefined && item.reviewCount > 0 && (
            <span className="text-[10px] text-gray-500 ml-0.5">({item.reviewCount})</span>
          )}
        </div>
      ) : (
        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl px-2.5 py-1 flex items-center gap-1.5 z-20 shadow-sm border border-black/5 dark:border-white/10">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
          <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-none mt-0.5">Nuevo</span>
        </div>
      )}
 </div>

    {/* CONTENIDO */}
    <div className="p-4 flex flex-col flex-1 bg-transparent rounded-b-2xl">
      {/* Nombre y descripción */}
      <Link 
        href={`/${locale}/market/item/${item.id}-${generateSlug(item.name)}`}
        onClick={(e) => e.stopPropagation()}
        className="hover:underline decoration-teal-500 cursor-pointer"
      >
        <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 mb-1">
          {item.name}
        </h3>
      </Link>
      <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium line-clamp-1 mb-3 capitalize">
        {(item.category || item.description).toLowerCase()}
      </p>

      {/* Proveedor */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {item.providerLogoUrl ? (
            <img src={item.providerLogoUrl} alt={item.providerName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <User className="w-3 h-3 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <span
            onClick={handleProviderClick}
            className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate hover:underline decoration-gray-400"
          >
            {item.providerName}
          </span>
          {item.distanceKm !== undefined && (
            <span className="text-[10px] text-gray-500 font-medium flex items-center mt-0.5">
              <Navigation className="w-2.5 h-2.5 mr-1 text-teal-500" /> a {item.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
      </div>

      {/* Separador */}
      <div className="w-full h-px bg-gray-100 dark:bg-gray-800/50 mb-3" />

      {/* Precio + Duración */}
      <div className="flex items-end justify-between mb-5">
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-gray-400 mb-0.5">
            {item.type === 'SERVICE' ? 'Tarifa' : item.type === 'COURSE' ? 'Inscripción' : 'Precio'}
          </span>
          <div className="flex items-baseline gap-1.5">
            {item.price > 0 ? (
              <>
                <span className="text-[15px] font-bold text-gray-900 dark:text-gray-100 leading-none">${item.price.toLocaleString()}</span>
                {item.compareAtPrice && item.compareAtPrice > item.price && (
                  <span className="text-[10px] text-gray-400 line-through">${item.compareAtPrice.toLocaleString()}</span>
                )}
              </>
            ) : (
              <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">Por cotizar</span>
            )}
          </div>
        </div>
        {item.durationMinutes && (item.type === 'SERVICE' || item.type === 'COURSE') && (
          <div className="flex items-center text-[10px] font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-full px-2 py-1">
            <Clock className="w-3 h-3 mr-1 text-gray-400" /> {item.durationMinutes} min
          </div>
        )}
      </div>

      {/* CTA BUTTON */}
      <Button
        onClick={handleCTA}
        className="w-full rounded-xl h-11 text-xs font-semibold flex items-center justify-center gap-2 transition-all text-white shadow-md hover:shadow-lg hover:opacity-90"
        style={{ backgroundColor: item.providerColor || '#0d9488' }}
      >
        {typeConfig.ctaIcon}
        {typeConfig.ctaLabel}
      </Button>
    </div>
 </div>
 );
};
