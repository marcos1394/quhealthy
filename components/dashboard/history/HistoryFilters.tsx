"use client";

import React from 'react';
import { Search, Calendar, Filter, ListFilter } from "lucide-react";

// ShadCN UI
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Tipos
export interface FilterOptions {
  dateRange: string;
  type: string;
  status: string;
}

interface HistoryFiltersProps {
  searchTerm: string;
  filters: FilterOptions;
  serviceTypes: string[]; // Lista de tipos de servicio disponibles
  onSearchTermChange: (term: string) => void;
  onFiltersChange: (filters: FilterOptions) => void;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({ 
  searchTerm, 
  filters, 
  serviceTypes, 
  onSearchTermChange, 
  onFiltersChange 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900/30 p-4 rounded-xl border border-gray-800">
    
    {/* Buscador */}
    <div className="md:col-span-1 lg:col-span-1 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
      <Input
        placeholder="Buscar..."
        className="pl-9 bg-gray-950 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 h-10"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
    </div>
    
    {/* Filtro: Rango de Fecha */}
    <Select
      value={filters.dateRange}
      onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}
    >
      <SelectTrigger className="bg-gray-950 border-gray-700 text-gray-300 h-10">
        <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <SelectValue placeholder="Periodo" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
        <SelectItem value="all">Todo el tiempo</SelectItem>
        <SelectItem value="today">Hoy</SelectItem>
        <SelectItem value="week">Esta semana</SelectItem>
        <SelectItem value="month">Este mes</SelectItem>
        <SelectItem value="year">Este año</SelectItem>
      </SelectContent>
    </Select>

    {/* Filtro: Tipo de Servicio */}
    <Select
      value={filters.type}
      onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
    >
      <SelectTrigger className="bg-gray-950 border-gray-700 text-gray-300 h-10">
        <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-blue-400" />
            <SelectValue placeholder="Servicio" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
        <SelectItem value="all">Todos los servicios</SelectItem>
        {serviceTypes.map(type => (
          <SelectItem key={type} value={type}>{type}</SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Filtro: Estado */}
    <Select
      value={filters.status}
      onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
    >
      <SelectTrigger className="bg-gray-950 border-gray-700 text-gray-300 h-10">
        <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <SelectValue placeholder="Estado" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
        <SelectItem value="all">Todos los estados</SelectItem>
        <SelectItem value="completed">Completados</SelectItem>
        <SelectItem value="cancelled">Cancelados</SelectItem>
        <SelectItem value="rescheduled">Reprogramados</SelectItem>
      </SelectContent>
    </Select>

  </div>
);