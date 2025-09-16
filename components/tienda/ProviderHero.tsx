"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, MapPin, Phone, Share, Heart,Clock } from 'lucide-react';
// 1. Importamos el tipo desde nuestro archivo central de tipos
import { ProviderProfileData } from '@/app/quhealthy/types/marketplace';
import { Button } from '../ui/button';

// 2. Definimos las props usando la interfaz importada
interface ProviderHeroProps {
  profile: ProviderProfileData;
}

export const ProviderHero: React.FC<ProviderHeroProps> = ({ profile }) => {
  // Ahora TypeScript sabe que 'profile' incluye 'tags', 'reviews', etc.
  
  return (
    <div className="relative">
      {/* Banner Principal */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        {profile.storeBanner ? (
          <div className="absolute inset-0">
            <img 
              src={profile.storeBanner} 
              alt={profile.storeName} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-black to-blue-600/30" />
        )}
        
        <div className="absolute top-6 right-6 flex gap-3">
          <button className="p-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/50 transition-all group">
            <Heart className="w-5 h-5 text-white group-hover:text-red-400" />
          </button>
          <button className="p-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10 hover:bg-black/50 transition-all">
            <Share className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      
      {/* Contenido Principal */}
      <div className="relative -mt-24 container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Logo del Proveedor */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gray-800 border-4 border-gray-700/50 overflow-hidden">
                  {profile.storeLogo ? (
                    <img 
                      src={profile.storeLogo} 
                      alt="Logo" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {profile.storeName?.charAt(0) || 'Q'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-gray-900">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            {/* Información Principal */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                  {profile.storeName}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <Badge className="bg-green-500/20 text-green-300 border-none px-3 py-1">
                    <CheckCircle className="w-4 h-4 mr-2"/>
                    Verificado
                  </Badge>
                  <div className="flex items-center gap-2 text-yellow-300">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{profile.reviews.average}</span>
                    <span className="text-yellow-300/70">({profile.reviews.count} opiniones)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Chihuahua, México</span>
                  </div>
                </div>
                {profile.customDescription && (
                  <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl">
                    {profile.customDescription}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-base font-semibold">
                  <Phone className="w-5 h-5 mr-2" />
                  Contactar Ahora
                </Button>
                <Button size="lg" variant="outline" className="flex-1 text-base font-semibold border-gray-600 bg-gray-800 hover:bg-gray-700">
                  <Clock className="w-5 h-5 mr-2" />
                  Ver Horarios
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};