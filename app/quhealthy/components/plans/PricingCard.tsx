"use client";
import React from 'react';
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Plan, PlanFeature } from '@/app/quhealthy/types/plans';

interface PricingCardProps {
  plan: Plan;
  isPopular: boolean;
}

// Formateador de precios
const formatPrice = (price: number): string => {
  return price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

// Formateador de descripciones de características
const formatFeatureDescription = (feature: PlanFeature, plan: Plan): string => {
  let desc = feature.description;
  if (feature.title.toLowerCase().includes('citas') && plan.maxAppointments === "Ilimitados") desc = "Sin límite mensual";
  if (feature.title.toLowerCase().includes('servicios') && plan.maxServices === "Ilimitados") desc = "Sin límite de servicios";
  // ... (añade el resto de tu lógica de formateo aquí)
  if (feature.title.toLowerCase().includes('comisión') && typeof plan.transactionFee === 'number') desc = `${plan.transactionFee}% por operación`;
  return desc;
};

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isPopular }) => {
  const router = useRouter();

  const handleSelectPlan = () => {
    const queryParams = new URLSearchParams({
      planId: plan.id.toString(),
      planName: plan.name,
      planPrice: plan.price.toString(),
      planDuration: plan.duration,
    }).toString();
    router.push(`/quhealthy/profile/providers/payment?${queryParams}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative h-full flex flex-col"
    >
      <Card className={`flex flex-col flex-grow h-full bg-gray-800 border border-gray-700 rounded-xl shadow-md ${isPopular ? "ring-2 ring-purple-500 scale-[1.03]" : "hover:border-gray-600"}`}>
        {isPopular && (
          <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 rounded-bl-xl rounded-tr-lg text-sm font-semibold z-10">
            POPULAR
          </div>
        )}
        <CardHeader className="p-6">
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <p className="text-sm text-gray-400 mt-1 min-h-[40px]">{plan.description}</p>
          <div className="mt-4">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-white">{formatPrice(plan.price)}</span>
              <span className="text-gray-400 ml-1.5 text-sm">/ {plan.duration}</span>
            </div>
            {plan.duration === 'año' && plan.annualDiscount && (
              <Badge variant="outline" className="mt-2 bg-purple-500/10 border-purple-500/30 text-purple-300">
                Ahorra {plan.annualDiscount}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex flex-col flex-grow">
          <div className="space-y-3 flex-grow mb-6">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-purple-400 mt-0.5 flex-shrink-0 w-4 h-4">{feature.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{feature.title}</p>
                  <p className="text-xs text-gray-400">{formatFeatureDescription(feature, plan)}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleSelectPlan} className={`w-full mt-auto ${isPopular ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-700 hover:bg-gray-600"} py-3 text-base`}>
            Seleccionar Plan <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};