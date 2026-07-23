/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/useAuth";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  ShieldCheck,
  Smartphone,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Info,
} from "lucide-react";
import { useSessionStore } from "@/stores/SessionStore";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";

export default function VerifyPhonePage() {
  const t = useTranslations("AuthVerifyPhone");
  const { verifyPhone, resendVerification } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [codeTimer, setCodeTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const { role, user } = useSessionStore();

  useEffect(() => {
    if (codeTimer > 0) {
      const tm = setTimeout(() => setCodeTimer((p) => p - 1), 1000);
      return () => clearTimeout(tm);
    } else setCanResend(true);
  }, [codeTimer]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const tm = setTimeout(() => setResendCooldown((p) => p - 1), 1000);
      return () => clearTimeout(tm);
    }
  }, [resendCooldown]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleCodeChange = (v: string) => {
    setCode(v.replace(/\D/g, "").slice(0, 6));
    setError("");
  };

  useEffect(() => {
    if (code.length === 6 && !isLoading) handleSubmit();
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6) return;
    if (!user?.email) {
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await verifyPhone({ code, identifier: user.email });
      setSuccess(true);
      toast.success(t("success_title", { defaultValue: "Teléfono verificado correctamente" }), {
        theme: "colored",
      });
      setTimeout(() => {
        router.push(
          role === "ROLE_PROVIDER" ? "/onboarding" : "/patient/dashboard",
        );
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al verificar el teléfono");
      handleApiError(err);
      setCode("");
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!user?.email) {
      return;
    }
    setIsResending(true);
    setError("");
    try {
      await resendVerification({ email: user.email, type: "SMS" });
      toast.success(t("resend_button", { defaultValue: "Código reenviado" }), {
        theme: "colored",
      });
      setCodeTimer(300);
      setCanResend(false);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message);
      handleApiError(err);
    } finally {
      setIsResending(false);
    }
  };

  const handleSkip = () => {
    router.push(
      role === "ROLE_PROVIDER"
        ? "/onboarding?phone_pending=true"
        : "/patient/dashboard?phone_pending=true",
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── PANEL IZQUIERDO (HERO VISUAL) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
        <img
          src="/hero_medical_lifestyle.png"
          alt="Phone Verify"
          className="absolute inset-0 w-full h-full object-cover object-top mix-blend-luminosity opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />

        {/* Header Marca */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              QuHealthy<span className="text-emerald-400">.</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verificación SMS</span>
          </span>
        </div>

        {/* Mensaje Hero */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              {t("area_title", { defaultValue: "Protección de Contacto Móvil" })}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
              Verificamos tu número telefónico para coordinar recordatorios de citas y alertas médicas en tiempo real.
            </p>
          </div>

          {/* Shield Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {t("secure_connection", { defaultValue: "Canal Directo Encriptado" })}
                </h3>
                <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                  {t("info", { defaultValue: "Garantía de confidencialidad en tus vías de notificación." })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO (FORMULARIO) ─────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Header & Logo Mobile */}
          <div className="text-center lg:text-left space-y-2">
            <Link href="/" className="inline-block lg:hidden mb-4">
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
              </span>
            </Link>

            <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <Smartphone className="w-4 h-4" strokeWidth={2} />
              <span>Verificación de Teléfono</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title", { defaultValue: "Verifica tu Teléfono" })}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("desc", { defaultValue: "Ingresa el código de 6 dígitos que enviamos vía mensaje SMS." })}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
              >
                {/* Timer Bar */}
                <div className="flex items-center justify-between bg-gray-50/50 dark:bg-[#050505] p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {t("code_valid_for", { defaultValue: "Código válido por:" })}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-xs font-bold px-2.5 py-1 rounded-lg border shadow-sm",
                      codeTimer < 60
                        ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                    )}
                  >
                    {formatTime(codeTimer)}
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("code_label", { defaultValue: "Código de Verificación (SMS)" })}
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      placeholder={t("code_placeholder", { defaultValue: "000000" })}
                      maxLength={6}
                      autoFocus
                      className={cn(
                        "w-full h-14 text-center text-3xl font-mono font-bold tracking-[0.35em] bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-300 shadow-sm",
                        error && "border-red-300 text-red-600 focus:ring-red-500/20"
                      )}
                      disabled={isLoading || success}
                    />
                    <p className="text-[11px] font-semibold text-gray-400 text-center">
                      {code.length}/6 {t("digits_status", { defaultValue: "dígitos ingresados" })}
                    </p>
                  </div>

                  {/* Alerta de Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-900/40 flex items-start gap-3 shadow-sm">
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400 leading-relaxed">
                            {error}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    disabled={isLoading || code.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <QhSpinner size="sm" className="text-current" />
                        <span>{t("verifying", { defaultValue: "Verificando código..." })}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                        <span>{t("verify_button", { defaultValue: "Verificar Número" })}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Reenvío de código */}
                <div className="text-center pt-1">
                  {canResend && resendCooldown === 0 ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {isResending ? (
                        <>
                          <QhSpinner size="sm" className="text-current" />
                          <span>{t("resending", { defaultValue: "Reenviando..." })}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{t("resend_button", { defaultValue: "Reenviar código SMS" })}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="text-xs font-medium text-gray-400">
                      {resendCooldown > 0
                        ? `${t("can_resend_in", { defaultValue: "Reenviar en" })} ${resendCooldown}s`
                        : `${t("cant_resend_yet", { defaultValue: "Podrás solicitar otro código en" })} ${formatTime(codeTimer)}`}
                    </p>
                  )}
                </div>

                {/* Info Card */}
                <div className="bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("info", { defaultValue: "Si no recibes el mensaje SMS, verifica que tu número esté registrado correctamente en tu perfil." })}
                  </p>
                </div>

                {/* Skip Link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    <span>{t("skip", { defaultValue: "Omitir por ahora" })}</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Success State */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-5"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2
                    className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("success_title", { defaultValue: "¡Teléfono Verificado!" })}
                  </h2>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">
                    {t("success_desc", { defaultValue: "Tu número telefónico ha sido vinculado de forma segura a tu cuenta." })}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-left flex items-start gap-3 shadow-sm">
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      {t("success_status", { defaultValue: "Verificación Completada" })}
                    </p>
                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {t("success_redirect", { defaultValue: "Redirigiendo a tu panel de control..." })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      role === "ROLE_PROVIDER"
                        ? "/onboarding"
                        : "/patient/dashboard",
                    )
                  }
                  className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  <span>{t("continue", { defaultValue: "Continuar" })}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  );
}