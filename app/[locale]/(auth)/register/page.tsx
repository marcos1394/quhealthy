"use client"
/* eslint-disable react-doctor/no-giant-component */;
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, useRef } from "react";
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
import { Turnstile } from '@marsidev/react-turnstile';

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
  
  // 🚀 Estado local para controlar el bloqueo del botón mientras el captcha piensa
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [captchaToken, setCaptchaToken] = useState<string>("");
  // 🚀 REFERENCIA PARA CONTROLAR EL CAPTCHA INVISIBLE
  const turnstileRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptPrivacy: false,
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(() =>
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

  // 🚀 FIX: Quitamos la validación de captchaToken
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

  // 🚀 NUEVA FUNCIÓN: Se ejecuta SÓLO cuando Turnstile nos devuelve el token válido
  const processSignup = async (token: string) => {
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
        privacyPolicyVersion: "v1.0",
        captchaToken: token, // Usamos el token validado
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
      setError(errorMessage);
      handleApiError(err);
      
      // 🚀 IMPORTANTE: Reseteamos el captcha en caso de error
      turnstileRef.current?.reset();
      setCaptchaToken("");
      setIsVerifying(false);
    }
  };

  // 🚀 MODIFICADO: Solo arranca la verificación y dispara el Captcha
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setIsVerifying(true);
    setError("");
    
    // Ejecutamos el captcha invisible
    turnstileRef.current?.execute();
  };

  const rulesMessages = [
    t('password_placeholder'), // Min 8 chars
    "Mayúscula",
    "Número"
  ];

  const benefits = [t('benefits.0'), t('benefits.1'), t('benefits.2')];

  // Indicador combinado de carga
  const isProcessing = authLoading || isVerifying;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">

        {/* Left Panel - Editorial Image (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/suite_patient_app.png"
            alt="QuHealthy Patient Sign Up"
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 dark:from-black/90 dark:via-black/50 dark:to-transparent" />

          <div className="relative z-10 p-16 mt-auto">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
              {t('area_title')}
            </h2>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-200 font-light text-lg"
                >
                  <div className="p-1.5 rounded-full border border-white/30">
                    <Check className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/20 pt-8 w-full max-w-md">
              <div className="flex items-start gap-5">
                <Shield className="w-6 h-6 text-white mt-0.5 opacity-80" strokeWidth={1.5} />
                <div>
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">
                    {t('secure_connection')}
                  </p>
                  <p className="text-gray-300 text-sm font-light leading-relaxed">
                    {t('secure_desc')}
                  </p>
                </div>
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
                <span className="text-2xl font-serif italic tracking-tight text-black dark:text-white">
                  QuHealthy.
                </span>
              </Link>
              <h1 className="text-3xl font-medium text-black dark:text-white mb-2 tracking-tight">
                {t('title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-light">
                {t('subtitle')}
              </p>
            </div>

            {/* Social Auth */}
            <SocialAuthButtons accountRole="CONSUMER" />

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm font-light">
                <span className="px-4 bg-white dark:bg-[#0a0a0a] text-gray-500 dark:text-gray-400">
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
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                  {t('name_label')}
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder={t('name_placeholder')}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                  {t('email_label')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder={t('email_placeholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
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
                    className="pr-12 h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                          ? "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
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
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">
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
                      "pr-12 h-14 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl transition-all",
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10"
                    )}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                  className="mt-1 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white border-gray-300 dark:border-gray-700 w-5 h-5"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                  >
                    {t('accept_privacy')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                    {t('accept_privacy_start')}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-black dark:text-white hover:underline"
                    >
                      {t('privacy_policy')}
                    </button>
                    {t('and')}
                    <Link
                      href="/terms"
                      className="text-black dark:text-white hover:underline"
                    >
                      {t('terms_of_service')}
                    </Link>.
                  </p>
                </div>
              </div>

              {/* 🚀 FIX: Turnstile conectado a la ref y llamando a processSignup */}
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                  processSignup(token); // Ejecutamos el registro real
                }}
                onError={() => {
                  setError("Error al validar la seguridad. Por favor, intenta de nuevo.");
                  setIsVerifying(false);
                }}
                options={{ theme: 'auto', size: 'invisible' }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || isProcessing}
                className="w-full h-14 text-base font-semibold text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-none rounded-xl transition-all mt-4"
              >
                {isProcessing ? (
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
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light">
                {t('has_account')}{' '}
                <Link
                  href="/login"
                  className="text-black dark:text-white font-medium hover:underline"
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