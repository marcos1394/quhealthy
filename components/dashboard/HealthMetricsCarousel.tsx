"use client"
/* eslint-disable react-doctor/click-events-have-key-events */

import React from 'react';
import { Activity, Heart, Scale, Droplet, Thermometer, Moon } from 'lucide-react';

// Interfaz para la métrica basada en el backend
export interface HealthMetricDto {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
  metricKey: string;
  lastUpdated: string;
  recommendedFrequency: string;
}

interface HealthMetricsCarouselProps {
  metrics: HealthMetricDto[];
  isLoading: boolean;
  onMetricClick?: (metricKey: string) => void;
}

// Función auxiliar para mapear el string del ícono del backend a un componente
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

export function HealthMetricsCarousel({ metrics, isLoading, onMetricClick }: HealthMetricsCarouselProps) {
  if (!isLoading && (!metrics || metrics.length === 0)) {
    return null; // Si no hay métricas, no mostramos el componente
  }

  return (
    <div className="w-full">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
        Telemetría Biométrica
      </h3>

      {/* Contenedor Grid Blueprint */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
        {isLoading ? (
          // Skeleton Loader Arquitectónico
          <>
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] min-h-[140px] animate-pulse p-6"
              >
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 mb-6" />
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-800 mb-2" />
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </>
        ) : (
          <>
            {metrics.map((metric, index) => {
              const Icon = getIconComponent(metric.icon);
              const isEmpty = !metric.value || metric.value === "";

              return (
                <div
                  key={`${metric.title}-${index}`}
                  onClick={() => onMetricClick && onMetricClick(metric.metricKey)}
                  // 1. HOVER DEL CONTENEDOR: Z-index relativo, fondo invertido, salto hacia arriba y sombra brutalista
                  className={`group relative z-0 hover:z-10 cursor-pointer border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] ${isEmpty ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    {/* 2. ÍCONO: Inversión de bordes y relleno para contrastar */}
                    <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] transition-colors duration-300 shrink-0 group-hover:border-white dark:group-hover:border-black group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white">
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    {metric.recommendedFrequency && (
                      // 3. BADGE: Inversión de colores de fondo de la etiqueta de frecuencia
                      <span className="text-[8px] uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 transition-colors duration-300 group-hover:bg-gray-800 group-hover:text-gray-300 dark:group-hover:bg-gray-200 dark:group-hover:text-gray-700">
                        {metric.recommendedFrequency}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    {/* 4. TÍTULO: Gris oscuro cambia a gris claro en modo claro, y viceversa */}
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1 truncate transition-colors duration-300 group-hover:text-gray-300 dark:group-hover:text-gray-600">
                      {metric.title}
                    </p>
                    {/* 5. VALOR: El texto negro cambia a blanco (o maneja el estado vacío) */}
                    <h4 className={`text-xl font-semibold tracking-tight truncate transition-colors duration-300 ${isEmpty ? 'text-gray-400 italic group-hover:text-gray-500 dark:group-hover:text-gray-400' : 'text-black dark:text-white group-hover:text-white dark:group-hover:text-black'}`}>
                      {isEmpty ? "Sin Registrar" : metric.value}
                    </h4>
                    {/* 6. SUBTÍTULO: Transición sutil de grises */}
                    <p className="text-[9px] text-gray-400 dark:text-gray-600 font-light truncate mt-1 transition-colors duration-300 group-hover:text-gray-500 dark:group-hover:text-gray-400">
                      {metric.subtitle}
                    </p>
                    {metric.lastUpdated && !isEmpty && (
                      <p className="text-[8px] text-gray-400 mt-2 text-right transition-colors duration-300 group-hover:text-gray-500 dark:group-hover:text-gray-400">
                        Última act: {metric.lastUpdated}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}