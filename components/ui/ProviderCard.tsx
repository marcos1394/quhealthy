"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, Star, Clock, Heart, ExternalLink, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProviderData } from '@/app/quhealthy/types/marketplace'; // Usamos el tipo centralizado
import Image from 'next/image';

interface ProviderCardProps {
  provider: ProviderData;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  // --- INICIO DE LA CORRECCIÓN DE DATOS ---
  // Desestructuramos las propiedades directamente desde el objeto 'provider'
  const { storeName, storeSlug, storeBanner, customDescription, tags, provider: providerDetails } = provider;
  const publicProfileUrl = `/tienda/${storeSlug}`;
  // --- FIN DE LA CORRECCIÓN DE DATOS ---

  return (
    <Link href={publicProfileUrl}>
      <motion.div 
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        {/* Efecto de glow en hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 min-h-96 flex flex-col">
        
          {/* Banner principal */}
          <div className="relative h-56 overflow-hidden">
            {storeBanner ? (
              <div className="relative w-full h-full">
                <Image 
                  src={storeBanner} 
                  alt={storeName} 
                  className="w-full h-full object-cover transition-transform duration-300 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center relative">
                <Store className="w-12 h-12 text-white/30 relative z-10" />
              </div>
            )}
            
            {/* Overlay en hover */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/60 flex items-center justify-center backdrop-blur-0 hover:backdrop-blur-sm transition-all duration-300 opacity-0 hover:opacity-100">
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-full p-4 mb-3 border border-white/20">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium text-sm">Ver perfil completo</p>
              </div>
            </div>
            
            {/* Badge de estado */}
            <div className="absolute top-3 right-3">
              <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium">Disponible</div>
            </div>
            
            {/* Botón de favorito */}
            <button 
              className="absolute top-3 left-3 p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="w-4 h-4 text-white hover:text-red-400 transition-colors" />
            </button>
          </div>
          
          {/* Contenido principal */}
          <div className="p-5 space-y-4 flex-grow">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors duration-300 line-clamp-1">
                {storeName || providerDetails.name}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed min-h-[40px]">
                {customDescription || 'Especialista certificado con amplia experiencia.'}
              </p>
            </div>
            
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.name} variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20">
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="secondary" className="bg-gray-600/20 text-gray-400 border-gray-600/20">
                    +{tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Footer de la tarjeta */}
          <div className="p-5 mt-auto border-t border-gray-700/30 bg-gray-900/50">
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
              <div className="flex items-center gap-1 text-purple-400 font-medium">
                <Award className="w-3 h-3" />
                <span>Verificado</span>
              </div>
            </div>
          </div>
          
          {/* Indicador de progreso en hover */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </motion.div>
    </Link>
  );
};