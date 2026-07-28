"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Stethoscope,
  User,
  AlertCircle,
  RefreshCw,
  MailCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { QhSpinner } from "@/components/ui/QhSpinner";

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("AuthVerifyEmail");
  const { verifyEmail } = useAuth();

  const token = searchParams.get("token");
  const roleParam = searchParams.get("role");

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "pending"
  >("loading");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(10);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status === "loading") {
      const i = setInterval(
        () => setProgress((p) => (p >= 90 ? p : p + 15)),
        300
      );
      return () => clearInterval(i);
    }
  }, [status]);

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((p) => p - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      router.push("/login?verified=true");
    }
  }, [status, countdown, router]);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        if (searchParams.get("email")) {
          setStatus("pending");
          setProgress(100);
          return;
        }
        setStatus("error");
        setMessage(t("cause_3"));
        setProgress(100);
        return;
      }
      try {
        await verifyEmail(token);
        setProgress(100);
        setStatus("success");
        setMessage(t("success_desc"));
      } catch (error: any) {
        setProgress(100);
        setStatus("error");
        setMessage(error.message || t("cause_1"));
      }
    };
    const timeout = setTimeout(() => verify(), 1200);
    return () => clearTimeout(timeout);
  }, [token, searchParams, t, verifyEmail]);

  const isProvider = roleParam === "provider";
  const RoleIcon = isProvider ? Stethoscope : User;

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── PANEL IZQUIERDO (HERO VISUAL & MARCA) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
        <img
          src="/hero_medical_lifestyle.png"
          alt={t("hero_img_alt")}
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
            <span>{t("badge_identity_verification")}</span>
          </span>
        </div>

        {/* Mensaje Hero */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              {t("title")}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
              {t("hero_subtitle")}
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
                  {t("hero_secure_title")}
                </h3>
                <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                  {t("hero_secure_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO (ESTADOS DE VERIFICACIÓN) ───────────────────────── */}
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
          </div>

          {/* Tarjeta Principal de Contenido */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              
              {/* ── ESTADO 1: VERIFICANDO ──────────────────────────────────── */}
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6 py-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto shadow-sm">
                    <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="space-y-1.5">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t("title")}
                    </h1>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {t("desc")}
                    </p>
                  </div>

                  <div className="space-y-2 max-w-xs mx-auto pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">{t("verifying")}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">{progress}%</span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2 bg-gray-100 dark:bg-gray-800 [&>div]:bg-emerald-600 dark:[&>div]:bg-emerald-400 rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {/* ── ESTADO 2: PENDIENTE DE CORREO ───────────────────────────── */}
              {status === "pending" && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-5 py-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto shadow-sm">
                    <MailCheck
                      className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t("pending_title")}
                    </h1>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {t("pending_desc_1")}
                      <strong className="font-bold text-gray-900 dark:text-white font-mono break-all">
                        {searchParams.get("email")}
                      </strong>
                      {t("pending_desc_2")}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/30 text-left flex items-start gap-3 shadow-sm">
                    <AlertCircle
                      className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                      {t("pending_spam_notice")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{t("go_to_login")}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </motion.div>
              )}

              {/* ── ESTADO 3: ÉXITO ─────────────────────────────────────────── */}
              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-5 py-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2
                      className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-[11px] font-bold shadow-sm">
                      <RoleIcon className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{isProvider ? t("role_provider") : t("role_patient")}</span>
                    </span>

                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {isProvider ? t("welcome_provider") : t("welcome")}
                    </h1>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {t("success_desc")}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-left flex items-start gap-3 shadow-sm">
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                      strokeWidth={2}
                    />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        {t("success_banner_title")}
                      </p>
                      <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {isProvider ? t("ready_provider") : t("ready_patient")}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-gray-400">
                    {t("redirecting")}{" "}
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{countdown}</span>{" "}
                    {t("seconds")}
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push("/login?verified=true")}
                    className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" strokeWidth={2} />
                    <span>{t("start_button")}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </motion.div>
              )}

              {/* ── ESTADO 4: ERROR ─────────────────────────────────────────── */}
              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-5 py-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center mx-auto shadow-sm">
                    <XCircle
                      className="w-7 h-7 text-red-600 dark:text-red-400"
                      strokeWidth={2}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {t("error_title")}
                    </h1>
                    <p className="text-xs font-medium text-gray-500 leading-relaxed">
                      {message}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-900/40 text-left space-y-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" strokeWidth={2} />
                      <p className="text-xs font-bold text-red-800 dark:text-red-300">
                        {t("error_causes")}
                      </p>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] font-medium text-red-700 dark:text-red-400/90 pl-1">
                      <li>{t("cause_1")}</li>
                      <li>{t("cause_2")}</li>
                      <li>{t("cause_3")}</li>
                    </ul>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm"
                    >
                      {t("go_to_login")}
                    </button>

                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" strokeWidth={2} />
                      <span>{t("try_again")}</span>
                    </button>
                  </div>

                  <p className="text-[11px] font-medium text-gray-400 pt-1">
                    {t("need_help")}{" "}
                    <a
                      href="mailto:support@quhealthy.org"
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      support@quhealthy.org
                    </a>
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations("AuthVerifyEmail");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50/50 dark:bg-[#050505]">
          <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-semibold text-gray-400">{t("loading_verification")}</p>
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}