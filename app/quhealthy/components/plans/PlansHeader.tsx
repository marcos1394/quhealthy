"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillingCycle } from '@/app/quhealthy/types/plans';

interface PlansHeaderProps {
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}

export const PlansHeader: React.FC<PlansHeaderProps> = ({ billingCycle, setBillingCycle }) => (
  <div className="text-center mb-12">
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4"
    >
      Potencia tu Práctica Profesional
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="text-gray-300 text-lg max-w-3xl mx-auto"
    >
      Elige el plan QuHealthy que impulsa tu crecimiento. Gestiona citas, pacientes, marketing y finanzas con herramientas inteligentes.
    </motion.p>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1}}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex justify-center mt-10"
    >
      <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700 p-1.5 rounded-lg flex space-x-2 shadow-md">
        <Button
          variant={billingCycle === "monthly" ? "default" : "ghost"}
          onClick={() => setBillingCycle("monthly")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${billingCycle === "monthly" ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
        >
          Mensual
        </Button>
        <Button
          variant={billingCycle === "yearly" ? "default" : "ghost"}
          onClick={() => setBillingCycle("yearly")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${billingCycle === "yearly" ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
        >
          Anual
          <Badge variant="outline" className="ml-2 bg-purple-500/20 border-purple-500/50 text-purple-300 text-xs px-1.5 py-0.5 font-semibold tracking-wide">
            AHORRA HASTA 20%
          </Badge>
        </Button>
      </div>
    </motion.div>
  </div>
);