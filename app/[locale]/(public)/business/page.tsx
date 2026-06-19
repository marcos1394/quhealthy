"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Activity, Laptop, CreditCard, MessageSquare, Check, Loader2, UserRound, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import axiosInstance from "@/lib/axios";
import { useSessionStore } from "@/stores/SessionStore";
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

const ANNUAL_DISCOUNT = 0.20; // 20% de descuento

export default function BusinessPage() {
  const t = useTranslations("PublicBusiness");
  const tPricing = useTranslations("Pricing");
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
        title: tPricing(`plans.${planKey}.title`),
        description: tPricing(`plans.${planKey}.description`),
        price: displayPrice,
        isPopular,
        features: buildFeaturesForPlan(bp, isAnnual, tPricing),
        originalId: bp.id,
        planKey
      };
    });

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      
      {/* Editorial Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 border-b border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-1/2"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
                <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">QuHealthy</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-black dark:text-white">Para Profesionales</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-black dark:text-white mb-8 leading-[1.1]">
                {t('title_light')}
                <br className="hidden md:block" />
                <span className="font-serif italic text-gray-400 dark:text-gray-500 font-light pr-2">
                  {t('title_highlight')}
                </span>
                {t('title_dark')}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-12 max-w-xl">
                {t('subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white rounded-none h-14 px-8 text-xs font-bold uppercase tracking-widest transition-all group"
                >
                  {t('cta_primary')} <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-none h-14 px-8 text-xs font-bold uppercase tracking-widest border-gray-300 dark:border-gray-800 text-black dark:text-white hover:border-black dark:hover:border-white transition-all group"
                >
                  {t('cta_secondary')} <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </div>
            </motion.div>

            {/* Wireframe Mockup (Estilo Arquitectónico Limpio) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative border border-black dark:border-white bg-gray-50 dark:bg-[#0a0a0a] p-2 overflow-hidden aspect-[4/3] w-full group">
                <div className="absolute top-0 inset-x-0 h-10 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-2">
                  <div className="w-2 h-2 rounded-full border border-black dark:border-white"></div>
                  <div className="w-2 h-2 rounded-full border border-black dark:border-white"></div>
                  <div className="w-2 h-2 rounded-full border border-black dark:border-white"></div>
                </div>
                <div className="mt-10 h-full w-full border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-6">
                  {/* Fake UI Elements Minimalistas */}
                  <div className="flex gap-4">
                    <div className="w-1/3 h-24 border border-gray-200 dark:border-gray-800 flex flex-col p-4 justify-between">
                      <div className="w-8 h-2 bg-gray-200 dark:bg-gray-800"></div>
                      <div className="w-16 h-6 bg-black dark:bg-white opacity-10"></div>
                    </div>
                    <div className="w-1/3 h-24 border border-black dark:border-white flex flex-col p-4 justify-between bg-black/5 dark:bg-white/5">
                      <div className="w-8 h-2 bg-black dark:bg-white opacity-50"></div>
                      <div className="w-16 h-6 bg-black dark:bg-white"></div>
                    </div>
                    <div className="w-1/3 h-24 border border-gray-200 dark:border-gray-800 flex flex-col p-4 justify-between">
                      <div className="w-8 h-2 bg-gray-200 dark:bg-gray-800"></div>
                      <div className="w-16 h-6 bg-black dark:bg-white opacity-10"></div>
                    </div>
                  </div>
                  <div className="flex-1 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                    <div className="w-1/2 h-1/2 border border-gray-100 dark:border-gray-900 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Grid de Funcionalidades a Corte Vivo */}
      <section className="py-24 md:py-32 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="mb-20 md:w-2/3">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-black dark:text-white mb-6">
              {t('bento_title')}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed">
              {t('bento_subtitle')}
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-12 lg:gap-16"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="border-t border-black dark:border-white pt-8 group">
              <Activity className="w-8 h-8 text-black dark:text-white mb-8 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">{t('bento.f1_title')}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed">{t('bento.f1_desc')}</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="border-t border-black dark:border-white pt-8 group">
              <Laptop className="w-8 h-8 text-black dark:text-white mb-8 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">{t('bento.f2_title')}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed">{t('bento.f2_desc')}</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="border-t border-black dark:border-white pt-8 group">
              <CreditCard className="w-8 h-8 text-black dark:text-white mb-8 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">{t('bento.f3_title')}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed">{t('bento.f3_desc')}</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants} className="border-t border-black dark:border-white pt-8 group">
              <MessageSquare className="w-8 h-8 text-black dark:text-white mb-8 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
              <h3 className="text-2xl font-semibold text-black dark:text-white mb-4">{t('bento.f4_title')}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed">{t('bento.f4_desc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Pricing Section (Editorial Style) */}
      <section id="pricing" className="py-24 md:py-32 bg-gray-50/50 dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-4">
                {tPricing('badge')}
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-black dark:text-white tracking-tight leading-[1.1]">
                {tPricing('title_start')} <span className="font-serif italic text-gray-400 dark:text-gray-500">{tPricing('title_highlight')}</span>
              </h2>
            </div>

            {/* Toggle Mensual/Anual Minimalista */}
            <div className="flex items-center gap-4 pb-2 border-b border-gray-300 dark:border-gray-800">
              <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${!isAnnual ? "text-black dark:text-white" : "text-gray-400"}`}>
                {tPricing('billing.monthly')}
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                disabled={isLoading}
                className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-700"
              />
              <span className={`text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${isAnnual ? "text-black dark:text-white" : "text-gray-400"}`}>
                {tPricing('billing.annual')}
                <span className="bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 text-[9px]">
                  -20%
                </span>
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-32 border-y border-gray-200 dark:border-gray-800">
              <Loader2 className="w-6 h-6 text-black dark:text-white animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800">
              {displayPlans.map((plan, index) => {
                const monthlyPrice = plan.price;
                const finalPrice = isAnnual ? Math.round(monthlyPrice * (1 - ANNUAL_DISCOUNT)) : monthlyPrice;

                return (
                  <motion.div
                    key={plan.title}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className={`relative p-8 md:p-10 flex flex-col border-b border-r border-gray-200 dark:border-gray-800 group ${
                      plan.isPopular ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent hover:bg-white dark:hover:bg-gray-900/50"
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 right-0 bg-black text-white dark:bg-white dark:text-black border-l border-b border-gray-800 dark:border-gray-200 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">
                        {tPricing('badges.popular')}
                      </div>
                    )}

                    <div className="mb-8 pt-4">
                      <h3 className={`text-2xl font-semibold mb-2 ${plan.isPopular ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                        {plan.title}
                      </h3>
                      <p className={`text-sm font-light min-h-[40px] ${plan.isPopular ? "text-gray-400 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-12 border-b border-gray-200 dark:border-gray-800 pb-8">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl lg:text-6xl font-semibold tracking-tighter ${plan.isPopular ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                          {locale === 'en' && finalPrice > 0 ? '~$' : '$'}{finalPrice}
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${plan.isPopular ? "text-gray-400 dark:text-gray-500" : "text-gray-400"}`}>
                          {locale === 'en' && finalPrice > 0 ? 'USD ' : ''}/{tPricing('price_frequency')}
                        </span>
                      </div>
                      
                      {isAnnual && monthlyPrice > 0 && (
                        <div className="mt-2 text-xs font-bold tracking-widest uppercase">
                          <span className="line-through text-gray-400 mr-2">
                            {locale === 'en' ? '~$' : '$'}{monthlyPrice}
                          </span>
                          <span className={plan.isPopular ? "text-gray-300 dark:text-gray-600" : "text-black dark:text-white"}>
                            -20% OFF
                          </span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-6 flex-1 mb-12">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className={`mt-0.5 shrink-0 ${plan.isPopular ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                            {feature.icon ? feature.icon : <Check className="w-4 h-4" strokeWidth={2} />}
                          </div>
                          <span className={`text-sm font-light leading-relaxed ${
                            feature.highlighted 
                              ? (plan.isPopular ? "text-white dark:text-black font-medium" : "text-black dark:text-white font-medium")
                              : (plan.isPopular ? "text-gray-400 dark:text-gray-600" : "text-gray-600 dark:text-gray-400")
                          }`}>
                            {feature.title}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={isAuthenticated && role === 'PROVIDER' ? `/provider/settings/subscription?planId=${plan.originalId}` : `/provider/register?planId=${plan.originalId}`}
                      className={`inline-flex items-center justify-center w-full py-4 rounded-none text-xs font-bold uppercase tracking-widest transition-colors group/btn ${
                        plan.isPopular
                          ? "bg-white text-black dark:bg-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                          : "border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                      }`}
                    >
                      {tPricing(`plans.${plan.planKey}.button_text`)}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-16 text-xs text-gray-400 uppercase tracking-widest">
            {tPricing('footer')}
          </div>
        </div>
      </section>

    </div>
  );
}