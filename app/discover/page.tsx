"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProviderCard } from '@/components/ui/ProviderCard';
import { Compass, Loader2 } from 'lucide-react';
import axios from 'axios';
import { ProviderData } from '@/app/quhealthy/types/marketplace'; // Importamos el tipo desde nuestro archivo central

// --- Hook para obtener los datos DENTRO del componente de cliente ---
const useActiveMarketplaces = () => {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data } = await axios.get('/api/marketplace/stores');
        setProviders(data);
      } catch (error) {
        console.error("Error fetching marketplaces:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProviders();
  }, []);

  return { providers, isLoading };
};

// --- Definición de las Animaciones ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Anima cada tarjeta con 0.1s de diferencia
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// --- Componente Principal de la Página ---
export default function DiscoverPage() {
  const { providers, isLoading } = useActiveMarketplaces();

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
            Explora Nuestros Profesionales
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Encuentra y conecta con los mejores expertos en salud y belleza.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
          </div>
        ) : providers.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {providers.map((provider) => (
              <motion.div key={provider.id} variants={itemVariants}>
                <ProviderCard provider={provider} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-500 py-16 flex flex-col items-center">
            <Compass className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400">Aún no hay proveedores disponibles</h3>
            <p className="max-w-md mt-2">Estamos trabajando para expandir nuestra red.</p>
          </div>
        )}
      </div>
    </div>
  );
}