"use client";

/* eslint-disable react-doctor/no-autofocus */

import React, { useState, useEffect, useRef, useReducer } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, AlertCircle, Mail, Phone, Clock, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { Turnstile } from '@marsidev/react-turnstile';

import { useAuth } from "@/hooks/useAuth";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface Props {
  email: string;
  deliveryMethod: 'OTP_EMAIL' | 'OTP_SMS';
  onSuccess: (token: string) => void;
  onGoBack: () => void;
}

interface State {
  code: string;
  loading: boolean;
  error: string;
  codeTimer: number;
  canResend: boolean;
}

type Action =
  | { type: 'SET_CODE'; payload: any }
  | { type: 'SET_LOADING'; payload: any }
  | { type: 'SET_ERROR'; payload: any }
  | { type: 'SET_CODETIMER'; payload: any }
  | { type: 'SET_CANRESEND'; payload: any };

function verifyReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CODE': return { ...state, code: typeof action.payload === 'function' ? action.payload(state.code) : action.payload };
    case 'SET_LOADING': return { ...state, loading: typeof action.payload === 'function' ? action.payload(state.loading) : action.payload };
    case 'SET_ERROR': return { ...state, error: typeof action.payload === 'function' ? action.payload(state.error) : action.payload };
    case 'SET_CODETIMER': return { ...state, codeTimer: typeof action.payload === 'function' ? action.payload(state.codeTimer) : action.payload };
    case 'SET_CANRESEND': return { ...state, canResend: typeof action.payload === 'function' ? action.payload(state.canResend) : action.payload };
    default: return state;
  }
}

export default function Step2VerifyCode({ email, deliveryMethod, onSuccess, onGoBack }: Props) {
  const t = useTranslations('AuthForgotPassword');
  const { verifyRecoveryCode, sendRecoveryCode } = useAuth();
  
  const [state, dispatch] = useReducer(verifyReducer, {
    code: "",
    loading: false,
    error: "",
    codeTimer: 300,
    canResend: false,
  });

  const { code, loading, error, codeTimer, canResend } = state;

  const turnstileRef = useRef<any>(null);
  const [isResending, setIsResending] = useState(false);
  const isIntentionalSubmitRef = useRef(false);

  useEffect(() => {
    if (codeTimer > 0) {
      const timer = setTimeout(() => dispatch({ type: 'SET_CODETIMER', payload: (prev: number) => prev - 1 }), 1000);
      return () => clearTimeout(timer);
    } else {
      dispatch({ type: 'SET_CANRESEND', payload: true });
    }
  }, [codeTimer]);

  const processResendCode = async (token: string) => {
    dispatch({ type: 'SET_CANRESEND', payload: false });
    dispatch({ type: 'SET_CODETIMER', payload: 300 });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: "" });
    
    try {
      await sendRecoveryCode({ email, deliveryMethod, captchaToken: token });
      toast.success(t('code_sent_title', { defaultValue: 'Código reenviado exitosamente' }), { theme: "colored" });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || "Error al reenviar el código" });
      dispatch({ type: 'SET_CANRESEND', payload: true });
      dispatch({ type: 'SET_CODETIMER', payload: 0 });
      turnstileRef.current?.reset();
      isIntentionalSubmitRef.current = false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      setIsResending(false);
    }
  };

  const handleResendClick = () => {
    setIsResending(true);
    dispatch({ type: 'SET_ERROR', payload: "" });
    isIntentionalSubmitRef.current = true;
    turnstileRef.current?.execute();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      dispatch({ type: 'SET_ERROR', payload: t('code_hint', { defaultValue: 'Ingresa los 6 dígitos del código' }) });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: "" });

    try {
      const res: any = await verifyRecoveryCode({ email, code });
      const resetToken = res.token || res.message; 
      onSuccess(resetToken);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || "Código inválido o expirado" });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.form 
      key="step2" 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit} 
      className="space-y-5 font-sans"
    >
      {/* Bloque de Información de Envío */}
      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a0a0a] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-sm">
          {deliveryMethod === "OTP_EMAIL" ? (
            <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          ) : (
            <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
            {t('code_sent_title', { defaultValue: 'Código de Verificación Enviado' })}
          </p>
          <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
            {deliveryMethod === "OTP_EMAIL" 
              ? t('check_email', { defaultValue: 'Revisa tu bandeja de entrada o spam en:' }) 
              : t('check_sms', { defaultValue: 'Revisa tus mensajes de texto en:' })}{' '}
            <span className="font-bold text-gray-900 dark:text-white font-mono break-all">{email}</span>
          </p>
        </div>
      </div>

      {/* Input de Código OTP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
            {t('verification_code_label', { defaultValue: 'Código de 6 dígitos' })}
          </label>
          <span className={cn(
            "text-xs font-mono font-bold flex items-center gap-1 px-2 py-0.5 rounded-md border shadow-sm", 
            codeTimer < 60 
              ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40" 
              : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          )}>
            <Clock className="w-3 h-3" />
            <span>{formatTime(codeTimer)}</span>
          </span>
        </div>
        
        <input
          type="text"
          value={code}
          onChange={(e) => dispatch({ type: 'SET_CODE', payload: e.target.value.replace(/\D/g, '') })}
          placeholder="000000"
          className="w-full h-14 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl text-center text-3xl font-mono font-bold tracking-[0.35em] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-300 shadow-sm"
          maxLength={6}
          required
          autoFocus
        />

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] font-semibold text-gray-400">
            {t('code_hint', { defaultValue: 'Ingresa el código numérico recibido.' })}
          </p>
          
          {canResend ? (
            <button 
              type="button" 
              onClick={handleResendClick} 
              disabled={isResending}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw className={cn("w-3 h-3", isResending && "animate-spin")} />
              <span>{isResending ? t('sending', { defaultValue: 'Enviando...' }) : t('resend_code_button', { defaultValue: 'Reenviar código' })}</span>
            </button>
          ) : (
            <p className="text-[11px] font-medium text-gray-400">
              {t('wait_to_resend', { defaultValue: 'Espera para reenviar' })}
            </p>
          )}
        </div>
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

      {/* Turnstile Captcha Invisible */}
      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
        onSuccess={(token) => {
          if (isIntentionalSubmitRef.current) {
            processResendCode(token);
          }
        }}
        onError={(errorCode) => {
          console.error("Turnstile error code:", errorCode);
          dispatch({ type: 'SET_ERROR', payload: "Error al validar la seguridad del reenvío." });
          setIsResending(false);
          isIntentionalSubmitRef.current = false;
          turnstileRef.current?.reset();
        }}
        options={{ 
          theme: 'auto', 
          size: 'invisible',
          execution: 'execute'
        }}
      />

      {/* Acciones */}
      <div className="pt-2 space-y-2.5">
        <button 
          type="submit" 
          disabled={loading || code.length !== 6 || isResending} 
          className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && !isResending ? (
            <>
              <QhSpinner size="sm" className="text-current" />
              <span>{t('verifying', { defaultValue: 'Verificando código...' })}</span>
            </>
          ) : (
            <>
              <span>{t('verify_code_button', { defaultValue: 'Verificar y Continuar' })}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </>
          )}
        </button>

        <button 
          type="button" 
          onClick={onGoBack} 
          disabled={loading || isResending}
          className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>{t('change_method_button', { defaultValue: 'Cambiar correo o método' })}</span>
        </button>
      </div>
    </motion.form>
  );
}