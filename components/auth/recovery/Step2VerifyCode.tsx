"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  email: string;
  deliveryMethod: 'OTP_EMAIL' | 'OTP_SMS';
  onSuccess: (token: string) => void;
  onGoBack: () => void;
}

export default function Step2VerifyCode({ email, deliveryMethod, onSuccess, onGoBack }: Props) {
  const t = useTranslations('AuthForgotPassword');
  const { verifyRecoveryCode, sendRecoveryCode } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeTimer, setCodeTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (codeTimer > 0) {
      const timer = setTimeout(() => setCodeTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [codeTimer]);

  const handleResendCode = async () => {
    setCanResend(false); setCodeTimer(300); setLoading(true); setError("");
    try {
      await sendRecoveryCode({ email, deliveryMethod });
      toast.success(t('code_sent_title'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError(t('code_hint'));
      return;
    }
    setLoading(true); setError("");

    try {
      const res: any = await verifyRecoveryCode({ email, code });
      const resetToken = res.token || res.message; 
      toast.success("✓");
      onSuccess(resetToken);
    } catch (err: any) {
      setError(err.message || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleSubmit} className="space-y-6">
      
      <div className="bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20 p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-medical-600 dark:text-medical-400 w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-medical-700 dark:text-medical-400 mb-1">{t('code_sent_title')}</p>
            <p className="text-xs text-medical-600 dark:text-medical-300">
              {deliveryMethod === "OTP_EMAIL" ? t('check_email') : t('check_sms')} <span className="font-bold">{email}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">{t('code_valid_for')}</span>
        </div>
        <Badge variant="outline" className={cn("font-mono text-sm border-0", codeTimer < 60 ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-medical-50 text-medical-600 dark:bg-medical-500/10 dark:text-medical-400")}>
          {formatTime(codeTimer)}
        </Badge>
      </div>

      <div className="space-y-3">
        <Label className="text-slate-700 dark:text-slate-300 font-medium">{t('verification_code_label')}</Label>
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder={t('code_placeholder')}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-16 text-center text-4xl tracking-[0.5em] font-mono focus:border-medical-500 focus:ring-medical-500/20 rounded-xl"
          maxLength={6}
          required
          autoFocus
        />
        <p className="text-xs text-slate-500 text-center font-light">{t('code_hint')}</p>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
          <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading || code.length !== 6} className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl">
        {loading ? <><Loader2 className="animate-spin mr-2 w-5 h-5" />{t('verifying')}</> : <><CheckCircle2 className="mr-2 w-5 h-5" />{t('verify_code_button')}</>}
      </Button>

      <div className="text-center pt-2">
        {canResend ? (
          <Button type="button" variant="ghost" onClick={handleResendCode} className="text-medical-600 dark:text-medical-400 hover:text-medical-700 hover:bg-medical-50 dark:hover:bg-medical-500/10">
            <RefreshCw className="w-4 h-4 mr-2" />{t('resend_code_button')}
          </Button>
        ) : (
          <p className="text-sm text-slate-500 font-light">{t('wait_to_resend')} {formatTime(codeTimer)}</p>
        )}
      </div>

      <Button type="button" variant="outline" onClick={onGoBack} className="w-full border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-12">
        <ArrowLeft className="w-4 h-4 mr-2" />{t('change_method_button')}
      </Button>
    </motion.form>
  );
}