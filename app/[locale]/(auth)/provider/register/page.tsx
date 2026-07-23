"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Shield,
  ArrowRight,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Stethoscope
} from "lucide-react";
import { toast } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";

// Components
import SocialAuthButtons from "@/components/auth/SocialButtons";
import TermsModal from "@/components/auth/TermsModal";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Enterprise Integration
import { useAuth } from "@/hooks/useAuth";
import { RegisterProviderRequest } from "@/types/auth";

// ShadCN UI
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";

// Types
interface PasswordRule {
  regex: RegExp;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, "valid">[] = [
  { regex: /.{8,}/ },
  { regex: /[A-Z]/ },
  { regex: /\d/ },
  { regex: /[\W_]/ },
];

export default function ProviderSignupPage() {
  const router = useRouter();
  const t = useTranslations("AuthSignupProvider");
  const { registerProvider, error: apiError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [, setCaptchaToken] = useState<string>("");
  // Referencia para controlar el captcha invisible
  const turnstileRef = useRef<any>(null);
  const isIntentionalSubmitRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setFormData((prev) => ({ ...prev, referralCode: ref }));
      }
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    referralCode: "",
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    () => passwordRulesConfig.map((rule) => ({ ...rule, valid: false })),
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptTerms: checked }));
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
    const isNameValid = formData.name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isPasswordValid =
      passwordValidation.every((rule) => rule.valid) &&
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

  const processSignup = async (token: string) => {
    try {
      const nameParts = formData.name.trim().split(" ");
      const signupData: RegisterProviderRequest = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || "",
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        termsAccepted: formData.acceptTerms as true,
        privacyPolicyVersion: "v1.0",
        referralCode: formData.referralCode.trim() || undefined,
        captchaToken: token,
      };

      const res = await registerProvider(signupData);

      if (res && res.id) {
        toast.success(
          "¡Cuenta creada correctamente! Por favor, revisa tu correo.",
          { theme: "colored" }
        );
        router.push(`/verify-email?email=${encodeURIComponent(res.email)}`);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      setLoading(false);
      console.error("Error en registro:", err);
      handleApiError(err);

      turnstileRef.current?.reset();
      setCaptchaToken("");
      isIntentionalSubmitRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    isIntentionalSubmitRef.current = true;
    turnstileRef.current?.execute();
  };

  const rulesMessages = [
    t("password_placeholder", { defaultValue: "Mín. 8 Caracteres" }),
    "Mayúscula (A-Z)",
    "Número (0-9)",
    "Símbolo Especial",
  ];

  const benefits = [
    t("benefits.0", { defaultValue: "Gestión clínica omnicanal e IA integrada" }),
    t("benefits.1", { defaultValue: "Agenda inteligente y expediente NOM-004" }),
    t("benefits.2", { defaultValue: "Facturación SAT y procesamiento de pagos" }),
  ];

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
        
        {/* ── PANEL IZQUIERDO (HERO VISUAL & BENEFICIOS) ────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
          <img
            src="/hero_medical_lifestyle.png"
            alt="QuHealthy Provider Sign Up"
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
              <span>Plataforma Médica Pro</span>
            </span>
          </div>

          {/* Área de Beneficios */}
          <div className="relative z-10 space-y-8 max-w-lg">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                {t("area_title", { defaultValue: "Únete a la Red de Especialistas" })}
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
                    {t("secure_connection", { defaultValue: "Infraestructura Médica de Grado Clínico" })}
                  </h3>
                  <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                    {t("secure_desc", { defaultValue: "Protección de expedientes digitales con cifrado de alto nivel." })}
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
                <Stethoscope className="w-4 h-4" strokeWidth={2} />
                <span>Registro de Profesionales de la Salud</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t("title", { defaultValue: "Crear Cuenta de Proveedor" })}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle", { defaultValue: "Completa tus datos para comenzar tu onboarding profesional." })}
              </p>
            </div>

            {/* Contenedor Principal del Formulario */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

              {/* Social Auth Buttons */}
              <SocialAuthButtons
                accountRole="ROLE_PROVIDER"
                onSuccess={handleSocialSuccess}
              />

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

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Nombre Completo */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("name_label", { defaultValue: "Nombre y Apellidos" })}
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder={t("name_placeholder", { defaultValue: "Dr. Roberto Gómez" })}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("email_label", { defaultValue: "Correo Electrónico Profesional" })}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("email_placeholder", { defaultValue: "doctor@clinica.com" })}
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
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("password_placeholder", { defaultValue: "••••••••" })}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-12 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
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
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
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

                {/* Referral Code */}
                <div className="space-y-1.5">
                  <label htmlFor="referralCode" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("referral_code_label", {
                      defaultValue: "Código de referido (Opcional)",
                    })}
                  </label>
                  <input
                    id="referralCode"
                    name="referralCode"
                    placeholder={t("referral_code_placeholder", {
                      defaultValue: "Ej. QU-DOC-1234",
                    })}
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm uppercase font-mono"
                  />
                </div>

                {/* Terms Checkbox */}
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
                      {t("accept_terms", { defaultValue: "Acepto los términos y políticas" })}
                    </label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("accept_terms_start", { defaultValue: "Al registrarte, confirmas que aceptas nuestros " })}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        {t("terms_of_service", { defaultValue: "términos de servicio" })}
                      </button>{" "}
                      {t("and", { defaultValue: "y la " })}
                      <Link
                        href="/privacy"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        {t("privacy_policy", { defaultValue: "política de privacidad" })}
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                {/* API Error Alert */}
                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-900/40 flex items-start gap-3 shadow-sm">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 leading-relaxed">
                          {apiError}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <QhSpinner size="sm" className="text-current" />
                        <span>{t("loading", { defaultValue: "Creando cuenta profesional..." })}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" strokeWidth={2} />
                        <span>{t("submit_button", { defaultValue: "Registrar mi Cuenta" })}</span>
                        <ArrowRight className="w-4 h-4" strokeWidth={2} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-3">
                    {t("no_credit_card", { defaultValue: "No requerimos tarjeta de crédito para iniciar tu prueba gratuita." })}
                  </p>
                </div>
              </form>

            </div>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t("has_account", { defaultValue: "¿Ya formas parte de la red de QuHealthy?" })}{" "}
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

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </GoogleOAuthProvider>
  );
}