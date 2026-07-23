"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Stethoscope,
  ArrowRight,
  Shield,
  Check,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";

// Componentes
import SocialAuthButtons from "@/components/auth/SocialButtons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { AuthResponse } from "@/types/auth";
import { handleApiError } from "@/lib/handleApiError";
import { nukeCookies } from "@/stores/SessionStore";
import { consumerProfileService } from "@/services/consumerProfile.service";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [, setCaptchaToken] = useState<string>("");

  // Referencias de control
  const turnstileRef = useRef<any>(null);
  const isIntentionalSubmitRef = useRef(false);

  const [userType, setUserType] = useState<"consumer" | "provider">("consumer");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    const expired = searchParams.get("expired");
    if (expired === "true") {
      setSessionExpired(true);
      nukeCookies();
      const url = new URL(window.location.href);
      url.searchParams.delete("expired");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRememberMeChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
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

    if (role === "ROLE_ADMIN") {
      router.push("/admin/dashboard");
    } else if (role === "ROLE_PROVIDER" || role === "ROLE_STAFF") {
      const isOnboardingComplete = response.status?.onboardingComplete;
      if (isOnboardingComplete) {
        router.push("/provider/dashboard");
      } else {
        router.push("/onboarding");
      }
    } else if (role === "ROLE_CONSUMER") {
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
        captchaToken: token,
        role: userType === "consumer" ? "ROLE_CONSUMER" : "ROLE_PROVIDER",
      });

      toast.success(t("title", { defaultValue: "Sesión iniciada correctamente" }), {
        theme: "colored",
      });
      await handleAuthNavigation(response);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Credenciales incorrectas.";

      if (errorMessage.includes("verificar")) {
        setError(
          "Debes verificar tu correo antes de entrar. Revisa tu bandeja de entrada."
        );
      } else {
        setError(errorMessage);
      }
      handleApiError(err);

      // Reseteamos estados tras un error
      turnstileRef.current?.reset();
      setCaptchaToken("");
      setLoading(false);
      isIntentionalSubmitRef.current = false;
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

    isIntentionalSubmitRef.current = true;
    turnstileRef.current?.execute();
  };

  const benefits =
    userType === "consumer"
      ? [
          t("consumer_benefits.0", { defaultValue: "Acceso inmediato a tu expediente médico digital" }),
          t("consumer_benefits.1", { defaultValue: "Agenda y gestión de citas en tiempo real" }),
          t("consumer_benefits.2", { defaultValue: "Comunicación directa y segura con especialistas" }),
        ]
      : [
          t("provider_benefits.0", { defaultValue: "Gestión omnicanal de pacientes y agenda" }),
          t("provider_benefits.1", { defaultValue: "Fichas clínicas personalizables e IA asistida" }),
          t("provider_benefits.2", { defaultValue: "Facturación electrónica y control financiero" }),
        ];

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
        
        {/* ── PANEL IZQUIERDO (HERO VISUAL & BENEFICIOS) ────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
          <motion.img
            key={userType}
            initial={{ opacity: 0.4, scale: 1.05 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={
              userType === "consumer"
                ? "/suite_patient_app.png"
                : "/hero_medical_lifestyle.png"
            }
            alt="QuHealthy Authentication"
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-luminosity opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />

          {/* Header Marca */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                QuHealthy<span className="text-emerald-400">.</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acceso Seguro</span>
            </span>
          </div>

          {/* Área de Beneficios Dinámica */}
          <div className="relative z-10 space-y-8 max-w-lg">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                {t(userType === "consumer" ? "consumer_area" : "provider_area", {
                  defaultValue:
                    userType === "consumer"
                      ? "Portal Digital de Pacientes"
                      : "Ecosistema Médico Profesional",
                })}
              </h2>

              <div className="space-y-3 pt-2">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-200 text-xs sm:text-sm font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shield Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {t("secure_connection", { defaultValue: "Conexión Cifrada de Extremo a Extremo" })}
                  </h3>
                  <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                    {t("secure_desc", { defaultValue: "Cumplimiento con estándares HIPAA y certificaciones internacionales de salud." })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PANEL DERECHO (FORMULARIO) ─────────────────────────────────── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md space-y-6"
          >
            {/* Header & Logo Mobile */}
            <div className="text-center lg:text-left space-y-2">
              <Link href="/" className="inline-block lg:hidden mb-4">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
                </span>
              </Link>

              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <KeyRound className="w-4 h-4" strokeWidth={2} />
                <span>Autenticación de Usuario</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t("title", { defaultValue: "Iniciar Sesión" })}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle", { defaultValue: "Ingresa tus credenciales para acceder a tu panel de control." })}
              </p>
            </div>

            {/* Selector de Rol en Pestaña Pill */}
            <Tabs
              defaultValue="consumer"
              value={userType}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800/50 h-12 p-1 rounded-2xl">
                <TabsTrigger
                  value="consumer"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-gray-500 h-full rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>{t("consumer_tab", { defaultValue: "Soy Paciente" })}</span>
                </TabsTrigger>

                <TabsTrigger
                  value="provider"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-gray-500 h-full rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Stethoscope className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>{t("provider_tab", { defaultValue: "Soy Médico / Staff" })}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Contenedor Principal del Formulario */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Social Login */}
              <SocialAuthButtons
                accountRole={
                  userType === "consumer" ? "ROLE_CONSUMER" : "ROLE_PROVIDER"
                }
                onSuccess={handleAuthNavigation}
              />

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-[11px] font-semibold">
                  <span className="px-3 bg-white dark:bg-[#0a0a0a] text-gray-400 uppercase tracking-wider">
                    {t("or_continue", { defaultValue: "o usa tu correo" })}
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
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl shadow-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          Tu sesión ha expirado
                        </p>
                        <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          Por tu seguridad, inicia sesión nuevamente.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSessionExpired(false)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
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
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-900/40 flex items-start gap-3 shadow-sm">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("email_label", { defaultValue: "Correo Electrónico" })}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={
                        userType === "consumer"
                          ? t("email_placeholder_consumer", { defaultValue: "tu@ejemplo.com" })
                          : t("email_placeholder_provider", { defaultValue: "doctor@clinica.com" })
                      }
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-12 pl-10 pr-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("password_label", { defaultValue: "Contraseña" })}
                    </label>
                    <Link
                      href="/recovery"
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      {t("forgot_password", { defaultValue: "¿Olvidaste tu contraseña?" })}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("password_placeholder", { defaultValue: "••••••••" })}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-12 pl-10 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={16} strokeWidth={2} />
                      ) : (
                        <Eye size={16} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2.5 pt-1">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={handleRememberMeChange}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md border-gray-300 dark:border-gray-700 w-4 h-4"
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs text-gray-600 dark:text-gray-400 font-semibold cursor-pointer select-none"
                  >
                    {t("remember_me", { defaultValue: "Recordar sesión en este equipo" })}
                  </label>
                </div>

                {/* Turnstile Captcha Invisible */}
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token) => {
                    setCaptchaToken(token);
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
                    theme: "auto",
                    size: "invisible",
                    execution: "execute",
                  }}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <>
                      <QhSpinner size="sm" className="text-current" />
                      <span>{t("loading", { defaultValue: "Iniciando sesión..." })}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("submit_button", { defaultValue: "Ingresar a mi Cuenta" })}</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>

            </div>

            {/* Signup Link */}
            <div className="text-center pt-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                {t("no_account", { defaultValue: "¿Aún no tienes una cuenta registrada?" })}
              </p>

              <Link
                href={
                  userType === "consumer" ? "/register" : "/provider/register"
                }
                className="inline-flex items-center justify-center w-full h-11 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm"
              >
                {t("create_account", { defaultValue: "Crear Cuenta Gratuitamente" })}
              </Link>
            </div>

          </motion.div>
        </div>

      </div>
    </GoogleOAuthProvider>
  );
}