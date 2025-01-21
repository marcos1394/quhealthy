"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Star, 
  SlidersHorizontal,
  DollarSign,
  Heart,
  ChevronDown,
  Loader2,
  X
} from "lucide-react";
import axios from "axios";
import debounce from "lodash/debounce";
import Sidebar from "../components/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types
interface Service {
  id: string;
  name: string;
  location: string;
  price: number;
  priceRange: string;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  isFavorite: boolean;
  description?: string;
  categories?: string[];
}

interface Filters {
  category: string;
  priceRange: string;
  rating: string;
  sortBy: string;
}

interface ServiceCardProps {
  service: Service;
  onFavorite: (serviceId: string) => void;
}

// Animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

// Service Card Component with enhanced UI
const ServiceCard: React.FC<ServiceCardProps> = ({ service, onFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-teal-400 transition-all duration-300 group"
      variants={fadeIn}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={service.imageUrl || "/api/placeholder/400/300"} 
          alt={service.name} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <motion.button 
          onClick={() => onFavorite(service.id)}
          className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart 
            className={`w-5 h-5 ${service.isFavorite ? "fill-red-500 text-red-500" : "text-white"}`}
          />
        </motion.button>
        
        {service.categories && (
          <div className="absolute bottom-2 left-2 flex gap-2">
            {service.categories.map((category, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <h3 className="text-xl font-semibold text-white group-hover:text-teal-400 transition-colors">
          {service.name}
        </h3>
        
        <div className="flex items-center text-gray-300">
          <MapPin className="w-4 h-4 text-teal-400 mr-1" />
          <span className="text-sm">{service.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">{service.rating}</span>
            <span className="text-gray-400 text-sm">({service.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-white">{service.priceRange}</span>
          </div>
        </div>

        {service.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {service.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-teal-400 font-semibold">${service.price} MXN</span>
          <motion.button 
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = `/service/${service.id}`}
          >
            Ver detalles
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const HealthServicesSearch: React.FC = () => {
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    priceRange: "all",
    rating: "all",
    sortBy: "relevance"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { id: "all", name: "Todos los servicios" },
    { id: "medical", name: "Servicios Médicos" },
    { id: "dental", name: "Servicios Dentales" },
    { id: "cosmetic", name: "Cosmética" },
    { id: "spa", name: "Spa y Bienestar" },
    { id: "hair", name: "Servicios Capilares" }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setServices([
        {
          id: "1",
          name: "Masaje Terapéutico",
          location: "Sala 3 - Centro Médico",
          price: 85,
          priceRange: "$$ Moderado",
          rating: 4.8,
          reviewCount: 150,
          imageUrl: null,
          isFavorite: false,
          description: "Alivia dolores musculares con un tratamiento especializado.",
          categories: ["Spa", "Relajación"],
        },
        {
          id: "2",
          name: "Limpieza Facial",
          location: "Centro de Belleza, Planta Baja",
          price: 65,
          priceRange: "$ Moderado",
          rating: 4.5,
          reviewCount: 120,
          imageUrl: null,
          isFavorite: false,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Search function with loading states
  const debouncedSearch = useCallback(
    debounce(async (searchTerm, location, filters, page) => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get("/api/services/search", {
          params: {
            search: searchTerm,
            location,
            ...filters,
            page,
            limit: 12
          }
        });
        
        if (page === 1) {
          setServices(response.data.services);
        } else {
          setServices(prev => [...prev, ...response.data.services]);
        }
        setHasMore(response.data.hasMore);
      } catch (err) {
        setError("No se pudieron cargar los servicios. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm, location, filters, page);
  }, [searchTerm, location, filters, page]);

  const handleFavorite = async (serviceId: string) => {
    try {
      await axios.post(`/api/services/${serviceId}/favorite`);
      setServices(prev =>
        prev.map(service =>
          service.id === serviceId
            ? { ...service, isFavorite: !service.isFavorite }
            : service
        )
      );
    } catch (err) {
      console.error("Error al marcar como favorito:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full animate-pulse delay-1000" />
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        activePage="search" 
      />

      <div className="flex-1 relative z-10">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-teal-500 p-2 rounded-lg shadow-lg hover:bg-teal-400 transition-all"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <SlidersHorizontal className="w-6 h-6 text-white" />
          )}
        </button>

        <div className="container mx-auto px-4 py-8">
          <motion.h1 
            className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Encuentra los Mejores Servicios de Salud y Belleza
          </motion.h1>

          <motion.div 
            className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl mb-8"
            variants={fadeIn}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="¿Qué servicio estás buscando?"
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                />
              </div>
              
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="¿En qué ciudad?"
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                />
              </div>

              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </motion.button>
            </div>

            <AnimatePresence>
              {(showFilters || window.innerWidth > 768) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  {/* Filter selects with enhanced styling */}
                  {[
                    { 
                      value: filters.category,
                      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => 
                        setFilters(prev => ({ ...prev, category: e.target.value })),
                      options: categories.map(cat => ({ value: cat.id, label: cat.name }))
                    },
                    {
                      value: filters.priceRange,
                      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => 
                        setFilters(prev => ({ ...prev, priceRange: e.target.value })),
                      options: [
                        { value: "all", label: "Todos los precios" },
                        { value: "low", label: "$ Económico" },
                        { value: "medium", label: "$$ Moderado" },
                        { value: "high", label: "$$$ Premium" }
                      ]
                    },
                    // Add other filters similarly
                  ].map((filter, index) => (
                    <div key={index} className="relative">
                      <select
                        value={filter.value}
                        onChange={filter.onChange}
                        className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      >
                        {filter.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={fadeIn}
          >
            <AnimatePresence>
              {services.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  onFavorite={handleFavorite}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {loading && (
            <div className="text-center my-8">
              <Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto" />
            </div>
          )}

          {!loading && hasMore && (
           <motion.button
           onClick={() => setPage(prev => prev + 1)}
           className="mx-auto mt-8 mb-4 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
         >
           {loading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
           ) : (
             <>
               Cargar más servicios
               <ChevronDown className="w-5 h-5" />
             </>
           )}
         </motion.button>
       )}

       {!loading && !hasMore && services.length > 0 && (
         <p className="text-center text-gray-400 mt-8">
           No hay más servicios disponibles
         </p>
       )}

       {!loading && services.length === 0 && (
         <motion.div 
           className="text-center py-12"
           variants={fadeIn}
         >
           <p className="text-xl text-gray-400 mb-4">
             No se encontraron servicios que coincidan con tu búsqueda
           </p>
           <p className="text-gray-500">
             Intenta ajustar los filtros o usar términos de búsqueda diferentes
           </p>
         </motion.div>
       )}
     </div>
   </div>
 </div>
);
};

export default HealthServicesSearch;