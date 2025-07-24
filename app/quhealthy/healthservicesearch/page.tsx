"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import axios from "axios";
import debounce from "lodash/debounce";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Importa los tipos y los nuevos componentes
import { Service, Filters } from '@/app/quhealthy/types/services';
import { SearchBar } from '@/app/quhealthy/components/search/SearchBar';
import { ServiceGrid } from '@/app/quhealthy/components/search/ServiceGrid';

// --- SOLUCIÓN AL ERROR 'window is not defined' ---
import dynamic from 'next/dynamic';

// El componente Sidebar (que probablemente contiene el mapa) se importa dinámicamente
// y se desactiva el renderizado del lado del servidor (SSR) para él.
const SidebarWithNoSSR = dynamic(
  () => import('../components/sidebar'),
  { ssr: false }
);
// ----------------------------------------------------

export default function HealthServicesSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ category: "all", priceRange: "all", rating: "all", sortBy: "relevance" });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Lógica de búsqueda con debounce
  const searchServices = useCallback(async (currentSearchTerm: string, currentLocation: string, currentFilters: Filters, currentPage: number) => {
    setLoading(true);
    setError("");
    try {
      // Aquí iría tu llamada real a la API
      // const response = await axios.get("/api/services/search", { ... });
      // setServices(currentPage === 1 ? response.data.services : prev => [...prev, ...response.data.services]);
      // setHasMore(response.data.hasMore);
    } catch (err) {
      setError("No se pudieron cargar los servicios.");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(searchServices, 500), [searchServices]);

  useEffect(() => {
    debouncedSearch(searchTerm, location, filters, page);
    return () => debouncedSearch.cancel();
  }, [searchTerm, location, filters, page, debouncedSearch]);
  
  const handleFavorite = async (serviceId: string) => { /* ... */ };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 to-gray-900">
      {/* Usamos el componente de Sidebar importado dinámicamente */}
      <SidebarWithNoSSR 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        activePage="search" 
      />

      <div className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <motion.h1 
            className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Encuentra los Mejores Servicios de Salud y Belleza
          </motion.h1>

          <SearchBar 
            searchTerm={searchTerm}
            location={location}
            filters={filters}
            onSearchTermChange={setSearchTerm}
            onLocationChange={setLocation}
            onFiltersChange={setFilters}
          />

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          <ServiceGrid services={services} onFavorite={handleFavorite} />

          {loading && (
            <div className="text-center my-8"><Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto" /></div>
          )}

          {/* ... (Lógica para 'Cargar más' y 'No hay resultados') ... */}
        </div>
      </div>
    </div>
  );
};