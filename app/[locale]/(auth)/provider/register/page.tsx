"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Shield,
  ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useTranslations } from "next-intl";

// Components
import SocialAuthButtons from '@/components/auth/SocialButtons';
import TermsModal from '@/components/auth/TermsModal';

// Enterprise Integration
import { useAuth } from "@/hooks/useAuth";
import { RegisterProviderRequest } from "@/types/auth";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { handleApiError } from '@/lib/handleApiError';

// Types
interface PasswordRule {
  regex: RegExp;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/ },
  { regex: /[A-Z]/ },
  { regex: /\d/ },
  { regex: /[\W_]/ },
];

export default function ProviderSignupPage() {
  const router = useRouter();
  const t = useTranslations('AuthSignupProvider');
  const { registerProvider, error: apiError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, acceptTerms: checked }));
  };

  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({
        ...rule,
        valid: rule.regex.test(formData.password)
      }))
    );
  }, [formData.password]);

  const isFormValid = (): boolean => {
    const isNameValid = formData.name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isPasswordValid =
      passwordValidation.every(rule => rule.valid) &&
      formData.password === formData.confirmPassword &&
      formData.confirmPassword.length > 0;
    const areTermsAccepted = formData.acceptTerms;

    return isNameValid && isEmailValid && isPasswordValid && areTermsAccepted;
  };

  const handleSocialSuccess = (res: any) => {
    if (res && res.status) {
      if (!res.status.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/provider/dashboard");
      }
    } else {
      router.push("/onboarding");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);

    try {
      const nameParts = formData.name.trim().split(' ');
      const signupData: RegisterProviderRequest = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        termsAccepted: formData.acceptTerms as true
      };

      const res = await registerProvider(signupData);

      if (res && res.id) {
        toast.success("¡Cuenta creada correctamente! Por favor, revisa tu correo.");
        router.push(`/verify-email?email=${encodeURIComponent(res.email)}`);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (err: any) {
      setLoading(false);
      console.error("Error en registro:", err);
      handleApiError(err);
    }
  };

  const rulesMessages = [
    t('password_placeholder'), // Min 8 chars
    "Mayúscula",
    "Número",
    "Caráct. Esp."
  ];

  const benefits = [t('benefits.0'), t('benefits.1'), t('benefits.2')];

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

        {/* Left Panel - Editorial Image (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero_medical_lifestyle.png"
            alt="QuHealthy Provider Sign Up"
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <div className="relative z-10 p-16 mt-auto">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
              {t('area_title')}
            </h2>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-slate-200 font-light text-lg"
                >
                  <div className="p-1.5 rounded-full bg-medical-500/20 backdrop-blur-sm">
                    <Check className="w-4 h-4 text-medical-400" strokeWidth={2} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20 w-max">
              <Shield className="w-8 h-8 text-medical-300" strokeWidth={1.5} />
              <div>
                <p className="text-white font-medium text-sm">{t('secure_connection')}</p>
                <p className="text-slate-300 text-xs font-light">
                  {t('secure_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Minimalist Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Header */}
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
                {t('subtitle')}
              </p>
            </div>

            {/* Social Auth Buttons */}
            <SocialAuthButtons role="PROVIDER" onSuccess={handleSocialSuccess} />

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm font-light">
                <span className="px-4 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  {t('or_register')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-5">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
                    {t('name_label')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t('name_placeholder')}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                    {t('email_label')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('email_placeholder')}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                    {t('password_label')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('password_placeholder')}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pr-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                    </button>
                  </div>

                  {/* Password Rules */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {passwordValidation.map((rule, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all",
                          rule.valid
                            ? "bg-medical-50 text-medical-600 dark:bg-medical-500/10 dark:text-medical-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        )}
                      >
                        {rule.valid && <Check size={12} strokeWidth={2} />}
                        {rulesMessages[idx]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 pt-1">
                  <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">
                    {t('confirm_password_label')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t('confirm_password_placeholder')}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={cn(
                        "pr-12 h-14 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl transition-all",
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 dark:border-slate-800 focus:border-medical-500 focus:ring-medical-500/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5">
                      {t('passwords_not_match')}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-3 pt-4">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="mt-1 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white border-slate-300 dark:border-slate-700 w-5 h-5"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      {t('accept_terms')}
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                      {t('accept_terms_start')}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-medical-600 dark:text-medical-400 hover:text-medical-700 underline"
                      >
                        {t('terms_of_service')}
                      </button>{' '}
                      {t('and')}
                      <Link
                        href="/privacy"
                        className="text-medical-600 dark:text-medical-400 hover:text-medical-700 underline"
                      >
                        {t('privacy_policy')}
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Error */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
                      <AlertDescription className="text-sm font-medium">{apiError}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 w-5 h-5" />
                      {t('loading')}
                    </>
                  ) : (
                    <>
                      {t('submit_button')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                  {t('no_credit_card')}
                </p>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
                {t('has_account')}{' '}
                <Link
                  href="/login"
                  className="text-medical-600 dark:text-medical-400 font-medium hover:underline"
                >
                  {t('login_here')}
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </GoogleOAuthProvider>
  );
}