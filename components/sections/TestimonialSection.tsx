"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

// Componentes UI de ShadCN
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// --- FIX: Relajamos el tipo para que sea compatible con tu archivo global ---
interface Testimonial {
  name: string;
  role: string;
  image: string;
  text: string;
  product: string; // Cambiado de Union Type a string general para evitar el error TS2322
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  
  // Función helper blindada: Normalizamos a minúsculas para evitar errores de tipeo
  const getBadgeClass = (product: string) => {
    const normalizedProduct = product.toLowerCase().trim();
    
    if (normalizedProduct.includes('quhealthy')) {
        return "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/50";
    }
    if (normalizedProduct.includes('qumarket')) {
        return "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border-pink-500/50";
    }
    if (normalizedProduct.includes('qublocks')) {
        return "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/50";
    }
    
    // Fallback por defecto
    return "bg-gray-800 text-gray-400 border-gray-700";
  };

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-gray-950">
      {/* ... (El resto del renderizado sigue igual, no necesitas cambiar nada abajo) ... */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-gray-950 to-gray-950 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Historias de Éxito
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Descubre cómo profesionales como tú están transformando su práctica diaria.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <Card className="h-full bg-gray-900/40 border-gray-800 backdrop-blur-sm hover:bg-gray-800/60 transition-colors flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                     <Quote className="text-purple-500/40 w-8 h-8 shrink-0" />
                     <Badge variant="outline" className={getBadgeClass(testimonial.product)}>
                        {testimonial.product}
                     </Badge>
                  </div>
                  <p className="text-gray-300 italic leading-relaxed text-sm md:text-base">
                    &quot;{testimonial.text}&quot;
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0 flex items-center gap-4 border-t border-gray-800/50 mt-auto pt-6 mx-6 mb-2">
                  <Avatar className="h-10 w-10 border border-gray-700">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gray-800 text-gray-400">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;