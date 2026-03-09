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

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
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
      if (!token) { setStatus("error"); setMessage(t("cause_3")); setProgress(100); return; }
      try {
        await verifyEmail(token);
        setProgress(100); setStatus("success"); setMessage(t("success_desc"));
      } catch (error: any) {
        setProgress(100); setStatus("error"); setMessage(error.message || t("cause_1"));
      }
    };
    const timeout = setTimeout(() => verify(), 1500);
    return () => clearTimeout(timeout);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const isProvider = roleParam === "provider";
  const RoleIcon = isProvider ? Stethoscope : User;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero_medical_lifestyle.png" alt="Verify" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-90 grayscale-[20%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="relative z-10 p-16 mt-auto">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">{t("title")}</h2>
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 w-max">
            <Shield className="w-8 h-8 text-medical-300" strokeWidth={1.5} />
            <div><p className="text-white font-medium text-sm">{t("secure_connection")}</p><p className="text-slate-300 text-xs font-light max-w-xs">{t("secure_info")}</p></div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-block mb-8"><span className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">QuHealthy<span className="text-medical-600 dark:text-medical-400">.</span></span></Link>
          </div>

          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mx-auto w-16 h-16 bg-medical-50 dark:bg-medical-500/10 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-medical-600 dark:text-medical-400" strokeWidth={1.5} />
                </motion.div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">{t("title")}</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-light">{t("desc")}</p>
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs font-medium"><span className="text-slate-500">{t("verifying")}</span><span className="text-medical-600 dark:text-medical-400">{progress}%</span></div>
                  <Progress value={progress} className="h-1.5 bg-slate-200 dark:bg-slate-800" />
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-8">
                <div className="mx-auto w-16 h-16 bg-medical-50 dark:bg-medical-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-medical-600 dark:text-medical-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <RoleIcon className="w-3 h-3" />{isProvider ? "Provider" : "Patient"}
                  </div>
                  <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">{isProvider ? t("welcome_provider") : t("welcome")}</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-light">{t("success_desc")}</p>
                </div>
                <div className="bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-medical-600 dark:text-medical-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-left"><p className="text-sm font-medium text-medical-700 dark:text-medical-400 mb-0.5">{t("success_title")}</p><p className="text-xs text-medical-600/80 dark:text-medical-300/80">{isProvider ? t("ready_provider") : t("ready_patient")}</p></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-light">{t("redirecting")} {countdown} {t("seconds")}</p>
                <Button onClick={() => router.push("/login?verified=true")} className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl">
                  <Sparkles className="w-4 h-4 mr-2" />{t("start_button")}<ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8 py-8">
                <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500 dark:text-red-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">{t("error_title")}</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-light">{message}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-left">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-sm space-y-2">
                      <p className="font-medium text-red-800 dark:text-red-400">{t("error_causes")}</p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-red-600 dark:text-red-300/80"><li>{t("cause_1")}</li><li>{t("cause_2")}</li><li>{t("cause_3")}</li></ul>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button onClick={() => router.push("/login")} className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl shadow-none font-semibold">{t("go_to_login")}</Button>
                  <Button onClick={() => window.location.reload()} variant="outline" className="w-full h-12 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl"><RefreshCw className="w-4 h-4 mr-2" />{t("try_again")}</Button>
                </div>
                <p className="text-xs text-slate-400 font-light">{t("need_help")} <a href="mailto:support@quhealthy.com" className="text-medical-600 dark:text-medical-400 hover:underline">support@quhealthy.com</a></p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><QhSpinner size="md" /></div>}>
      <VerificationContent />
    </Suspense>
  );
}