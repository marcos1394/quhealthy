"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StatBlock Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Valor principal más grande y prominente
 *    - Label secundario en gris
 *    - Trend como información complementaria
 * 
 * 2. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos visuales por métrica
 *    - Colores distintivos por tendencia
 *    - No requiere recordar significados
 * 
 * 3. FEEDBACK VISUAL
 *    - Hover states suaves
 *    - Animaciones de entrada
 *    - Micro-interacciones
 * 
 * 4. PRIMING
 *    - Colores preparan interpretación (verde=bueno, rojo=malo)
 *    - Iconos de tendencia refuerzan dirección
 * 
 * 5. CHUNKING
 *    - Una métrica por card
 *    - Información organizada lógicamente
 *    - Fácil de escanear
 * 
 * 6. AFFORDANCE
 *    - Card elevado sugiere importancia
 *    - Hover indica puede ser clickeable
 *    - Glow effect en iconos
 */

interface StatBlockProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string | number;
  trendDirection?: 'up' | 'down' | 'neutral';
  description?: string;
  onClick?: () => void;
  isLoading?: boolean;
  color?: 'purple' | 'blue' | 'emerald' | 'amber' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  animationDelay?: number;
}

export const StatBlock: React.FC<StatBlockProps> = ({ 
  label, 
  value, 
  icon, 
  trend,
  trendDirection,
  description,
  onClick,
  isLoading = false,
  color = 'purple',
  size = 'md',
  animationDelay = 0
}) => {
  
  // Helper para determinar color de tendencia - PRIMING
  const getTrendInfo = () => {
    if (!trend) return null;

    let direction = trendDirection;
    
    // Auto-detect si no se especifica
    if (!direction && typeof trend === 'number') {
      direction = trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral';
    } else if (!direction && typeof trend === 'string') {
      direction = trend.includes('+') ? 'up' : trend.includes('-') ? 'down' : 'neutral';
    }

    const configs = {
      up: {
        icon: <TrendingUp className="w-3 h-3" />,
        className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        label: typeof trend === 'number' ? `+${trend}%` : trend
      },
      down: {
        icon: <TrendingDown className="w-3 h-3" />,
        className: "text-red-400 bg-red-500/10 border-red-500/20",
        label: typeof trend === 'number' ? `${trend}%` : trend
      },
      neutral: {
        icon: <Minus className="w-3 h-3" />,
        className: "text-gray-400 bg-gray-500/10 border-gray-500/20",
        label: typeof trend === 'number' ? `${trend}%` : trend
      }
    };

    return configs[direction || 'neutral'];
  };

  const trendInfo = getTrendInfo();

  // Helper para colores del icono - RECONOCIMIENTO VISUAL
  const colorConfigs = {
    purple: {
      icon: "text-purple-400 group-hover:text-purple-300",
      bg: "bg-purple-500/10 group-hover:bg-purple-500/20 border-purple-500/20",
      glow: "group-hover:shadow-purple-500/20"
    },
    blue: {
      icon: "text-blue-400 group-hover:text-blue-300",
      bg: "bg-blue-500/10 group-hover:bg-blue-500/20 border-blue-500/20",
      glow: "group-hover:shadow-blue-500/20"
    },
    emerald: {
      icon: "text-emerald-400 group-hover:text-emerald-300",
      bg: "bg-emerald-500/10 group-hover:bg-emerald-500/20 border-emerald-500/20",
      glow: "group-hover:shadow-emerald-500/20"
    },
    amber: {
      icon: "text-amber-400 group-hover:text-amber-300",
      bg: "bg-amber-500/10 group-hover:bg-amber-500/20 border-amber-500/20",
      glow: "group-hover:shadow-amber-500/20"
    },
    pink: {
      icon: "text-pink-400 group-hover:text-pink-300",
      bg: "bg-pink-500/10 group-hover:bg-pink-500/20 border-pink-500/20",
      glow: "group-hover:shadow-pink-500/20"
    }
  };

  const colorConfig = colorConfigs[color];

  // Helper para tamaños - JERARQUÍA VISUAL
  const sizeConfigs = {
    sm: {
      card: "p-4",
      value: "text-2xl",
      icon: "p-2 w-10 h-10",
      iconSize: "w-5 h-5"
    },
    md: {
      card: "p-6",
      value: "text-3xl md:text-4xl",
      icon: "p-3 w-12 h-12",
      iconSize: "w-6 h-6"
    },
    lg: {
      card: "p-8",
      value: "text-4xl md:text-5xl",
      icon: "p-4 w-16 h-16",
      iconSize: "w-8 h-8"
    }
  };

  const sizeConfig = sizeConfigs[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: animationDelay,
        ease: "easeOut" 
      }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card 
        className={cn(
          "relative bg-gray-900/50 backdrop-blur-sm border-gray-800 shadow-lg transition-all duration-300 overflow-hidden h-full group",
          "hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10",
          onClick ? "cursor-pointer hover:scale-[1.02]" : ""
        )}
        onClick={onClick}
      >
        {/* Glow effect en hover - AFFORDANCE */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardContent className={cn("relative", sizeConfig.card)}>
          <div className="flex items-start justify-between gap-4">
            
            {/* Sección izquierda: Data - JERARQUÍA VISUAL */}
            <div className="flex-1 min-w-0">
              {/* Label - Texto secundario */}
              <p className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {label}
              </p>
              
              {/* Value - Texto principal */}
              <div className="flex items-baseline gap-3 mb-2">
                {isLoading ? (
                  <div className={cn(
                    "bg-gray-800 rounded-lg animate-pulse",
                    sizeConfig.value === "text-2xl" ? "h-8 w-20" : "",
                    sizeConfig.value === "text-3xl md:text-4xl" ? "h-10 w-24" : "",
                    sizeConfig.value === "text-4xl md:text-5xl" ? "h-12 w-32" : ""
                  )} />
                ) : (
                  <motion.h3 
                    className={cn(
                      "font-black text-white tracking-tight",
                      sizeConfig.value
                    )}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      delay: animationDelay + 0.2
                    }}
                  >
                    {value}
                  </motion.h3>
                )}

                {/* Trend Badge - PRIMING */}
                {trendInfo && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: animationDelay + 0.3 }}
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border transition-all duration-200",
                      trendInfo.className
                    )}
                  >
                    {trendInfo.icon}
                    <span>{trendInfo.label}</span>
                  </motion.div>
                )}
              </div>

              {/* Description - Información adicional */}
              {description && !isLoading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: animationDelay + 0.4 }}
                  className="text-xs text-gray-500 leading-relaxed line-clamp-2"
                >
                  {description}
                </motion.p>
              )}
            </div>

            {/* Sección derecha: Icono - RECONOCIMIENTO */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                delay: animationDelay + 0.1
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 5
              }}
              className={cn(
                "relative rounded-xl border shadow-lg transition-all duration-300 flex items-center justify-center flex-shrink-0",
                sizeConfig.icon,
                colorConfig.bg,
                colorConfig.glow
              )}
            >
              {/* Glow interno en hover */}
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md",
                colorConfig.bg
              )} />
              
              {/* Icono */}
              <div className={cn("relative", colorConfig.icon)}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                  className: sizeConfig.iconSize + " " + colorConfig.icon
                })}
              </div>
            </motion.div>
          </div>

          {/* Progress bar sutil (opcional) */}
          {typeof value === 'number' && value > 0 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ 
                duration: 1,
                delay: animationDelay + 0.5,
                ease: "easeOut"
              }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500/50 to-pink-500/50 origin-left"
              style={{ 
                width: `${Math.min((value as number) / 100, 1) * 100}%` 
              }}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Grid de StatBlocks con animaciones escalonadas
 */
export const StatBlockGrid: React.FC<{
  stats: Array<Omit<StatBlockProps, 'animationDelay'>>;
  columns?: 1 | 2 | 3 | 4;
}> = ({ stats, columns = 4 }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns])}>
      {stats.map((stat, index) => (
        <StatBlock
          key={stat.label}
          {...stat}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  );
};

/**
 * Variante compacta para espacios reducidos
 */
export const StatBlockCompact: React.FC<StatBlockProps> = (props) => {
  return (
    <StatBlock
      {...props}
      size="sm"
    />
  );
};