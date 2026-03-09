"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  Shield,
  ArrowRight
} from "lucide-react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// Components
import SocialAuthButtons from '@/components/auth/SocialButtons';
import PrivacyModal from '@/components/auth/Privacymodal';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { RegisterConsumerRequest } from "@/types/auth";
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

export default function ConsumerSignupPage() {
  const router = useRouter();
  const t = useTranslations('AuthSignupConsumer');
  const { registerConsumer, loading: authLoading } = useAuth();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptPrivacy: false,
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      acceptPrivacy: checked,
      acceptTerms: checked
    }));
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
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const allPasswordRulesValid = passwordValidation.every(rule => rule.valid);

    return !!(
      formData.name.trim().length >= 2 &&
      isEmailValid &&
      allPasswordRulesValid &&
      passwordsMatch &&
      formData.acceptTerms
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const signupData: RegisterConsumerRequest = {
        firstName: firstName,
        lastName: lastName,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone ? formData.phone.trim() : undefined,
        termsAccepted: formData.acceptTerms as true,
        utmSource: "web_direct",
        utmMedium: "organic"
      };

      const response = await registerConsumer(signupData);

      toast.success(response.message || "¡Registro exitoso! Por favor, revisa tu correo.", {
        position: "top-center",
      });

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(response.email)}`);
      }, 1500);

    } catch (err: any) {
      const errorMessage = err.message || "Error al crear la cuenta de paciente";
      handleApiError(err);
    }
  };

  const rulesMessages = [
    t('password_placeholder'), // Min 8 chars
    "Mayúscula",
    "Número"
  ];

  const benefits = [t('benefits.0'), t('benefits.1'), t('benefits.2')];

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

        {/* Left Panel - Editorial Image (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/suite_patient_app.png"
            alt="QuHealthy Patient Sign Up"
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

            {/* Social Auth */}
            <SocialAuthButtons role="CONSUMER" />

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

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
                    <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name Field */}
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
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t('email_label')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder={t('email_placeholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t('password_label')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t('password_placeholder')}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pr-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                  </button>
                </div>

                {/* Password Strength Indicators */}
                <div className="flex gap-2 mt-2 flex-wrap">
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

              {/* Confirm Password Field */}
              <div className="space-y-2 pt-1">
                <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t('confirm_password_label')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder={t('confirm_password_placeholder')}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={cn(
                      "pr-12 h-14 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl transition-all",
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-200 dark:border-slate-800 focus:border-medical-500 focus:ring-medical-500/20"
                    )}
                    required
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

              {/* Privacy Checkbox */}
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
                    {t('accept_privacy')}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                    {t('accept_privacy_start')}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-medical-600 dark:text-medical-400 hover:text-medical-700 underline"
                    >
                      {t('privacy_policy')}
                    </button>
                    {t('and')}
                    <Link
                      href="/terms"
                      className="text-medical-600 dark:text-medical-400 hover:text-medical-700 underline"
                    >
                      {t('terms_of_service')}
                    </Link>.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || authLoading}
                className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl transition-all mt-4"
              >
                {authLoading ? (
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
            </form>

            {/* Login Link */}
            <div className="mt-10 text-center">
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

      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </GoogleOAuthProvider>
  );
}