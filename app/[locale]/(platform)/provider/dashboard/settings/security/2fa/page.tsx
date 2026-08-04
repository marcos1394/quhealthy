"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Smartphone,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Download,
  Copy,
  CheckCircle2,
  QrCode,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { securityService } from "@/services/security.service";
import { MfaSetupResponse } from "@/types/security";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface EnableFormValues {
  code: string;
}

interface DisableFormValues {
  password: string;
}

export default function TwoFactorPage() {
  const t = useTranslations("Settings2FA");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"initial" | "step1" | "step2" | "step3">("initial");
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const {
    register: registerEnable,
    handleSubmit: handleSubmitEnable,
    formState: { errors: errorsEnable },
  } = useForm<EnableFormValues>();

  const {
    register: registerDisable,
    handleSubmit: handleSubmitDisable,
    formState: { errors: errorsDisable },
    reset: resetDisable,
  } = useForm<DisableFormValues>();

  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch initial MFA state
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const settings = await securityService.getProviderSettings();
        if (settings.mfaEnabled !== undefined) {
          setMfaEnabled(settings.mfaEnabled);
        }
      } catch (error) {
        console.error("Failed to fetch MFA status", error);
      } finally {
        setIsInitializing(false);
      }
    };
    fetchStatus();
  }, []);

  // Iniciar flujo de configuración (Paso 1: Generar QR/Secreto)
  const handleStartSetup = async () => {
    try {
      setLoading(true);
      const data = await securityService.setupMfa();
      setSetupData(data);
      setStep("step1");
    } catch (error: any) {
      if (error.response?.data?.error?.includes("activado")) {
        setMfaEnabled(true);
      } else {
        toast.error(t("toast_error_init"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Activar MFA enviando código de 6 dígitos (Paso 2)
  const onEnable = async (data: EnableFormValues) => {
    try {
      setLoading(true);
      const res = await securityService.enableMfa(data.code);
      setRecoveryCodes(res.recoveryCodes || []);
      setStep("step3");
      toast.success(t("toast_success"));
      setMfaEnabled(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("toast_error_verify"));
    } finally {
      setLoading(false);
    }
  };

  // Desactivar MFA con contraseña
  const onDisable = async (data: DisableFormValues) => {
    try {
      setLoading(true);
      await securityService.disableMfa(data.password);
      toast.success(t("toast_disable_success"));
      setMfaEnabled(false);
      setStep("initial");
      resetDisable();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t("toast_disable_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = useCallback((secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedKey(true);
    toast.success(t("toast_copy"));
    setTimeout(() => setCopiedKey(false), 2000);
  }, [t]);

  const downloadRecoveryCodes = () => {
    const text = recoveryCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quhealthy_recovery_codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("toast_download"));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-xl mx-auto space-y-8">
        
        {isInitializing ? (
          <div className="flex justify-center items-center h-40">
            <QhSpinner className="w-8 h-8 text-emerald-600" />
          </div>
        ) : (
          <>
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <Link
            href="/provider/dashboard/settings"
            className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-200" strokeWidth={2} />
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Smartphone className="w-6 h-6" strokeWidth={2} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              {t("title")}
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* ── ESTADO: 2FA YA ACTIVADO ────────────────────────────────── */}
          {mfaEnabled && step === "initial" && (
            <Card className="bg-white dark:bg-[#0a0a0a] border-emerald-100 dark:border-emerald-900/30 rounded-3xl overflow-hidden shadow-sm">
              <CardHeader className="p-6 md:p-8 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 mb-1">
                  <ShieldCheck className="w-6 h-6 shrink-0" strokeWidth={2} />
                  <CardTitle className="text-base font-bold tracking-tight">
                    {t("enabled_title")}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs font-medium text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed pl-9">
                  {t("enabled_desc")}
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmitDisable(onDisable)}>
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("disable_label")}
                    </Label>
                    <Input
                      type="password"
                      className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                      {...registerDisable("password", { required: true })}
                    />
                    {errorsDisable.password && (
                      <p className="text-[11px] font-bold text-rose-500 mt-1">
                        Campo requerido
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={loading}
                    className="h-11 px-6 rounded-xl border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold shadow-sm"
                  >
                    {loading ? <QhSpinner size="sm" /> : t("disable_button")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* ── ESTADO INICIAL: SIN CONFIGURAR ───────────────────────────── */}
          {!mfaEnabled && step === "initial" && (
            <Card className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
              <CardHeader className="p-6 md:p-8 space-y-2">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                  {t("step1.instructions_title")}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("step1.instructions_desc")}
                </CardDescription>
              </CardHeader>

              <CardFooter className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <Button
                  onClick={handleStartSetup}
                  disabled={loading}
                  className="w-full sm:w-auto h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm border-0"
                >
                  {loading ? <QhSpinner size="sm" /> : t("step1.continue")}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* ── PASO 1: ESCANEAR CÓDIGO QR / SECRETO MANUAL ──────────────── */}
          {step === "step1" && setupData && (
            <Card className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
              <CardHeader className="p-6 md:p-8 space-y-2 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("step1.instructions_title")}</span>
                </CardTitle>
                <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("step1.instructions_desc")}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 md:p-8 space-y-6 flex flex-col items-center">
                {/* Imagen del Código QR */}
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">
                  <img
                    src={setupData.qrCodeUri}
                    alt="MFA QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                {/* Clave Manual */}
                <div className="w-full text-center space-y-2 bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("step1.cannot_scan")}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs font-mono font-bold text-gray-900 dark:text-white select-all">
                      {setupData.secret}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopySecret(setupData.secret)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {copiedKey ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <Button
                  onClick={() => setStep("step2")}
                  className="w-full sm:w-auto h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
                >
                  <span>{t("step1.continue")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* ── PASO 2: VERIFICAR CÓDIGO DE 6 DÍGITOS ─────────────────────── */}
          {step === "step2" && (
            <Card className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
              <CardHeader className="p-6 md:p-8 space-y-2 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("step2.instructions")}</span>
                </CardTitle>
              </CardHeader>

              <form onSubmit={handleSubmitEnable(onEnable)}>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      className="h-14 rounded-2xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-center tracking-[0.3em] font-mono text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                      placeholder={t("step2.placeholder")}
                      maxLength={6}
                      autoFocus
                      {...registerEnable("code", {
                        required: true,
                        pattern: /^[0-9]{6}$/,
                      })}
                    />
                    {errorsEnable.code && (
                      <p className="text-[11px] font-bold text-rose-500 text-center mt-1">
                        {t("toast_error_verify")}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("step1")}
                    className="w-full sm:w-auto h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
                  >
                    {t("step2.back")}
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm border-0"
                  >
                    {loading ? <QhSpinner size="sm" /> : t("step2.verify")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* ── PASO 3: CÓDIGOS DE RECUPERACIÓN / ÉXITO ───────────────────── */}
          {step === "step3" && (
            <Card className="bg-white dark:bg-[#0a0a0a] border-emerald-100 dark:border-emerald-900/30 rounded-3xl overflow-hidden shadow-sm">
              <CardHeader className="p-6 md:p-8 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30 space-y-2">
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 mb-1">
                  <ShieldCheck className="w-6 h-6 shrink-0" strokeWidth={2} />
                  <CardTitle className="text-base font-bold tracking-tight">
                    {t("step3.success_title")}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs font-medium text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed pl-9">
                  {t("step3.success_desc")}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t("step3.important_title")}</span>
                  </p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t("step3.important_desc")}
                  </p>
                </div>

                {recoveryCodes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 bg-gray-50/50 dark:bg-[#050505] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 font-mono text-xs font-bold text-gray-900 dark:text-white text-center">
                    {recoveryCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm tracking-wider"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-gray-400 text-center italic">
                    {t("step3.no_backup_codes")}
                  </p>
                )}
              </CardContent>

              <CardFooter className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                {recoveryCodes.length > 0 && (
                  <Button
                    onClick={downloadRecoveryCodes}
                    variant="outline"
                    className="w-full sm:flex-1 h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" strokeWidth={2} />
                    <span>{t("step3.download")}</span>
                  </Button>
                )}

                <Button
                  onClick={() => router.push("/provider/dashboard")}
                  className="w-full sm:flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm border-0"
                >
                  {t("step3.go_to_dashboard")}
                </Button>
              </CardFooter>
            </Card>
          )}
        </motion.div>
        </>
        )}
      </div>
    </div>
  );
}