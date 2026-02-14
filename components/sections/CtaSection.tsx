"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import HeroParticle, { generateDeterministicParticles } from "@/components/animations/HeroParticle";

/**
 * CtaSection Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. PRINCIPIO DE ESCASEZ
 *    - "Comienza Hoy Mismo" crea urgencia temporal
 *    - "Sin riesgos" reduce fricción de decisión
 * 
 * 2. PRUEBA SOCIAL
 *    - "Miles de profesionales" = validación externa
 *    - Establece credibilidad antes del CTA
 * 
 * 3. AVERSIÓN A LA PÉRDIDA
 *    - "No se requiere tarjeta" elimina riesgo percibido
 *    - "Prueba premium" enfatiza ganancia sin pérdida
 * 
 * 4. JERARQUÍA VISUAL
 *    - CTA primario destacado con gradiente
 *    - CTA secundario visible pero menos prominente
 * 
 * 5. MINIMIZAR CARGA COGNITIVA
 *    - Mensaje claro y directo
 *    - Solo 2 opciones (no sobrecarga de decisiones)
 * 
 * 6. FIGURA/FONDO (Gestalt)
 *    - Card elevado con glassmorphism
 *    - Orbs decorativos crean profundidad
 * 
 * 7. PRINCIPIO DE RECIPROCIDAD
 *    - "Prueba gratis" antes de pedir compromiso
 *    - Genera buena voluntad
 */

const CtaSection: React.FC = () => {
  const particles = useMemo(() => generateDeterministicParticles(15, 10, 20), []);

  // Beneficios - CHUNKING para memoria
  const benefits = [
    "14 días de prueba gratis",
    "Todas las funciones premium",
    "Sin tarjeta de crédito"
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-gray-950">
      {/* Background con profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900" />
      
      {/* Partículas sutiles - Profundidad visual */}
      {particles.map((particle, i) => (
        <HeroParticle 
          key={`cta-particle-${i}`}
          left={particle.left} 
          top={particle.top} 
          color={i % 3 === 0 ? "bg-purple-500" : i % 3 === 1 ? "bg-pink-500" : "bg-blue-500"}
          size="w-1.5 h-1.5"
          animationDuration={4 + (i % 3)}
        />
      ))}
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          {/* Card principal - REGIÓN COMÚN (Gestalt) */}
          <div className="relative bg-gray-900/80 border border-gray-800 p-10 md:p-16 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
            
            {/* Efectos de resplandor - Atención visual */}
            <div className="absolute top-0 right-0 -mt-32 -mr-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-32 -ml-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Contenido - JERARQUÍA CLARA */}
            <div className="text-center relative z-10 space-y-8">
              
              {/* Badge - PRUEBA SOCIAL */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Únete a +2,500 profesionales</span>
              </motion.div>

              {/* Headline - PRIMING emocional */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-black tracking-tight leading-tight"
              >
                <span className="text-white block">Potencia tu Práctica</span>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent block mt-2">
                  Comienza Hoy Mismo
                </span>
              </motion.h2>
              
              {/* Subheadline - CHUNKING del mensaje */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              >
                Únete a miles de profesionales que ya están transformando su práctica. 
                Prueba todas las funciones premium sin riesgos.
              </motion.p>

              {/* Benefits List - RECONOCIMIENTO VS RECUPERACIÓN */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-6 py-4"
              >
                {benefits.map((benefit, index) => (
                  <div 
                    key={benefit}
                    className="flex items-center gap-2 text-gray-300 font-medium"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </motion.div>
              
              {/* CTAs - JERARQUÍA VISUAL clara */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
              >
                {/* Primary CTA - Mayor prominencia */}
                <Button 
                  asChild 
                  size="lg" 
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 text-white font-bold px-10 py-7 text-lg shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 transition-all duration-300"
                >
                  <Link href="/register" className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Comenzar Gratis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                
                {/* Secondary CTA - Menos prominente */}
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-gray-700 bg-gray-900/50 backdrop-blur-sm text-white hover:bg-gray-800 hover:border-gray-600 px-10 py-7 text-lg hover:scale-105 transition-all duration-300"
                >
                  <Link href="/contact">
                    Hablar con Ventas
                  </Link>
                </Button>
              </motion.div>
              
              {/* Trust indicator - AVERSIÓN A LA PÉRDIDA */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="text-gray-500 text-sm pt-4"
              >
                🔒 No se requiere tarjeta de crédito • Cancela cuando quieras
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;