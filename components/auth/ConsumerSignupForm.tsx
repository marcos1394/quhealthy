import React, { useReducer, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { useAuth } from "@/hooks/useAuth";
import { RegisterConsumerRequest } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";
import PrivacyModal from "@/components/auth/Privacymodal";

// --- REDUCER ---
interface PasswordRule {
  regex: RegExp;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/ },
  { regex: /[A-Z]/ },
  { regex: /\d/ },
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
  | { type: "TOGGLE_FIELD"; field: "showPassword" | "showConfirmPassword" | "showPrivacyModal" }
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
  passwordValidation: passwordRulesConfig.map((rule) => ({ ...rule, valid: false })),
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
  const t = useTranslations('AuthSignupConsumer');
  const { registerConsumer } = useAuth();

  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_FIELD", field: e.target.name as keyof FormState, value: e.target.value });
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
    const allPasswordRulesValid = state.passwordValidation.every(rule => rule.valid);

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
      const nameParts = state.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const signupData: RegisterConsumerRequest = {
        firstName: firstName,
        lastName: lastName,
        email: state.email.toLowerCase().trim(),
        password: state.password,
        phone: state.phone ? state.phone.trim() : undefined,
        termsAccepted: state.acceptTerms as true,
        privacyPolicyVersion: "v1.0",
        utmSource: "web_direct",
        utmMedium: "organic",
        captchaToken: "" // Fake token just to satisfy the compiler for this deprecated file
      };

      const response = await registerConsumer(signupData);

      toast.success(response.message || "¡Registro exitoso! Por favor, revisa tu correo.", {
        position: "top-center",
      });

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(response.email)}`);
      }, 1500);

    } catch (err: any) {
      dispatch({ type: "SET_LOADING", payload: false });
      const errorMessage = err.message || "Error al crear la cuenta de paciente";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      handleApiError(err);
    }
  };

  const rulesMessages = [
    t('password_placeholder'), // Min 8 chars
    "Mayúscula",
    "Número"
  ];

  return (
    <>
      <AnimatePresence>
        {state.error && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium ml-2">{state.error}</AlertDescription>
            </Alert>
          </m.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
            {t('name_label')}
          </Label>
          <Input
            id="name"
            name="name"
            placeholder={t('name_placeholder')}
            value={state.name}
            onChange={handleInputChange}
            className="h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
            required
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
            {t('email_label')}
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder={t('email_placeholder')}
            value={state.email}
            onChange={handleInputChange}
            className="h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
            {t('password_label')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={state.showPassword ? "text" : "password"}
              name="password"
              placeholder={t('password_placeholder')}
              value={state.password}
              onChange={handleInputChange}
              className="pr-12 h-14 bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 text-black dark:text-white focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10 rounded-xl transition-all"
              required
            />
            <button
              type="button"
              aria-label={state.showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => dispatch({ type: "TOGGLE_FIELD", field: "showPassword" })}
              className="absolute right-3.5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {state.showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Password Strength Indicators */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {state.passwordValidation.map((rule, idx) => (
              <span
                key={idx}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all",
                  rule.valid
                    ? "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                {rule.valid && <Check size={12} strokeWidth={2} />}
                {rulesMessages[idx]}
              </span>
            ))}
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2 pt-1">
          <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">
            {t('confirm_password_label')}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={state.showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t('confirm_password_placeholder')}
              value={state.confirmPassword}
              onChange={handleInputChange}
              className={cn(
                "pr-12 h-14 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl transition-all",
                state.confirmPassword && state.password !== state.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white focus:ring-black/10 dark:focus:ring-white/10"
              )}
              required
            />
            <button
              type="button"
              aria-label={state.showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
              onClick={() => dispatch({ type: "TOGGLE_FIELD", field: "showConfirmPassword" })}
              className="absolute right-3.5 top-1/2 -trangray-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {state.showConfirmPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
            </button>
          </div>
          {state.confirmPassword && state.password !== state.confirmPassword && (
            <p className="text-xs text-red-500 mt-1.5">
              {t('passwords_not_match')}
            </p>
          )}
        </div>

        {/* Privacy Checkbox */}
        <div className="flex items-start space-x-3 pt-4">
          <Checkbox
            id="terms"
            checked={state.acceptTerms}
            onCheckedChange={handleCheckboxChange}
            className="mt-1 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white border-gray-300 dark:border-gray-700 w-5 h-5"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
            >
              {t('accept_privacy')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
              {t('accept_privacy_start')}
              <button
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_FIELD", field: "showPrivacyModal" })}
                className="text-black dark:text-white hover:underline focus:outline-none"
              >
                {t('privacy_policy')}
              </button>
              {t('and')}
              <Link
                href="/terms"
                className="text-black dark:text-white hover:underline"
              >
                {t('terms_of_service')}
              </Link>.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid() || state.loading}
          className="w-full h-14 bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black font-semibold rounded-xl transition-all duration-200 ease-in-out hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {state.loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('loading')}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>{t('submit_button')}</span>
            </div>
          )}
        </Button>
      </form>

      <PrivacyModal 
        isOpen={state.showPrivacyModal} 
        onClose={() => dispatch({ type: "TOGGLE_FIELD", field: "showPrivacyModal" })} 
      />
    </>
  );
}
