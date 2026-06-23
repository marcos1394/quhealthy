import React, { useReducer, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { useAuth } from "@/hooks/useAuth";
import { RegisterProviderRequest } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";
import TermsModal from "@/components/auth/TermsModal";

// --- REDUCER ---
interface PasswordRule {
  regex: RegExp;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/ },
  { regex: /[A-Z]/ },
  { regex: /\d/ },
  { regex: /[\W_]/ },
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
  | { type: "TOGGLE_FIELD"; field: "showPassword" | "showConfirmPassword" | "showTermsModal" }
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
  passwordValidation: passwordRulesConfig.map((rule) => ({ ...rule, valid: false })),
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
  const t = useTranslations('AuthSignupProvider');
  const { registerProvider, error: apiError } = useAuth();

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
    const isNameValid = state.name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
    const isPasswordValid =
      state.passwordValidation.every(rule => rule.valid) &&
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
      const nameParts = state.name.trim().split(' ');
      const signupData: RegisterProviderRequest = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        email: state.email.toLowerCase().trim(),
        password: state.password,
        termsAccepted: state.acceptTerms as true,
        privacyPolicyVersion: "v1.0",
        captchaToken: ""
      };

      const res = await registerProvider(signupData);

      if (res && res.id) {
        toast.success("¡Cuenta creada correctamente! Por favor, revisa tu correo.");
        router.push(`/verify-email?email=${encodeURIComponent(res.email)}`);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

    } catch (err: any) {
      dispatch({ type: "SET_LOADING", payload: false });
      console.error("Error en registro:", err);
      handleApiError(err);
    }
  };

  const rulesMessages = [
    t('password_placeholder'), // Min 8 chars
    "Mayúscula",
    "Número",
    "Caráct. Esp."
  ];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
              {t('name_label')}
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Dr. Juan Pérez"
              value={state.name}
              onChange={handleInputChange}
              required
              className="h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
              {t('email_label')}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('email_placeholder')}
              value={state.email}
              onChange={handleInputChange}
              required
              className="h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
              {t('password_label')}
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={state.showPassword ? "text" : "password"}
                placeholder="********"
                value={state.password}
                onChange={handleInputChange}
                required
                className="h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl pr-12 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700"
              />
              <button
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_FIELD", field: "showPassword" })}
                className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {state.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">
              {t('confirm_password_label')}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={state.showConfirmPassword ? "text" : "password"}
                placeholder="********"
                value={state.confirmPassword}
                onChange={handleInputChange}
                required
                className="h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl pr-12 focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700"
              />
              <button
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_FIELD", field: "showConfirmPassword" })}
                className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {state.showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Requisitos de contraseña - Minimizados */}
          {state.password && (
            <div className="flex flex-wrap gap-2 pt-1">
              {state.passwordValidation.map((rule, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-sm flex items-center gap-1 transition-all",
                    rule.valid
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  )}
                >
                  {rulesMessages[idx]}
                </div>
              ))}
            </div>
          )}

          {/* Términos */}
          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              id="terms"
              checked={state.acceptTerms}
              onCheckedChange={handleCheckboxChange}
              className="mt-1 border-gray-300 dark:border-gray-700"
            />
            <div className="text-sm font-light text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('accept_terms_start')}{' '}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); dispatch({ type: "TOGGLE_FIELD", field: "showTermsModal" }); }}
                className="text-black dark:text-white font-medium hover:underline focus:outline-none"
              >
                {t('terms_of_service')}
              </button>
              {' '}{t('and')}{' '}
              <Link href="/privacy" className="text-black dark:text-white font-medium hover:underline">
                {t('privacy_policy')}
              </Link>
            </div>
          </div>
        </div>

        {apiError && (
          <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-0 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {apiError}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-sm font-semibold rounded-xl bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black transition-all"
          disabled={!isFormValid() || state.loading}
        >
          {state.loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t('loading')}</span>
            </div>
          ) : (
            t('submit_button')
          )}
        </Button>
      </form>
      <TermsModal
        isOpen={state.showTermsModal}
        onClose={() => dispatch({ type: "TOGGLE_FIELD", field: "showTermsModal" })}
        onAccept={() => {
          handleCheckboxChange(true);
          dispatch({ type: "TOGGLE_FIELD", field: "showTermsModal" });
        }}
      />
    </>
  );
}
