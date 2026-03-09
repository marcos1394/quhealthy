"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PreferenceCard Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. JERARQUÍA VISUAL
 *    - Icono destacado en container
 *    - Título prominente
 *    - Descripción secundaria
 *    - Contenido terciario
 * 
 * 2. AFFORDANCE
 *    - Hover effects sutiles
 *    - Bordes con gradiente
 *    - Sombra al hover
 *    - Icon container con glow
 * 
 * 3. FEEDBACK VISUAL
 *    - Animaciones suaves
 *    - Transiciones de estado
 *    - Hover lift effect
 * 
 * 4. RECONOCIMIENTO
 *    - Iconos descriptivos
 *    - Colores consistentes
 *    - Layout predecible
 * 
 * 5. FIGURA/FONDO (Gestalt)
 *    - Card elevado
 *    - Separación clara
 *    - Agrupación visual
 * 
 * 6. SIMILITUD (Gestalt)
 *    - Estructura consistente
 *    - Spacing uniforme
 *    - Estilo predecible
 */

interface PreferenceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
  highlighted?: boolean;
  onClick?: () => void;
}

export const PreferenceCard: React.FC<PreferenceCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  children, 
  className = "",
  badge,
  highlighted = false,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { y: -2 } : {}}
      className={cn(
        onClick ? "cursor-pointer" : ""
      )} 
      onClick={onClick}
    >
      <Card 
        className={cn(
          "bg-slate-900/50 backdrop-blur-sm border-slate-800 shadow-lg transition-all duration-300",
          "hover:border-slate-700 hover:shadow-xl hover:shadow-purple-500/5",
          highlighted ? "border-purple-500/30 bg-purple-500/5 ring-1 ring-purple-500/20" : "",
          onClick ? "hover:border-purple-500/40" : "",
          className
        )}
      >
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-5">
            
            {/* Icon Container - AFFORDANCE */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200,
                delay: 0.1 
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "relative p-4 rounded-2xl shrink-0 transition-all duration-300",
                "bg-gradient-to-br from-medical-500/10 to-medical-600/10",
                "border border-purple-500/20",
                "shadow-lg shadow-purple-500/10",
                "group-hover:shadow-xl group-hover:shadow-medical-500/20"
              )}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-medical-500/20 to-medical-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <Icon className={cn(
                "relative w-6 h-6 md:w-7 md:h-7 transition-colors duration-300",
                highlighted ? "text-purple-300" : "text-purple-400"
              )} />

              {/* Pulse animation para highlighted */}
              {highlighted && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-purple-500"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>
            
            {/* Content - JERARQUÍA VISUAL */}
            <div className="flex-1 space-y-4 min-w-0">
              
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={cn(
                        "text-lg md:text-xl font-bold tracking-tight",
                        highlighted ? "text-white" : "text-white/90"
                      )}>
                        {title}
                      </h3>
                      
                      {/* Badge opcional */}
                      {badge && (
                        <Badge 
                          variant="outline" 
                          className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {badge}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm md:text-base text-slate-400 mt-1.5 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Click indicator */}
                  {onClick && (
                    <motion.div
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Separator - FIGURA/FONDO */}
              <div className={cn(
                "w-full h-px transition-colors duration-300",
                highlighted 
                  ? "bg-gradient-to-r from-medical-500/30 via-pink-500/30 to-transparent" 
                  : "bg-gradient-to-r from-slate-800 via-gray-700 to-transparent"
              )} />
              
              {/* Children Content */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Variante compacta para espacios reducidos
 */
export const PreferenceCardCompact: React.FC<PreferenceCardProps> = (props) => {
  const { icon: Icon, title, description, children, className, badge, highlighted } = props;

  return (
    <Card 
      className={cn(
        "bg-slate-900/50 border-slate-800 shadow-md transition-all duration-300",
        "hover:border-slate-700",
        highlighted ? "border-purple-500/30 bg-purple-500/5" : "",
        className ? "" + className : ""
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            "bg-gradient-to-br from-medical-500/10 to-medical-600/10",
            "border border-purple-500/20"
          )}>
            <Icon className="w-5 h-5 text-purple-400" />
          </div>
          
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">{title}</h4>
              {badge && (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">{description}</p>
            <div className="space-y-2">
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Variante con acción/link
 */
export const PreferenceCardAction: React.FC<PreferenceCardProps & { 
  actionLabel?: string;
  onAction?: () => void;
}> = (props) => {
  const { actionLabel = "Configurar", onAction, ...cardProps } = props;

  return (
    <PreferenceCard {...cardProps}>
      {props.children}
      
      {onAction && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "mt-4 w-full px-4 py-2 rounded-lg font-medium text-sm",
            "bg-purple-500/10 text-purple-400 border border-purple-500/20",
            "hover:bg-medical-500/20 hover:border-purple-500/30",
            "transition-all duration-200",
            "flex items-center justify-center gap-2"
          )}
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </PreferenceCard>
  );
};