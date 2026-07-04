"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from 'next-intl';
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
 const locale = useLocale();

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
 <Badge className="bg-black text-white px-5 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-none border border-black rounded-none flex items-center gap-1.5 dark:bg-white dark:text-black dark:border-white">
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
 <Badge className="bg-black/5 text-black px-5 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-none border border-black/20 rounded-none flex items-center gap-1.5 dark:bg-white/5 dark:text-white dark:border-white/20">
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
 <Badge className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white rounded-none text-[9px] px-2 py-1 flex items-center gap-1 uppercase tracking-widest font-bold">
 <Zap className="w-3 h-3" />
 {t('limited_offer_badge')}
 </Badge>
 </motion.div>
 </div>
 )}

 <Card className={cn(
 "h-full flex flex-col overflow-hidden transition-all duration-300 rounded-none bg-transparent shadow-none",
 isPopular
 ? 'border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]'
 : 'border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]',
 isHovered && !isPopular ? "border-black dark:border-white" : ""
 )}>

 {/* Header */}
 <CardHeader className={cn("p-8 pb-6 text-center space-y-4 border-b", isPopular ? "bg-black/5 dark:bg-white/5 border-black/20 dark:border-white/20" : "bg-transparent border-black/10 dark:border-white/10")}>

 <div className="space-y-2">
 <h3 className="text-2xl font-bold uppercase tracking-tighter text-black dark:text-white">
 {plan.name}
 </h3>
 <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 min-h-[40px] leading-relaxed px-2">
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
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{locale === 'en' && plan.price > 0 ? '~$' : '$'}</span>
 <span className={cn(
 "font-bold tracking-tighter text-5xl text-black dark:text-white"
 )}>
 {plan.price.toLocaleString()}
 </span>
 <span className="text-gray-500 font-bold uppercase tracking-widest text-[9px] ml-1">
 {locale === 'en' && plan.price > 0 ? ' USD' : ''}/{plan.duration === 'monthly' ? t('duration_monthly') : t('duration_yearly')}
 </span>
 </div>

 {/* Daily price */}
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-2">
 {t('daily_price', { amount: getDailyPrice() })}
 </p>
 </motion.div>

 {/* Savings Badge */}
 {plan.savings && (
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.4, type: "spring" }}
 >
 <Badge
 variant="outline"
 className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white rounded-none px-3 py-1 mt-2 text-[9px] font-bold uppercase tracking-widest shadow-none"
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
 "mt-0.5 p-1 rounded-none shrink-0 transition-all duration-300 border border-transparent",
 feature.highlighted
 ? "border-black text-black dark:border-white dark:text-white bg-black/5 dark:bg-white/5"
 : isPopular
 ? "text-black dark:text-white bg-transparent"
 : "text-gray-400 dark:text-gray-500 bg-transparent group-hover/item:text-black dark:group-hover/item:text-white transition-colors"
 )}>
 {feature.icon || <Check className="w-4 h-4" />}
 </div>

 {/* Text */}
 <div className="flex-1 min-w-0">
 <p className={cn(
 "text-[11px] font-bold uppercase tracking-widest transition-colors mt-1",
 feature.highlighted
 ? "text-black dark:text-white"
 : "text-gray-700 dark:text-gray-300 group-hover/item:text-black dark:group-hover/item:text-white"
 )}>
 {feature.title}
 </p>
 {feature.description && (
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1 leading-relaxed">
 {feature.description}
 </p>
 )}
 </div>

 {/* Highlighted indicator */}
 {feature.highlighted && (
 <motion.div
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1 }}
 transition={{ delay: 0.6 + idx * 0.05 }}
 >
 <Badge variant="outline" className="bg-black/5 text-black dark:bg-white/5 dark:text-white border-black/20 dark:border-white/20 text-[9px] uppercase tracking-widest px-1.5 py-0 shadow-none rounded-none font-bold">
 {t('premium_feature')}
 </Badge>
 </motion.div>
 )}
 </motion.li>
 ))}
 </ul>

 {/* Extra info */}
 {plan.features.length > 10 && (
 <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
 <p className="text-[9px] uppercase tracking-widest text-center text-gray-500 font-bold flex items-center justify-center gap-1.5">
 <Info className="w-3.5 h-3.5" />
 {t('more_features', { count: plan.features.length - 10 })}
 </p>
 </div>
 )}
 </CardContent>

 {/* Footer */}
 <CardFooter className="p-8 pt-0 mt-auto bg-transparent">
 <div className="w-full space-y-3">
 <Button
 onClick={() => onSelect(plan)}
 className={cn(
 "w-full h-12 text-[10px] uppercase tracking-widest font-bold transition-all duration-300 group/btn rounded-none border border-black dark:border-white shadow-none",
 isPopular
 ? 'bg-black hover:bg-white text-white hover:text-black dark:bg-white dark:hover:bg-black dark:text-black dark:hover:text-white'
 : 'bg-transparent hover:bg-black text-black hover:text-white dark:text-white dark:hover:bg-white dark:hover:text-black',
 isHovered ? "" : ""
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

 <p className="text-[9px] font-bold uppercase tracking-widest text-center text-gray-400 dark:text-gray-500">
 {t('trust_indicator')}
 </p>
 </div>
 </CardFooter>

 </Card>
 </motion.div>
 );
};