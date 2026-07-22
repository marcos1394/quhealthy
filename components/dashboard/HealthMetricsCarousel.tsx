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

// Función auxiliar para mapear el string del ícono del backend a un componente y colores semánticos
const getIconData = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'heart.fill': return { icon: Heart, colorClass: 'text-rose-500 dark:text-rose-400', bgClass: 'bg-rose-50 dark:bg-rose-500/10' };
    case 'drop.fill': return { icon: Droplet, colorClass: 'text-cyan-500 dark:text-cyan-400', bgClass: 'bg-cyan-50 dark:bg-cyan-500/10' };
    case 'figure.walk': return { icon: Activity, colorClass: 'text-emerald-500 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-500/10' };
    case 'scalemass': return { icon: Scale, colorClass: 'text-indigo-500 dark:text-indigo-400', bgClass: 'bg-indigo-50 dark:bg-indigo-500/10' };
    case 'thermometer': return { icon: Thermometer, colorClass: 'text-orange-500 dark:text-orange-400', bgClass: 'bg-orange-50 dark:bg-orange-500/10' };
    case 'moon.fill': return { icon: Moon, colorClass: 'text-violet-500 dark:text-violet-400', bgClass: 'bg-violet-50 dark:bg-violet-500/10' };
    default: return { icon: Activity, colorClass: 'text-teal-500 dark:text-teal-400', bgClass: 'bg-teal-50 dark:bg-teal-500/10' };
  }
};

export function HealthMetricsCarousel({ metrics, isLoading, onMetricClick }: HealthMetricsCarouselProps) {
 if (!isLoading && (!metrics || metrics.length === 0)) {
 return null; // Si no hay métricass, no mostramos el componente
 }

 return (
 <div className="w-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 px-1">
        Telemetría Biométrica
      </h3>

      {/* Contenedor Grid Soft Health */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          // Skeleton Loader
          <>
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] min-h-[160px] animate-pulse p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6" />
                <div className="w-16 h-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-3" />
                <div className="w-24 h-8 rounded-full bg-gray-100 dark:bg-gray-800" />
              </div>
            ))}
          </>
        ) : (
          <>
            {metrics.map((metric, index) => {
              const { icon: Icon, colorClass, bgClass } = getIconData(metric.icon);
              const isEmpty = !metric.value || metric.value === "";

              return (
                <div
                  key={`${metric.title}-${index}`}
                  onClick={() => onMetricClick && onMetricClick(metric.metricKey)}
                  className={`group cursor-pointer rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between min-h-[160px] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${isEmpty ? 'opacity-70 grayscale-[50%]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${bgClass} ${colorClass}`}>
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    {metric.recommendedFrequency && (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 px-2.5 py-1 rounded-full transition-colors">
                        {metric.recommendedFrequency}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 truncate">
                      {metric.title}
                    </p>
                    <h4 className={`text-2xl font-bold tracking-tight truncate mb-1 ${isEmpty ? 'text-gray-300 dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>
                      {isEmpty ? "Sin Registrar" : metric.value}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">
                      {metric.subtitle}
                    </p>
                    {metric.lastUpdated && !isEmpty && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-3 text-right font-medium">
                        Act. {metric.lastUpdated}
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