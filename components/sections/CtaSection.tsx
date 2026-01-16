"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Imports corregidos (ShadCN + Componentes optimizados)
import { Button } from "@/components/ui/button";
import HeroParticle, { generateDeterministicParticles } from "@/components/animations/HeroParticle";

const CtaSection: React.FC = () => {
  // Optimizamos con useMemo para evitar recálculos innecesarios
  const particles = useMemo(() => generateDeterministicParticles(15, 10, 20), []);

  return (
    <section className="py-24 relative overflow-hidden bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950 pointer-events-none"></div>
      
      {/* Reutilizamos las partículas del Hero para consistencia visual */}
      {particles.map((particle, i) => (
        <HeroParticle 
          key={i} 
          left={particle.left} 
          top={particle.top} 
          color={i % 3 === 0 ? "bg-purple-500" : i % 3 === 1 ? "bg-pink-500" : "bg-blue-500"}
          className="opacity-20" // Un poco más sutiles aquí para no distraer del CTA
        />
      ))}
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gray-900/80 border border-gray-800 p-8 md:p-12 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-2xl shadow-purple-900/20"
        >
          {/* Efecto de resplandor interno */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight"
            >
              Potencia tu Práctica Profesional
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent block mt-2">
                Comienza Hoy Mismo
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Únete a miles de profesionales que ya están transformando su práctica con nuestra suite integral. 
              Prueba todas las funciones premium sin riesgos.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              {/* Botón Principal - Usando asChild para Next.js Link */}
              <Button asChild size="lg" className="min-w-[200px] h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/25">
                <Link href="/register">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              
              {/* Botón Secundario */}
              <Button asChild variant="outline" size="lg" className="min-w-[200px] h-12 text-base border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white">
                <Link href="/contact">
                  Hablar con Ventas
                </Link>
              </Button>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-gray-500 text-sm mt-8"
            >
              No se requiere tarjeta de crédito para la prueba de 14 días.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;