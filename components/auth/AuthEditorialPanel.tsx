import React from "react";
import { m } from "framer-motion";
import { Check, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

interface AuthEditorialPanelProps {
 userType: "consumer" | "provider";
}

export default function AuthEditorialPanel({ userType }: AuthEditorialPanelProps) {
 const t = useTranslations('Auth');

 const benefits = userType === "consumer"
 ? [t('consumer_benefits.0'), t('consumer_benefits.1'), t('consumer_benefits.2')]
 : [t('provider_benefits.0'), t('provider_benefits.1'), t('provider_benefits.2')];

 return (
 <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <m.img
 key={userType} // Fuerza a que la imagen se re-anime al cambiar de tab
 initial={{ opacity: 0.5, scale: 1.05 }}
 animate={{ opacity: 0.9, scale: 1 }}
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
 src={userType === "consumer" ? "/suite_patient_app.png" : "/hero_medical_lifestyle.png"}
 alt="QuHealthy Authentication"
 className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 dark:from-black/90 dark:via-black/50 dark:to-transparent" />

 <div className="relative z-10 p-16 mt-auto">
 <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-8 tracking-tight leading-[1.1]">
 {t(userType === 'consumer' ? 'consumer_area' : 'provider_area')}
 </h2>

 <div className="space-y-4 mb-10">
 {benefits.map((benefit, index) => (
 <div
 key={index}
 className="flex items-center gap-3 text-gray-200 font-light text-lg"
 >
 <div className="p-1.5 rounded-full border border-white/30">
 <Check className="w-4 h-4 text-white" strokeWidth={2} />
 </div>
 <span>{benefit}</span>
 </div>
 ))}
 </div>

 {/* Bloque de Información Segura */}
 <div className="border-t border-white/20 pt-8 w-full max-w-md">
 <div className="flex items-start gap-5">
 <Shield className="w-6 h-6 text-white mt-0.5 opacity-80" strokeWidth={1.5} />
 <div>
 <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">
 {t('secure_connection')}
 </p>
 <p className="text-gray-300 text-sm font-light leading-relaxed">
 {t('secure_desc')}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
