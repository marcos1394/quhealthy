/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Shield,
  Check,
  Sparkles,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks/useAuth";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";

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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("AuthResetPassword");
  const { validateResetToken, recoveryResetPassword } = useAuth();

  const token = searchParams.get("token");

  const [tokenState, setTokenState] = useState<
    "checking" | "valid" | "invalid" | "expired"
  >("checking");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pwdRules, setPwdRules] = useState<PasswordRule[]>(() =>
    passwordRulesConfig.map((r) => ({ ...r, valid: false })),
  );
  
  const labels = [
    t("new_password_placeholder", { defaultValue: "Mín. 8 Caracteres" }),
    "Mayúscula (A-Z)",
    "Número (0-9)",
    "Símbolo Especial",
  ];

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setTokenState("invalid");
        return;
      }
      try {
        await validateResetToken({ token });
        setTokenState("valid");
      } catch (err: any) {
        setTokenState(err.message?.includes("expired") ? "expired" : "invalid");
      }
    };
    validate();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPwdRules(
      passwordRulesConfig.map((r) => ({ ...r, valid: r.regex.test(password) })),
    );
  }, [password]);

  const isValid = () =>
    pwdRules.every((r) => r.valid) &&
    password === confirmPwd &&
    confirmPwd.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid() || !token) return;
    setLoading(true);
    setError("");
    try {
      await recoveryResetPassword({ token, newPassword: password });
      setSuccess(true);
      toast.success(
        t("success_title", { defaultValue: "¡Contraseña actualizada con éxito!" }),
        { theme: "colored" }
      );
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la contraseña.");
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── ESTADO: VERIFICANDO TOKEN ──────────────────────────────────────────────
  if (tokenState === "checking")
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4 text-center">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-900 dark:text-white">
            {t("checking_token", { defaultValue: "Validando enlace de seguridad..." })}
          </p>
          <p className="text-[11px] font-medium text-gray-400">
            {t("checking_moment", { defaultValue: "Un momento por favor..." })}
          </p>
        </div>
      </div>
    );

  // ── ESTADO: TOKEN INVÁLIDO O EXPIRADO ──────────────────────────────────────
  if (tokenState === "invalid" || tokenState === "expired")
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 py-4 font-sans text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle
            className="w-7 h-7 text-red-600 dark:text-red-400"
            strokeWidth={2}
          />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {tokenState === "expired"
              ? t("expired_title", { defaultValue: "Enlace Expirado" })
              : t("invalid_title", { defaultValue: "Enlace Inválido" })}
          </h2>
          <p className="text-xs font-medium text-gray-500 max-w-xs mx-auto leading-relaxed">
            {tokenState === "expired"
              ? t("expired_desc", { defaultValue: "El enlace de recuperación ha caducado por motivos de seguridad." })
              : t("invalid_desc", { defaultValue: "El enlace proporcionado no es válido o ya ha sido utilizado." })}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link href="/recovery" className="block">
            <button className="w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm">
              {t("request_new", { defaultValue: "Solicitar Nuevo Enlace" })}
            </button>
          </Link>
          <Link href="/login" className="block">
            <button className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm">
              {t("back_to_login", { defaultValue: "Volver a Iniciar Sesión" })}
            </button>
          </Link>
        </div>
      </motion.div>
    );

  // ── ESTADO: ÉXITO EN EL CAMBIO DE CONTRASEÑA ────────────────────────────────
  if (success)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6 space-y-5 font-sans"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2
            className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
            strokeWidth={2}
          />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("success_title", { defaultValue: "¡Contraseña Actualizada!" })}
          </h2>
          <p className="text-xs font-medium text-gray-500 leading-relaxed">
            {t("success_desc", { defaultValue: "Tu nueva contraseña ha sido guardada de forma segura." })}
          </p>
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            {t("redirect_hint", { defaultValue: "Redirigiendo a la pantalla de acceso..." })}
          </p>
        </div>

        <Link href="/login" className="block pt-2">
          <button className="w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" strokeWidth={2} />
            <span>{t("go_to_login", { defaultValue: "Iniciar Sesión Ahora" })}</span>
          </button>
        </Link>
      </motion.div>
    );

  // ── FORMULARIO DE RESTABLECIMIENTO ──────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      
      {/* Input Nueva Contraseña */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
          {t("new_password_label", { defaultValue: "Nueva Contraseña" })}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={2} />
          <input
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("new_password_placeholder", { defaultValue: "••••••••" })}
            className="w-full h-12 pl-10 pr-10 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
            required
          />
          <button
            type="button"
            aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {showPwd ? (
              <EyeOff size={16} strokeWidth={2} />
            ) : (
              <Eye size={16} strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Badges de Reglas */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pwdRules.map((r, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all border shadow-sm",
                r.valid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                  : "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800/50 dark:text-gray-500 dark:border-gray-700/60"
              )}
            >
              {r.valid && <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />}
              <span>{labels[i]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Input Confirmar Contraseña */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
          {t("confirm_password_label", { defaultValue: "Confirmar Contraseña" })}
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" strokeWidth={2} />
          <input
            type={showConfirmPwd ? "text" : "password"}
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder={t("confirm_password_placeholder", { defaultValue: "••••••••" })}
            className={cn(
              "w-full h-12 pl-10 pr-10 bg-gray-50/50 dark:bg-[#050505] border rounded-xl text-xs font-semibold focus:outline-none transition-colors shadow-sm",
              confirmPwd && password !== confirmPwd
                ? "border-red-300 text-red-600 focus:ring-2 focus:ring-red-500/20"
                : "border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20"
            )}
            required
          />
          <button
            type="button"
            aria-label={
              showConfirmPwd
                ? "Ocultar confirmación de contraseña"
                : "Mostrar confirmación de contraseña"
            }
            onClick={() => setShowConfirmPwd(!showConfirmPwd)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {showConfirmPwd ? (
              <EyeOff size={16} strokeWidth={2} />
            ) : (
              <Eye size={16} strokeWidth={2} />
            )}
          </button>
        </div>
        {confirmPwd && (
          <p
            className={cn(
              "text-xs font-semibold pt-0.5",
              password === confirmPwd
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500"
            )}
          >
            {password === confirmPwd
              ? t("passwords_match", { defaultValue: "Las contraseñas coinciden" })
              : t("passwords_not_match", { defaultValue: "Las contraseñas no coinciden" })}
          </p>
        )}
      </div>

      {/* Alerta de Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-900/40 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 leading-relaxed">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de Enviar */}
      <button
        type="submit"
        disabled={!isValid() || loading}
        className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
      >
        {loading ? (
          <>
            <QhSpinner size="sm" className="text-current" />
            <span>{t("updating", { defaultValue: "Actualizando contraseña..." })}</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            <span>{t("submit_button", { defaultValue: "Establecer Nueva Contraseña" })}</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 pt-2">
        <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        <span>{t("secure_connection", { defaultValue: "Conexión cifrada de alta seguridad" })}</span>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("AuthResetPassword");
  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── PANEL IZQUIERDO (HERO VISUAL) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 p-12 flex-col justify-between overflow-hidden m-4 rounded-3xl border border-gray-800 shadow-2xl">
        <img
          src="/hero_medical_lifestyle.png"
          alt="Reset Password"
          className="absolute inset-0 w-full h-full object-cover object-center mix-blend-luminosity opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/20" />

        {/* Header Marca */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              QuHealthy<span className="text-emerald-400">.</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restablecimiento Seguro</span>
          </span>
        </div>

        {/* Mensaje de Seguridad */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              {t("area_title", { defaultValue: "Protege tu Acceso Clínico" })}
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed">
              Crea una credencial robusta para resguardar la confidencialidad de tu perfil y expedientes.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {t("secure_connection", { defaultValue: "Cifrado de Alto Nivel" })}
                </h3>
                <p className="text-[11px] text-gray-300 font-medium mt-0.5">
                  {t("secure_hint", { defaultValue: "Tus nuevas credenciales se procesan mediante algoritmos de encriptación seguros." })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO (FORMULARIO Y CONTENEDOR) ───────────────────────── */}
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
                QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
              </span>
            </Link>

            <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <KeyRound className="w-4 h-4" strokeWidth={2} />
              <span>Seguridad de la Cuenta</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title", { defaultValue: "Restablecer Contraseña" })}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("desc", { defaultValue: "Ingresa tu nueva contraseña para actualizar las credenciales de tu cuenta." })}
            </p>
          </div>

          {/* Tarjeta Contenedora del Formulario */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-semibold text-gray-400">Cargando módulo de restablecimiento...</p>
                </div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </div>

          {/* Enlace Volver */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              <span>{t("back_to_login", { defaultValue: "Volver a Iniciar Sesión" })}</span>
            </Link>
          </div>

        </motion.div>
      </div>

    </div>
  );
}