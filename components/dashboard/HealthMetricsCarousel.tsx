"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Scale, Droplet, Thermometer, Moon } from 'lucide-react';

// Interfaz para la métrica basada en el backend
export interface HealthMetricDto {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
}

interface HealthMetricsCarouselProps {
  metrics: HealthMetricDto[];
  isLoading: boolean;
}

// Función auxiliar para mapear el string del ícono del backend a un componente de Lucide
const getIconComponent = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'heart.fill': return Heart;
    case 'drop.fill': return Droplet;
    case 'figure.walk': return Activity;
    case 'scalemass': return Scale;
    case 'thermometer': return Thermometer;
    case 'moon.fill': return Moon;
    default: return Activity;
  }
};

// Función auxiliar para mapear el string de color del backend a clases de Tailwind
const getColorClasses = (colorName: string) => {
  switch (colorName?.toLowerCase()) {
    case 'red': return 'text-red-500 bg-red-50 dark:bg-red-500/10';
    case 'blue': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
    case 'green': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
    case 'orange': return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10';
    case 'purple': return 'text-purple-500 bg-purple-50 dark:bg-purple-500/10';
    default: return 'text-medical-500 bg-medical-50 dark:bg-medical-500/10';
  }
};

export function HealthMetricsCarousel({ metrics, isLoading }: HealthMetricsCarouselProps) {
  // Animaciones Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  if (!isLoading && (!metrics || metrics.length === 0)) {
    return null; // Si no hay métricas, no mostramos el componente
  }

  return (
    <div className="w-full pb-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">
        Métricas de Salud
      </h3>

      {/* Contenedor Responsivo: Scroll Horizontal en Móvil, Grid en Desktop */}
      <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading ? (
          // Skeleton Loader
          <>
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="min-w-[160px] lg:min-w-0 lg:w-full h-[120px] rounded-[1.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0"
              />
            ))}
          </>
        ) : (
          <>
            {metrics.map((metric, index) => {
              const Icon = getIconComponent(metric.icon);
              const colorClasses = getColorClasses(metric.color);
              const [textColor, bgColor] = colorClasses.split(' bg-');

              return (
                <motion.div
                  key={`${metric.title}-${index}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  className="min-w-[160px] lg:min-w-0 lg:w-full shrink-0 relative group cursor-pointer overflow-hidden rounded-[1.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-4 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Glassmorphism Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="flex flex-col h-full justify-between relative z-10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-2xl bg-${bgColor} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`w-5 h-5 ${textColor}`} />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight mb-1 truncate">
                        {metric.title}
                      </p>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-baseline gap-1 truncate">
                        {metric.value}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-light truncate mt-0.5">
                        {metric.subtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
