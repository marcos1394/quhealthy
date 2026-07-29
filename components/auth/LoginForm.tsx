"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useReducer } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useAuth } from "@/hooks/useAuth";
import { AuthResponse } from "@/types/auth";
import { handleApiError } from "@/lib/handleApiError";

interface LoginFormProps {
  userType: "consumer" | "provider";
  onSuccess: (response: AuthResponse) => void;
}

type LoginState = {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  error: string;
  showPassword: boolean;
};

type LoginAction =
  | { type: "set_field"; field: keyof LoginState; value: any }
  | { type: "set_loading"; value: boolean }
  | { type: "set_error"; value: string }
  | { type: "toggle_password" };

function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case "set_field":
      return { ...state, [action.field]: action.value };
    case "set_loading":
      return { ...state, loading: action.value };
    case "set_error":
      return { ...state, error: action.value };
    case "toggle_password":
      return { ...state, showPassword: !state.showPassword };
    default:
      return state;
  }
}

export default function LoginForm({ userType, onSuccess }: LoginFormProps) {
  const t = useTranslations("Auth");
  const { login } = useAuth();

  const [state, dispatch] = useReducer(loginReducer, {
    email: "",
    password: "",
    rememberMe: false,
    loading: false,
    error: "",
    showPassword: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "set_field",
      field: e.target.name as keyof LoginState,
      value: e.target.value,
    });
    if (state.error) dispatch({ type: "set_error", value: "" });
  };

  const handleRememberMeChange = (checked: boolean) => {
    dispatch({ type: "set_field", field: "rememberMe", value: checked });
  };

  const isFormValid = (): boolean => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
    return isEmailValid && state.password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      dispatch({
        type: "set_error",
        value: t("invalid_form_error"),
      });
      return;
    }

    dispatch({ type: "set_loading", value: true });
    dispatch({ type: "set_error", value: "" });

    try {
      const response = await login({
        email: state.email.toLowerCase().trim(),
        password: state.password,
        captchaToken: "",
        role: userType === "consumer" ? "ROLE_CONSUMER" : "ROLE_PROVIDER",
      });

      toast.success(t("login_success"));
      onSuccess(response);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "";

      if (errorMessage.includes("verificar")) {
        dispatch({
          type: "set_error",
          value: t("unverified_email_error"),
        });
      } else {
        dispatch({
          type: "set_error",
          value: errorMessage || t("invalid_form_error"),
        });
      }
      handleApiError(err);
    } finally {
      dispatch({ type: "set_loading", value: false });
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
        {/* Campo Correo Electrónico */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            {t("email_label")}
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              strokeWidth={2}
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={
                userType === "consumer"
                  ? t("email_placeholder_consumer")
                  : t("email_placeholder_provider")
              }
              value={state.email}
              onChange={handleInputChange}
              className="h-11 pl-10 pr-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm transition-all"
              required
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="password"
              className="text-xs font-bold text-gray-700 dark:text-gray-300"
            >
              {t("password_label")}
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
            >
              {t("forgot_password")}
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              strokeWidth={2}
            />
            <Input
              id="password"
              name="password"
              type={state.showPassword ? "text" : "password"}
              placeholder={t("password_placeholder")}
              value={state.password}
              onChange={handleInputChange}
              className="h-11 pl-10 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl focus-visible:ring-emerald-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm transition-all"
              required
            />
            <button
              type="button"
              aria-label={
                state.showPassword
                  ? t("hide_password")
                  : t("show_password")
              }
              onClick={() => dispatch({ type: "toggle_password" })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {state.showPassword ? (
                <EyeOff size={16} strokeWidth={2} />
              ) : (
                <Eye size={16} strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Checkbox Recordarme */}
        <div className="flex items-center space-x-2.5 pt-1">
          <Checkbox
            id="remember"
            checked={state.rememberMe}
            onCheckedChange={handleRememberMeChange}
            className="rounded-md border-gray-300 dark:border-gray-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 w-4 h-4 shadow-xs"
          />
          <label
            htmlFor="remember"
            className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none"
          >
            {t("remember_me")}
          </label>
        </div>

        {/* Botón Iniciar Sesión */}
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
    </div>
  );
}