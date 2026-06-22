import React from "react";
import Image from "next/image";
import { Check, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ConsumerSignupEditorialPanel() {
  const t = useTranslations('AuthSignupConsumer');
  const benefits = [t('benefits.0'), t('benefits.1'), t('benefits.2')];

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden">
      <Image 
        height={800} 
        width={800}
        src="/suite_patient_app.png"
        alt="QuHealthy Patient Sign Up"
        className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 dark:from-black/90 dark:via-black/50 dark:to-transparent" />

      <div className="relative z-10 p-16 mt-auto">
        <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
          {t('area_title')}
        </h2>

        <div className="space-y-4 mb-8">
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
