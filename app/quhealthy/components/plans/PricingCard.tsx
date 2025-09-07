"use client";
import React from 'react';
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Star, Zap } from "lucide-react";
import { Plan, PlanFeature } from '@/app/quhealthy/types/plans';

interface PricingCardProps {
  plan: Plan;
  isPopular: boolean;
  index: number;
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
  if (feature.title.toLowerCase().includes('comisión') && typeof plan.transactionFee === 'number') desc = `${plan.transactionFee}% por operación`;
  return desc;
};

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isPopular, index }) => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1]
      }
    },
    hover: {
      y: -8,
      scale: isPopular ? 1.05 : 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const getGradientClasses = () => {
    if (isPopular) {
      return "bg-gradient-to-br from-purple-900/90 via-gray-900/95 to-blue-900/90";
    }
    return "bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-gray-900/80";
  };

  const getBorderClasses = () => {
    if (isPopular) {
      return "border-2 border-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-clip-border";
    }
    return "border border-gray-700/50 hover:border-gray-600/70";
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="relative h-full flex flex-col group"
    >
      {/* Background glow effect */}
      {isPopular && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
      )}

      <Card className={`relative flex flex-col flex-grow h-full ${getGradientClasses()} ${getBorderClasses()} rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden`}>
        {/* Popular badge */}
        {isPopular && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="absolute -top-1 -right-1 z-20"
          >
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              POPULAR
            </div>
          </motion.div>
        )}

        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full transform rotate-45 translate-x-16 -translate-y-16" />
        </div>

        <CardHeader className="p-8 pb-6">
          {/* Plan name and icon */}
          <div className="flex items-center gap-3 mb-3">
            {isPopular && <Zap className="w-6 h-6 text-amber-400 fill-current" />}
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
          </div>

          <p className="text-gray-300 text-base leading-relaxed min-h-[48px] mb-6">
            {plan.description}
          </p>

          {/* Pricing */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-gray-100'}`}>
                {formatPrice(plan.price)}
              </span>
              <span className="text-gray-400 text-base font-medium">
                / {plan.duration}
              </span>
            </div>

            {plan.duration === 'año' && plan.annualDiscount && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-sm px-3 py-1 font-semibold shadow-lg">
                  🎉 Ahorra {plan.annualDiscount}%
                </Badge>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-0 flex flex-col flex-grow">
          {/* Features list */}
          <div className="space-y-4 flex-grow mb-8">
            {plan.features.map((feature, featureIndex) => (
              <motion.div
                key={featureIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + featureIndex * 0.1 }}
                className="flex items-start gap-4 group/feature"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-100 mb-1 group-hover/feature:text-white transition-colors">
                    {feature.title}
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {formatFeatureDescription(feature, plan)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-auto"
          >
            <Button
              onClick={handleSelectPlan}
              size="lg"
              className={`w-full h-14 text-lg font-semibold rounded-xl shadow-xl transition-all duration-300 transform ${
                isPopular
                  ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 hover:from-purple-500 hover:via-purple-400 hover:to-blue-400 text-white shadow-purple-500/25'
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-gray-800/25'
              } hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group/button`}
            >
              <span className="flex items-center justify-center gap-3">
                Seleccionar Plan
                <ArrowRight className="w-5 h-5 group-hover/button:translate-x-1 transition-transform duration-200" />
              </span>
            </Button>
          </motion.div>

          {/* Additional info for popular plan */}
          {isPopular && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-sm text-purple-300 mt-4 font-medium"
            >
              ⚡ Configuración inmediata • Soporte prioritario
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};