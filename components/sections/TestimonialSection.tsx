"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

/**
 * TestimonialsSection Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. PRUEBA SOCIAL
 *    - Testimonios de usuarios reales
 *    - Nombres, roles y fotos añaden credibilidad
 * 
 * 2. EFECTO HALO
 *    - Badge del producto asocia éxito con la marca
 *    - Colores consistentes refuerzan identidad
 * 
 * 3. PEAK-END EFFECT
 *    - Quote icon crea momento memorable
 *    - Testimonios positivos dejan impresión duradera
 * 
 * 4. SIMILITUD (Gestalt)
 *    - Estructura idéntica facilita escaneo
 *    - Grid organizado reduce carga cognitiva
 * 
 * 5. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Badges coloridos identifican productos
 *    - Avatar + nombre facilitan recordar
 * 
 * 6. CREDIBILIDAD
 *    - Roles específicos (no genéricos)
 *    - Fotos reales (cuando disponibles)
 */

interface Testimonial {
  name: string;
  role: string;
  image: string;
  text: string;
  product: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  
  // Helper para badges - RECONOCIMIENTO visual
  const getBadgeClass = (product: string) => {
    const normalized = product.toLowerCase().trim();
    
    if (normalized.includes('quhealthy')) {
      return "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/30";
    }
    if (normalized.includes('qumarket')) {
      return "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border-pink-500/30";
    }
    if (normalized.includes('qublocks')) {
      return "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30";
    }
    
    return "bg-gray-800 text-gray-400 border-gray-700";
  };

  return (
    <section id="testimonials" className="py-32 relative overflow-hidden bg-gray-950">
      {/* Background con profundidad */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-gray-950 to-gray-950" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header - PRIMING emocional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-6"
        >
          {/* Badge decorativo */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Calificación promedio 4.9/5</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Historias de Éxito
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Descubre cómo profesionales como tú están transformando su práctica diaria
          </p>
        </motion.div>

        {/* Grid de Testimonios - SIMILITUD (Gestalt) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <Card className="h-full bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/70 hover:border-gray-700 transition-all duration-300 flex flex-col group">
                <CardHeader className="pb-6 space-y-6">
                  {/* Header con quote y badge - REGIÓN COMÚN */}
                  <div className="flex justify-between items-start">
                    <div className="relative">
                      {/* Glow effect para quote */}
                      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Quote className="relative text-purple-500/40 w-10 h-10" />
                    </div>
                    
                    {/* Badge del producto - RECONOCIMIENTO */}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-semibold text-xs px-3 py-1 transition-all duration-200",
                        getBadgeClass(testimonial.product)
                      )}
                    >
                      {testimonial.product}
                    </Badge>
                  </div>
                  
                  {/* Testimonial text - CHUNKING del mensaje */}
                  <blockquote className="text-gray-300 italic leading-relaxed text-base">
                    &quot;{testimonial.text}&quot;
                  </blockquote>
                </CardHeader>
                
                {/* Footer con autor - CREDIBILIDAD */}
                <CardContent className="pt-6 mt-auto border-t border-gray-800/50">
                  <div className="flex items-center gap-4">
                    {/* Avatar - RECONOCIMIENTO visual */}
                    <Avatar className="h-12 w-12 border-2 border-gray-700 group-hover:border-purple-500/50 transition-colors duration-300">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Info del autor - JERARQUÍA */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-500 text-xs truncate">
                        {testimonial.role}
                      </p>
                    </div>

                    {/* Rating visual - PRUEBA SOCIAL */}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3.5 h-3.5 text-amber-400 fill-amber-400" 
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA final - PRINCIPIO DE RECIPROCIDAD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 text-lg mb-4">
            ¿Quieres ser parte de estas historias de éxito?
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            Comenzar mi historia
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;