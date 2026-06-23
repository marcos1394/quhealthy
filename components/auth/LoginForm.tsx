import React, { useReducer } from "react";
import Link from "next/link";
import { m, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { AuthResponse } from "@/types/auth";
import { handleApiError } from '@/lib/handleApiError';

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
  const t = useTranslations('Auth');
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
    dispatch({ type: "set_field", field: e.target.name as keyof LoginState, value: e.target.value });
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
      dispatch({ type: "set_error", value: "Por favor ingresa un email y contraseña válidos" });
      return;
    }

    dispatch({ type: "set_loading", value: true });
    dispatch({ type: "set_error", value: "" });

    try {
      const response = await login({
        email: state.email.toLowerCase().trim(),
        password: state.password,
        captchaToken: ""
      });

      toast.success(t('title'));
      onSuccess(response);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Credenciales incorrectas.";

      if (errorMessage.includes("verificar")) {
        dispatch({ type: "set_error", value: "Debes verificar tu correo antes de entrar. Revisa tu bandeja de entrada." });
      } else {
        dispatch({ type: "set_error", value: errorMessage });
      }
      handleApiError(err);
    } finally {
      dispatch({ type: "set_loading", value: false });
    }
  };

  return (
    <>
      {/* Error Alert */}
      <AnimatePresence>
        {state.error && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
              <AlertDescription className="text-sm font-medium">{state.error}</AlertDescription>
            </Alert>
          </m.div>
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
              value={state.email}
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
              type={state.showPassword ? "text" : "password"}
              placeholder={t('password_placeholder')}
              value={state.password}
              onChange={handleInputChange}
              className="pl-11 pr-12 h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
              required
            />
            <button
              type="button"
              aria-label={state.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => dispatch({ type: "toggle_password" })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {state.showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-3 pt-2">
          <Checkbox
            id="remember"
            checked={state.rememberMe}
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid() || state.loading}
          className="w-full h-14 text-base font-semibold text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-none rounded-xl transition-all mt-4"
        >
          {state.loading ? (
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
    </>
  );
}
