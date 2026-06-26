"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  Stethoscope,
  ArrowRight,
  Shield,
  Check,
  AlertTriangle
} from "lucide-react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { Turnstile } from '@marsidev/react-turnstile';

// Components
import SocialAuthButtons from '@/components/auth/SocialButtons';

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthResponse } from "@/types/auth";
import { handleApiError } from '@/lib/handleApiError';
import { nukeCookies } from '@/stores/SessionStore';
import { consumerProfileService } from '@/services/consumerProfile.service';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  const [captchaToken, setCaptchaToken] = useState<string>("");
  
  // 🚀 REFERENCIAS DE CONTROL
  const turnstileRef = useRef<any>(null);
  // 🚀 CANDADO: Nos asegura que el usuario hizo clic en el botón antes de intentar el login
  const isIntentionalSubmitRef = useRef(false); 

  const [userType, setUserType] = useState<"consumer" | "provider">("consumer");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  useEffect(() => {
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setSessionExpired(true);
      nukeCookies();
      const url = new URL(window.location.href);
      url.searchParams.delete('expired');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRememberMeChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, rememberMe: checked }));
  };

  const handleTabChange = (value: string) => {
    setUserType(value as "consumer" | "provider");
    setError("");
  };

  const isFormValid = (): boolean => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    return isEmailValid && formData.password.length >= 6;
  };

  const handleAuthNavigation = async (response: AuthResponse) => {
    const role = response.role;

    if (role === 'ROLE_ADMIN') {
      router.push("/admin/dashboard");
    } else if (role === 'ROLE_PROVIDER') {
      const isOnboardingComplete = response.status?.onboardingComplete;
      if (isOnboardingComplete) {
        router.push("/provider/dashboard");
      } else {
        router.push("/onboarding");
      }
    } else if (role === 'ROLE_CONSUMER') {
      try {
        const profile: any = await consumerProfileService.getProfile();
        const step = profile?.onboardingStep || 0;
        const stepsLength = 8;
        
        if (step >= stepsLength) {
          router.push("/patient/dashboard");
        } else {
          router.push("/onboarding/patient");
        }
      } catch (err) {
        router.push("/onboarding/patient");
      }
    } else {
      router.push("/discover");
    }
  };

  const processLogin = async (token: string) => {
    try {
      const response = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        captchaToken: token
      });

      toast.success(t('title'));
      await handleAuthNavigation(response);

    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Credenciales incorrectas.";

      if (errorMessage.includes("verificar")) {
        setError("Debes verificar tu correo antes de entrar. Revisa tu bandeja de entrada.");
      } else {
        setError(errorMessage);
      }
      handleApiError(err);
      
      // Reseteamos estados tras un error
      turnstileRef.current?.reset();
      setCaptchaToken("");
      setLoading(false);
      isIntentionalSubmitRef.current = false; // Cerramos el candado
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Por favor ingresa un email y contraseña válidos");
      return;
    }

    setLoading(true);
    setError("");
    
    // 🚀 ABRIMOS EL CANDADO: Indicamos que fue un clic real del usuario
    isIntentionalSubmitRef.current = true; 
    turnstileRef.current?.execute();
  };

  const benefits = userType === "consumer"
    ? [t('consumer_benefits.0'), t('consumer_benefits.1'), t('consumer_benefits.2')]
    : [t('provider_benefits.0'), t('provider_benefits.1'), t('provider_benefits.2')];

  const RoleIcon = userType === "consumer" ? User : Stethoscope;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="flex min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300 selection:bg-gray-200 dark:selection:bg-white/20">

        {/* Left Panel - Editorial Image (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden">
          <motion.img
            key={userType}
            initial={{ opacity: 0.5, scale: 1.05 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            src={userType === "consumer" ? "/suite_patient_app.png" : "/hero_medical_lifestyle.png"}
            alt="QuHealthy Authentication"
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 dark:from-black/90 dark:via-black/50 dark:to-transparent" />

          <div className="relative z-10 p-16 mt-auto">
            <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-8 tracking-tight leading-[1.1]">
              {t(userType === 'consumer' ? 'consumer_area' : 'provider_area')}
            </h2>

            <div className="space-y-4 mb-10">
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
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="mb-16 text-center lg:text-left">
              <Link href="/" className="inline-block mb-12">
                <span className="text-2xl font-serif italic tracking-tight text-black dark:text-white">
                  QuHealthy.
                </span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-semibold text-black dark:text-white mb-4 tracking-tight">
                {t('title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                {t('subtitle')}
              </p>
            </div>

            {/* User Type Selector */}
            <Tabs
              defaultValue="consumer"
              value={userType}
              onValueChange={handleTabChange}
              className="w-full mb-8"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-900 h-14 p-1 rounded-xl">
                <TabsTrigger
                  value="consumer"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 h-full rounded-lg text-sm font-medium transition-all"
                >
                  <User className="w-4 h-4 mr-2" /> {t('consumer_tab')}
                </TabsTrigger>
                <TabsTrigger
                  value="provider"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-black dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 h-full rounded-lg text-sm font-medium transition-all"
                >
                  <Stethoscope className="w-4 h-4 mr-2" /> {t('provider_tab')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Social Login */}
            <SocialAuthButtons
              accountRole={userType === "consumer" ? "ROLE_CONSUMER" : "ROLE_PROVIDER"}
              onSuccess={handleAuthNavigation}
            />

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm font-light">
                <span className="px-4 bg-white dark:bg-[#0a0a0a] text-gray-500 dark:text-gray-400">
                  {t('or_continue')}
                </span>
              </div>
            </div>

            {/* Expired Session Banner */}
            <AnimatePresence>
              {sessionExpired && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Tu sesión ha expirado</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Por tu seguridad, inicia sesión de nuevo.</p>
                    </div>
                    <button
                      onClick={() => setSessionExpired(false)}
                      className="ml-auto text-amber-400 hover:text-amber-600 dark:hover:text-amber-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                  {t('email_label')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={userType === 'consumer' ? t('email_placeholder_consumer') : t('email_placeholder_provider')}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-11 h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                    {t('password_label')}
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-black dark:text-white hover:underline font-medium transition-colors"
                  >
                    {t('forgot_password')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('password_placeholder')}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-11 pr-12 h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={handleRememberMeChange}
                  className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white border-gray-300 dark:border-gray-700 w-5 h-5"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 dark:text-gray-400 font-medium cursor-pointer select-none"
                >
                  {t('remember_me')}
                </label>
              </div>

              {/* 🚀 FIX: Turnstile con candados de seguridad */}
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                  // Solo procesamos el login si el usuario apretó el botón
                  if (isIntentionalSubmitRef.current) {
                    processLogin(token);
                  }
                }}
                onError={(errorCode) => {
                  console.error("Turnstile error code:", errorCode);
  toast.error("Error al validar la seguridad. Por favor, intenta de nuevo.");
  setLoading(false);
  isIntentionalSubmitRef.current = false;
  turnstileRef.current?.reset();
                }}
                options={{ 
                  theme: 'auto', 
                  size: 'invisible',
                  execution: 'execute' // 🚀 Evita que arranque automáticamente al cargar la página
                }}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className="w-full h-14 text-base font-semibold text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-none rounded-xl transition-all mt-4"
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
            </form>

            {/* Signup Link */}
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-light mb-4">
                {t('no_account')}
              </p>

              <Link
                href={userType === 'consumer' ? "/register" : "/provider/register"}
                className="inline-flex items-center justify-center w-full h-14 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group"
              >
                {t('create_account')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}