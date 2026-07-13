"use client"
/* eslint-disable react-doctor/button-has-type */;
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { useSessionStore } from "@/stores/SessionStore";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { BackendPlan, buildFeaturesForPlan } from "@/lib/subscriptionUtils";

interface UIPlan {
 id: string;
 title: string;
 description: string;
 price: number;
 isPopular: boolean;
 features: { title: string; icon?: React.ReactNode; highlighted?: boolean }[];
 originalId: number;
 planKey: string;
}

const ANNUAL_DISCOUNT = 0.20; // 20% de descuento al pagar anual

const PricingSection: React.FC = () => {
 const t = useTranslations('Pricing');
 const locale = useLocale();
 const { isAuthenticated, role } = useSessionStore();
 const [isAnnual, setIsAnnual] = useState(false);
 const [rawPlans, setRawPlans] = useState<BackendPlan[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 const fetchPlans = async () => {
 try {
 const { data } = await axiosInstance.get<BackendPlan[]>('/api/payments/plans');
 setRawPlans(data);
 } catch (err) {
 console.error("Error fetching plans:", err);
 } finally {
 setIsLoading(false);
 }
 };
 fetchPlans();
 }, []);

 const monthlyPlans = rawPlans.filter(p => p.billingInterval === "MONTHLY");
 const EXCHANGE_RATE = 20;

 const displayPlans: UIPlan[] = monthlyPlans
 .sort((a, b) => a.price - b.price)
 .map((bp) => {
 const nameLower = bp.name.toLowerCase();
 const isPopular = nameLower.includes("estándar") || nameLower.includes("prof");
 
 let planKey = "basic";
 if (nameLower.includes("gratis") || nameLower.includes("free")) planKey = "free";
 else if (nameLower.includes("estándar") || nameLower.includes("standard")) planKey = "standard";
 else if (nameLower.includes("premium")) planKey = "premium";
 else if (nameLower.includes("empresarial") || nameLower.includes("enterprise")) planKey = "enterprise";

 const displayPrice = locale === 'en' ? Math.round(bp.price / EXCHANGE_RATE) : bp.price;

 return {
 id: bp.stripePriceId || `plan_${bp.id}`,
 title: t(`plans.${planKey}.title`),
 description: t(`plans.${planKey}.description`),
 price: displayPrice,
 isPopular,
 features: planKey === 'enterprise'
    ? (t.raw(`plans.enterprise.features`) as string[]).map((f: string) => ({ title: f, highlighted: false }))
    : buildFeaturesForPlan(bp, isAnnual, t),
 originalId: bp.id,
 planKey
 };
 });

 return (
 <section id="pricing" className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">
 <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-7xl">
 
 {/* Editorial Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 md:mb-24">
 <div className="max-w-3xl">
 <div className="border-l-2 border-black dark:border-white pl-4 mb-8">
 <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 {t('badge')}
 </span>
 </div>
 
 <h2 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-black dark:text-white mb-6 tracking-tight leading-[1.05]">
 {t('title_start')} <br className="hidden md:block"/>
 <span className="text-gray-400 dark:text-gray-500 font-serif italic pr-2">
 {t('title_highlight')}
 </span>
 </h2>
 <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-light">
 {t('description')}
 </p>
 </div>

 {/* Toggle Mensual/Anual (Architectural Split Button) */}
 <div className="flex items-center border border-black dark:border-white p-1 shrink-0">
 <button
 onClick={() => setIsAnnual(false)}
 disabled={isLoading}
 className={cn(
 "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300",
 !isAnnual ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:text-black dark:hover:text-white"
 )}
 >
 {t('billing.monthly')}
 </button>
 <button
 onClick={() => setIsAnnual(true)}
 disabled={isLoading}
 className={cn(
 "px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-2",
 isAnnual ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:text-black dark:hover:text-white"
 )}
 >
 {t('billing.annual')}
 <span className={cn(
 "px-1.5 py-0.5 text-[9px] border",
 isAnnual ? "border-white/30 dark:border-black/30" : "border-gray-300 dark:border-gray-700"
 )}>
 -20%
 </span>
 </button>
 </div>
 </div>

 {/* Pricing Layout (Flush Grid) */}
 {isLoading ? (
 <div className="flex justify-center py-32 border-y border-gray-200 dark:border-gray-800">
 <Loader2 className="w-6 h-6 text-black dark:text-white animate-spin" />
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 border-t border-l border-gray-200 dark:border-gray-800 w-full">
 
 {displayPlans.map((plan, index) => {
 const monthlyPrice = plan.price;
 const finalPrice = isAnnual ? Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT)) : monthlyPrice;

 return (
 <motion.div
 key={plan.title}
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-50px" }}
 transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
 className={cn(
 "relative p-8 md:p-10 flex flex-col border-b border-r border-gray-200 dark:border-gray-800 group transition-colors duration-500",
 plan.isPopular 
 ? "bg-black text-white dark:bg-white dark:text-black" 
 : "bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-gray-900/50"
 )}
 >
 {/* Etiqueta Popular a corte vivo */}
 {plan.isPopular && (
 <div className="absolute top-0 right-0 bg-white text-black dark:bg-black dark:text-white border-l border-b border-gray-800 dark:border-gray-200 px-4 py-1.5 text-[9px] font-bold tracking-widest uppercase">
 {t('badges.popular')}
 </div>
 )}

 <div className="mb-10 pt-4">
 <h3 className={cn("text-3xl font-semibold mb-3 tracking-tight", plan.isPopular ? "text-white dark:text-black" : "text-black dark:text-white")}>
 {plan.title}
 </h3>
 <p className={cn("text-sm font-light min-h-[40px] leading-relaxed break-words", plan.isPopular ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400")}>
 {plan.description}
 </p>
 </div>

 {/* Precio Editorial */}
 <div className={cn("mb-12 pb-8 border-b", plan.isPopular ? "border-gray-800 dark:border-gray-200" : "border-gray-200 dark:border-gray-800")}>
 {plan.planKey === 'enterprise' ? (
     <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
         <span className={cn("text-3xl xl:text-4xl font-semibold tracking-tighter", plan.isPopular ? "text-white dark:text-black" : "text-black dark:text-white")}>
             {locale === 'en' ? 'Custom' : 'A la medida'}
         </span>
     </div>
 ) : (
     <>
         <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
         <span className={cn("text-5xl xl:text-6xl font-semibold tracking-tighter", plan.isPopular ? "text-white dark:text-black" : "text-black dark:text-white")}>
         {locale === 'en' && finalPrice > 0 ? '~$' : '$'}{finalPrice}
         </span>
         <span className={cn("text-[10px] font-bold uppercase tracking-widest", plan.isPopular ? "text-gray-500" : "text-gray-400")}>
         {locale === 'en' && finalPrice > 0 ? 'USD ' : ''}/{t('price_frequency')}
         </span>
         </div>
         
         {/* Precio Tachado (Anual) */}
         {isAnnual && monthlyPrice > 0 && (
         <div className="flex items-center gap-3 mt-3">
         <span className="text-gray-400 dark:text-gray-500 text-sm font-light line-through">
         {locale === 'en' ? '~$' : '$'}{monthlyPrice}
         </span>
         <span className={cn("text-[10px] font-bold uppercase tracking-widest", plan.isPopular ? "text-gray-300 dark:text-gray-600" : "text-black dark:text-white")}>
         -20% OFF
         </span>
         </div>
         )}
     </>
 )}
 </div>

 {/* Lista de Features */}
 <ul className="space-y-6 flex-1 mb-12">
 {plan.features.map((feature, i) => (
 <li key={i} className="flex items-start gap-4">
 <div className={cn("mt-1 shrink-0", plan.isPopular ? "text-white dark:text-black" : "text-black dark:text-white")}>
 {feature.icon ? feature.icon : <Check className="w-4 h-4" strokeWidth={1.5} />}
 </div>
 <span className={cn(
 "text-sm leading-relaxed",
 feature.highlighted 
 ? (plan.isPopular ? "text-white dark:text-black font-semibold" : "text-black dark:text-white font-semibold") 
 : (plan.isPopular ? "text-gray-300 dark:text-gray-600 font-light" : "text-gray-500 dark:text-gray-400 font-light")
 )}>
 {feature.title}
 </span>
 </li>
 ))}
 </ul>

 {/* Botón CTA (Flush) */}
 <Link
 href={
    (plan as any).planKey === 'enterprise' 
    ? '/contact' 
    : (isAuthenticated && role === 'ROLE_PROVIDER' ? `/provider/settings/subscription?planId=${plan.originalId}` : `/provider/register?planId=${plan.originalId}`)
 }
 className={cn(
 "group flex items-center justify-center w-full h-14 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all",
 plan.isPopular
 ? "bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
 : "border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
 )}
 >
 {t(`plans.${(plan as any).planKey}.button_text`)}
 <ArrowRight className="w-3.5 h-3.5 ml-3 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
 </Link>

 </motion.div>
 );
 })}
 </div>
 )}

 <div className="text-center mt-16">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
 {t('footer')}
 </p>
 </div>
 </div>
 </section>
 );
};

export default PricingSection;