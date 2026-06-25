"use client"
/* eslint-disable react-doctor/no-autofocus */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Turnstile } from '@marsidev/react-turnstile';

interface Props {
  email: string;
  deliveryMethod: 'OTP_EMAIL' | 'OTP_SMS';
  onSuccess: (token: string) => void;
  onGoBack: () => void;
}

export default function Step2VerifyCode({ email, deliveryMethod, onSuccess, onGoBack }: Props) {
  const t = useTranslations('AuthForgotPassword');
  const { verifyRecoveryCode, sendRecoveryCode } = useAuth();
  
  const [{ code, loading, error, codeTimer, canResend }, dispatch] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case 'SET_CODE': return { ...state, code: typeof action.payload === 'function' ? action.payload(state.code) : action.payload };
        case 'SET_LOADING': return { ...state, loading: typeof action.payload === 'function' ? action.payload(state.loading) : action.payload };
        case 'SET_ERROR': return { ...state, error: typeof action.payload === 'function' ? action.payload(state.error) : action.payload };
        case 'SET_CODETIMER': return { ...state, codeTimer: typeof action.payload === 'function' ? action.payload(state.codeTimer) : action.payload };
        case 'SET_CANRESEND': return { ...state, canResend: typeof action.payload === 'function' ? action.payload(state.canResend) : action.payload };
        default: return state;
      }
    },
    {
      code: "", loading: false, error: "", codeTimer: 300, canResend: false
    }
  );

  const setCode = (val: any) => dispatch({ type: 'SET_CODE', payload: val });
  const setLoading = (val: any) => dispatch({ type: 'SET_LOADING', payload: val });
  const setError = (val: any) => dispatch({ type: 'SET_ERROR', payload: val });
  const setCodeTimer = (val: any) => dispatch({ type: 'SET_CODETIMER', payload: val });
  const setCanResend = (val: any) => dispatch({ type: 'SET_CANRESEND', payload: val });

  // 🚀 REFERENCIA Y ESTADO PARA EL REENVÍO
  const turnstileRef = useRef<any>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (codeTimer > 0) {
      const timer = setTimeout(() => setCodeTimer((prev: number) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [codeTimer]);

  // 🚀 NUEVA FUNCIÓN: Solo se ejecuta cuando Turnstile nos da el token
  const processResendCode = async (token: string) => {
    setCanResend(false); 
    setCodeTimer(300); 
    setLoading(true); 
    setError("");
    
    try {
      await sendRecoveryCode({ email, deliveryMethod, captchaToken: token });
      toast.success(t('code_sent_title'));
    } catch (err: any) {
      setError(err.message);
      // Si falla, permitimos que reintente inmediatamente sin esperar 5 min
      setCanResend(true);
      setCodeTimer(0);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
      setIsResending(false);
    }
  };

  // 🚀 DISPARADOR DEL CAPTCHA (Al hacer clic en reenviar)
  const handleResendClick = () => {
    setIsResending(true);
    setError("");
    turnstileRef.current?.execute();
  };

  // El submit normal (Verificar) no usa Captcha, ya que el OTP de 6 dígitos es el secreto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError(t('code_hint'));
      return;
    }
    setLoading(true); setError("");

    try {
      const res: any = await verifyRecoveryCode({ email, code });
      const resetToken = res.token || res.message; 
      onSuccess(resetToken);
    } catch (err: any) {
      setError(err.message || "Código inválido");
    } finally {
      setLoading(false);
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
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit} 
      className="space-y-10"
    >
      
      {/* Editorial Information Block */}
      <div className="border-l-2 border-black dark:border-white pl-5 py-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">
          {t('code_sent_title')}
        </p>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
          {deliveryMethod === "OTP_EMAIL" ? t('check_email') : t('check_sms')} <br/>
          <span className="font-medium text-black dark:text-white">{email}</span>
        </p>
      </div>

      <div className="space-y-4 group">
        <div className="flex items-end justify-between">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
            {t('verification_code_label')}
          </label>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest transition-colors", 
            codeTimer < 60 ? "text-red-500" : "text-gray-400"
          )}>
            {formatTime(codeTimer)}
          </span>
        </div>
        
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full bg-transparent border-0 border-b-2 border-gray-300 dark:border-gray-800 text-black dark:text-white h-20 text-center text-4xl md:text-5xl tracking-[0.4em] font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-200 dark:placeholder:text-gray-800"
          maxLength={6}
          required
          autoFocus
        />
        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t('code_hint')}</p>
          
          {/* 🚀 FIX: Modificamos el botón para disparar handleResendClick */}
          {canResend ? (
            <button 
              type="button" 
              onClick={handleResendClick} 
              disabled={isResending}
              className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:underline underline-offset-4 transition-all disabled:opacity-50"
            >
              {isResending ? t('sending') : t('resend_code_button')}
            </button>
          ) : (
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-700">
              {t('wait_to_resend')}
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-transparent border border-red-500/50 text-red-600 dark:text-red-400 rounded-none">
          <AlertDescription className="text-xs font-medium tracking-wide">{error}</AlertDescription>
        </Alert>
      )}

      {/* 🚀 FIX: Turnstile conectado a la ref y llamando a processResendCode */}
      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
        onSuccess={(token) => processResendCode(token)}
        onError={() => {
          setError("Error al validar la seguridad del reenvío.");
          setIsResending(false);
        }}
        options={{ theme: 'auto', size: 'invisible' }}
      />

      <div className="pt-4 space-y-4">
        <Button 
          type="submit" 
          disabled={loading || code.length !== 6 || isResending} 
          className="w-full flex items-center justify-between bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white rounded-none h-14 px-6 text-xs font-bold uppercase tracking-widest transition-all group/btn"
        >
          {loading && !isResending ? (
            <span className="flex items-center"><Loader2 className="animate-spin mr-3 w-4 h-4" />{t('verifying')}</span>
          ) : (
            <>
              <span>{t('verify_code_button')}</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        <button 
          type="button" 
          onClick={onGoBack} 
          disabled={loading || isResending}
          className="w-full flex items-center justify-center h-14 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors group/back disabled:opacity-50"
        >
          <ArrowLeft className="w-3 h-3 mr-2 opacity-0 -translate-x-2 group-hover/back:opacity-100 group-hover/back:translate-x-0 transition-all" />
          {t('change_method_button')}
        </button>
      </div>
    </motion.form>
  );
}