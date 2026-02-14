"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";

// Custom Animations & Components
import TypeWriter from "@/components/animations/TypeWriter";
import HeroParticle, { generateDeterministicParticles } from "@/components/animations/HeroParticle";
import ProductPill from "@/components/ProductPill";
import { StatsCard } from "@/components/StatsCard";
import { TrustBadge } from "@/components/TrustBage";

// Animación Lottie con lazy loading
import healthAnimation from "../../public/animations/health.json";

const Lottie = dynamic(() => import("lottie-react"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse rounded-xl flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )
});

const HeroSection: React.FC = () => {
  // Optimización: Memoizar partículas
  const particles = useMemo(() => generateDeterministicParticles(15), []);
  
  const typewriterPhrases = [
    "Encuentra a los mejores profesionales de salud",
    "Reserva tratamientos de belleza",
    "Descubre clínicas especializadas cerca de ti",
    "Cuida tu salud de forma inteligente"
  ];

  const categories = [
    { name: "Médicos", color: "bg-purple-500", gradient: "from-purple-500 to-purple-600" },
    { name: "Fisioterapeutas", color: "bg-pink-500", gradient: "from-pink-500 to-pink-600" },
    { name: "Nutricionistas", color: "bg-blue-500", gradient: "from-blue-500 to-blue-600" },
    { name: "Psicólogos", color: "bg-emerald-500", gradient: "from-emerald-500 to-emerald-600" },
    { name: "Trainers", color: "bg-amber-500", gradient: "from-amber-500 to-amber-600" },
    { name: "Estética", color: "bg-indigo-500", gradient: "from-indigo-500 to-indigo-600" }
  ];

  // Beneficios aplicando principio de "chunks" para memoria
  const benefits = [
    "Sin costos ocultos",
    "Profesionales verificados",
    "Agenda en 2 minutos"
  ];

  return (
    <section className="relative overflow-hidden bg-gray-950 pt-20 pb-24 min-h-[95vh] flex items-center">
      {/* Background layers - Aplicando Gestalt (figura/fondo) */}
      <div className="absolute inset-0">
        {/* Gradiente base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950/10 to-gray-950" />
        
        {/* Grid pattern sutil - No intrusivo (memoria selectiva) */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Orbs con blur - Efecto de profundidad */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" 
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" 
          style={{ animationDelay: '2s', animationDuration: '5s' }}
        />
      </div>
      
      {/* Partículas flotantes */}
      {particles.map((particle, index) => (
        <HeroParticle
          key={`particle-${index}`}
          left={particle.left}
          top={particle.top}
          color={index % 3 === 0 ? "bg-purple-400" : index % 3 === 1 ? "bg-pink-400" : "bg-blue-400"}
          size={index % 5 === 0 ? "w-2 h-2" : "w-1.5 h-1.5"}
          animationDuration={3 + (index % 4)}
        />
      ))}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* ===== LEFT CONTENT ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Trust Badge - Principio de autoridad y prueba social */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <TrustBadge />
            </motion.div>
            
            {/* Headline - Aplicando jerarquía visual clara */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                <span className="text-white">Tu portal de </span>
                <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  salud y belleza
                </span>
                <span className="block mt-2 text-white">personalizado</span>
              </h1>
            </motion.div>
            
            {/* TypeWriter - Mantiene atención con movimiento */}
            <motion.div
              className="min-h-[80px] flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <TypeWriter phrases={typewriterPhrases} />
            </motion.div>
            
            {/* Value Proposition - Chunking para mejor memoria */}
            <motion.p
              className="text-xl text-gray-300 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              Conectamos a personas con los mejores profesionales certificados. 
              Agenda citas, recibe tratamientos y mejora tu bienestar de forma sencilla y segura.
            </motion.p>
            
            {/* Benefits List - Principio de reconocimiento vs recuperación */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>
            
            {/* CTAs - Jerarquía clara, principio de escasez sutil */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {/* Primary CTA - Mayor prominencia visual */}
              <Button 
                asChild 
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 text-white font-bold px-10 py-7 text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-[1.02] transition-all duration-300"
              >
                <Link href="/register" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Comenzar gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              
              {/* Secondary CTA - Menos prominente pero accesible */}
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-700 bg-gray-900/50 backdrop-blur-sm text-white hover:bg-gray-800 hover:border-gray-600 px-10 py-7 text-lg hover:scale-[1.02] transition-all duration-300"
              >
                <Link href="/discover" className="flex items-center gap-2">
                  Ver especialistas
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </motion.div>
            
            {/* Categories - Principio de región común (agrupación) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="pt-6 space-y-4"
            >
              <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-2">
                <span className="w-8 h-[2px] bg-gradient-to-r from-purple-500 to-transparent" />
                Explora por categoría
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <ProductPill
                    key={category.name}
                    name={category.name}
                    color={category.color}
                    delay={0.05 * index}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          {/* ===== RIGHT CONTENT - Visual Hierarchy ===== */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Container principal con glassmorphism */}
            <div className="relative">
              {/* Glow effect detrás */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 rounded-3xl blur-2xl opacity-50" />
              
              {/* Card principal */}
              <div className="relative h-[650px] w-full rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-xl shadow-2xl">
                <Lottie
                  animationData={healthAnimation}
                  loop={true}
                  className="w-full h-full p-10"
                />
              </div>
              
              {/* Stats Card - Aplicando efecto Peak-End (memorable) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="absolute -bottom-8 -left-8 z-20"
              >
                <StatsCard />
              </motion.div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;