"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link"; // Usamos Link nativo de Next.js para rendimiento
import { motion } from "framer-motion";

// UI Components (ShadCN)
import { Button } from "@/components/ui/button";

// Custom Animations & Components
// Asegúrate de actualizar estas rutas si moviste los archivos, o usa @/ si están en src
import TypeWriter from "@/components/animations/TypeWriter";
import HeroParticle, { generateDeterministicParticles } from "@/components/animations/HeroParticle";
import ProductPill from "@/components/ProductPill";

// Importamos la data de la animación directamente
import healthAnimation from "../../public/animations/health.json";

// OPTIMIZACIÓN CRÍTICA: Carga diferida de Lottie
// Esto evita que la librería pesada bloquee la carga inicial de la página.
const Lottie = dynamic(() => import("lottie-react"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-purple-500/10 animate-pulse rounded-xl" /> 
});

const HeroSection: React.FC = () => {
  // Optimizamos: Solo calculamos las partículas una vez
  const particles = useMemo(() => generateDeterministicParticles(15), []);
  
  const typewriterPhrases = [
    "Encuentra a los mejores profesionales de salud",
    "Reserva tratamientos de belleza",
    "Descubre clínicas especializadas cerca de ti",
    "Cuida tu salud de forma inteligente"
  ];

  const categories = [
    { name: "Médicos", color: "bg-purple-500" },
    { name: "Fisioterapeutas", color: "bg-pink-500" },
    { name: "Nutricionistas", color: "bg-blue-500" },
    { name: "Psicólogos", color: "bg-emerald-500" }, // Ajusté a emerald para mejor contraste
    { name: "Trainers", color: "bg-amber-500" },
    { name: "Estética", color: "bg-indigo-500" }
  ];

  return (
    <section className="relative overflow-hidden bg-gray-900 pt-20 pb-24 min-h-[90vh] flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 opacity-50 pointer-events-none" />
      
      {/* Animated particles */}
      {particles.map((particle, index) => (
        <HeroParticle
          key={index}
          left={particle.left}
          top={particle.top}
          color={index % 3 === 0 ? "bg-purple-400" : index % 3 === 1 ? "bg-pink-400" : "bg-blue-400"}
          size={index % 5 === 0 ? "w-2 h-2" : "w-1.5 h-1.5"}
          animationDuration={3 + (index % 4)}
        />
      ))}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4"
            >
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-sm font-medium text-purple-300 border border-purple-500/20 backdrop-blur-sm">
                🚀 La revolución en el sector salud y belleza
              </span>
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Tu portal de{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                salud y belleza
              </span>{" "}
              personalizado
            </motion.h1>
            
            <motion.div
              className="h-20 sm:h-16 mb-2" // Altura fija para evitar saltos de layout (CLS)
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <TypeWriter phrases={typewriterPhrases} />
            </motion.div>
            
            <motion.p
              className="text-gray-300 text-lg mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              Conectamos a personas con los mejores profesionales certificados. 
              Agenda citas, recibe tratamientos y mejora tu bienestar de forma sencilla y segura.
            </motion.p>
            
            <motion.div
              className="flex flex-wrap gap-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {/* Botones ShadCN + Next/Link */}
              <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-emerald-500/20">
                <Link href="/register">Comenzar ahora</Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="border-gray-700 text-white hover:bg-gray-800 px-8 py-6 text-lg">
                <Link href="/about">Cómo funciona</Link>
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              <p className="text-gray-400 mb-4 text-sm uppercase tracking-wider font-semibold">Explora por categoría:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <ProductPill
                    key={category.name}
                    name={category.name}
                    color={category.color}
                    delay={0.1 * index}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right content - Animation */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="relative h-[600px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-xl">
              {/* Lottie cargado dinámicamente */}
              <Lottie
                animationData={healthAnimation}
                loop={true}
                className="w-full h-full p-8"
              />
            </div>
            
            {/* Stats overlay - Glassmorphism optimizado */}
            <motion.div
              className="absolute bottom-10 -left-10 bg-gray-900/90 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl z-20 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Profesionales</p>
                  <p className="text-white text-3xl font-bold tracking-tight">2.5k+</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Ciudades</p>
                  <p className="text-white text-3xl font-bold tracking-tight">28</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Citas</p>
                  <p className="text-white text-3xl font-bold tracking-tight">15k+</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Satisfacción</p>
                  <div className="flex items-center text-yellow-400">
                     <span className="text-3xl font-bold text-white mr-1">4.9</span> ★
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;