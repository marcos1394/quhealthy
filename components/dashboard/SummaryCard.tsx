"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Info, Minus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * SummaryCard Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Valor destacado (3xl)
 *    - Título secundario
 *    - Tendencia terciaria
 *    - Icono cuaternario
 * 
 * 2. PRIMING
 *    - Verde = positivo (▲)
 *    - Rojo = negativo (▼)
 *    - Colores emotivos
 *    - Dirección visual
 * 
 * 3. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos descriptivos
 *    - Tendencia con símbolo
 *    - Colores consistentes
 *    - Labels claros
 * 
 * 4. AFFORDANCE
 *    - Hover effects
 *    - Click para más info
 *    - Scale animations
 *    - Visual feedback
 * 
 * 5. CREDIBILIDAD
 *    - Comparación visible
 *    - Context tooltip
 *    - Periodo visible
 *    - Fuente de datos
 * 
 * 6. FEEDBACK VISUAL
 *    - Hover lift
 *    - Scale icon
 *    - Glow effect
 *    - Progress bar
 */

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  comparison?: {
    label: string;
    value: string;
  };
  description?: string;
  onClick?: () => void;
  loading?: boolean;
  badge?: string;
  sparkline?: number[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "text-purple-400",
  bgColor = "bg-purple-500/10",
  borderColor = "border-gray-800",
  trend,
  comparison,
  description,
  onClick,
  loading = false,
  badge,
  sparkline
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Helper para obtener color de tendencia - PRIMING
  const getTrendColor = () => {
    if (!trend) return '';
    return trend.isPositive ? 'text-emerald-400' : 'text-red-400';
  };

  const getTrendBgColor = () => {
    if (!trend) return '';
    return trend.isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';
  };

  const getTrendBorderColor = () => {
    if (!trend) return '';
    return trend.isPositive ? 'border-emerald-500/20' : 'border-red-500/20';
  };

  // Helper para icono de tendencia - RECONOCIMIENTO
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

  // Simple sparkline renderer - FEEDBACK VISUAL
  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null;

    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-0.5 h-8 mt-2">
        {sparkline.map((point, index) => {
          const height = ((point - min) / range) * 100;
          return (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn(
                "flex-1 rounded-t",
                trend?.isPositive ? "bg-emerald-500/30" : "bg-purple-500/30"
              )}
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
      onClick={onClick}
    >
      <Card className={cn(
        "h-full bg-gray-900 shadow-lg transition-all duration-300 overflow-hidden relative group",
        borderColor,
        onClick ? "cursor-pointer" :"",
        isHovered ? "shadow-2xl shadow-purple-500/10" : "",
        loading ? "animate-pulse" : ""
      )}>
        
        {/* Glow Effect - AFFORDANCE */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badge - PRIMING */}
        {badge && (
          <div className="absolute top-4 right-4 z-20">
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
              {badge}
            </Badge>
          </div>
        )}

        <CardContent className="p-6 relative z-10">
          
          {/* Header: Icon + Trend - JERARQUÍA VISUAL */}
          <div className="flex items-start justify-between mb-4">
            
            {/* Icon Container */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300",
                bgColor,
                isHovered ? "shadow-xl" : ""
              )}
            >
              <Icon className={cn("w-6 h-6", color)} />
            </motion.div>

            {/* Trend Badge - PRIMING */}
            {trend && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <Badge 
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2.5 py-1",
                    getTrendBgColor(),
                    getTrendBorderColor(),
                    getTrendColor()
                  )}
                >
                  <TrendIcon className="w-3 h-3" />
                  {Math.abs(trend.value)}%
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Content - JERARQUÍA */}
          <div className="space-y-2">
            
            {/* Title */}
            <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase">
              {title}
            </p>

            {/* Value - DESTACADO */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {loading ? (
                <div className="h-10 bg-gray-800 rounded animate-pulse" />
              ) : (
                <p className={cn(
                  "font-black tracking-tight",
                  "text-3xl lg:text-4xl",
                  "bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                )}>
                  {value}
                </p>
              )}
            </motion.div>

            {/* Comparison - CREDIBILIDAD */}
            {comparison && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{comparison.label}:</span>
                <span className="font-semibold text-gray-400">{comparison.value}</span>
              </div>
            )}

            {/* Trend Period - CREDIBILIDAD */}
            {trend?.period && (
              <p className="text-xs text-gray-600 flex items-center gap-1">
                vs. {trend.period}
              </p>
            )}

            {/* Sparkline - FEEDBACK VISUAL */}
            {sparkline && renderSparkline()}
          </div>

          {/* Description Tooltip - RECONOCIMIENTO */}
          <AnimatePresence>
            {isHovered && description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 p-3"
              >
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Animated Bottom Line - AFFORDANCE */}
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent",
            color
          )}
          initial={{ width: 0 }}
          animate={{ width: isHovered ? '100%' : 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Corner Accent - JERARQUÍA */}
        <div className={cn(
          "absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700",
          bgColor
        )} />
      </Card>
    </motion.div>
  );
};

/**
 * Variante compacta para espacios reducidos
 */
export const SummaryCardCompact: React.FC<SummaryCardProps> = (props) => {
  const { title, value, icon: Icon, color ="text-purple-400", bgColor="bg-purple-500/10", trend } = props;
  const TrendIcon = trend?.isPositive ? TrendingUp : trend ? TrendingDown : Minus;

  return (
    <Card className="bg-gray-900 border-gray-800 p-4 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bgColor)}>
            <Icon className={cn("w-5 h-5", color)} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <Badge 
            variant="outline"
            className={cn(
              "flex items-center gap-1 text-xs",
              trend.isPositive 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            )}
          >
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend.value)}%
          </Badge>
        )}
      </div>
    </Card>
  );
};

/**
 * Grid Container para organizar múltiples SummaryCards
 */
export const SummaryCardGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ 
  children, 
  columns = 4 
}) => {
  return (
    <div className={cn(
      "grid gap-6",
      columns === 1 ? "grid-cols-1" : "",
      columns === 2 ? "grid-cols-1 md:grid-cols-2" : "",
      columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
      columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : ""
    )}>
      {children}
    </div>
  );
};