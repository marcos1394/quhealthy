"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Usamos los componentes base de ShadCN para consistencia total
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Definición de tipos
export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string; // Esperamos una clase de Tailwind, ej: "text-purple-500"
  bg_color?: string; // Opcional: fondo del icono, ej: "bg-purple-500/10"
}

interface FeaturesSectionProps {
  features: Feature[];
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-gray-900">
      {/* Fondo con patrón sutil para dar profundidad */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800/40 via-gray-900 to-gray-950 opacity-60"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Características Potentes
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            Herramientas diseñadas obsesivamente para optimizar tu tiempo y multiplicar tus ingresos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <Card className="h-full border-gray-800 bg-gray-900/50 hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1 group">
                <CardHeader>
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors",
                    feature.bg_color || "bg-gray-800", // Fallback si no hay bg_color
                    "group-hover:scale-110 duration-300 ease-out"
                  )}>
                    <feature.icon className={cn("w-6 h-6", feature.color)} />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;