"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Filters } from '@/app/quhealthy/types/services';

interface SearchBarProps {
  searchTerm: string;
  location: string;
  filters: Filters;
  onSearchTermChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onFiltersChange: (filters: Filters) => void;
}

const categories = [
  { id: "all", name: "Todos los servicios" },
  { id: "medical", name: "Servicios Médicos" },
  { id: "dental", name: "Servicios Dentales" },
  { id: "cosmetic", name: "Cosmética" },
];

export const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, location, filters, 
  onSearchTermChange, onLocationChange, onFiltersChange 
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <motion.div 
      className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} placeholder="¿Qué servicio estás buscando?" className="w-full bg-gray-700/50 text-white p-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-3.5 text-gray-400" />
          <input type="text" value={location} onChange={(e) => onLocationChange(e.target.value)} placeholder="¿En qué ciudad?" className="w-full bg-gray-700/50 text-white p-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-teal-400" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden bg-teal-500 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2">
          <SlidersHorizontal className="w-5 h-5" /> Filtros
        </button>
      </div>
      <AnimatePresence>
        {(showFilters) && ( // Para móvil. En desktop siempre se mostraría ajustando la condición.
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: '1rem' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden"
          >
            {/* Aquí irían tus selectores de filtros */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};