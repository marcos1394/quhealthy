"use client";

import React from 'react';
import useSWR from 'swr';
import { discoverService } from '@/services/discover.service';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface CrossSellingCarouselProps {
 itemType: 'COURSE' | 'PRODUCT';
 title: string;
 subtitle?: string;
}

export const CrossSellingCarousel: React.FC<CrossSellingCarouselProps> = ({ itemType, title, subtitle }) => {
 const { data: items, isLoading } = useSWR(
 ['/discover/cross-selling', itemType],
 () => discoverService.getCrossSellingRecommendations(itemType, 10),
 {
 revalidateOnFocus: false,
 dedupingInterval: 120000 // 2 minutos de caché para recomendaciones
 }
 );

 if (isLoading) {
 return (
 <div className="py-8 w-full">
 <div className="animate-pulse flex space-x-4 overflow-x-auto">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="min-w-[280px] h-40 bg-gray-200 rounded-xl" />
 ))}
 </div>
 </div>
 );
 }

 if (!items || items.length === 0) return null;

 return (
 <div className="py-8 w-full border-t border-gray-100 mt-8">
 <div className="flex justify-between items-end mb-6">
 <div>
 <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
 {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
 </div>
 <Link href={`/discover?type=${itemType.toLowerCase()}`} className="text-primary hover:text-primary/80 text-sm font-medium flex items-center group">
 Ver todos <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
 </Link>
 </div>

 <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
 {items.map((item) => (
 <Link 
 href={`/item/${item.id}`} 
 key={item.id} 
 className="min-w-[280px] md:min-w-[320px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group snap-start block"
 >
 <div className="h-32 bg-gray-100 relative overflow-hidden">
 {item.imageUrl ? (
 <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
 <ExternalLink className="w-8 h-8 opacity-20" />
 </div>
 )}
 {item.category && (
 <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-md text-gray-700 shadow-sm">
 {item.category}
 </div>
 )}
 </div>
 
 <div className="p-4">
 <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
 <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
 {item.description || 'Sin descripción disponible'}
 </p>
 <div className="mt-4 flex items-center justify-between">
 <span className="font-bold text-lg">${item.price?.toFixed(2)}</span>
 <span className="text-primary text-sm font-semibold hover:underline">
 Ver detalles
 </span>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 );
};
