"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Clock,
  AlertCircle,
  Check,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { handleApiError } from '@/lib/handleApiError';

interface PasswordRule {
  regex: RegExp;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/ },
  { regex: /[A-Z]/ },
  { regex: /\d/ },
];

export default function AccountRecoveryPage() {
  const router = useRouter();
  const t = useTranslations('AuthForgotPassword');
  const { sendRecoveryCode, verifyRecoveryCode, recoveryResetPassword } = useAuth();

  // Flow states
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeTimer, setCodeTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  const progress = (step / 3) * 100;

  useEffect(() => {
    if (step === 2 && codeTimer > 0) {
      const timer = setTimeout(() => setCodeTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (codeTimer === 0) {
      setCanResend(true);
    }
  }, [step, codeTimer]);

  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({
        ...rule,
        valid: rule.regex.test(newPassword)
      }))
    );
  }, [newPassword]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // STEP 1: Send Code — via authService
  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendRecoveryCode({
        contact,
        method: method === "email" ? "EMAIL" : "SMS"
      });
      toast.success(t('code_sent_title'));
      setStep(2);
      setCodeTimer(300);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || "Error");
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCanResend(false);
    setCodeTimer(300);
    setLoading(true);
    try {
      await sendRecoveryCode({
        contact,
        method: method === "email" ? "EMAIL" : "SMS"
      });
      toast.success(t('code_sent_title'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Code — via authService
  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError(t('code_hint'));
      return;
    }
    setLoading(true);
    setError("");

    try {
      await verifyRecoveryCode({ contact, code });
      toast.success("✓");
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Código inválido");
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password — via authService
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValidation.every(rule => rule.valid)) return;
    if (newPassword !== confirmPassword) {
      setError(t('passwords_not_match'));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await recoveryResetPassword({ contact, code, newPassword });
      toast.success(t('reset_password_button'), { position: "top-center" });
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Error");
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const rulesMessages = [
    t('new_password_placeholder'),
    "A-Z",
    "0-9"
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left Panel - Editorial Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
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

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
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

          {/* Progress */}
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
                    step > stepNum
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : step === stepNum
                        ? "bg-medical-600 text-white dark:bg-medical-500 ring-2 ring-medical-500/20 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  )}>
                    {step > stepNum ? <Check className="w-4 h-4" strokeWidth={2} /> : stepNum}
                  </div>
                  <span className={cn(
                    "hidden sm:block text-xs font-medium",
                    step === stepNum ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {stepNum === 1 && t('method')}
                    {stepNum === 2 && t('code')}
                    {stepNum === 3 && t('password')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.form key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleMethodSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">{t('recovery_method_label')}</Label>
                  <Select value={method} onValueChange={(val: "email" | "phone") => setMethod(val)}>
                    <SelectTrigger className="h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl">
                      <SelectValue placeholder={t('select_method_placeholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectItem value="email">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span>{t('email_method')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span>{t('sms_method')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    {method === "email" ? t('your_email_label') : t('your_phone_label')}
                  </Label>
                  <div className="relative">
                    {method === "email" ? (
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    ) : (
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    )}
                    <Input
                      type={method === "email" ? "email" : "tel"}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={method === "email" ? t('email_placeholder') : t('phone_placeholder')}
                      className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading || !contact}
                  className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl mt-4"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin mr-2 w-5 h-5" />{t('sending')}</>
                  ) : (
                    <>{t('send_code_button')}<ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              </motion.form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleCodeVerification} className="space-y-6">
                <div className="bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-medical-600 dark:text-medical-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-medical-700 dark:text-medical-400 mb-1">{t('code_sent_title')}</p>
                      <p className="text-xs text-medical-600 dark:text-medical-300">
                        {method === "email" ? t('check_email') : t('check_sms')} <span className="font-bold">{contact}</span>
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

                <Button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin mr-2 w-5 h-5" />{t('verifying')}</>
                  ) : (
                    <><CheckCircle2 className="mr-2 w-5 h-5" />{t('verify_code_button')}</>
                  )}
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

                <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl h-12">
                  <ArrowLeft className="w-4 h-4 mr-2" />{t('change_method_button')}
                </Button>
              </motion.form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.form key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handlePasswordReset} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">{t('new_password_label')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('new_password_placeholder')}
                      className="pl-11 pr-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {passwordValidation.map((rule, idx) => (
                      <span key={idx} className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all", rule.valid ? "bg-medical-50 text-medical-600 dark:bg-medical-500/10 dark:text-medical-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
                        {rule.valid && <Check size={12} strokeWidth={2} />}
                        {rulesMessages[idx]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">{t('confirm_password_label')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('confirm_password_placeholder')}
                      className={cn("pl-11 pr-12 h-14 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl", confirmPassword && newPassword !== confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800 focus:border-medical-500 focus:ring-medical-500/20")}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      {showConfirmPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3 h-3" />{t('passwords_not_match')}
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading || !passwordValidation.every(r => r.valid) || newPassword !== confirmPassword}
                  className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl mt-4"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin mr-2 w-5 h-5" />{t('updating')}</>
                  ) : (
                    <><Sparkles className="mr-2 w-5 h-5 text-yellow-500 dark:text-yellow-600" />{t('reset_password_button')}</>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />{t('back_to_login')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}