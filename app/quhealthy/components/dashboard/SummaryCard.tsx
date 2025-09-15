"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  hoverColor?: string; // <-- Nueva prop para el color del hover
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
  borderColor = "border-purple-500/20",
  hoverColor = "bg-purple-500", // <-- Valor por defecto para la nueva prop
  trend 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-2xl border ${borderColor}
        bg-slate-800/60 backdrop-blur-xl shadow-xl
        hover:shadow-2xl transition-all duration-300
        group cursor-pointer
      `}
    >
      {/* Background Gradient on Hover */}
      <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.isPositive ? '▲' : '▼'} {trend.value}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
        </div>
      </div>

      {/* --- LÍNEA CORREGIDA --- */}
      {/* Ahora usamos la nueva prop 'hoverColor' directamente, sin '.replace()' */}
      <div className={`absolute bottom-0 left-0 h-1 ${hoverColor} w-0 group-hover:w-full transition-all duration-500`} />
    </motion.div>
  );
};