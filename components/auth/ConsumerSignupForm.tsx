"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useReducer, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, AlertCircle, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { useAuth } from "@/hooks/useAuth";
import { RegisterConsumerRequest } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";
import PrivacyModal from "@/components/auth/Privacymodal";

// ── REDUCER & CONFIGURACIÓN DE REGLAS ─────────────────────────────────────────
interface PasswordRule {
  regex: RegExp;
  labelKey: string;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, "valid">[] = [
  { regex: /.{8,}/, labelKey: "rule_min_length" },
  { regex: /[A-Z]/, labelKey: "rule_uppercase" },
  { regex: /\d/, labelKey: "rule_number" },
];

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  acceptTerms: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  showPrivacyModal: boolean;
  loading: boolean;
  error: string;
  passwordValidation: PasswordRule[];
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string | boolean }
  | {
      type: "TOGGLE_FIELD";
      field: "showPassword" | "showConfirmPassword" | "showPrivacyModal";
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "UPDATE_PASSWORD_VALIDATION" };

const initialState: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  acceptTerms: false,
  showPassword: false,
  showConfirmPassword: false,
  showPrivacyModal: false,
  loading: false,
  error: "",
  passwordValidation: passwordRulesConfig.map((rule) => ({
    ...rule,
    valid: false,
  })),
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, error: "" };
    case "TOGGLE_FIELD":
      return { ...state, [action.field]: !state[action.field] };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "UPDATE_PASSWORD_VALIDATION":
      return {
        ...state,
        passwordValidation: passwordRulesConfig.map((rule) => ({
          ...rule,
          valid: rule.regex.test(state.password),
        })),
      };
    default:
      return state;
  }
}

export default function ConsumerSignupForm() {
  const router = useRouter();
  const t = useTranslations("AuthSignupConsumer");
  const { registerConsumer } = useAuth();

  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "SET_FIELD",
      field: e.target.name as keyof FormState,
      value: e.target.value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    dispatch({ type: "SET_FIELD", field: "acceptTerms", value: checked });
  };

  useEffect(() => {
    dispatch({ type: "UPDATE_PASSWORD_VALIDATION" });
  }, [state.password]);

  const isFormValid = (): boolean => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
    const passwordsMatch = state.password === state.confirmPassword;
    const allPasswordRulesValid = state.passwordValidation.every(
      (rule) => rule.valid
    );

    return !!(
      state.name.trim().length >= 2 &&
      isEmailValid &&
      allPasswordRulesValid &&
      passwordsMatch &&
      state.acceptTerms
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid()) return;

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const nameParts = state.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      const signupData: RegisterConsumerRequest = {
        firstName,
        lastName,
        email: state.email.toLowerCase().trim(),
        password: state.password,
        phone: state.phone ? state.phone.trim() : undefined,
        termsAccepted: state.acceptTerms as true,
        privacyPolicyVersion: "v1.0",
        utmSource: "web_direct",
        utmMedium: "organic",
        captchaToken: "",
      };

      const response = await registerConsumer(signupData);

      toast.success(response.message || t("toast_success"), {
        position: "top-center",
      });

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(response.email)}`);
      }, 1500);
    } catch (err: any) {
      dispatch({ type: "SET_LOADING", payload: false });
      const errorMessage = err.message || t("error_generic");
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      handleApiError(err);
    }
  };

  return (
    <div className="font-sans">
      {/* Mensaje de Error */}
      <AnimatePresence mode="wait">
        {state.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-start gap-3 shadow-xs">
              <AlertCircle
                className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <p className="text-xs font-semibold text-red-700 dark:text-red-300 leading-relaxed">
                {state.error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nombre Completo */}
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            {t("name_label")}
          </Label>
          <Input
            id="name"
            name="name"
            placeholder={t("name_placeholder")}
            value={state.name}
            onChange={handleInputChange}
            className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm transition-all"
            required
          />
        </div>

        {/* Campo Correo Electrónico */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            {t("email_label")}
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder={t("email_placeholder")}
            value={state.email}
            onChange={handleInputChange}
            className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm transition-all"
            required
          />
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            {t("password_label")}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={state.showPassword ? "text" : "password"}
              name="password"
              placeholder={t("password_placeholder")}
              value={state.password}
              onChange={handleInputChange}
              className="h-11 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm transition-all"
              required
            />
            <button
              type="button"
              aria-label={
                state.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() =>
                dispatch({ type: "TOGGLE_FIELD", field: "showPassword" })
              }
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {state.showPassword ? (
                <EyeOff size={16} strokeWidth={2} />
              ) : (
                <Eye size={16} strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Badges de Reglas de Contraseña */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {state.passwordValidation.map((rule, idx) => (
              <span
                key={idx}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all border shadow-xs",
                  rule.valid
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                    : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700/60"
                )}
              >
                {rule.valid && (
                  <Check
                    size={11}
                    strokeWidth={2.5}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                )}
                <span>{t(rule.labelKey)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Campo Confirmar Contraseña */}
        <div className="space-y-1.5">
          <Label
            htmlFor="confirmPassword"
            className="text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            {t("confirm_password_label")}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={state.showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("confirm_password_placeholder")}
              value={state.confirmPassword}
              onChange={handleInputChange}
              className={cn(
                "h-11 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border rounded-xl text-xs font-semibold text-gray-900 dark:text-white transition-all shadow-sm",
                state.confirmPassword &&
                  state.password !== state.confirmPassword
                  ? "border-red-300 dark:border-red-900/50 focus-visible:ring-red-500/20"
                  : "border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500/20"
              )}
              required
            />
            <button
              type="button"
              aria-label={
                state.showConfirmPassword
                  ? "Ocultar confirmación de contraseña"
                  : "Mostrar confirmación de contraseña"
              }
              onClick={() =>
                dispatch({
                  type: "TOGGLE_FIELD",
                  field: "showConfirmPassword",
                })
              }
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {state.showConfirmPassword ? (
                <EyeOff size={16} strokeWidth={2} />
              ) : (
                <Eye size={16} strokeWidth={2} />
              )}
            </button>
          </div>
          {state.confirmPassword && state.password !== state.confirmPassword && (
            <p className="text-xs font-semibold text-red-500 pt-0.5">
              {t("passwords_not_match")}
            </p>
          )}
        </div>

        {/* Checkbox Términos y Privacidad */}
        <div className="flex items-start space-x-3 pt-2">
          <Checkbox
            id="terms"
            checked={state.acceptTerms}
            onCheckedChange={handleCheckboxChange}
            className="mt-0.5 rounded-md border-gray-300 dark:border-gray-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 w-4 h-4 shadow-xs"
          />
          <div className="space-y-0.5 leading-tight">
            <label
              htmlFor="terms"
              className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer select-none"
            >
              {t("accept_privacy")}
            </label>
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("accept_privacy_start")}
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "TOGGLE_FIELD", field: "showPrivacyModal" })
                }
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline focus:outline-none"
              >
                {t("privacy_policy")}
              </button>
              {t("and")}
              <Link
                href="/terms"
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                {t("terms_of_service")}
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={!isFormValid() || state.loading}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {state.loading ? (
              <>
                <QhSpinner size="sm" className="text-white" />
                <span>{t("loading")}</span>
              </>
            ) : (
              <>
                <span>{t("submit_button")}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Modal de Privacidad */}
      <PrivacyModal
        isOpen={state.showPrivacyModal}
        onClose={() =>
          dispatch({ type: "TOGGLE_FIELD", field: "showPrivacyModal" })
        }
      />
    </div>
  );
}