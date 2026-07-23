"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Sparkles, KeyRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

// Importamos los componentes desacoplados
import Step1SendCode from "@/components/auth/recovery/Step1SendCode";
import Step2VerifyCode from "@/components/auth/recovery/Step2VerifyCode";
import Step3ResetPassword from "@/components/auth/recovery/Step3ResetPassword";

export default function AccountRecoveryPage() {
  const t = useTranslations("AuthForgotPassword");

  // Estados Globales del Flujo
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"OTP_EMAIL" | "OTP_SMS">(
    "OTP_EMAIL"
  );
  const [resetToken, setResetToken] = useState("");

  const progress = (step / 3) * 100;

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── PANEL IZQUIERDO (HERO VISUAL & BRANDING) ────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
        {/* Imagen de fondo con overlay suave */}
        <img
          src="/hero_medical_lifestyle.png"
          alt="QuHealthy Account Recovery"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />

        {/* Header del Panel */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              QuHealthy<span className="text-emerald-400">.</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restablecimiento Seguro</span>
          </span>
        </div>

        {/* Mensaje & Info Card */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              {t("area_title", { defaultValue: "Recupera el acceso a tu cuenta" })}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
              Plataforma con verificación multi-factor para la máxima protección de la información clínica y de pacientes.
            </p>
          </div>

          {/* Bloque de Seguridad */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {t("secure_info_title", { defaultValue: "Protección y Privacidad" })}
                </h3>
                <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                  {t("secure_info_desc", { defaultValue: "Validación mediante códigos temporales cifrados de un solo uso." })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO (FORMULARIO & PROGRESO) ─────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header & Logo Mobile */}
          <div className="text-center lg:text-left space-y-2">
            <Link href="/" className="inline-block lg:hidden mb-4">
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
              </span>
            </Link>

            <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <KeyRound className="w-4 h-4" strokeWidth={2} />
              <span>Seguridad de la Cuenta</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title", { defaultValue: "Recuperación de Contraseña" })}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {step === 1 && t("step_1_desc", { defaultValue: "Ingresa tu correo o teléfono para recibir tu código de seguridad." })}
              {step === 2 && t("step_2_desc", { defaultValue: "Ingresa el código de verificación enviado a tu dispositivo." })}
              {step === 3 && t("step_3_desc", { defaultValue: "Crea una nueva contraseña segura para acceder a tu perfil." })}
            </p>
          </div>

          {/* Barra de Progreso Homologada */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-500 font-mono">
                Paso 0{step} <span className="text-gray-300 dark:text-gray-700">/</span> 03
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-gray-800">
              <motion.div
                className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Contenedor de Pasos */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm"
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

            {step === 3 && <Step3ResetPassword resetToken={resetToken} />}
          </motion.div>

        </div>
      </div>
    </div>
  );
}