/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, Star, Clock, Heart, ExternalLink, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Tipos importados o definidos aquí para el componente
interface Tag { 
  name: string; 
}

interface Marketplace { 
  storeName: string; 
  storeSlug: string; 
  storeBannerUrl: string | null; 
  customDescription: string | null; 
}

interface ProviderData { 
  id: number; 
  name: string; 
  marketplace: Marketplace; 
  tags: Tag[]; 
}

interface ProviderCardProps {
  provider: ProviderData;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const { marketplace, tags } = provider;
  const publicProfileUrl = `/tienda/${marketplace.storeSlug || provider.id}`;
  
  return (
    <Link href={publicProfileUrl}>
      <motion.div 
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        {/* Efecto de glow en hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 group-hover:border-purple-500/50 transition-all duration-300 h-96">
          
          {/* Banner principal - Más grande */}
          <div className="relative h-56 overflow-hidden">
            {marketplace.storeBannerUrl ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={marketplace.storeBannerUrl} 
                  alt={marketplace.storeName} 
                  className="w-full h-full object-cover transition-transform duration-300 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_70%)]" />
                <Store className="w-12 h-12 text-white/30 relative z-10" />
              </div>
            )}
            
            {/* Overlay con información adicional en hover - Sin parpadeo */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/60 flex items-center justify-center backdrop-blur-0 hover:backdrop-blur-sm transition-all duration-300 ease-out opacity-0 hover:opacity-100">
              <div className="text-center transform scale-90 hover:scale-100 transition-transform duration-300">
                <div className="bg-white/10 backdrop-blur-md rounded-full p-4 mb-3 border border-white/20">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium text-sm">
                  Ver perfil completo
                </p>
              </div>
            </div>
            
            {/* Badge de "Nuevo" */}
            <div className="absolute top-3 right-3">
              <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Disponible
              </div>
            </div>
            
            {/* Icono de favorito */}
            <button 
              className="absolute top-3 left-3 p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors group/heart"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="w-4 h-4 text-white group-hover/heart:text-red-400 transition-colors" />
            </button>
          </div>
          
          {/* Contenido principal */}
          <div className="p-5 space-y-4">
            {/* Título y descripción */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors duration-300 line-clamp-1">
                {marketplace.storeName || provider.name}
              </h3>
              
              <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {marketplace.customDescription || 'Especialista certificado en salud y bienestar con amplia experiencia.'}
              </p>
            </div>
            
            {/* Tags de especialidades */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={tag.name} 
                    variant="secondary" 
                    className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs px-2 py-1 font-medium hover:bg-purple-500/20 transition-colors"
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-gray-600/20 text-gray-400 border-gray-600/20 text-xs px-2 py-1"
                  >
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Footer con información adicional - Posición fija */}
          <div className="p-5 border-t border-gray-700/30 bg-gray-900/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-medium">4.8</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Rápido</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-purple-400 font-medium group-hover:text-purple-300 transition-colors duration-300">
                <Award className="w-3 h-3" />
                <span>Verificado</span>
              </div>
            </div>
          </div>
          
          {/* Indicador de progreso sutil en hover */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </motion.div>
    </Link>
  );
};