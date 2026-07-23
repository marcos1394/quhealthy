"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";

import { useAuth } from "@/hooks/useAuth";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  email: string;
  setEmail: (val: string) => void;
  deliveryMethod: "OTP_EMAIL" | "OTP_SMS";
  setDeliveryMethod: (val: "OTP_EMAIL" | "OTP_SMS") => void;
  onSuccess: () => void;
}

export default function Step1SendCode({
  email,
  setEmail,
  deliveryMethod,
  setDeliveryMethod,
  onSuccess,
}: Props) {
  const t = useTranslations("AuthForgotPassword");
  const { sendRecoveryCode } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const [, setCaptchaToken] = useState<string>("");
  // Referencia para controlar el captcha invisible
  const turnstileRef = useRef<any>(null);
  // Candado de seguridad para clicks reales
  const isIntentionalSubmitRef = useRef(false);

  // Se ejecuta SÓLO cuando Turnstile devuelve el token válido
  const processSendCode = async (token: string) => {
    try {
      setLoading(true);

      await sendRecoveryCode({ email, deliveryMethod, captchaToken: token });

      toast.success(
        t("code_sent_title", { defaultValue: "Código enviado exitosamente" }),
        { theme: "colored" }
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error al enviar el código de verificación");

      turnstileRef.current?.reset();
      setCaptchaToken("");
      isIntentionalSubmitRef.current = false;
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    isIntentionalSubmitRef.current = true;
    setIsVerifying(true);
    setError("");

    turnstileRef.current?.execute();
  };

  const isProcessing = loading || isVerifying;

  return (
    <motion.form
      key="step1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="space-y-5 font-sans"
    >
      {/* Selector de Método de Entrega */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
          {t("recovery_method_label", { defaultValue: "Método de recuperación" })}
        </label>
        <Select
          value={deliveryMethod}
          onValueChange={(val: any) => setDeliveryMethod(val)}
        >
          <SelectTrigger className="w-full h-12 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500/20">
            <SelectValue
              placeholder={t("select_method_placeholder", {
                defaultValue: "Seleccionar canal...",
              })}
            />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <SelectItem
              value="OTP_EMAIL"
              className="text-xs font-semibold focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 py-0.5">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {t("email_method", { defaultValue: "Correo Electrónico (Recomendado)" })}
                </span>
              </div>
            </SelectItem>
            <SelectItem
              value="OTP_SMS"
              className="text-xs font-semibold focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-700 dark:focus:text-emerald-400 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 py-0.5">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {t("sms_method", { defaultValue: "Mensaje SMS de Texto" })}
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Input de Destino (Email / Teléfono) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
          {deliveryMethod === "OTP_EMAIL"
            ? t("your_email_label", { defaultValue: "Dirección de Correo Electrónico" })
            : t("your_phone_label", { defaultValue: "Número Telefónico Asociado" })}
        </label>
        <div className="relative">
          <input
            type={deliveryMethod === "OTP_EMAIL" ? "email" : "tel"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              deliveryMethod === "OTP_EMAIL"
                ? t("email_placeholder", { defaultValue: "ejemplo@dominio.com" })
                : t("phone_placeholder", { defaultValue: "+52 123 456 7890" })
            }
            className="w-full h-12 pl-4 pr-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm"
            required
          />
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
          setCaptchaToken(token);
          if (isIntentionalSubmitRef.current) {
            processSendCode(token);
          }
        }}
        onError={(errorCode) => {
          console.error("Turnstile error code:", errorCode);
          setError("Error al validar la seguridad. Por favor, intenta de nuevo.");
          setIsVerifying(false);
          isIntentionalSubmitRef.current = false;
          turnstileRef.current?.reset();
        }}
        options={{
          theme: "auto",
          size: "invisible",
          execution: "execute",
        }}
      />

      {/* Botón de Enviar Código */}
      <button
        type="submit"
        disabled={isProcessing || !email}
        className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
      >
        {isProcessing ? (
          <>
            <QhSpinner size="sm" className="text-current" />
            <span>{t("sending", { defaultValue: "Validando seguridad..." })}</span>
          </>
        ) : (
          <>
            <span>{t("send_code_button", { defaultValue: "Enviar Código de Verificación" })}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </>
        )}
      </button>
    </motion.form>
  );
}