"use client"
/* eslint-disable deslop/unused-export */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Users, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
 const t = useTranslations('SettingsSubscription.PlansHeader');

 // Helper para calcular ahorro anual
 const calculateYearlySavings = () => {
 const monthlyBase = 50;
 const yearlyTotal = monthlyBase * 12;
 const savings = Math.round(yearlyTotal * 0.2);
 return savings;
 };

 const yearlySavings = calculateYearlySavings();

 const roleContent = {
 paciente: {
 title: t('role_patient_title'),
 subtitle: t('role_patient_subtitle'),
 icon: Heart,
 highlight: t('role_patient_highlight')
 },
 proveedor: {
 title: t('role_provider_title'),
 subtitle: t('role_provider_subtitle'),
 icon: TrendingUp,
 highlight: t('role_provider_highlight')
 }
 };

 const content = roleContent[role];
 const Icon = content.icon;

 return (
 <div className="text-center mb-16 space-y-6">

 {/* Icon Badge */}
 <motion.div
 initial={{ scale: 0.95, opacity: 0, rotate: -180 }}
 animate={{ scale: 1, rotate: 0 }}
 transition={{ type: "spring", stiffness: 200 }}
 className="inline-flex items-center justify-center.tsx"
 >
 <div className="p-3 bg-black dark:bg-white rounded-none border border-black dark:border-white w-fit">
 <Icon className="w-8 h-8 text-white dark:text-black" />
 </div>
 </motion.div>

 {/* Title */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="space-y-3"
 >
 <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-black dark:text-white">
 {content.title}
 </h1>

 <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed mt-1">
 {content.subtitle}
 </p>

 {/* Social Proof Badge */}
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.3 }}
 className="inline-flex items-center gap-2 px-4 py-2 mt-4 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-none"
 >
 <Users className="w-4 h-4 text-black dark:text-white" />
 <span className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">
 {content.highlight}
 </span>
 </motion.div>
 </motion.div>

 {/* Billing Toggle */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.4 }}
 className="flex flex-col items-center gap-4 mt-8"
 >

 {/* Savings Preview */}
 {billingCycle === "yearly" && (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white rounded-none px-4 py-2 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
 >
 <Sparkles className="w-4 h-4" />
 <span className="text-[10px] font-bold uppercase tracking-widest">
 {t('savings_yearly', { amount: yearlySavings })}
 </span>
 </motion.div>
 )}

 {/* Toggle Buttons */}
 <div className="inline-flex items-center p-1 bg-transparent border border-black/20 dark:border-white/20 rounded-none shadow-none">

 {/* Monthly Button */}
 <Button
 variant="ghost"
 onClick={() => setBillingCycle("monthly")}
 className={cn(
 "relative rounded-none px-8 py-3 font-bold uppercase tracking-widest text-[10px] transition-all duration-300",
 billingCycle === "monthly"
 ? "text-white bg-black dark:text-black dark:bg-white border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
 : "text-gray-500 hover:text-black hover:bg-black/5 dark:hover:bg-white/5 dark:hover:text-white"
 )}
 >
 <span className="relative z-10 flex items-center gap-2">
 {t('toggle_monthly')}
 </span>
 </Button>

 {/* Yearly Button */}
 <Button
 variant="ghost"
 onClick={() => setBillingCycle("yearly")}
 className={cn(
 "relative rounded-none px-8 py-3 font-bold uppercase tracking-widest text-[10px] transition-all duration-300",
 billingCycle === "yearly"
 ? "text-white bg-black dark:text-black dark:bg-white border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
 : "text-gray-500 hover:text-black hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
 )}
 >
 <span className="relative z-10 flex items-center gap-2">
 {t('toggle_yearly')}
 <Badge className={cn(
 "ml-1 text-[9px] px-2 py-0.5 font-bold transition-all shadow-none rounded-none uppercase tracking-widest",
 billingCycle === "yearly"
 ? "bg-white/20 text-white dark:bg-black/20 dark:text-black hover:bg-white/30"
 : "bg-black/5 text-gray-500 dark:bg-white/5 dark:text-gray-400 hover:bg-black/10"
 )}>
 <Zap className="w-3 h-3 mr-1" />
 {t('badge_discount')}
 </Badge>
 </span>
 </Button>
 </div>

 {/* Info Text */}
 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.6 }}
 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-2"
 >
 {billingCycle === "yearly"
 ? t('info_yearly')
 : t('info_monthly')}
 </motion.p>
 </motion.div>

 {/* Separator */}
 <motion.div
 initial={{ scaleX: 0 }}
 animate={{ scaleX: 1 }}
 transition={{ delay: 0.7, duration: 0.5 }}
 className="w-24 h-[1px] bg-black dark:bg-white mx-auto rounded-none mt-8 opacity-20"
 />
 </div>
 );
};

const PlansHeaderCompact: React.FC<PlansHeaderProps> = ({
 role,
 billingCycle,
 setBillingCycle
}) => {
 const t = useTranslations('SettingsSubscription.PlansHeader');

 return (
 <div className="text-center mb-8 space-y-4">
 <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
 {role === "paciente"
 ? t('compact_patient_title')
 : t('compact_provider_title')}
 </h2>

 <div className="inline-flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
 <Button
 variant="ghost"
 onClick={() => setBillingCycle("monthly")}
 className={cn(
 "rounded-lg px-4 py-2 text-sm transition-all",
 billingCycle === "monthly"
 ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
 : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
 )}
 >
 {t('toggle_monthly')}
 </Button>
 <Button
 variant="ghost"
 onClick={() => setBillingCycle("yearly")}
 className={cn(
 "rounded-lg px-4 py-2 text-sm transition-all flex items-center",
 billingCycle === "yearly"
 ? "bg-slate-600 text-white font-medium"
 : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
 )}
 >
 {t('toggle_yearly')}
 <Badge className={cn("ml-2 shadow-none border-0 text-[10px]", billingCycle === "yearly" ? "bg-white/20 hover:bg-white/30" : "bg-slate-50 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300")}>
 {t('badge_discount')}
 </Badge>
 </Button>
 </div>
 </div>
 );
};