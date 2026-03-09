"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Check
} from "lucide-react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

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

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('Auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [userType, setUserType] = useState<"consumer" | "provider">("consumer");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

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

  const handleAuthNavigation = (response: AuthResponse) => {
    const role = response.role;

    if (role === 'ADMIN') {
      router.push("/admin/dashboard");
    }
    else if (role === 'PROVIDER') {
      const isOnboardingComplete = response.status?.onboardingComplete;
      if (isOnboardingComplete) {
        router.push("/provider/dashboard");
      } else {
        router.push("/onboarding");
      }
    }
    else {
      router.push("/patient/discover");
    }

    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Por favor ingresa un email y contraseña válidos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      toast.success(t('title'));
      handleAuthNavigation(response);

    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Credenciales incorrectas.";

      if (errorMessage.includes("verificar")) {
        setError("Debes verificar tu correo antes de entrar. Revisa tu bandeja de entrada.");
      } else {
        setError(errorMessage);
      }
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const benefits = userType === "consumer"
    ? [t('consumer_benefits.0'), t('consumer_benefits.1'), t('consumer_benefits.2')]
    : [t('provider_benefits.0'), t('provider_benefits.1'), t('provider_benefits.2')];

  const RoleIcon = userType === "consumer" ? User : Stethoscope;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

        {/* Left Panel - Editorial Image (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero_medical_lifestyle.png"
            alt="QuHealthy Authentication"
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          <div className="relative z-10 p-16 mt-auto">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
              {t(userType === 'consumer' ? 'consumer_area' : 'provider_area')}
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

            {/* User Type Selector */}
            <Tabs
              defaultValue="consumer"
              value={userType}
              onValueChange={handleTabChange}
              className="w-full mb-8"
            >
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-900 h-14 p-1 rounded-xl">
                <TabsTrigger
                  value="consumer"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500 h-full rounded-lg text-sm font-medium transition-all"
                >
                  <User className="w-4 h-4 mr-2" /> {t('consumer_tab')}
                </TabsTrigger>
                <TabsTrigger
                  value="provider"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500 h-full rounded-lg text-sm font-medium transition-all"
                >
                  <Stethoscope className="w-4 h-4 mr-2" /> {t('provider_tab')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Social Login */}
            <SocialAuthButtons
              role={userType === "consumer" ? "CONSUMER" : "PROVIDER"}
              onSuccess={handleAuthNavigation}
            />

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm font-light">
                <span className="px-4 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                  {t('or_continue')}
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

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t('email_label')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={userType === 'consumer' ? t('email_placeholder_consumer') : t('email_placeholder_provider')}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
                    {t('password_label')}
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-medical-600 dark:text-medical-400 hover:text-medical-700 font-medium transition-colors"
                  >
                    {t('forgot_password')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('password_placeholder')}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-11 pr-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
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
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-3 pt-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={handleRememberMeChange}
                  className="data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white border-slate-300 dark:border-slate-700 w-5 h-5"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none"
                >
                  {t('remember_me')}
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className="w-full h-14 text-base font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-none rounded-xl transition-all mt-4"
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
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light mb-4">
                {t('no_account')}
              </p>

              <Link
                href={userType === 'consumer' ? "/register" : "/provider/register"}
                className="inline-flex items-center justify-center w-full h-14 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
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