"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Sparkles,
  Zap,
  TrendingUp,
  Info,
  CheckCircle2,
  Star
} from "lucide-react";

// ShadCN UI
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * PricingCard Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. AVERSIÓN A LA PÉRDIDA
 *    - Ahorros destacados
 *    - "Solo hoy" sutil
 *    - Valor por dinero visible
 *    - Comparación implícita
 * 
 * 2. PRIMING
 *    - "Más Popular" prominente
 *    - Badge de recomendado
 *    - Colores de éxito (purple/emerald)
 *    - Iconos de beneficio
 * 
 * 3. JERARQUÍA VISUAL
 *    - Precio destacado (4xl)
 *    - Features secundarias
 *    - CTA terciario
 *    - Badges cuaternarios
 * 
 * 4. AFFORDANCE
 *    - Hover lift effect
 *    - CTA con gradiente
 *    - Estados claros
 *    - Feedback visual
 * 
 * 5. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos por feature
 *    - Checkmarks visuales
 *    - Labels claros
 *    - Precio vs periodo
 * 
 * 6. CREDIBILIDAD
 *    - Features específicas
 *    - Números concretos
 *    - Descripciones claras
 *    - Sin sorpresas
 */

// Tipos
export interface PlanFeature {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
}

export interface Plan {
  id: string | number;
  name: string;
  description: string;
  price: number;
  duration: string; // 'monthly' | 'yearly'
  features: PlanFeature[];
  savings?: number;
  isPopular?: boolean;
  recommended?: boolean;
  limitedOffer?: boolean;
}

interface PricingCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isPopular?: boolean;
  index?: number;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  onSelect, 
  isPopular,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Helper para calcular precio diario - CREDIBILIDAD
  const getDailyPrice = () => {
    const days = plan.duration === 'monthly' ? 30 : 365;
    return (plan.price / days).toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: index * 0.1 
      }}
      whileHover={{ y: -12, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "h-full relative group",
        isPopular ? 'z-10' : 'z-0'
      )}
    >
      
      {/* Popular Badge - PRIMING */}
      {isPopular && (
        <div className="absolute -top-5 left-0 right-0 flex justify-center z-20">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider shadow-2xl border-0 flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              Más Popular
              <Star className="w-4 h-4 fill-current" />
            </Badge>
          </motion.div>
        </div>
      )}

      {/* Recommended Badge - PRIMING */}
      {plan.recommended && !isPopular && (
        <div className="absolute -top-5 left-0 right-0 flex justify-center z-20">
          <Badge className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider shadow-xl border-0 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recomendado
          </Badge>
        </div>
      )}

      {/* Limited Offer Badge - URGENCIA */}
      {plan.limitedOffer && (
        <div className="absolute top-4 right-4 z-20">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs px-2 py-1 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Oferta Limitada
            </Badge>
          </motion.div>
        </div>
      )}

      <Card className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-300",
        "backdrop-blur-sm",
        isPopular 
          ? 'bg-gradient-to-b from-purple-900/20 to-gray-900 border-2 border-purple-500/50 shadow-2xl shadow-purple-900/30 ring-2 ring-purple-500/30' 
          : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/80 hover:shadow-xl',
        isHovered && !isPopular ? "border-purple-500/30" : ""
      )}>
        
        {/* Header - JERARQUÍA VISUAL */}
        <CardHeader className="p-8 pb-6 text-center space-y-4">
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {plan.name}
            </h3>
            <p className="text-sm text-gray-400 min-h-[48px] leading-relaxed px-2">
              {plan.description}
            </p>
          </div>

          {/* Price - VALOR DESTACADO */}
          <motion.div 
            className="pt-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-sm text-gray-500 font-medium">$</span>
              <span className={cn(
                "font-black tracking-tighter",
                isPopular 
                  ? "text-5xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  : "text-5xl text-white"
              )}>
                {plan.price}
              </span>
              <span className="text-gray-500 font-medium text-base">
                /{plan.duration === 'monthly' ? 'mes' : 'año'}
              </span>
            </div>
            
            {/* Daily price - CREDIBILIDAD */}
            <p className="text-xs text-gray-600 mt-2">
              Solo ${getDailyPrice()} por día
            </p>
          </motion.div>

          {/* Savings Badge - AVERSIÓN A LA PÉRDIDA */}
          {plan.savings && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 text-emerald-400 border-emerald-500/30 px-4 py-1.5 text-sm font-bold"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                ¡Ahorras ${plan.savings} al año!
              </Badge>
            </motion.div>
          )}
        </CardHeader>

        {/* Content - VALOR POR DINERO */}
        <CardContent className="p-8 pt-6 flex-grow">
          
          {/* Separator */}
          <div className={cn(
            "w-full h-px mb-6 bg-gradient-to-r",
            isPopular 
              ? "from-transparent via-purple-500/50 to-transparent"
              : "from-transparent via-gray-800 to-transparent"
          )} />

          {/* Features List */}
          <ul className="space-y-4">
            {plan.features.map((feature, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className="flex items-start gap-3 text-left group/item"
              >
                {/* Icon Container */}
                <div className={cn(
                  "mt-0.5 p-1.5 rounded-lg shrink-0 transition-all duration-300",
                  feature.highlighted 
                    ? "bg-purple-500/20 text-purple-400 ring-2 ring-purple-500/50"
                    : isPopular 
                      ? "bg-purple-500/10 text-purple-400 group-hover/item:bg-purple-500/20"
                      : "bg-gray-800 text-gray-400 group-hover/item:bg-gray-700"
                )}>
                  {feature.icon || <Check className="w-4 h-4" />}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold transition-colors",
                    feature.highlighted 
                      ? "text-white"
                      : "text-gray-200 group-hover/item:text-white"
                  )}>
                    {feature.title}
                  </p>
                  {feature.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  )}
                </div>

                {/* Highlighted indicator */}
                {feature.highlighted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                  >
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs px-2 py-0.5">
                      Premium
                    </Badge>
                  </motion.div>
                )}
              </motion.li>
            ))}
          </ul>

          {/* Extra info if needed */}
          {plan.features.length > 10 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-center text-purple-400 font-medium flex items-center justify-center gap-1">
                <Info className="w-3 h-3" />
                Y {plan.features.length - 10} beneficios más
              </p>
            </div>
          )}
        </CardContent>

        {/* Footer - CTA OPTIMIZADO */}
        <CardFooter className="p-8 pt-0">
          <div className="w-full space-y-3">
            
            {/* Primary CTA */}
            <Button 
              onClick={() => onSelect(plan)} 
              className={cn(
                "w-full h-14 text-base font-bold shadow-2xl transition-all duration-300 group/btn",
                isPopular 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 hover:shadow-purple-500/50' 
                  : 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-600',
                isHovered ? "scale-[1.02]" : ""
              )}
            >
              <span className="flex items-center gap-2">
                {isPopular ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Comenzar Ahora
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    Elegir {plan.name}
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>

            {/* Trust indicator */}
            <p className="text-xs text-center text-gray-600">
              Sin tarjeta de crédito • Cancela cuando quieras
            </p>
          </div>
        </CardFooter>

        {/* Hover glow effect - AFFORDANCE */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute inset-0 -z-10 blur-2xl transition-opacity",
                isPopular 
                  ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                  : "bg-gradient-to-br from-gray-700/10 to-gray-800/10"
              )}
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};