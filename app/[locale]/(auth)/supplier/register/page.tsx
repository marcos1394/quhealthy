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
  Truck,
  Building2,
  Boxes,
} from "lucide-react";
import { toast } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";

// Componentes
import SocialAuthButtons from "@/components/auth/SocialButtons";
import TermsModal from "@/components/auth/TermsModal";
import { QhSpinner } from "@/components/ui/QhSpinner";

// Integración de Autenticación
import { useAuth } from "@/hooks/useAuth";
import { RegisterProviderRequest } from "@/types/auth";

// ShadCN UI & Utils
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";

// Interfaces
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

export default function SupplierSignupPage() {
  const router = useRouter();
  const t = useTranslations("AuthSignupSupplier");
  const { registerProvider, error: apiError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [, setCaptchaToken] = useState<string>("");
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
    () => passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
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
      }))
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
    toast.success(t("success_toast"), { theme: "colored" });
    router.push("/onboarding/supplier");
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
        toast.success(t("success_toast"), { theme: "colored" });
        router.push(`/verify-email?email=${encodeURIComponent(res.email)}&next=/onboarding/supplier`);
      } else {
        router.push("/onboarding/supplier");
      }
    } catch (err: any) {
      setLoading(false);
      console.error("Error en registro de proveedor:", err);
      handleApiError(err);

      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
      isIntentionalSubmitRef.current = false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || loading) return;

    setLoading(true);
    isIntentionalSubmitRef.current = true;

    if (turnstileRef.current) {
      turnstileRef.current.execute();
    } else {
      processSignup("bypass-dev-token");
    }
  };

  const benefits = [
    t("benefits.0"),
    t("benefits.1"),
    t("benefits.2"),
  ];

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-blue-100 dark:selection:bg-blue-950/30 transition-colors duration-500">
        
        {/* ── PANEL IZQUIERDO (HERO VISUAL B2B) ─────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-slate-800 shadow-2xl">
          <img
            src="/hero_supplier_warehouse.jpg"
            alt={t("hero_img_alt")}
            className="absolute inset-0 w-full h-full object-cover opacity-45 filter saturate-110 brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-blue-950/40" />

          {/* Header Marca */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                QuHealthy<span className="text-blue-400">.</span>
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-xs font-semibold text-blue-300 shadow-sm">
              <Boxes className="w-3.5 h-3.5 text-blue-400" />
              <span>{t("badge_supplier_platform")}</span>
            </span>
          </div>

          {/* Área de Beneficios */}
          <div className="relative z-10 space-y-8 max-w-lg">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                {t("area_title")}
              </h2>

              <div className="space-y-3 pt-2">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-gray-200 text-xs sm:text-sm font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shield Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-blue-400" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {t("secure_connection")}
                  </h3>
                  <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                    {t("secure_desc")}
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
                  QuHealthy<span className="text-blue-600 dark:text-blue-400">.</span>
                </span>
              </Link>

              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                <Truck className="w-4 h-4" strokeWidth={2} />
                <span>{t("tagline")}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
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
                    {t("or_register")}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Nombre Completo */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("name_label")}
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder={t("name_placeholder")}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 shadow-sm"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("email_label")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("email_placeholder")}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 shadow-sm"
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("password_label")}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("password_placeholder")}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-12 pl-4 pr-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("confirm_password_label")}
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirm_password_placeholder")}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-12 pl-4 pr-11 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {t("passwords_not_match")}
                    </p>
                  )}
                </div>

                {/* Reglas de Contraseña (Chips) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {passwordValidation.map((rule, idx) => {
                    const labels = [
                      t("password_rule_min_length"),
                      t("password_rule_uppercase"),
                      t("password_rule_number"),
                      t("password_rule_symbol"),
                    ];
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                          rule.valid
                            ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-400"
                            : "bg-gray-50 dark:bg-[#050505] border-gray-100 dark:border-gray-800 text-gray-400"
                        )}
                      >
                        <div
                          className={cn(
                            "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]",
                            rule.valid
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-800 text-transparent"
                          )}
                        >
                          ✓
                        </div>
                        <span className="truncate">{labels[idx]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Código de Referido */}
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="referralCode" className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("referral_code_label")}
                  </label>
                  <input
                    id="referralCode"
                    name="referralCode"
                    placeholder={t("referral_code_placeholder")}
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                {/* Términos y Condiciones */}
                <div className="flex items-start gap-2.5 pt-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="mt-0.5 border-gray-300 dark:border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                    {t("accept_terms_start")}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      {t("terms_of_service")}
                    </button>
                    {t("and")}
                    <Link href="/privacy" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                      {t("privacy_policy")}
                    </Link>
                  </label>
                </div>

                {/* Error de la API */}
                {apiError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Turnstile Captcha Invisible */}
                <div className="hidden">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={(token) => {
                      setCaptchaToken(token);
                      if (isIntentionalSubmitRef.current) {
                        processSignup(token);
                      }
                    }}
                    onError={() => {
                      setLoading(false);
                      toast.error(t("captcha_error"));
                    }}
                  />
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className={cn(
                    "w-full h-12 rounded-xl text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2",
                    isFormValid() && !loading
                      ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      : "bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed shadow-none"
                  )}
                >
                  {loading ? (
                    <>
                      <QhSpinner size="sm" />
                      <span>{t("loading")}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>{t("submit_button")}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-[11px] text-gray-400 font-medium">
                {t("no_credit_card")}
              </p>
            </div>

            {/* Footer Login Link */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <span>{t("has_account")} </span>
              <Link
                href="/login?redirect=/onboarding/supplier"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t("login_here")}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Modal de Términos */}
        {showTermsModal && (
          <TermsModal
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}
