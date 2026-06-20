// Ubicación: src/app/recovery/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Importamos los componentes desacoplados
import Step1SendCode from "@/components/auth/recovery/Step1SendCode";
import Step2VerifyCode from "@/components/auth/recovery/Step2VerifyCode";
import Step3ResetPassword from "@/components/auth/recovery/Step3ResetPassword";

export default function AccountRecoveryPage() {
  const t = useTranslations('AuthForgotPassword');

  // Estados Globales del Flujo
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(""); 
  const [deliveryMethod, setDeliveryMethod] = useState<'OTP_EMAIL' | 'OTP_SMS'>('OTP_EMAIL');
  const [resetToken, setResetToken] = useState(""); 

  const progress = (step / 3) * 100;

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      
      {/* Panel Izquierdo (Editorial / Stark) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden">
        {/* Imagen en escala de grises para un look más serio y premium */}
        <img
          src="/hero_medical_lifestyle.png"
          alt="QuHealthy Account Recovery"
          className="absolute inset-0 w-full h-full object-cover object-center grayscale mix-blend-multiply dark:mix-blend-lighten opacity-80"
        />
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
        
        <div className="relative z-10 p-16 mt-auto">
          <h2 className="text-5xl lg:text-6xl font-semibold text-white mb-10 tracking-tight leading-[1.1]">
            {t('area_title')}
          </h2>
          
          {/* Bloque de Información Seguro (Arquitectónico a corte vivo) */}
          <div className="border-t border-white/20 pt-8 w-full max-w-md">
            <div className="flex items-start gap-5">
              <Shield className="w-6 h-6 text-white mt-0.5 opacity-80" strokeWidth={1.5} />
              <div>
                <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">
                  {t('secure_info_title')}
                </p>
                <p className="text-gray-300 text-sm font-light leading-relaxed">
                  {t('secure_info_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho (Dinámico y Flush) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md">
          
          <div className="mb-16 text-center lg:text-left">
            <Link href="/" className="inline-block mb-12">
              <span className="text-2xl font-serif italic tracking-tight text-black dark:text-white">
                QuHealthy.
              </span>
            </Link>
            
            <h1 className="text-3xl md:text-4xl font-semibold text-black dark:text-white mb-4 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed">
              {step === 1 && t('step_1_desc')}
              {step === 2 && t('step_2_desc')}
              {step === 3 && t('step_3_desc')}
            </p>
          </div>

          {/* Barra de Progreso (Línea Arquitectónica) */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {t('step')} 0{step} <span className="mx-2 text-gray-300 dark:text-gray-700">/</span> 03
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                {Math.round(progress)}%
              </span>
            </div>
            
            {/* Progress Track */}
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-black dark:bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Ruteador de Pasos (Los subcomponentes heredan el espacio) */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 1 && (
              <Step1SendCode 
                email={email} 
                setEmail={setEmail} 
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod}
                onSuccess={() => setStep(2)} 
              />
            )}
            
            {step === 2 && (
              <Step2VerifyCode 
                email={email} 
                deliveryMethod={deliveryMethod}
                onSuccess={(token) => {
                  setResetToken(token); 
                  setStep(3);
                }} 
                onGoBack={() => setStep(1)} 
              />
            )}
            
            {step === 3 && (
              <Step3ResetPassword 
                resetToken={resetToken} 
              />
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}