"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Users, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PlansHeader Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. PRIMING
 *    - Título emocional por rol
 *    - Beneficios destacados
 *    - Ahorro visible (-20%)
 *    - Urgencia sutil
 * 
 * 2. AVERSIÓN A LA PÉRDIDA
 *    - Badge de descuento prominente
 *    - "Ahorra X al año" visible
 *    - Comparación de ahorro
 * 
 * 3. AFFORDANCE
 *    - Toggle visual claro
 *    - Estados activo/inactivo
 *    - Animaciones suaves
 *    - Feedback inmediato
 * 
 * 4. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos por rol
 *    - Labels claros
 *    - Estado visible
 * 
 * 5. CREDIBILIDAD
 *    - Números específicos
 *    - Beneficios concretos
 *    - Social proof sutil
 * 
 * 6. JERARQUÍA VISUAL
 *    - Título destacado
 *    - Subtítulo secundario
 *    - Toggle terciario
 *    - Badge de ahorro
 */

// Tipos
export type UserRole = "paciente" | "proveedor";
export type BillingCycle = "monthly" | "yearly";

interface PlansHeaderProps {
  role: UserRole;
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}

export const PlansHeader: React.FC<PlansHeaderProps> = ({ 
  role, 
  billingCycle, 
  setBillingCycle 
}) => {
  // Helper para calcular ahorro anual - AVERSIÓN A LA PÉRDIDA
  const calculateYearlySavings = () => {
    // Asumiendo plan base de $50/mes
    const monthlyBase = 50;
    const yearlyTotal = monthlyBase * 12;
    const savings = Math.round(yearlyTotal * 0.2);
    return savings;
  };

  const yearlySavings = calculateYearlySavings();

  // Content por rol - PRIMING
  const roleContent = {
    paciente: {
      title: "Tu bienestar, al siguiente nivel",
      subtitle: "Accede a descuentos exclusivos y funcionalidades premium para cuidar tu salud",
      icon: Heart,
      highlight: "Miles de pacientes confían en nosotros"
    },
    proveedor: {
      title: "Escala tu práctica médica",
      subtitle: "Herramientas profesionales diseñadas para gestionar más pacientes y aumentar tus ingresos",
      icon: TrendingUp,
      highlight: "Únete a +500 profesionales de la salud"
    }
  };

  const content = roleContent[role];
  const Icon = content.icon;

  return (
    <div className="text-center mb-16 space-y-6">
      
      {/* Icon Badge - RECONOCIMIENTO */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="inline-flex items-center justify-center"
      >
        <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 shadow-lg">
          <Icon className="w-8 h-8 text-purple-400" />
        </div>
      </motion.div>

      {/* Title - JERARQUÍA VISUAL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
          <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
            {content.title}
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          {content.subtitle}
        </p>

        {/* Social Proof Badge - CREDIBILIDAD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full"
        >
          <Users className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300 font-medium">
            {content.highlight}
          </span>
        </motion.div>
      </motion.div>

      {/* Billing Toggle - AFFORDANCE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        
        {/* Savings Preview - AVERSIÓN A LA PÉRDIDA */}
        {billingCycle === "yearly" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">
              ¡Ahorra ${yearlySavings} al año con el plan anual!
            </span>
          </motion.div>
        )}

        {/* Toggle Buttons */}
        <div className="inline-flex items-center p-1.5 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl">
          
          {/* Monthly Button */}
          <Button
            variant="ghost"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "relative rounded-xl px-8 py-3 font-semibold transition-all duration-300",
              billingCycle === "monthly" 
                ? "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg border border-gray-600" 
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            )}
          >
            {billingCycle === "monthly" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              Mensual
            </span>
          </Button>

          {/* Yearly Button */}
          <Button
            variant="ghost"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "relative rounded-xl px-8 py-3 font-semibold transition-all duration-300",
              billingCycle === "yearly" 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30" 
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            )}
          >
            {billingCycle === "yearly" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              Anual
              <Badge className={cn(
                "ml-1 text-xs px-2 py-0.5 font-bold transition-all",
                billingCycle === "yearly"
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-purple-500/20 text-purple-300 border-purple-500/30"
              )}>
                <Zap className="w-3 h-3 mr-1" />
                -20%
              </Badge>
            </span>
          </Button>
        </div>

        {/* Info Text - CREDIBILIDAD */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-gray-500"
        >
          {billingCycle === "yearly" 
            ? "Facturación anual • Cancela cuando quieras"
            : "Sin compromiso • Cancela en cualquier momento"}
        </motion.p>
      </motion.div>

      {/* Separator with gradient */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto rounded-full"
      />
    </div>
  );
};

/**
 * Variante compacta para páginas con espacio limitado
 */
export const PlansHeaderCompact: React.FC<PlansHeaderProps> = ({ 
  role, 
  billingCycle, 
  setBillingCycle 
}) => {
  return (
    <div className="text-center mb-8 space-y-4">
      <h2 className="text-2xl md:text-3xl font-bold text-white">
        {role === "paciente" 
          ? "Elige tu plan" 
          : "Planes para profesionales"}
      </h2>

      <div className="inline-flex items-center p-1 bg-gray-900 border border-gray-800 rounded-xl">
        <Button
          variant="ghost"
          onClick={() => setBillingCycle("monthly")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm transition-all",
            billingCycle === "monthly" 
              ? "bg-gray-800 text-white" 
              : "text-gray-400 hover:text-white"
          )}
        >
          Mensual
        </Button>
        <Button
          variant="ghost"
          onClick={() => setBillingCycle("yearly")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm transition-all",
            billingCycle === "yearly" 
              ? "bg-purple-600 text-white" 
              : "text-gray-400 hover:text-white"
          )}
        >
          Anual
          <Badge className="ml-1 bg-purple-500/20 text-purple-300 text-xs">
            -20%
          </Badge>
        </Button>
      </div>
    </div>
  );
};