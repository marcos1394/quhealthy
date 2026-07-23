"use client";

/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React, { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/useAuth";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface Props {
  resetToken: string;
}

interface ValidationRule {
  regex: RegExp;
  label: string;
  valid: boolean;
}

interface State {
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  loading: boolean;
  error: string;
  passwordValidation: ValidationRule[];
}

type Action =
  | { type: 'SET_NEWPASSWORD'; payload: any }
  | { type: 'SET_CONFIRMPASSWORD'; payload: any }
  | { type: 'SET_SHOWPASSWORD'; payload: any }
  | { type: 'SET_SHOWCONFIRMPASSWORD'; payload: any }
  | { type: 'SET_LOADING'; payload: any }
  | { type: 'SET_ERROR'; payload: any }
  | { type: 'SET_PASSWORDVALIDATION'; payload: any };

const passwordRulesConfig = [
  { regex: /.{8,}/, label: "Mín. 8 Caracteres" },
  { regex: /[A-Z]/, label: "Una Mayúscula (A-Z)" },
  { regex: /\d/, label: "Un Número (0-9)" },
];

function resetReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NEWPASSWORD': return { ...state, newPassword: typeof action.payload === 'function' ? action.payload(state.newPassword) : action.payload };
    case 'SET_CONFIRMPASSWORD': return { ...state, confirmPassword: typeof action.payload === 'function' ? action.payload(state.confirmPassword) : action.payload };
    case 'SET_SHOWPASSWORD': return { ...state, showPassword: typeof action.payload === 'function' ? action.payload(state.showPassword) : action.payload };
    case 'SET_SHOWCONFIRMPASSWORD': return { ...state, showConfirmPassword: typeof action.payload === 'function' ? action.payload(state.showConfirmPassword) : action.payload };
    case 'SET_LOADING': return { ...state, loading: typeof action.payload === 'function' ? action.payload(state.loading) : action.payload };
    case 'SET_ERROR': return { ...state, error: typeof action.payload === 'function' ? action.payload(state.error) : action.payload };
    case 'SET_PASSWORDVALIDATION': return { ...state, passwordValidation: typeof action.payload === 'function' ? action.payload(state.passwordValidation) : action.payload };
    default: return state;
  }
}

export default function Step3ResetPassword({ resetToken }: Props) {
  const router = useRouter();
  const t = useTranslations('AuthForgotPassword');
  const { recoveryResetPassword } = useAuth();
  
  const [state, dispatch] = useReducer(resetReducer, {
    newPassword: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    loading: false,
    error: "",
    passwordValidation: passwordRulesConfig.map(r => ({ ...r, valid: false })),
  });

  const {
    newPassword,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    loading,
    error,
    passwordValidation,
  } = state;

  useEffect(() => {
    dispatch({
      type: 'SET_PASSWORDVALIDATION',
      payload: passwordRulesConfig.map(rule => ({
        ...rule,
        valid: rule.regex.test(newPassword),
      })),
    });
  }, [newPassword]);

  const isValidForm = passwordValidation.every(r => r.valid) && newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidForm) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: "" });

    try {
      await recoveryResetPassword({ token: resetToken, newPassword });
      toast.success(
        t('reset_password_success', { defaultValue: 'Contraseña actualizada correctamente' }),
        { theme: "colored" }
      );
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || "Error al actualizar la contraseña. Por favor, reintenta."
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <motion.form 
      key="step3" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit} 
      className="space-y-5 font-sans"
    >
      {/* Input Nueva Contraseña */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
          {t('new_password_label', { defaultValue: 'Nueva Contraseña' })}
        </label>
        <div className="relative">
          <input 
            type={showPassword ? "text" : "password"} 
            value={newPassword} 
            onChange={(e) => dispatch({ type: 'SET_NEWPASSWORD', payload: e.target.value })} 
            placeholder={t('new_password_placeholder', { defaultValue: '••••••••' })}
            className="w-full h-12 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm" 
            required 
          />
          <button 
            type="button" 
            onClick={() => dispatch({ type: 'SET_SHOWPASSWORD', payload: !showPassword })} 
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
          </button>
        </div>
        
        {/* Badges de Reglas de Complejidad */}
        <div className="flex flex-wrap gap-2 pt-1.5">
          {passwordValidation.map((rule, idx) => (
            <span 
              key={idx} 
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border shadow-sm", 
                rule.valid 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" 
                  : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700/60"
              )}
            >
              {rule.valid && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />}
              <span>{rule.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Input Confirmar Contraseña */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
          {t('confirm_password_label', { defaultValue: 'Confirmar Contraseña' })}
        </label>
        <div className="relative">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            value={confirmPassword} 
            onChange={(e) => dispatch({ type: 'SET_CONFIRMPASSWORD', payload: e.target.value })} 
            placeholder={t('confirm_password_placeholder', { defaultValue: '••••••••' })}
            className={cn(
              "w-full h-12 pl-4 pr-10 bg-gray-50/50 dark:bg-[#050505] border rounded-xl text-xs font-semibold focus:outline-none transition-colors shadow-sm", 
              confirmPassword && newPassword !== confirmPassword 
                ? "border-red-300 text-red-600 focus:ring-2 focus:ring-red-500/20" 
                : "border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20"
            )}
            required 
          />
          <button 
            type="button" 
            onClick={() => dispatch({ type: 'SET_SHOWCONFIRMPASSWORD', payload: !showConfirmPassword })} 
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
          </button>
        </div>
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs font-semibold text-red-500 pt-0.5">
            {t('passwords_not_match', { defaultValue: 'Las contraseñas no coinciden' })}
          </p>
        )}
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-900/40 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-xs font-semibold text-red-700 dark:text-red-400 leading-relaxed">
            {error}
          </p>
        </div>
      )}

      {/* Botón Guardar */}
      <button 
        type="submit" 
        disabled={loading || !isValidForm} 
        className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
      >
        {loading ? (
          <>
            <QhSpinner size="sm" className="text-current" />
            <span>{t('updating', { defaultValue: 'Actualizando contraseña...' })}</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            <span>{t('reset_password_button', { defaultValue: 'Establecer Nueva Contraseña' })}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </>
        )}
      </button>
    </motion.form>
  );
}