// Ubicación: src/app/recovery/page.tsx (o donde tengas la página)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Importamos los componentes desacoplados
import Step1SendCode from "@/components/auth/recovery/Step1SendCode";
import Step2VerifyCode from "@/components/auth/recovery/Step2VerifyCode";
import Step3ResetPassword from "@/components/auth/recovery/Step3ResetPassword";

export default function AccountRecoveryPage() {
  const t = useTranslations('AuthForgotPassword');

  // Estados Globales del Flujo
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(""); // El backend pide estrictamente el email
  const [deliveryMethod, setDeliveryMethod] = useState<'OTP_EMAIL' | 'OTP_SMS'>('OTP_EMAIL');
  const [resetToken, setResetToken] = useState(""); // 🚀 NUEVO: Aquí guardaremos el token seguro

  const progress = (step / 3) * 100;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Panel Izquierdo (Mantenido intacto) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden">
        <img
          src="/hero_medical_lifestyle.png"
          alt="QuHealthy Account Recovery"
          className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal opacity-90 grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="relative z-10 p-16 mt-auto">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
            {t('area_title')}
          </h2>
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 w-max">
            <Shield className="w-8 h-8 text-medical-300" strokeWidth={1.5} />
            <div>
              <p className="text-white font-medium text-sm">{t('secure_info_title')}</p>
              <p className="text-slate-300 text-xs font-light max-w-xs leading-relaxed">
                {t('secure_info_desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho (Dinámico) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-block mb-8">
              <span className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
                QuHealthy<span className="text-medical-600 dark:text-medical-400">.</span>
              </span>
            </Link>
            <h1 className="text-3xl font-medium text-slate-900 dark:text-white mb-2 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-light">
              {step === 1 && t('step_1_desc')}
              {step === 2 && t('step_2_desc')}
              {step === 3 && t('step_3_desc')}
            </p>
          </div>

          {/* Barra de Progreso */}
          <div className="mb-10 space-y-3">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400">{t('step')} {step} {t('of')} 3</span>
              <span className="text-medical-600 dark:text-medical-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-200 dark:bg-slate-800" />
            <div className="flex justify-between mt-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    step > stepNum ? "bg-slate-900 text-white" : step === stepNum ? "bg-medical-600 text-white ring-2 ring-medical-500/20 ring-offset-2" : "bg-slate-100 text-slate-400"
                  )}>
                    {step > stepNum ? <Check className="w-4 h-4" strokeWidth={2} /> : stepNum}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ruteador de Pasos */}
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
                setResetToken(token); // 🚀 Guardamos el token
                setStep(3);
              }} 
              onGoBack={() => setStep(1)} 
            />
          )}
          
          {step === 3 && (
            <Step3ResetPassword 
              resetToken={resetToken} // 🚀 Le pasamos el token al paso 3
            />
          )}

        </div>
      </div>
    </div>
  );
}