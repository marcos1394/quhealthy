"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Check,
  Shield,
  ArrowRight,
  UserPlus,
  AlertCircle,
  Sparkles,
  User
} from "lucide-react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// Componentes
import SocialAuthButtons from "@/components/auth/SocialButtons";
import PrivacyModal from "@/components/auth/Privacymodal";
import { Turnstile } from "@marsidev/react-turnstile";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Integración
import { useAuth } from "@/hooks/useAuth";
import { RegisterConsumerRequest } from "@/types/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";

interface PasswordRule {
  regex: RegExp;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, "valid">[] = [
  { regex: /.{8,}/ },
  { regex: /[A-Z]/ },
  { regex: /\d/ },
];

export default function ConsumerSignupPage() {
  const router = useRouter();
  const t = useTranslations("AuthSignupConsumer");
  const { registerConsumer, loading: authLoading } = useAuth();

  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Estado local para controlar el bloqueo del botón mientras el captcha piensa
  const [isVerifying, setIsVerifying] = useState(false);

  const [, setCaptchaToken] = useState<string>("");
  // Referencia para controlar el captcha invisible
  const turnstileRef = useRef<any>(null);
  const isIntentionalSubmitRef = useRef(false);

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
    () => passwordRulesConfig.map((rule) => ({ ...rule, valid: false })),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      acceptPrivacy: checked,
      acceptTerms: checked,
    }));
  };

  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map((rule) => ({
        ...rule,
        valid: rule.regex.test(formData.password),
      })),
    );
  }, [formData.password]);

  const isFormValid = (): boolean => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const allPasswordRulesValid = passwordValidation.every(
      (rule) => rule.valid,
    );

    return !!(
      formData.name.trim().length >= 2 &&
      isEmailValid &&
      allPasswordRulesValid &&
      passwordsMatch &&
      formData.acceptTerms
    );
  };

  const processSignup = async (token: string) => {
    try {
      const nameParts = formData.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      const signupData: RegisterConsumerRequest = {
        firstName: firstName,
        lastName: lastName,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone ? formData.phone.trim() : undefined,
        termsAccepted: formData.acceptTerms as true,
        privacyPolicyVersion: "v1.0",
        captchaToken: token,
        utmSource: "web_direct",
        utmMedium: "organic",
      };

      const response = await registerConsumer(signupData);

      toast.success(
        response.message || "¡Registro exitoso! Por favor, revisa tu correo.",
        { theme: "colored" }
      );

      setTimeout(() => {
        router.push(
          `/verify-email?email=${encodeURIComponent(response.email)}`,
        );
      }, 1200);
    } catch (err: any) {
      const errorMessage =
        err.message || "Error al crear la cuenta de paciente";
      setError(errorMessage);
      handleApiError(err);

      turnstileRef.current?.reset();
      setCaptchaToken("");
      setIsVerifying(false);
      isIntentionalSubmitRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setIsVerifying(true);
    setError("");

    isIntentionalSubmitRef.current = true;
    turnstileRef.current?.execute();
  };

  const rulesMessages = [
    t("password_placeholder", { defaultValue: "Mín. 8 Caracteres" }),
    "Mayúscula (A-Z)",
    "Número (0-9)",
  ];

  const benefits = [
    t("benefits.0", { defaultValue: "Expediente de salud digital seguro e integral" }),
    t("benefits.1", { defaultValue: "Agendamiento inmediato con especialistas verificados" }),
    t("benefits.2", { defaultValue: "Teleconsultas y recetas digitales sin salir de casa" }),
  ];

  const isProcessing = authLoading || isVerifying;

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
        
        {/* ── PANEL IZQUIERDO (HERO VISUAL & BENEFICIOS) ────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
          <img
            src="/suite_patient_app.png"
            alt="QuHealthy Patient Sign Up"
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-luminosity opacity-40 scale-105"
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
              <span>Portal de Salud Personal</span>
            </span>
          </div>

          {/* Área de Beneficios */}
          <div className="relative z-10 space-y-8 max-w-lg">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                {t("area_title", { defaultValue: "Tu Salud en un Solo Lugar" })}
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
                    {t("secure_connection", { defaultValue: "Privacidad y Datos Protegidos" })}
                  </h3>
                  <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                    {t("secure_desc", { defaultValue: "Tu información médica cifrada con los estándares de seguridad más rigurosos." })}
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
                <User className="w-4 h-4" strokeWidth={2} />
                <span>Registro de Paciente</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t("title", { defaultValue: "Crear Cuenta Personal" })}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle", { defaultValue: "Crea tu perfil en minutos y gestiona tu salud de forma inteligente." })}
              </p>
            </div>

            {/* Contenedor Principal del Formulario */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

              {/* Social Auth */}
              <SocialAuthButtons accountRole="ROLE_CONSUMER" />

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-[11px] font-semibold">
                  <span className="px-3 bg-white dark:bg-[#0a0a0a] text-gray-400 uppercase tracking-wider">
                    {t("or_register", { defaultValue: "o regístrate con correo" })}
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
                
                {/* Nombre Completo */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("name_label", { defaultValue: "Nombre y Apellidos" })}
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder={t("name_placeholder", { defaultValue: "María Fernández" })}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("email_label", { defaultValue: "Correo Electrónico" })}
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder={t("email_placeholder", { defaultValue: "maria@ejemplo.com" })}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("password_label", { defaultValue: "Contraseña" })}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder={t("password_placeholder", { defaultValue: "••••••••" })}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-12 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
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

                  {/* Badges de Reglas de Complejidad */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {passwordValidation.map((rule, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all border shadow-sm",
                          rule.valid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                            : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700/60"
                        )}
                      >
                        {rule.valid && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />}
                        <span>{rulesMessages[idx]}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("confirm_password_label", { defaultValue: "Confirmar Contraseña" })}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder={t("confirm_password_placeholder", { defaultValue: "••••••••" })}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full h-12 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border rounded-xl text-xs font-semibold focus:outline-none transition-colors shadow-sm",
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-red-300 text-red-600 focus:ring-2 focus:ring-red-500/20"
                          : "border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20"
                      )}
                      required
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? "Ocultar confirmación de contraseña"
                          : "Mostrar confirmación de contraseña"
                      }
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} strokeWidth={2} />
                      ) : (
                        <Eye size={16} strokeWidth={2} />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs font-semibold text-red-500 pt-0.5">
                      {t("passwords_not_match", { defaultValue: "Las contraseñas no coinciden" })}
                    </p>
                  )}
                </div>

                {/* Privacy Checkbox */}
                <div className="flex items-start space-x-2.5 pt-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md border-gray-300 dark:border-gray-700 w-4 h-4"
                  />
                  <div className="grid gap-1 leading-snug">
                    <label
                      htmlFor="terms"
                      className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                    >
                      {t("accept_privacy", { defaultValue: "Acepto los términos y aviso de privacidad" })}
                    </label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("accept_privacy_start", { defaultValue: "Al registrarte, confirmas que has leído el " })}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        {t("privacy_policy", { defaultValue: "aviso de privacidad" })}
                      </button>{" "}
                      {t("and", { defaultValue: "y los " })}
                      <Link
                        href="/terms"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        {t("terms_of_service", { defaultValue: "términos de servicio" })}
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                {/* Turnstile Captcha Invisible */}
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token) => {
                    setCaptchaToken(token);
                    if (isIntentionalSubmitRef.current) {
                      processSignup(token);
                    }
                  }}
                  onError={(errorCode) => {
                    console.error("Turnstile error code:", errorCode);
                    toast.error(
                      "Error al validar la seguridad. Por favor, intenta de nuevo."
                    );
                    setIsVerifying(false);
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
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <QhSpinner size="sm" className="text-current" />
                        <span>{t("loading", { defaultValue: "Creando cuenta de paciente..." })}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" strokeWidth={2} />
                        <span>{t("submit_button", { defaultValue: "Registrar mi Cuenta" })}</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("has_account", { defaultValue: "¿Ya tienes una cuenta registrada?" })}{" "}
                <Link
                  href="/login"
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  {t("login_here", { defaultValue: "Inicia sesión aquí" })}
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