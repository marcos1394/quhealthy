"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: string; // Clase Tailwind para el icono (ej: text-purple-400)
  bgColor?: string; // Clase Tailwind para el fondo del icono (ej: bg-purple-500/10)
  borderColor?: string; // Clase Tailwind para el borde
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "text-purple-400",
  bgColor = "bg-purple-500/10",
  borderColor = "border-gray-800",
  trend 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card className={`h-full bg-gray-900 border ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group`}>
        
        {/* Efecto de fondo sutil al hover */}
        <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-4">
            {/* Icono con fondo */}
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            
            {/* Tendencia (Trend) */}
            {trend && (
              <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full bg-gray-800/50 backdrop-blur-sm ${
                trend.isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                <span>{trend.isPositive ? '▲' : '▼'} {trend.value}%</span>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</p>
          </div>
        </CardContent>

        {/* Línea decorativa inferior animada */}
        <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r from-transparent via-${color.replace('text-', '')} to-transparent`} />
      </Card>
    </motion.div>
  );
};