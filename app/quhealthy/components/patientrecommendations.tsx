"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Sparkles,
  RefreshCcw,
  ImageOff,
  Tag,
  Loader2,
  Filter,
  Search,
  AlertCircle
} from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

const PatientRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/patients/recommendations");
      if (!response.ok) throw new Error("Error al cargar las recomendaciones");

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      if (!data.recommendations?.length) {
        toast.info("No se encontraron recomendaciones para ti en este momento.");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las recomendaciones. Por favor, intenta de nuevo.");
      toast.error("Error al cargar las recomendaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const categories = ["all", ...new Set(recommendations.map(rec => rec.category))];
  
  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = activeCategory === "all" || rec.category === activeCategory;
    const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8" />
            Recomendaciones Personalizadas
          </h1>

          {/* Search and Filter Controls */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar recomendaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/90 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2
                    ${activeCategory === category 
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter className="w-4 h-4" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div
            className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-xl"
            variants={fadeIn}
          >
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
                <p className="text-gray-300">Cargando recomendaciones...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                className="flex flex-col items-center justify-center py-12 text-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>{error}</p>
                <motion.button
                  onClick={fetchRecommendations}
                  className="mt-4 px-4 py-2 bg-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCcw className="w-4 h-4" />
                  Intentar de nuevo
                </motion.button>
              </motion.div>
            )}

            {/* Recommendations Grid */}
            <AnimatePresence mode="wait">
              {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecommendations.map((rec) => (
                    <motion.div
                      key={rec.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-gray-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="relative aspect-video">
                        {rec.imageUrl ? (
                          <img
                            src={rec.imageUrl}
                            alt={rec.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <ImageOff className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="bg-gray-900/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {rec.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h2 className="text-lg font-semibold text-teal-400 mb-2">{rec.title}</h2>
                        <p className="text-gray-300 text-sm">{rec.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!loading && !error && filteredRecommendations.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No se encontraron recomendaciones para los filtros seleccionados.</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientRecommendations;