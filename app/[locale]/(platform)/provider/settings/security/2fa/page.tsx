/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Shield,
  Smartphone,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Download,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';

export default function TwoFactorSetupPage() {
  const t = useTranslations('Settings2FA');
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Paso 1: Obtener el Secreto para el QR
  const fetchSetupData = async () => {
    try {
      setInitializing(true);
      const response = await axios.get("/api/auth/2fa/setup");

      setSecret(response.data.secret);
      if (response.data.backupCodes) {
        setBackupCodes(response.data.backupCodes);
      }
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchSetupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Paso 2: Verificar el código TOTP ingresado
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/2fa/verify", {
        token: code,
        secret: secret
      });

      if (response.data.success || response.status === 200) {
        toast.success(t('toast_success'));

        if (response.data.backupCodes) {
          setBackupCodes(response.data.backupCodes);
        }

        setStep(3);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || t('toast_error_verify');
      handleApiError(err);
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  // Utils
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('toast_copy'));
  };

  const downloadBackupCodes = () => {
    const text = `QuHealthy Backup Codes:\n\n${backupCodes.join('\n')}\n\nKeep this file in a safe place.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quhealthy-backup-codes.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(t('toast_download'));
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <QhSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-medical-500/30">

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">

          <CardHeader className="text-center border-b border-slate-100 dark:border-slate-800/60 pb-8 pt-8">
            <div className="mx-auto w-16 h-16 bg-medical-50 dark:bg-medical-500/10 rounded-2xl flex items-center justify-center mb-5 border border-medical-100 dark:border-medical-500/20 shadow-sm">
              <Shield className="w-8 h-8 text-medical-600 dark:text-medical-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">{t('title')}</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 mt-2 text-base">
              {t('subtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <AnimatePresence mode="wait">

              {/* PASO 1: ESCANEAR QR */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-8 space-y-8"
                >
                  <Alert className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300">
                    <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="font-semibold">{t('step1.instructions_title')}</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300/80 mt-1">
                      {t('step1.instructions_desc')}
                    </AlertDescription>
                  </Alert>

                  {secret ? (
                    <div className="flex flex-col items-center space-y-6">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <QRCodeSVG value={`otpauth://totp/QuHealthy:${"Usuario"}?secret=${secret}&issuer=QuHealthy`} size={180} />
                      </div>

                      <div className="w-full bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase font-bold tracking-wider">{t('step1.cannot_scan')}</p>
                        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg px-4 py-2.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                          <code className="text-medical-600 dark:text-medical-400 font-mono text-sm tracking-widest font-semibold">
                            {secret}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(secret)} className="hover:text-medical-600 dark:hover:text-medical-400 h-8 w-8 p-0">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-rose-500 font-medium bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                      {t('step1.error_secret')}
                    </div>
                  )}

                  <Button onClick={() => setStep(2)} className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-medical-600 dark:hover:bg-medical-700 h-12 rounded-xl text-base shadow-sm group">
                    {t('step1.continue')} <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              )}

              {/* PASO 2: VERIFICAR CÓDIGO */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-8 space-y-8"
                >
                  <div className="text-center space-y-4 py-2">
                    <div className="mx-auto w-14 h-14 bg-medical-50 dark:bg-medical-500/10 rounded-full flex items-center justify-center animate-pulse border border-medical-100 dark:border-medical-500/20">
                      <Lock className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {t('step2.instructions')}
                    </p>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-6">
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder={t('step2.placeholder')}
                      className="text-center text-3xl tracking-[0.5em] h-16 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-medical-500 focus-visible:border-medical-500 font-mono placeholder:tracking-normal placeholder:text-slate-300 dark:placeholder:text-slate-700 rounded-xl transition-all shadow-inner"
                      maxLength={6}
                      autoFocus
                    />

                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="w-full bg-medical-600 hover:bg-medical-700 text-white font-semibold h-12 rounded-xl shadow-sm"
                      >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : t('step2.verify')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(1)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-11"
                      >
                        {t('step2.back')}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* PASO 3: ÉXITO Y CÓDIGOS DE RESPALDO */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 space-y-8"
                >
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100 dark:border-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {t('step3.success_title')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      {t('step3.success_desc')}
                    </p>
                  </div>

                  <Alert className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-700 dark:text-amber-300 font-bold tracking-wide uppercase text-sm">{t('step3.important_title')}</AlertTitle>
                    <AlertDescription className="text-amber-700/80 dark:text-amber-200/80 mt-1">
                      {t('step3.important_desc')}
                    </AlertDescription>
                  </Alert>

                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 shadow-inner">
                    {backupCodes.length > 0 ? backupCodes.map((code, index) => (
                      <div key={index} className="bg-white dark:bg-slate-900 p-2.5 rounded-lg text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                        <code className="font-mono text-slate-800 dark:text-slate-300 text-sm font-semibold tracking-wider">{code}</code>
                      </div>
                    )) : (
                      <p className="col-span-2 text-center text-slate-500 text-sm py-2">{t('step3.no_backup_codes')}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={downloadBackupCodes}
                      variant="outline"
                      className="flex-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 rounded-xl font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" /> {t('step3.download')}
                    </Button>

                    <Button
                      onClick={() => router.push("/provider")}
                      className="flex-1 bg-medical-600 hover:bg-medical-700 text-white h-12 rounded-xl font-medium shadow-sm"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" /> {t('step3.go_to_dashboard')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}