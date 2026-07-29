"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  TrendingUp,
  Info,
  CheckCircle2,
  Star,
} from "lucide-react";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
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
  index = 0,
}) => {
  const [, setIsHovered] = useState(false);
  const t = useTranslations("SettingsSubscription.PricingCard");
  const locale = useLocale();

  const getDailyPrice = () => {
    const days = plan.duration === "monthly" ? 30 : 365;
    return (plan.price / days).toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.08,
      }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("h-full relative group font-sans", isPopular ? "z-10" : "z-0")}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-20">
          <motion.div
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-emerald-600 text-white px-4 py-1 text-xs font-bold rounded-full shadow-2xs flex items-center gap-1.5 border border-emerald-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{t("popular_badge")}</span>
              <Star className="w-3.5 h-3.5 fill-current" />
            </span>
          </motion.div>
        </div>
      )}

      {/* Recommended Badge */}
      {plan.recommended && !isPopular && (
        <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-20">
          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-4 py-1 text-xs font-bold rounded-full shadow-2xs flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("recommended_badge")}</span>
          </span>
        </div>
      )}

      {/* Limited Offer Badge */}
      {plan.limitedOffer && (
        <div className="absolute top-4 right-4 z-20">
          <span className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-full text-[10px] font-bold px-2.5 py-1 flex items-center gap-1 shadow-2xs">
            <Zap className="w-3 h-3 text-amber-500" strokeWidth={2} />
            <span>{t("limited_offer_badge")}</span>
          </span>
        </div>
      )}

      <Card
        className={cn(
          "h-full flex flex-col overflow-hidden transition-all duration-200 rounded-3xl bg-white dark:bg-[#0a0a0a] shadow-sm",
          isPopular
            ? "border-2 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/10"
            : "border border-gray-100 dark:border-gray-800 hover:border-emerald-500/30 hover:shadow-md"
        )}
      >
        {/* Header */}
        <CardHeader
          className={cn(
            "p-6 sm:p-8 pb-6 text-center space-y-3 border-b transition-colors",
            isPopular
              ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
              : "bg-gray-50/50 dark:bg-[#050505] border-gray-100 dark:border-gray-800"
          )}
        >
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {plan.name}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 min-h-[36px] leading-relaxed px-2">
              {plan.description}
            </p>
          </div>

          {/* Price */}
          <div className="pt-2">
            <div className="flex items-baseline justify-center gap-1 font-mono">
              <span className="text-xs font-bold text-gray-400">
                {locale === "en" && plan.price > 0 ? "~$" : "$"}
              </span>
              <span className="font-bold text-4xl sm:text-5xl text-gray-900 dark:text-white tracking-tight">
                {plan.price.toLocaleString()}
              </span>
              <span className="text-gray-400 font-semibold text-xs ml-1 font-sans">
                {locale === "en" && plan.price > 0 ? " USD" : ""}/
                {plan.duration === "monthly"
                  ? t("duration_monthly")
                  : t("duration_yearly")}
              </span>
            </div>

            {/* Daily price */}
            <p className="text-[11px] font-semibold text-gray-400 mt-1.5 font-mono">
              {t("daily_price", { amount: getDailyPrice() })}
            </p>
          </div>

          {/* Savings Badge */}
          {plan.savings && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full px-3 py-1 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>
                  {t("savings_badge", { amount: plan.savings.toLocaleString() })}
                </span>
              </span>
            </div>
          )}
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6 sm:p-8 pt-6 flex-grow space-y-4">
          {/* Features List */}
          <ul className="space-y-3.5">
            {plan.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-left group/item"
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    "mt-0.5 p-1 rounded-lg shrink-0 transition-colors border shadow-2xs",
                    feature.highlighted
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40"
                      : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {feature.icon || <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p
                    className={cn(
                      "text-xs font-bold leading-tight transition-colors",
                      feature.highlighted
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white"
                    )}
                  >
                    {feature.title}
                  </p>
                  {feature.description && (
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  )}
                </div>

                {/* Highlighted indicator */}
                {feature.highlighted && (
                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                    {t("premium_feature")}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Extra info */}
          {plan.features.length > 10 && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-center text-gray-400 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("more_features", { count: plan.features.length - 10 })}</span>
              </p>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-6 sm:p-8 pt-0 mt-auto bg-transparent">
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => onSelect(plan)}
              className={cn(
                "w-full h-11 px-5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0",
                isPopular
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] shadow-2xs"
              )}
            >
              {isPopular ? (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>{t("btn_popular")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </>
              ) : (
                <>
                  <span>{t("btn_regular", { planName: plan.name })}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                </>
              )}
            </button>

            <p className="text-[11px] font-medium text-center text-gray-400">
              {t("trust_indicator")}
            </p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};