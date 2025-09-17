/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle, MapPin, Phone, Share, Heart, Clock, Sparkles } from 'lucide-react';
import { ProviderProfileData } from '@/app/quhealthy/types/marketplace';
import { Button } from '../ui/button';

interface ProviderHeroProps {
  profile: ProviderProfileData;
}

export const ProviderHero: React.FC<ProviderHeroProps> = ({ profile }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Enhanced Banner Section */}
      <div className="relative h-96 md:h-[32rem]">
        {profile.storeBanner ? (
          <div className="absolute inset-0">
            <img 
              src={profile.storeBanner} 
              alt={profile.storeName} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
            {/* Overlay pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-slate-900 to-blue-600/40">
            {/* Animated background elements for no-banner state */}
            <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        )}
        
        {/* Floating action buttons */}
        <div className="absolute top-8 right-8 flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group p-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-red-500/20 hover:border-red-400/30 transition-all duration-300"
          >
            <Heart className="w-6 h-6 text-white group-hover:text-red-400 transition-colors" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group p-4 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-blue-500/20 hover:border-blue-400/30 transition-all duration-300"
          >
            <Share className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" />
          </motion.button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-12 left-12 hidden md:block">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-lg rounded-full px-4 py-2 border border-white/10">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-white text-sm font-medium">Perfil Profesional</span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Content Section */}
      <div className="relative -mt-32 container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Background card with enhanced styling */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-2xl rounded-3xl border border-purple-500/20 shadow-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
          
          {/* Content */}
          <div className="relative p-8 md:p-16">
            <div className="flex flex-col lg:flex-row lg:items-start gap-12">
              {/* Enhanced Logo Section */}
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="relative"
                >
                  <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    
                    {/* Logo container */}
                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 border-4 border-purple-500/20 overflow-hidden shadow-2xl">
                      {profile.storeLogo ? (
                        <img 
                          src={profile.storeLogo} 
                          alt="Logo" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                          <span className="text-5xl md:text-6xl font-black bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
                            {profile.storeName?.charAt(0) || 'Q'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Verification badge */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      className="absolute -bottom-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 border-4 border-slate-900 shadow-xl"
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
              
              {/* Enhanced Info Section */}
              <div className="flex-1 min-w-0 text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="mb-8"
                >
                  {/* Store name with gradient */}
                  <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                    <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                      {profile.storeName}
                    </span>
                  </h1>
                  
                  {/* Enhanced badges and info */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-6">
                    <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 px-4 py-2 text-sm font-medium">
                      <CheckCircle className="w-5 h-5 mr-2"/>
                      Verificado
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.round(profile.reviews.average) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} 
                          />
                        ))}
                      </div>
                      <span className="font-bold text-white text-lg">{profile.reviews.average}</span>
                      <span className="text-yellow-300/70 text-sm">({profile.reviews.count} opiniones)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">Chihuahua, México</span>
                    </div>
                  </div>
                  
                  {/* Description with better typography */}
                  {profile.customDescription && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      className="mb-8"
                    >
                      <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-3xl">
                        {profile.customDescription}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Enhanced CTA Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0"
                >
                  <Button 
                    size="lg" 
                    className="group flex-1 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white font-semibold text-base py-4 px-8 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 border-0"
                  >
                    <Phone className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                    Contactar Ahora
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="group flex-1 text-white font-semibold text-base py-4 px-8 rounded-2xl border-2 border-purple-500/30 bg-slate-800/50 hover:bg-purple-500/10 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                  >
                    <Clock className="w-5 h-5 mr-3 group-hover:animate-spin" />
                    Ver Horarios
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};