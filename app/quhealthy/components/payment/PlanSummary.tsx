"use client";
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface PlanSummaryProps {
  planName: string;
  planPrice: number;
  planDuration: string;
}

const formatPrice = (price: number): string => {
    return price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

export const PlanSummary: React.FC<PlanSummaryProps> = ({ planName, planPrice, planDuration }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center mb-12"
  >
    <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
      Finalizar Suscripción
    </h1>
    <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
      Estás a un paso de potenciar tu práctica. Selecciona tu método de pago preferido.
    </p>
    <div className="inline-block bg-gray-800/70 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-base px-4 py-1">
          {planName}
        </Badge>
        <div className="flex items-baseline">
            <div className="text-2xl font-bold text-white">{formatPrice(planPrice)}</div>
            <div className="text-gray-400 ml-1.5">/ {planDuration}</div>
        </div>
      </div>
    </div>
  </motion.div>
);