"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Filter, 
  ListFilter, 
  X,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * HistoryFilters Component - Principios UX aplicados:
 * Minimizar carga cognitiva, Feedback inmediato, Affordance visual,
 * Reconocimiento vs recuperación, Minimizar errores, Satisficing
 */

export interface FilterOptions {
  dateRange: string;
  type: string;
  status: string;
}

interface HistoryFiltersProps {
  searchTerm: string;
  filters: FilterOptions;
  serviceTypes: string[];
  onSearchTermChange: (term: string) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  resultCount?: number;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({ 
  searchTerm, 
  filters, 
  serviceTypes, 
  onSearchTermChange, 
  onFiltersChange,
  resultCount
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.status && filters.status !== 'all') count++;
    if (searchTerm) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const handleResetFilters = () => {
    onFiltersChange({ dateRange: 'all', type: 'all', status: 'all' });
    onSearchTermChange('');
  };

  const handleClearSearch = () => onSearchTermChange('');

  const getFilterLabel = (key: keyof FilterOptions, value: string) => {
    const labels: Record<string, Record<string, string>> = {
      dateRange: { all: 'Todo', today: 'Hoy', week: 'Semana', month: 'Mes', year: 'Año' },
      status: { all: 'Todos', completed: 'Completados', cancelled: 'Cancelados', rescheduled: 'Reprogramados' }
    };
    return labels[key]?.[value] || value;
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-800 transition-all duration-300",
          isFocused ? "border-purple-500/30 shadow-lg shadow-purple-500/10" : ""
        )}
      >
        {/* Search */}
        <div className="relative">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none",
            isFocused || searchTerm ? "text-purple-400" : "text-gray-500"
          )} />
          <Input
            placeholder="Buscar..."
            className={cn(
              "pl-10 pr-10 bg-gray-950/50 border-gray-700 text-white h-11 rounded-xl transition-all",
              "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
              searchTerm && "border-purple-500/50"
            )}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Date Range */}
        <Select value={filters.dateRange} onValueChange={(value) => onFiltersChange({ ...filters, dateRange: value })}>
          <SelectTrigger className={cn(
            "bg-gray-950/50 border-gray-700 h-11 rounded-xl transition-all",
            "hover:border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
            filters.dateRange !== 'all' ? "border-purple-500/50 bg-purple-500/5" : ""
          )}>
            <div className="flex items-center gap-2">
              <Calendar className={cn("w-4 h-4", filters.dateRange !== 'all' ? "text-purple-400" : "text-gray-400")} />
              <SelectValue placeholder="Periodo" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            <SelectItem value="all">Todo el tiempo</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
            <SelectItem value="year">Este año</SelectItem>
          </SelectContent>
        </Select>

        {/* Service Type */}
        <Select value={filters.type} onValueChange={(value) => onFiltersChange({ ...filters, type: value })}>
          <SelectTrigger className={cn(
            "bg-gray-950/50 border-gray-700 h-11 rounded-xl transition-all",
            "hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            filters.type !== 'all' ? "border-blue-500/50 bg-blue-500/5" : ""
          )}>
            <div className="flex items-center gap-2">
              <ListFilter className={cn("w-4 h-4", filters.type !== 'all' ? "text-blue-400" : "text-gray-400")} />
              <SelectValue placeholder="Servicio" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            <SelectItem value="all">Todos</SelectItem>
            {serviceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filters.status} onValueChange={(value) => onFiltersChange({ ...filters, status: value })}>
          <SelectTrigger className={cn(
            "bg-gray-950/50 border-gray-700 h-11 rounded-xl transition-all",
            "hover:border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
            filters.status !== 'all' ? "border-emerald-500/50 bg-emerald-500/5" : ""
          )}>
            <div className="flex items-center gap-2">
              <Filter className={cn("w-4 h-4", filters.status !== 'all' ? "text-emerald-400" : "text-gray-400")} />
              <SelectValue placeholder="Estado" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="completed">✓ Completados</SelectItem>
            <SelectItem value="cancelled">✗ Cancelados</SelectItem>
            <SelectItem value="rescheduled">↻ Reprogramados</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Active Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {activeFiltersCount > 0 && (
            <>
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Activos:</span>
              </div>
              <AnimatePresence>
                {searchTerm && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 gap-1">
                      <Search className="w-3 h-3" />
                      <span className="max-w-[100px] truncate">{searchTerm}</span>
                      <button onClick={handleClearSearch} className="ml-1 hover:text-purple-300"><X className="w-3 h-3" /></button>
                    </Badge>
                  </motion.div>
                )}
                {filters.dateRange !== 'all' && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 gap-1">
                      <Calendar className="w-3 h-3" />
                      {getFilterLabel('dateRange', filters.dateRange)}
                      <button onClick={() => onFiltersChange({ ...filters, dateRange: 'all' })} className="ml-1 hover:text-purple-300"><X className="w-3 h-3" /></button>
                    </Badge>
                  </motion.div>
                )}
                {filters.type !== 'all' && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 gap-1">
                      <ListFilter className="w-3 h-3" />
                      {filters.type}
                      <button onClick={() => onFiltersChange({ ...filters, type: 'all' })} className="ml-1 hover:text-blue-300"><X className="w-3 h-3" /></button>
                    </Badge>
                  </motion.div>
                )}
                {filters.status !== 'all' && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1">
                      <Filter className="w-3 h-3" />
                      {getFilterLabel('status', filters.status)}
                      <button onClick={() => onFiltersChange({ ...filters, status: 'all' })} className="ml-1 hover:text-emerald-300"><X className="w-3 h-3" /></button>
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-gray-400 hover:text-white h-7 px-3 text-xs">
                <RotateCcw className="w-3 h-3 mr-1" />
                Limpiar
              </Button>
            </>
          )}
        </div>
        {resultCount !== undefined && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400">
            <span className="font-semibold text-white">{resultCount}</span> resultado{resultCount !== 1 ? 's' : ''}
          </motion.div>
        )}
      </div>
    </div>
  );
};