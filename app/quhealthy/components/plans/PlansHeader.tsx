"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { BillingCycle } from '@/app/quhealthy/types/plans';

interface PlansHeaderProps {
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}

export const PlansHeader: React.FC<PlansHeaderProps> = ({ billingCycle, setBillingCycle }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1]
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center mb-16 relative"
    >
      {/* Background gradient blur effects */}
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -top-10 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Header badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-6"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">Planes Profesionales</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200">
            Potencia tu
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-blue-400 relative">
            Práctica Profesional
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-gray-300 text-xl max-w-4xl mx-auto leading-relaxed mb-12"
        >
          Transforma tu consulta con{" "}
          <span className="text-purple-300 font-semibold">herramientas inteligentes</span>{" "}
          para gestión de citas, pacientes, marketing y finanzas.
          <br />
          <span className="text-gray-400 text-lg">
            Únete a más de 5,000 profesionales que ya confían en QuHealthy
          </span>
        </motion.p>

        {/* Billing toggle */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center"
        >
          <div className="relative bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-2 rounded-2xl shadow-2xl">
            {/* Active indicator */}
            <motion.div
              className="absolute top-2 bottom-2 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl shadow-lg"
              initial={false}
              animate={{
                left: billingCycle === "monthly" ? "8px" : "calc(50% + 4px)",
                right: billingCycle === "monthly" ? "calc(50% + 4px)" : "8px",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            <div className="relative flex space-x-2">
              <Button
                variant="ghost"
                onClick={() => setBillingCycle("monthly")}
                className={`px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 relative z-10 ${
                  billingCycle === "monthly" 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Mensual
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setBillingCycle("annual")}
                className={`px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 relative z-10 flex items-center gap-3 ${
                  billingCycle === "annual" 
                    ? 'text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Anual
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-2 py-1 font-bold shadow-lg">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  AHORRA 20%
                </Badge>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center items-center gap-8 mt-12 text-sm text-gray-400"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Soporte 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span>Datos Seguros</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};