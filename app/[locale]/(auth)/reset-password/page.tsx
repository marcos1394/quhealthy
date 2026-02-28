/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, Shield, Check, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface PasswordRule { regex: RegExp; valid: boolean; }

const passwordRulesConfig: Omit<PasswordRule, "valid">[] = [
  { regex: /.{8,}/ }, { regex: /[A-Z]/ }, { regex: /\d/ }, { regex: /[\W_]/ },
];

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("AuthResetPassword");
  const { validateResetToken, confirmResetPassword } = useAuth();

  const token = searchParams.get("token");

  const [tokenState, setTokenState] = useState<"checking" | "valid" | "invalid" | "expired">("checking");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pwdRules, setPwdRules] = useState<PasswordRule[]>(passwordRulesConfig.map(r => ({ ...r, valid: false })));
  const labels = [t("new_password_placeholder"), "A-Z", "0-9", "!@#$"];

  useEffect(() => {
    const validate = async () => {
      if (!token) { setTokenState("invalid"); return; }
      try { await validateResetToken({ token }); setTokenState("valid"); }
      catch (err: any) { setTokenState(err.message?.includes("expired") ? "expired" : "invalid"); }
    };
    validate();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setPwdRules(passwordRulesConfig.map(r => ({ ...r, valid: r.regex.test(password) }))); }, [password]);

  const isValid = () => pwdRules.every(r => r.valid) && password === confirmPwd && confirmPwd.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid() || !token) return;
    setLoading(true); setError("");
    try {
      await confirmResetPassword({ token, newPassword: password });
      setSuccess(true); toast.success(t("success_title"), { position: "top-center" });
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) { setError(err.message || "Error"); toast.error(err.message); }
    finally { setLoading(false); }
  };

  if (tokenState === "checking") return (
    <div className="flex flex-col justify-center items-center py-16 space-y-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Shield className="w-10 h-10 text-medical-600 dark:text-medical-400" strokeWidth={1.5} />
      </motion.div>
      <p className="text-slate-700 dark:text-slate-300 font-medium">{t("checking_token")}</p>
      <p className="text-slate-500 text-sm font-light">{t("checking_moment")}</p>
    </div>
  );

  if (tokenState === "invalid" || tokenState === "expired") return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 py-8">
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-medium text-slate-900 dark:text-white">{tokenState === "expired" ? t("expired_title") : t("invalid_title")}</h2>
        <p className="text-slate-500 text-sm font-light max-w-xs mx-auto">{tokenState === "expired" ? t("expired_desc") : t("invalid_desc")}</p>
      </div>
      <div className="space-y-3">
        <Link href="/forgot-password" className="block"><Button className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl shadow-none font-semibold">{t("request_new")}</Button></Link>
        <Link href="/login" className="block"><Button variant="outline" className="w-full h-12 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">{t("back_to_login")}</Button></Link>
      </div>
    </motion.div>
  );

  if (success) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-6">
      <div className="mx-auto w-16 h-16 bg-medical-50 dark:bg-medical-500/10 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-medical-600 dark:text-medical-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-medium text-slate-900 dark:text-white">{t("success_title")}</h2>
      <p className="text-slate-500 text-sm font-light">{t("success_desc")}</p>
      <p className="text-xs text-slate-400">{t("redirect_hint")}</p>
      <Link href="/login" className="block"><Button className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl shadow-none font-semibold"><Sparkles className="w-4 h-4 mr-2" />{t("go_to_login")}</Button></Link>
    </motion.div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">{t("new_password_label")}</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={t("new_password_placeholder")} className="pl-11 pr-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 rounded-xl" required />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {showPwd ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {pwdRules.map((r, i) => (
            <span key={i} className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md", r.valid ? "bg-medical-50 text-medical-600 dark:bg-medical-500/10 dark:text-medical-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
              {r.valid && <Check size={12} strokeWidth={2} />}{labels[i]}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">{t("confirm_password_label")}</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input type={showConfirmPwd ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder={t("confirm_password_placeholder")} className={cn("pl-11 pr-12 h-14 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl", confirmPwd && password !== confirmPwd ? "border-red-500" : "border-slate-200 dark:border-slate-800 focus:border-medical-500")} required />
          <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {showConfirmPwd ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
          </button>
        </div>
        {confirmPwd && <p className={cn("text-xs mt-1", password === confirmPwd ? "text-medical-600" : "text-red-500")}>{password === confirmPwd ? t("passwords_match") : t("passwords_not_match")}</p>}
      </div>

      <AnimatePresence>{error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200"><AlertDescription className="text-sm font-medium">{error}</AlertDescription></Alert></motion.div>}</AnimatePresence>

      <Button type="submit" disabled={!isValid() || loading} className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl">
        {loading ? <><Loader2 className="animate-spin mr-2 w-5 h-5" />{t("updating")}</> : <><Sparkles className="mr-2 w-5 h-5 text-yellow-500" />{t("submit_button")}</>}
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2"><Shield className="w-3 h-3" /><span>{t("secure_connection")}</span></div>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("AuthResetPassword");
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero_medical_lifestyle.png" alt="Reset" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-90 grayscale-[20%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="relative z-10 p-16 mt-auto">
          <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">{t("area_title")}</h2>
          <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 w-max">
            <Shield className="w-8 h-8 text-medical-300" strokeWidth={1.5} />
            <div><p className="text-white font-medium text-sm">{t("secure_connection")}</p><p className="text-slate-300 text-xs font-light max-w-xs">{t("secure_hint")}</p></div>
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
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-medical-500 animate-spin" /></div>}><ResetPasswordForm /></Suspense>
          <div className="mt-10 text-center"><Link href="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium"><ArrowLeft className="w-4 h-4 mr-2" />{t("back_to_login")}</Link></div>
        </motion.div>
      </div>
    </div>
  );
}