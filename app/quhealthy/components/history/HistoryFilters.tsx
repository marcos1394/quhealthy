"use client";
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Filter } from "lucide-react";
import { FilterOptions } from '@/app/quhealthy/types/history';

interface HistoryFiltersProps {
  searchTerm: string;
  filters: FilterOptions;
  serviceTypes: string[];
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
  <div className="mt-4 space-y-4">
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar por descripción, proveedor o cliente..."
          className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
      
      <Select
        value={filters.dateRange}
        onValueChange={(value: FilterOptions['dateRange']) => onFiltersChange({ ...filters, dateRange: value })}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-gray-700/50 border-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Rango de fecha" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="today">Hoy</SelectItem>
          <SelectItem value="week">Última semana</SelectItem>
          <SelectItem value="month">Último mes</SelectItem>
          <SelectItem value="year">Último año</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.type}
        onValueChange={(value) => onFiltersChange({ ...filters, type: value })}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-gray-700/50 border-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Tipo de servicio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {serviceTypes.map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-full md:w-[180px] bg-gray-700/50 border-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="completed">Completados</SelectItem>
          <SelectItem value="cancelled">Cancelados</SelectItem>
          <SelectItem value="rescheduled">Reprogramados</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);