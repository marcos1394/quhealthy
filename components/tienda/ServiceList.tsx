"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Calendar, Filter, Grid, List } from 'lucide-react';
import { Service } from '@/app/quhealthy/types/marketplace';


interface ServiceListProps {
  services: Service[];
}

export const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Extraer categorías únicas (simulado)
  const categories = ['all', 'facial', 'corporal', 'masaje', 'especialidad'];
  
  if (!services || services.length === 0) {
    return (
      <section>
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Servicios en preparación
          </h3>
          <p className="text-gray-400">
            Estamos actualizando nuestra lista de servicios.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Nuestros Servicios
          </h2>
          <p className="text-gray-400">
            {services.length} servicios disponibles
          </p>
        </div>
        
        {/* Controles */}
        <div className="flex items-center gap-4">
          {/* Filtro por categoría */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-2xl p-1 border border-gray-700/50">
            <Filter className="w-4 h-4 text-gray-400 ml-3" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-white text-sm px-2 py-1 border-none outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Toggle de vista */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista/Grid de servicios */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 gap-6" 
          : "space-y-4"
      }>
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {viewMode === 'grid' ? (
              // Vista de tarjetas
              <Card className="bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden">
                <div className="relative">
                  {/* Imagen del servicio (placeholder) */}
                  <div className="h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_70%)]" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                        {service.category || 'General'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-white mb-3 group-hover:text-purple-300 transition-colors">
                      {service.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-white font-semibold text-lg">${service.price}</span>
                      </div>
                    </div>
                    
                    {service.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      Agendar Servicio
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              // Vista de lista
              <Card className="bg-gray-900/50 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                        {service.name}
                      </h3>
                      <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded text-xs">
                        {service.category || 'General'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} min</span>
                      </div>
                      {service.description && (
                        <span className="line-clamp-1">{service.description}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">${service.price}</div>
                    </div>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all px-8"
                    >
                      Agendar
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