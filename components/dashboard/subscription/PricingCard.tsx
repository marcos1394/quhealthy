"use client";

import React from 'react';
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";

// ShadCN UI
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Tipos
export interface PlanFeature {
    title: string;
    description?: string;
    icon?: React.ReactNode; 
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
}

interface PricingCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isPopular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect, isPopular }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`h-full relative ${isPopular ? 'z-10' : 'z-0'}`}
  >
    {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-wider shadow-lg border-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" /> Más Popular
            </Badge>
        </div>
    )}

    <Card className={`
        h-full flex flex-col bg-gray-900 overflow-hidden transition-all duration-300
        ${isPopular 
            ? 'border-purple-500/50 shadow-2xl shadow-purple-900/20 ring-1 ring-purple-500/50' 
            : 'border-gray-800 hover:border-gray-700 hover:bg-gray-900/80'}
    `}>
      <CardHeader className="p-8 pb-4 text-center">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-sm text-gray-400 min-h-[40px] leading-relaxed">{plan.description}</p>
        
        <div className="mt-6 flex items-baseline justify-center">
            <span className="text-4xl font-extrabold text-white tracking-tight">${plan.price}</span>
            <span className="text-gray-500 font-medium ml-1 text-lg">/{plan.duration === 'monthly' ? 'mes' : 'año'}</span>
        </div>
        
        {plan.savings && (
            <Badge variant="secondary" className="mt-3 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 self-center">
                Ahorras ${plan.savings} al año
            </Badge>
        )}
      </CardHeader>

      <CardContent className="p-8 pt-4 flex-grow">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-6" />
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-left">
              <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${isPopular ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                {feature.icon || <Check className="w-3.5 h-3.5" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">{feature.title}</p>
                {feature.description && <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="p-8 pt-0">
        <Button 
            onClick={() => onSelect(plan)} 
            className={`w-full py-6 text-base font-semibold shadow-lg transition-all ${
                isPopular 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0' 
                : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
            }`}
        >
          Elegir Plan <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);