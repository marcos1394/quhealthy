"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  ArrowRight,
  Shield,
  Check,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Building2,
  FlaskConical,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";

// Componentes y utilidades del sistema
import SocialAuthButtons from "@/components/auth/SocialButtons";
import { Checkbox } from "@/components/ui/checkbox";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useAuth } from "@/hooks/useAuth";
import { AuthResponse } from "@/types/auth";
import { handleApiError } from "@/lib/handleApiError";
import { nukeCookies } from "@/stores/SessionStore";
import { foundationOnboardingService } from "@/services/foundation-onboarding.service";
import { supplierService } from "@/services/supplier.service";
import { laboratoryOnboardingService } from "@/services/laboratory-onboarding.service";

export default function ProviderLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, verifyMfaLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [, setCaptchaToken] = useState<string>("");

  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  // Referencias de control
  const turnstileRef = useRef<any>(null);
  const isIntentionalSubmitRef = useRef(false);

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

  const isFormValid = (): boolean => {
    const isEmailValid = /^[^s@]+@[^s@]+.[^s@]+$/.test(formData.email);
    return isEmailValid && formData.password.length >= 6;
  };

  const handleAuthNavigation = async (response: AuthResponse) => {
    if (response.mfaRequired) {
      setIsMfaStep(true);
      setMfaToken(response.mfaChallengeToken || "");
      toast.info(response.message || "Se requiere MFA", { theme: "colored" });
      setLoading(false);
      return;
    }

    const redirectParam = searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/")) {
      toast.success(t("login_success"), { theme: "colored" });
      router.push(redirectParam);
      return;
    }

    const role = response.role;

    if (role === "ROLE_ADMIN") {
      toast.success(t("login_success"), { theme: "colored" });
      router.push("/admin/dashboard");
      return;
    }

    // 🔬 1. LABORATORIOS CLÍNICOS
    if ((role as string) === "ROLE_LABORATORY" || (role as string) === "LABORATORY") {
      toast.success(t("login_success"), { theme: "colored" });
      try {
        const labStatus = await laboratoryOnboardingService.getStatus();
        if (labStatus.isRegistered && (labStatus.canExploreDashboard || labStatus.currentStep >= 5)) {
          router.push("/laboratory/dashboard");
        } else {
          router.push("/onboarding/laboratory");
        }
      } catch {
        router.push("/laboratory/dashboard");
      }
      return;
    }

    // 🤝 2. FUNDACIONES & ONGs
    if ((role as string) === "ROLE_FOUNDATION" || (role as string) === "FOUNDATION") {
      toast.success(t("login_success"), { theme: "colored" });
      try {
        const fStatus = await foundationOnboardingService.getStatus();
        if (fStatus.isCompleted || (fStatus.currentStep && fStatus.currentStep >= 5)) {
          router.push("/foundation/dashboard");
        } else {
          router.push("/onboarding/foundation");
        }
      } catch {
        router.push("/foundation/dashboard");
      }
      return;
    }

    // 📦 3. PROVEEDORES DE INSUMOS
    if ((role as string) === "ROLE_SUPPLIER" || (role as string) === "SUPPLIER") {
      toast.success(t("login_success"), { theme: "colored" });
      try {
        const sStatus = await supplierService.getOnboardingStatus();
        if (sStatus.isRegistered && sStatus.currentStep >= 5) {
          router.push("/supplier/dashboard");
        } else {
          router.push("/onboarding/supplier");
        }
      } catch {
        router.push("/onboarding/supplier");
      }
      return;
    }

    // 🩺 4. PROFESIONALES DE LA SALUD & CLÍNICAS & STAFF
    if (role === "ROLE_PROVIDER" || role === "ROLE_STAFF") {
      toast.success(t("login_success"), { theme: "colored" });

      // Verificación cruzada si es laboratorio, fundación o proveedor registrado con cuenta de prestador
      try {
        const labStatus = await laboratoryOnboardingService.getStatus();
        if (labStatus.isRegistered) {
          if (labStatus.canExploreDashboard || labStatus.currentStep >= 5) {
            router.push("/laboratory/dashboard");
          } else {
            router.push("/onboarding/laboratory");
          }
          return;
        }
      } catch {}

      try {
        const fStatus = await foundationOnboardingService.getStatus();
        if (fStatus.profile && fStatus.profile.legalName) {
          if (fStatus.isCompleted || (fStatus.currentStep && fStatus.currentStep >= 5)) {
            router.push("/foundation/dashboard");
          } else {
            router.push("/onboarding/foundation");
          }
          return;
        }
      } catch {}

      try {
        const sStatus = await supplierService.getOnboardingStatus();
        if (sStatus.organizationId || sStatus.legalName) {
          if (sStatus.currentStep >= 5) {
            router.push("/supplier/dashboard");
          } else {
            router.push("/onboarding/supplier");
          }
          return;
        }
      } catch {}

      const isOnboardingComplete = response.status?.onboardingComplete;
      if (isOnboardingComplete) {
        router.push("/provider/dashboard");
      } else {
        router.push("/onboarding");
      }
      return;
    }

    // Si es paciente que entró al portal institucional, redirigir amistosamente a su dashboard
    if (role === "ROLE_CONSUMER") {
      toast.success(t("login_success"), { theme: "colored" });
      router.push("/patient/dashboard");
      return;
    }

    toast.success(t("login_success"), { theme: "colored" });
    router.push("/provider/dashboard");
  };

  const processLogin = async (token: string) => {
    try {
      const response = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        captchaToken: token,
        role: "ROLE_PROVIDER",
      });

      await handleAuthNavigation(response);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Credenciales incorrectas.";

      if (errorMessage.includes("verificar")) {
        setError(t("unverified_email_error"));
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
      setError(t("invalid_form_error"));
      return;
    }

    setLoading(true);
    setError("");

    isIntentionalSubmitRef.current = true;
    turnstileRef.current?.execute();
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await verifyMfaLogin({ mfaChallengeToken: mfaToken, code: mfaCode });
      await handleAuthNavigation(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Código inválido.");
      handleApiError(err);
      setLoading(false);
    }
  };

  const proHighlights = [
    "Agenda médica inteligente, recordatorios y videoconsultas HD",
    "Expediente Clínico Digital bajo norma oficial NOM-004-SSA3",
    "Cobro automatizado y dispersión segura de ingresos",
    "Red de derivaciones con clínicas, laboratorios y aseguradoras",
  ];

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
        
        {/* ── PANEL IZQUIERDO (HERO B2B & BENEFICIOS CLÍNICOS) ───────────── */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
          <motion.img
            initial={{ opacity: 0.4, scale: 1.05 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src="/hero_medical_lifestyle.png"
            alt={t("hero_img_alt")}
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-luminosity opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/65 to-gray-950/25" />

          {/* Header Marca */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                QuHealthy<span className="text-emerald-400">.</span>
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Pro
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t("badge_secure_login")}</span>
            </span>
          </div>

          {/* Área de Beneficios B2B */}
          <div className="relative z-10 space-y-8 max-w-lg">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Ecosistema Clínico & Empresarial</span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-[1.15]">
                {t("pro_title")}
              </h2>

              <p className="text-sm text-gray-300 font-normal leading-relaxed">
                {t("pro_subtitle")}
              </p>

              <div className="space-y-3 pt-2">
                {proHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-200 text-xs sm:text-sm font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges de Roles Atendidos */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-gray-200 font-semibold">Médicos y Clínicas</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                <FlaskConical className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs text-gray-200 font-semibold">Laboratorios Clínicos</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs text-gray-200 font-semibold">Fundaciones & ONGs</span>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-xs text-gray-200 font-semibold">Proveedores de Salud</span>
              </div>
            </div>
          </div>
          
          {/* Footer Card */}
          <div className="relative z-10 text-[11px] text-gray-400 font-medium">
            © {new Date().getFullYear()} QuHealthy Inc. Entorno Profesional y Clínico Seguro.
          </div>
        </div>

        {/* ── PANEL DERECHO (FORMULARIO B2B PROFESIONAL) ─────────────────── */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md space-y-6"
          >
            {/* Header & Retorno a Pacientes */}
            <div className="text-center lg:text-left space-y-2">
              <div className="flex items-center justify-between">
                <Link href="/" className="inline-block mb-2">
                  <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
                  </span>
                  <span className="ml-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                    Pro
                  </span>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors group"
                >
                  <span>{t("switch_to_consumer")}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                <span>{t("pro_tagline")}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t("pro_title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                Ingresa con tu correo institucional para acceder a tu panel de gestión.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Social Login Institucional */}
              <SocialAuthButtons
                accountRole="ROLE_PROVIDER"
                onSuccess={handleAuthNavigation}
              />

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-[11px] font-semibold">
                  <span className="px-3 bg-white dark:bg-[#0a0a0a] text-gray-400 uppercase tracking-wider">
                    {t("or_continue")}
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
                          {t("session_expired_title")}
                        </p>
                        <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          {t("session_expired_desc")}
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
                    Correo Profesional o Institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t("email_placeholder_pro")}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("password_label")}
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {t("forgot_password")}
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("password_placeholder")}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
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
                    {t("remember_me")}
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
                    toast.error(t("captcha_error"));
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
                  className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer border-0"
                >
                  {loading ? (
                    <>
                      <QhSpinner size="sm" className="text-current" />
                      <span>{t("loading")}</span>
                    </>
                  ) : (
                    <>
                      <span>Acceder a QuHealthy Pro</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>

            </div>

            {/* Enlaces de Registro Institucional */}
            <div className="bg-gray-50/80 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center space-y-2.5">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                ¿Aún no formas parte de nuestra red de aliados?
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <Link
                  href="/provider/register"
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-emerald-700 dark:text-emerald-300 font-semibold hover:border-emerald-500/40 transition-colors"
                >
                  Médico / Clínica
                </Link>
                <Link
                  href="/laboratory/register"
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-teal-700 dark:text-teal-300 font-semibold hover:border-teal-500/40 transition-colors"
                >
                  Laboratorio
                </Link>
                <Link
                  href="/foundation/register"
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-rose-700 dark:text-rose-300 font-semibold hover:border-rose-500/40 transition-colors"
                >
                  Fundación
                </Link>
                <Link
                  href="/supplier/register"
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sky-700 dark:text-sky-300 font-semibold hover:border-sky-500/40 transition-colors"
                >
                  Proveedor
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* MFA Modal Overlay */}
      <AnimatePresence>
        {isMfaStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Verificación de 2 Pasos
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Ingresa el código de 6 dígitos generado por tu aplicación autenticadora.
                </p>
              </div>
              
              <form onSubmit={handleMfaSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-center">
                    Código MFA
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/D/g, ""))}
                    className="w-full text-center tracking-[0.5em] text-3xl h-14 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-mono"
                    placeholder="000000"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || mfaCode.length !== 6}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <QhSpinner size="sm" className="text-current" /> : "Verificar y Entrar"}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsMfaStep(false);
                    setMfaCode("");
                    setMfaToken("");
                    setError("");
                  }}
                  className="w-full h-12 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold transition-all"
                >
                  Cancelar
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GoogleOAuthProvider>
  );
}
