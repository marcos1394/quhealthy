"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useReducer, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { useAuth } from "@/hooks/useAuth";
import { RegisterProviderRequest } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";
import TermsModal from "@/components/auth/TermsModal";

// ── REDUCER & REGLAS DE CONTRASEÑA ──────────────────────────────────────────
interface PasswordRule {
  regex: RegExp;
  labelKey: string;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, "valid">[] = [
  { regex: /.{8,}/, labelKey: "rule_min_length" },
  { regex: /[A-Z]/, labelKey: "rule_uppercase" },
  { regex: /\d/, labelKey: "rule_number" },
  { regex: /[\W_]/, labelKey: "rule_special" },
];

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  showTermsModal: boolean;
  loading: boolean;
  passwordValidation: PasswordRule[];
}

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string | boolean }
  | {
      type: "TOGGLE_FIELD";
      field: "showPassword" | "showConfirmPassword" | "showTermsModal";
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_PASSWORD_VALIDATION" };

const initialState: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
  showPassword: false,
  showConfirmPassword: false,
  showTermsModal: false,
  loading: false,
  passwordValidation: passwordRulesConfig.map((rule) => ({
    ...rule,
    valid: false,
  })),
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_FIELD":
      return { ...state, [action.field]: !state[action.field] };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
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

export default function ProviderSignupForm() {
  const router = useRouter();
  const t = useTranslations("AuthSignupProvider");
  const { registerProvider, error: apiError } = useAuth();

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
    const isNameValid = state.name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
    const isPasswordValid =
      state.passwordValidation.every((rule) => rule.valid) &&
      state.password === state.confirmPassword &&
      state.confirmPassword.length > 0;
    const areTermsAccepted = state.acceptTerms;

    return isNameValid && isEmailValid && isPasswordValid && areTermsAccepted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const nameParts = state.name.trim().split(" ");
      const signupData: RegisterProviderRequest = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || "",
        email: state.email.toLowerCase().trim(),
        password: state.password,
        termsAccepted: state.acceptTerms as true,
        privacyPolicyVersion: "v1.0",
        captchaToken: "",
      };

      const res = await registerProvider(signupData);

      if (res && res.id) {
        toast.success(t("toast_success"), { position: "top-center" });
        router.push(`/verify-email?email=${encodeURIComponent(res.email)}`);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      dispatch({ type: "SET_LOADING", payload: false });
      console.error("Error en registro:", err);
      handleApiError(err);
    }
  };

  return (
    <div className="font-sans">
      {/* Alerta de Error de la API */}
      <AnimatePresence mode="wait">
        {apiError && (
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
                {apiError}
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
            required
            className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm transition-all"
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
            name="email"
            type="email"
            placeholder={t("email_placeholder")}
            value={state.email}
            onChange={handleInputChange}
            required
            className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm transition-all"
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
              name="password"
              type={state.showPassword ? "text" : "password"}
              placeholder={t("password_placeholder")}
              value={state.password}
              onChange={handleInputChange}
              required
              className="h-11 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm transition-all"
            />
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "TOGGLE_FIELD", field: "showPassword" })
              }
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              tabIndex={-1}
            >
              {state.showPassword ? (
                <EyeOff size={16} strokeWidth={2} />
              ) : (
                <Eye size={16} strokeWidth={2} />
              )}
            </button>
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
              name="confirmPassword"
              type={state.showConfirmPassword ? "text" : "password"}
              placeholder={t("confirm_password_placeholder")}
              value={state.confirmPassword}
              onChange={handleInputChange}
              required
              className={cn(
                "h-11 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border rounded-xl text-xs font-semibold text-gray-900 dark:text-white transition-all shadow-sm",
                state.confirmPassword &&
                  state.password !== state.confirmPassword
                  ? "border-red-300 dark:border-red-900/50 focus-visible:ring-red-500/20"
                  : "border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500/20"
              )}
            />
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "TOGGLE_FIELD",
                  field: "showConfirmPassword",
                })
              }
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              tabIndex={-1}
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

        {/* Badges de Reglas de Contraseña */}
        {state.password && (
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
        )}

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
              {t("accept_terms_start")}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch({
                    type: "TOGGLE_FIELD",
                    field: "showTermsModal",
                  });
                }}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline focus:outline-none"
              >
                {t("terms_of_service")}
              </button>
              {t("and")}
              <Link
                href="/privacy"
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                {t("privacy_policy")}
              </Link>
              .
            </label>
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

      {/* Modal de Términos */}
      <TermsModal
        isOpen={state.showTermsModal}
        onClose={() =>
          dispatch({ type: "TOGGLE_FIELD", field: "showTermsModal" })
        }
        onAccept={() => {
          handleCheckboxChange(true);
          dispatch({ type: "TOGGLE_FIELD", field: "showTermsModal" });
        }}
      />
    </div>
  );
}