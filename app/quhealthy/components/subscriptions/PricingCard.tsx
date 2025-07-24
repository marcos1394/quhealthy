"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Plan } from '@/app/quhealthy/types/subscriptions';

interface PricingCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isPopular: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect, isPopular }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    layout
    className={`relative ${isPopular ? 'scale-105' : ''}`}
  >
    <Card className={`h-full bg-gray-800 border-gray-700 overflow-hidden ${isPopular ? 'ring-2 ring-teal-500' : ''}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-teal-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
          Popular
        </div>
      )}
      <CardHeader className="p-6">
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-white">${plan.price}</span>
            <span className="text-gray-400 ml-2">/{plan.duration}</span>
          </div>
          {plan.savings && (
            <Badge className="mt-2 bg-teal-500/20 text-teal-400">Ahorra ${plan.savings}/año</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="text-teal-400 mt-1">{feature.icon}</div>
              <div>
                <p className="text-sm font-medium text-white">{feature.title}</p>
                <p className="text-xs text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={() => onSelect(plan)} className={`w-full mt-6 ${isPopular ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          Seleccionar plan <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);