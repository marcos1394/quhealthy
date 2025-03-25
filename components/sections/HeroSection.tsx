"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Button from "../Button";
import TypeWriter from "../animations/TypeWriter";
import HeroParticle, { generateDeterministicParticles } from "../animations/HeroParticle";
import ProductPill from "../ProductPill";
import Lottie from "lottie-react";
import healthAnimation from "../../public/animations/health.json";

const HeroSection: React.FC = () => {
  const particles = generateDeterministicParticles(15);
  
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
    { name: "Psicólogos", color: "bg-green-500" },
    { name: "Personal trainers", color: "bg-yellow-500" },
    { name: "Estética", color: "bg-indigo-500" }
  ];

  return (
    <section className="relative overflow-hidden bg-gray-900 pt-20 pb-24 min-h-[90vh] flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 opacity-50" />
      
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
              className="mb-3"
            >
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-sm font-medium text-purple-300 border border-purple-500/20">
                La revolucion en el sector salud y belleza
              </span>
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Tu portal de
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> salud y belleza </span>
              personalizado
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <TypeWriter phrases={typewriterPhrases} />
            </motion.div>
            
            <motion.p
              className="text-gray-300 text-lg mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              Conectamos a personas con los mejores profesionales de salud y belleza. 
              Agenda citas, recibe tratamientos y mejora tu bienestar de forma sencilla.
            </motion.p>
            
            <motion.div
              className="flex flex-wrap gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Button href="/registro" size="lg">
                Comenzar ahora
              </Button>
              <Button href="/como-funciona" variant="outline" size="lg">
                Cómo funciona
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            >
              <p className="text-gray-400 mb-3 text-sm">Explora por categoría:</p>
              <div className="flex flex-wrap">
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
            <div className="relative h-[500px] w-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <Lottie
                animationData={healthAnimation}
                loop={true}
                className="w-full h-full"
              />
            </div>
            
            {/* Stats overlay */}
            <motion.div
              className="absolute bottom-6 right-6 bg-gray-800/80 backdrop-blur-sm p-5 rounded-lg border border-gray-700 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Profesionales</p>
                  <p className="text-white text-2xl font-bold">2.500+</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Ciudades</p>
                  <p className="text-white text-2xl font-bold">28</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Citas</p>
                  <p className="text-white text-2xl font-bold">15K+</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Valoración</p>
                  <p className="text-white text-2xl font-bold">4.9 ★</p>
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