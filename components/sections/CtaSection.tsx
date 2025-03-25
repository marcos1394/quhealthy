"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "../Button";
import { ArrowRight } from "lucide-react";
import { generateDeterministicParticles } from "../animations/HeroParticle";
import HeroParticle from "../animations/HeroParticle";

const CtaSection: React.FC = () => {
  const [particles] = React.useState(() => generateDeterministicParticles(15, 10, 20));

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950"></div>
      
      {/* Particles */}
      {particles.map((particle, i) => (
        <HeroParticle 
          key={i} 
          left={particle.left} 
          top={particle.top} 
          color={i % 3 === 0 ? "bg-purple-400" : i % 3 === 1 ? "bg-pink-400" : "bg-blue-400"}
        />
      ))}
      
      <div className="max-w-5xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 p-12 rounded-3xl relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-30"></div>
          
          <div className="text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
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
              className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              Únete a miles de profesionales que ya están transformando su práctica con nuestra suite integral. 14 días de prueba gratuita sin compromiso.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <Button href="/signup" size="lg" className="min-w-[200px]">
                Comenzar Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button href="/contacto" variant="outline" size="lg" className="min-w-[200px]">
                Hablar con un Asesor
              </Button>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-gray-400 mt-6"
            >
              No se requiere tarjeta de crédito. Cancela cuando quieras.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;