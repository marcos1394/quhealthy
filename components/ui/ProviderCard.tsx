/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isHovered, setIsHovered] = useState(false);
  const { marketplace, tags } = provider;
  const publicProfileUrl = `/tienda/${marketplace.storeSlug || provider.id}`;
  
  return (
    <Link href={publicProfileUrl}>
      <motion.div 
        className="relative group cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Efecto de glow en hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 group-hover:border-purple-500/50 transition-all duration-500 h-80">
          
          {/* Banner principal */}
          <div className="relative h-44 overflow-hidden">
            {marketplace.storeBannerUrl ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={marketplace.storeBannerUrl} 
                  alt={marketplace.storeName} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_70%)]" />
                <Store className="w-12 h-12 text-white/30 relative z-10" />
              </div>
            )}
            
            {/* Overlay con información adicional en hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/20 backdrop-blur-md rounded-full p-4 mb-3"
                    >
                      <ExternalLink className="w-6 h-6 text-white" />
                    </motion.div>
                    <motion.p
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white font-medium"
                    >
                      Ver perfil completo
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
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
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                {marketplace.storeName || provider.name}
              </h3>
              
              <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
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
          
          {/* Footer con información adicional */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-gray-900/90 to-transparent">
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
              
              <div className="flex items-center gap-1 text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                <Award className="w-3 h-3" />
                <span>Verificado</span>
              </div>
            </div>
          </div>
          
          {/* Indicador de progreso sutil en hover */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
      </motion.div>
    </Link>
  );
};