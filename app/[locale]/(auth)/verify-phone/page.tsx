/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Smartphone, Clock, RefreshCw, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Shield, Info } from "lucide-react";
import { useSessionStore } from "@/stores/SessionStore";
import { cn } from "@/lib/utils";
import { handleApiError } from '@/lib/handleApiError';

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
    if (codeTimer > 0) { const tm = setTimeout(() => setCodeTimer(p => p - 1), 1000); return () => clearTimeout(tm); }
    else setCanResend(true);
  }, [codeTimer]);

  useEffect(() => {
    if (resendCooldown > 0) { const tm = setTimeout(() => setResendCooldown(p => p - 1), 1000); return () => clearTimeout(tm); }
  }, [resendCooldown]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleCodeChange = (v: string) => { setCode(v.replace(/\D/g, "").slice(0, 6)); setError(""); };

  useEffect(() => {
    if (code.length === 6 && !isLoading) handleSubmit();
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6) return;
    if (!user?.email) {
      return;
    }
    setIsLoading(true); setError("");
    try {
      await verifyPhone({ code, identifier: user.email });
      setSuccess(true);
      toast.success(t("success_title"), { position: "top-center" });
      setTimeout(() => {
        router.push(role === "PROVIDER" ? "/provider/onboarding/checklist" : "/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error");
      handleApiError(err);
      setCode(""); setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!user?.email) {
      return;
    }
    setIsResending(true); setError("");
    try {
      await resendVerification({ email: user.email, type: 'SMS' });
      toast.success(t("resend_button"));
      setCodeTimer(300); setCanResend(false); setResendCooldown(60);
    } catch (err: any) { setError(err.message); handleApiError(err); }
    finally { setIsResending(false); }
  };

  const handleSkip = () => {
    router.push(role === "PROVIDER" ? "/provider/onboarding/checklist?phone_pending=true" : "/dashboard?phone_pending=true");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero_medical_lifestyle.png" alt="Phone Verify" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-90 grayscale-[20%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="relative z-10 p-16 mt-auto">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">{t("area_title")}</h2>
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 w-max">
            <Shield className="w-8 h-8 text-medical-300" strokeWidth={1.5} />
            <div><p className="text-white font-medium text-sm">{t("secure_connection")}</p><p className="text-slate-300 text-xs font-light max-w-xs">{t("info")}</p></div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-block mb-8"><span className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">QuHealthy<span className="text-medical-600 dark:text-medical-400">.</span></span></Link>
            <h1 className="text-3xl font-medium text-slate-900 dark:text-white mb-2 tracking-tight">{t("title")}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-light">{t("desc")}</p>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" /><span className="text-sm text-slate-600 dark:text-slate-400">{t("code_valid_for")}</span></div>
                  <Badge variant="outline" className={cn("font-mono text-sm border-0", codeTimer < 60 ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-medical-50 text-medical-600 dark:bg-medical-500/10 dark:text-medical-400")}>{formatTime(codeTimer)}</Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("code_label")}</label>
                    <Input type="text" value={code} onChange={e => handleCodeChange(e.target.value)} placeholder={t("code_placeholder")} maxLength={6} autoFocus
                      className={cn("h-16 text-center text-4xl tracking-[0.5em] font-mono bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 rounded-xl", error && "border-red-500")}
                      disabled={isLoading || success} />
                    <p className="text-xs text-slate-500 text-center font-light">{code.length}/6 {t("digits_status")}</p>
                  </div>

                  <AnimatePresence>{error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200"><AlertCircle className="h-4 w-4" /><AlertDescription className="text-sm font-medium">{error}</AlertDescription></Alert></motion.div>}</AnimatePresence>

                  <Button type="submit" className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl" disabled={isLoading || code.length !== 6}>
                    {isLoading ? <><Loader2 className="animate-spin mr-2 w-5 h-5" />{t("verifying")}</> : <><ShieldCheck className="mr-2 w-5 h-5" />{t("verify_button")}</>}
                  </Button>
                </form>

                <div className="text-center space-y-3">
                  {canResend && resendCooldown === 0 ? (
                    <Button variant="ghost" onClick={handleResendCode} disabled={isResending} className="text-medical-600 dark:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10">
                      {isResending ? <><Loader2 className="animate-spin mr-2 w-4 h-4" />{t("resending")}</> : <><RefreshCw className="mr-2 w-4 h-4" />{t("resend_button")}</>}
                    </Button>
                  ) : (
                    <p className="text-sm text-slate-500 font-light">{resendCooldown > 0 ? `${t("can_resend_in")} ${resendCooldown}s` : `${t("cant_resend_yet")} ${formatTime(codeTimer)}`}</p>
                  )}
                </div>

                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-start gap-2">
                  <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" /><p className="text-xs text-slate-500 dark:text-slate-400 font-light">{t("info")}</p>
                </div>

                <div className="text-center pt-2">
                  <Button variant="ghost" onClick={handleSkip} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm">{t("skip")}<ArrowRight className="ml-2 w-4 h-4" /></Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-8">
                <div className="mx-auto w-16 h-16 bg-medical-50 dark:bg-medical-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-medical-600 dark:text-medical-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">{t("success_title")}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-light">{t("success_desc")}</p>
                </div>
                <div className="bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-medical-600 dark:text-medical-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-left"><p className="text-sm font-medium text-medical-700 dark:text-medical-400 mb-0.5">{t("success_status")}</p><p className="text-xs text-medical-600/80 dark:text-medical-300/80">{t("success_redirect")}</p></div>
                  </div>
                </div>
                <Button onClick={() => router.push(role === "PROVIDER" ? "/provider/onboarding/checklist" : "/dashboard")} className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl">
                  <Sparkles className="w-4 h-4 mr-2" />{t("continue")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}