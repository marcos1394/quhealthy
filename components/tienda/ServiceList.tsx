"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Calendar, Filter, Grid, List, Sparkles, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Service } from '@/app/quhealthy/types/marketplace';


// 1. Definimos la 'forma' de las props, incluyendo la nueva función
interface ServiceListProps {
  services: Service[];
  onBookClick: (service: Service) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ services, onBookClick }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterCategory, setFilterCategory] = useState('all');
  const getPolicyText = (policy: 'flexible' | 'moderate' | 'strict') => {
  switch (policy) {
    case 'flexible': return 'Cancelación Flexible';
    case 'moderate': return 'Cancelación Moderada';
    case 'strict': return 'Cancelación Estricta';
    default: return 'Política Estándar';
  }
};
  
  // Extraer categorías únicas
  const categories = ['all', 'facial', 'corporal', 'masaje', 'especialidad'];
  
  if (!services || services.length === 0) {
    return (
      <section>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl mx-auto flex items-center justify-center border border-purple-500/20">
              <Calendar className="w-10 h-10 text-purple-400" />
            </div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
            Servicios en preparación
          </h3>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Estamos actualizando nuestra lista de servicios exclusivos para brindarte la mejor experiencia.
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section>
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/20">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Nuestros Servicios
            </h2>
          </div>
          <p className="text-slate-400 text-lg">
            {services.length} servicios profesionales disponibles
          </p>
        </motion.div>
        
        {/* Enhanced Controls */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-4"
        >
          {/* Category Filter */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-1 border border-slate-700/50 shadow-lg">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Filter className="w-4 h-4 text-purple-400" />
              </div>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-white px-3 py-2 border-none outline-none font-medium cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-800 text-white">
                    {cat === 'all' ? 'Todos los servicios' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-slate-800/50 backdrop-blur-xl rounded-2xl p-1 border border-slate-700/50 shadow-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Services Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 lg:grid-cols-2 gap-8" 
          : "space-y-6"
      }>
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group"
          >
            {viewMode === 'grid' ? (
              // Enhanced Grid View
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="relative">
                  {/* Service Image/Header */}
                  <div className="h-56 bg-gradient-to-br from-purple-600/20 via-slate-800 to-blue-600/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)]" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-black/60 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm font-medium border border-white/10">
                        {service.category || 'General'}
                      </span>
                    </div>
                    {/* Floating price tag */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30 rounded-2xl px-3 py-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-white font-bold text-lg">${service.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    <h3 className="font-bold text-2xl text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">
                      {service.name}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
                      <div className="flex items-center gap-2 bg-slate-700/30 rounded-full px-3 py-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">{service.duration} minutos</span>
                      </div>
                    </div>
                    
                    {service.description && (
                      <p className="text-slate-400 text-sm mb-6 leading-relaxed min-h-[3rem]">
                        {service.description.length > 120 
                          ? `${service.description.substring(0, 120)}...` 
                          : service.description
                        }
                      </p>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-700/50">
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <ShieldCheck className="w-4 h-4 text-green-400" />
      <span>{getPolicyText(service.cancellationPolicy)}</span>
    </div>
  </div>
                    
                   <Button 
                  className="w-full group bg-purple-600 hover:bg-purple-700"
                  onClick={() => onBookClick(service)}
                >
                      <Calendar className="w-5 h-5 mr-3" />
                      Agendar Servicio
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              // Enhanced List View
              <Card className="relative overflow-hidden bg-gradient-to-r from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 group hover:shadow-xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative p-8 flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-6">
                    {/* Service icon/indicator */}
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors duration-300 flex-shrink-0">
                          {service.name}
                        </h3>
                        <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-600/50 flex-shrink-0">
                          {service.category || 'General'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="font-medium text-slate-300">{service.duration} min</span>
                        </div>
                        {service.description && (
                          <p className="text-slate-400 text-sm leading-relaxed">
                            {service.description.length > 80 
                              ? `${service.description.substring(0, 80)}...` 
                              : service.description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    {/* Price display */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-3xl font-bold text-white mb-1">
                        <DollarSign className="w-6 h-6 text-green-400" />
                        {service.price}
                      </div>
                      <span className="text-xs text-slate-400">por sesión</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
      <ShieldCheck className="w-4 h-4 text-green-400" />
      <span>{getPolicyText(service.cancellationPolicy)}</span>
    </div>
                    
                    <Button 
                      size="lg"
                      className="group bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 border-0"
                    >
                      <Calendar className="w-5 h-5 mr-3" />
                      Agendar
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};