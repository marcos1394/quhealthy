"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Mail, Sparkles, ArrowRight, Shield, Stethoscope, User, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QhSpinner } from '@/components/ui/QhSpinner';

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("AuthVerifyEmail");
  const { verifyEmail } = useAuth();

  const token = searchParams.get("token");
  const roleParam = searchParams.get("role");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(10);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status === "loading") { const i = setInterval(() => setProgress(p => p >= 90 ? p : p + 15), 300); return () => clearInterval(i); }
  }, [status]);

  useEffect(() => {
    if (status === "success" && countdown > 0) { const t = setTimeout(() => setCountdown(p => p - 1), 1000); return () => clearTimeout(t); }
    else if (status === "success" && countdown === 0) router.push("/login?verified=true");
  }, [status, countdown, router]);

  useEffect(() => {
    const verify = async () => {
      if (!token) { 
        if (searchParams.get("email")) {
          setStatus("pending");
          setProgress(100);
          return;
        }
        setStatus("error"); setMessage(t("cause_3")); setProgress(100); return; 
      }
      try {
        await verifyEmail(token);
        setProgress(100); setStatus("success"); setMessage(t("success_desc"));
      } catch (error: any) {
        setProgress(100); setStatus("error"); setMessage(error.message || t("cause_1"));
      }
    };
    const timeout = setTimeout(() => verify(), 1500);
    return () => clearTimeout(timeout);
  }, [token, searchParams, t, verifyEmail]);

  const isProvider = roleParam === "provider";
  const RoleIcon = isProvider ? Stethoscope : User;

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-50 dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero_medical_lifestyle.png" alt="Verify" className="absolute inset-0 w-full h-full object-cover object-top opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="relative z-10 p-16 mt-auto">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">{t("title")}</h2>
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 p-4 rounded-none border border-white/20 w-max">
            <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
            <div><p className="text-white font-medium text-sm">{t("secure_connection")}</p><p className="text-gray-300 text-xs font-light max-w-xs">{t("secure_info")}</p></div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-block mb-8"><span className="text-2xl font-serif italic tracking-tight text-black dark:text-white">QuHealthy.</span></Link>
          </div>

          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mx-auto w-16 h-16 bg-gray-100 dark:bg-[#111111] rounded-none flex items-center justify-center">
                  <Mail className="w-8 h-8 text-black dark:text-white" strokeWidth={1.5} />
                </motion.div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-medium text-black dark:text-white tracking-tight">{t("title")}</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-light">{t("desc")}</p>
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs font-medium"><span className="text-gray-500">{t("verifying")}</span><span className="text-black dark:text-white">{progress}%</span></div>
                  <Progress value={progress} className="h-1.5 bg-gray-200 dark:bg-gray-800" />
                </div>
              </motion.div>
            )}
            
            {status === "pending" && (
              <motion.div key="pending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-[#111111] rounded-none flex items-center justify-center">
                  <Mail className="w-8 h-8 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                  <h1 className="text-2xl font-medium text-black dark:text-white tracking-tight">Revisa tu correo</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-light">
                    Hemos enviado un enlace de confirmación a <strong className="font-medium text-gray-700 dark:text-gray-300">{searchParams.get("email")}</strong>. Por favor, haz clic en el enlace para activar tu cuenta.
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-left text-sm text-black dark:text-white space-y-1">
                      <p>Si no lo encuentras en tu bandeja de entrada principal, revisa la carpeta de Spam o Correo No Deseado.</p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => router.push("/login")} className="w-full h-14 text-base font-semibold text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-none rounded-none">
                  Ir al inicio de sesión
                </Button>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-[#111111] rounded-none flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-none text-xs text-gray-600 dark:text-gray-300 font-medium">
                    <RoleIcon className="w-3 h-3" />{isProvider ? "Provider" : "Patient"}
                  </div>
                  <h1 className="text-2xl font-medium text-black dark:text-white tracking-tight">{isProvider ? t("welcome_provider") : t("welcome")}</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-light">{t("success_desc")}</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-left"><p className="text-sm font-medium text-black dark:text-white mb-0.5">{t("success_title")}</p><p className="text-xs text-gray-500 dark:text-gray-400">{isProvider ? t("ready_provider") : t("ready_patient")}</p></div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-light">{t("redirecting")} {countdown} {t("seconds")}</p>
                <Button onClick={() => router.push("/login?verified=true")} className="w-full h-14 text-base font-semibold text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-none rounded-none">
                  <Sparkles className="w-4 h-4 mr-2" />{t("start_button")}<ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-8">
                <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-none flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-medium text-black dark:text-white tracking-tight">{t("error_title")}</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-light">{message}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-none p-4 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-red-800 dark:text-red-400">{t("error_causes")}</p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-red-600 dark:text-red-300/80"><li>{t("cause_1")}</li><li>{t("cause_2")}</li><li>{t("cause_3")}</li></ul>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button onClick={() => router.push("/login")} className="w-full h-12 bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 rounded-none shadow-none font-semibold">{t("go_to_login")}</Button>
                  <Button onClick={() => window.location.reload()} variant="outline" className="w-full h-12 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-none"><RefreshCw className="w-4 h-4 mr-2" />{t("try_again")}</Button>
                </div>
                <p className="text-xs text-gray-400 font-light">{t("need_help")} <a href="mailto:support@quhealthy.org" className="text-black dark:text-white hover:underline">support@quhealthy.org</a></p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]"><QhSpinner size="md" /></div>}>
      <VerificationContent />
    </Suspense>
  );
}