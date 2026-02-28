"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';
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

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  duration: string;
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
  const t = useTranslations('SettingsSubscription.PricingCard');

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
      whileHover={{ y: -8, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "h-full relative group",
        isPopular ? 'z-10' : 'z-0'
      )}
    >

      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Badge className="bg-medical-600 text-white px-5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg border border-medical-500 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" />
              {t('popular_badge')}
              <Star className="w-3.5 h-3.5 fill-current" />
            </Badge>
          </motion.div>
        </div>
      )}

      {/* Recommended Badge */}
      {plan.recommended && !isPopular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
          <Badge className="bg-emerald-600 text-white px-5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-md border-0 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            {t('recommended_badge')}
          </Badge>
        </div>
      )}

      {/* Limited Offer Badge */}
      {plan.limitedOffer && (
        <div className="absolute top-4 right-4 z-20">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-xs px-2 py-1 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {t('limited_offer_badge')}
            </Badge>
          </motion.div>
        </div>
      )}

      <Card className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-300",
        isPopular
          ? 'bg-white dark:bg-slate-900 border-2 border-medical-500 shadow-xl shadow-medical-500/10'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg shadow-sm',
        isHovered && !isPopular ? "border-medical-300 dark:border-medical-500/50" : ""
      )}>

        {/* Header */}
        <CardHeader className={cn("p-8 pb-6 text-center space-y-4", isPopular ? "bg-medical-50 dark:bg-medical-500/5" : "bg-slate-50 dark:bg-slate-800/20")}>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {plan.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 min-h-[40px] leading-relaxed px-2">
              {plan.description}
            </p>
          </div>

          {/* Price */}
          <motion.div
            className="pt-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-sm text-slate-400 font-medium">$</span>
              <span className={cn(
                "font-black tracking-tighter text-5xl text-slate-900 dark:text-white"
              )}>
                {plan.price.toLocaleString()}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium text-sm ml-1">
                /{plan.duration === 'monthly' ? t('duration_monthly') : t('duration_yearly')}
              </span>
            </div>

            {/* Daily price */}
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {t('daily_price', { amount: getDailyPrice() })}
            </p>
          </motion.div>

          {/* Savings Badge */}
          {plan.savings && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 mt-2 text-xs font-bold"
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                {t('savings_badge', { amount: plan.savings.toLocaleString() })}
              </Badge>
            </motion.div>
          )}
        </CardHeader>

        {/* Content */}
        <CardContent className="p-8 pt-6 flex-grow">
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
                  "mt-0.5 p-1 rounded-md shrink-0 transition-all duration-300",
                  feature.highlighted
                    ? "bg-medical-100 text-medical-600 dark:bg-medical-500/20 dark:text-medical-400"
                    : isPopular
                      ? "bg-medical-50 text-medical-500 dark:bg-medical-500/10 dark:text-medical-400"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 group-hover/item:text-medical-500 transition-colors"
                )}>
                  {feature.icon || <Check className="w-4 h-4" />}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    feature.highlighted
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300"
                  )}>
                    {feature.title}
                  </p>
                  {feature.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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
                    <Badge className="bg-medical-50 text-medical-600 dark:bg-medical-500/20 dark:text-medical-400 border border-medical-200 dark:border-medical-500/30 text-[10px] px-1.5 py-0 shadow-none">
                      {t('premium_feature')}
                    </Badge>
                  </motion.div>
                )}
              </motion.li>
            ))}
          </ul>

          {/* Extra info */}
          {plan.features.length > 10 && (
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-center text-medical-600 dark:text-medical-400 font-medium flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                {t('more_features', { count: plan.features.length - 10 })}
              </p>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-8 pt-0 mt-auto">
          <div className="w-full space-y-3">
            <Button
              onClick={() => onSelect(plan)}
              className={cn(
                "w-full h-12 text-sm font-bold transition-all duration-300 group/btn shadow-sm",
                isPopular
                  ? 'bg-medical-600 hover:bg-medical-700 text-white'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700',
                isHovered ? "scale-[1.02]" : ""
              )}
            >
              <span className="flex items-center gap-2">
                {isPopular ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {t('btn_popular')}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    {t('btn_regular', { planName: plan.name })}
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500 font-medium tracking-tight">
              {t('trust_indicator')}
            </p>
          </div>
        </CardFooter>

      </Card>
    </motion.div>
  );
};