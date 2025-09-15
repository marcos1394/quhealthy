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
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          
          {trend && (
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              <svg 
                className={`w-4 h-4 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1 group-hover:text-slate-300 transition-colors duration-300">
            {title}
          </p>
          <p className="text-2xl font-bold text-white group-hover:text-white transition-colors duration-300">
            {value}
          </p>
        </div>
      </div>

      {/* Hover Effect Line */}
      <div className={`absolute bottom-0 left-0 h-1 ${bgColor?.replace('/10', '')} w-0 group-hover:w-full transition-all duration-500`} />
    </motion.div>
  );
};