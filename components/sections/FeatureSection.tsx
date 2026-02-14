/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { Calendar, CreditCard, FileText, Video, Activity, Zap, Shield, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Principios UX: Chunking, Similitud (Gestalt), Jerarquía Visual,
 * Affordance, Carga Cognitiva Mínima, Reconocimiento vs Recuperación
 */

const iconMap: Record<string, React.ElementType> = {
  Calendar, CreditCard, FileText, Video, Activity, Zap, Shield, Users
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative overflow-hidden bg-gray-900">
      {/* Background con profundidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium backdrop-blur-sm">
              <Zap className="w-4 h-4" />
              Potenciado por IA
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Características Potentes
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Herramientas diseñadas para optimizar tu tiempo y multiplicar tus resultados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {FEATURES.map((feature: any, index: number) => {
            const IconComponent = iconMap[feature.iconName] || Activity;
            
            const colors = [
              { bg: "from-purple-500/10 to-purple-600/10", border: "border-purple-500/20", icon: "text-purple-400", glow: "group-hover:shadow-purple-500/20" },
              { bg: "from-pink-500/10 to-pink-600/10", border: "border-pink-500/20", icon: "text-pink-400", glow: "group-hover:shadow-pink-500/20" },
              { bg: "from-blue-500/10 to-blue-600/10", border: "border-blue-500/20", icon: "text-blue-400", glow: "group-hover:shadow-blue-500/20" },
              { bg: "from-emerald-500/10 to-emerald-600/10", border: "border-emerald-500/20", icon: "text-emerald-400", glow: "group-hover:shadow-emerald-500/20" },
              { bg: "from-amber-500/10 to-amber-600/10", border: "border-amber-500/20", icon: "text-amber-400", glow: "group-hover:shadow-amber-500/20" },
              { bg: "from-indigo-500/10 to-indigo-600/10", border: "border-indigo-500/20", icon: "text-indigo-400", glow: "group-hover:shadow-indigo-500/20" },
            ];
            const colorScheme = colors[index % colors.length];

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <Card className={cn(
                  "h-full relative overflow-hidden border border-gray-800 bg-gray-900/50 backdrop-blur-sm",
                  "hover:bg-gray-800/80 hover:border-gray-700 transition-all duration-300",
                  "hover:shadow-2xl hover:-translate-y-2", colorScheme.glow, "group cursor-pointer"
                )}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={cn("absolute inset-0 bg-gradient-to-br blur-2xl", colorScheme.bg)} />
                  </div>

                  <CardHeader className="relative space-y-4">
                    <div className={cn(
                      "relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                      colorScheme.bg, "border", colorScheme.border,
                      "group-hover:scale-110 transition-transform duration-300 ease-out shadow-xl"
                    )}>
                      <div className={cn(
                        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br blur-md",
                        colorScheme.bg
                      )} />
                      <IconComponent className={cn("relative w-7 h-7 transition-all duration-300", colorScheme.icon, "group-hover:scale-110")} />
                    </div>

                    <CardTitle className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <p className="text-gray-400 leading-relaxed text-base group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>

                    <div className="flex items-center text-sm font-semibold text-transparent group-hover:text-purple-400 transition-colors duration-300">
                      <span>Explorar característica</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </CardContent>

                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={cn("absolute inset-0 rounded-2xl blur-xl bg-gradient-to-r", colorScheme.bg)} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-gray-400 mb-6 text-lg">¿Quieres ver todas las funcionalidades en acción?</p>
          <a href="#" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 group">
            Ver documentación completa
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;