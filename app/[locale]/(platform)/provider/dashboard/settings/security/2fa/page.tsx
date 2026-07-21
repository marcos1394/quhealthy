"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Smartphone, ArrowLeft, QrCode, KeyRound, Save, AlertTriangle, ShieldCheck, Download } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";

import { securityService } from "@/services/security.service";
import { MfaSetupResponse } from "@/types/security";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TwoFactorPage() {
  const t = useTranslations("SettingsSecurity");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"initial" | "setup" | "recovery">("initial");
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const { register: registerEnable, handleSubmit: handleSubmitEnable, formState: { errors: errorsEnable } } = useForm();
  const { register: registerDisable, handleSubmit: handleSubmitDisable, formState: { errors: errorsDisable }, reset: resetDisable } = useForm();

  // In a real scenario, you'd fetch the user profile to know if MFA is already enabled.
  // We'll assume the user needs to set it up if they come here, or we can check via an API if needed.

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      const data = await securityService.setupMfa();
      setSetupData(data);
      setStep("setup");
    } catch (error: any) {
      if (error.response?.data?.error?.includes("activado")) {
        setMfaEnabled(true);
      } else {
        toast.error("Error al iniciar la configuración de MFA");
      }
    } finally {
      setLoading(false);
    }
  };

  const onEnable = async (data: any) => {
    try {
      setLoading(true);
      const res = await securityService.enableMfa(data.code);
      setRecoveryCodes(res.recoveryCodes);
      setStep("recovery");
      toast.success("MFA activado exitosamente");
      setMfaEnabled(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const onDisable = async (data: any) => {
    try {
      setLoading(true);
      await securityService.disableMfa(data.password);
      toast.success("MFA desactivado exitosamente");
      setMfaEnabled(false);
      setStep("initial");
      resetDisable();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Contraseña incorrecta");
    } finally {
      setLoading(false);
    }
  };

  const downloadRecoveryCodes = () => {
    const text = recoveryCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quhealthy_recovery_codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/provider/dashboard/settings" className="p-2 border border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
          </Link>
          <div className="p-3 bg-black dark:bg-white border border-black dark:border-white w-fit">
            <Smartphone className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter text-black dark:text-white">
              {t("options.2fa.title") || "Autenticación en 2 Pasos (2FA)"}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
              Añade una capa extra de seguridad
            </p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          
          {mfaEnabled && step === "initial" && (
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-600/30 rounded-none mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-500 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold uppercase tracking-tight">
                    MFA Activado
                  </CardTitle>
                </div>
                <CardDescription className="text-xs uppercase tracking-wide text-green-700/80 dark:text-green-400/80">
                  Tu cuenta está protegida con autenticación de dos factores.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitDisable(onDisable)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest">Para desactivar, ingresa tu contraseña</Label>
                    <Input 
                      type="password"
                      className="rounded-none border-black/20 dark:border-white/20" 
                      {...registerDisable("password", { required: "Contraseña requerida" })}
                    />
                    {errorsDisable.password && <p className="text-red-500 text-[10px] uppercase font-bold">{errorsDisable.password.message as string}</p>}
                  </div>
                </CardContent>
                <CardFooter className="bg-black/5 dark:bg-white/5 p-4 border-t border-black/10 dark:border-white/10">
                  <Button 
                    type="submit" 
                    variant="destructive"
                    disabled={loading}
                    className="rounded-none uppercase text-[10px] tracking-widest font-bold"
                  >
                    {loading ? "Procesando..." : "Desactivar 2FA"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {!mfaEnabled && step === "initial" && (
            <Card className="bg-transparent border-black/20 dark:border-white/20 rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold uppercase tracking-tight">
                  Configurar Aplicación de Autenticación
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide mt-1">
                  Usa una aplicación como Google Authenticator o Authy.
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10">
                <Button 
                  onClick={handleStartSetup}
                  disabled={loading}
                  className="w-full rounded-none uppercase text-[10px] tracking-widest font-bold"
                >
                  {loading ? "Cargando..." : "Comenzar Configuración"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === "setup" && setupData && (
            <Card className="bg-transparent border-black/20 dark:border-white/20 rounded-none">
              <CardHeader>
                <CardTitle className="text-lg font-bold uppercase tracking-tight">
                  Escanea el Código QR
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide mt-1">
                  Abre tu aplicación de autenticación y escanea este código.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex flex-col items-center">
                <div className="bg-white p-4 border border-black/10">
                  <img src={setupData.qrCodeUri} alt="QR Code MFA" className="w-48 h-48" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Código Manual</p>
                  <code className="text-sm font-mono bg-black/5 dark:bg-white/5 px-2 py-1 select-all">
                    {setupData.secret}
                  </code>
                </div>

                <form onSubmit={handleSubmitEnable(onEnable)} className="w-full space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold tracking-widest">Código de 6 dígitos</Label>
                    <Input 
                      className="rounded-none border-black/20 dark:border-white/20 text-center tracking-widest text-lg font-mono" 
                      placeholder="000000"
                      maxLength={6}
                      {...registerEnable("code", { 
                        required: "Ingresa el código",
                        pattern: { value: /^[0-9]{6}$/, message: "Debe ser de 6 dígitos numéricos" }
                      })}
                    />
                    {errorsEnable.code && <p className="text-red-500 text-[10px] uppercase font-bold text-center">{errorsEnable.code.message as string}</p>}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-none uppercase text-[10px] tracking-widest font-bold"
                  >
                    {loading ? "Verificando..." : "Activar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "recovery" && (
            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-600/30 rounded-none">
              <CardHeader>
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-500 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <CardTitle className="text-lg font-bold uppercase tracking-tight">
                    Códigos de Recuperación
                  </CardTitle>
                </div>
                <CardDescription className="text-xs uppercase tracking-wide text-yellow-700/80 dark:text-yellow-400/80">
                  Guarda estos códigos en un lugar seguro. Son la única forma de acceder si pierdes tu dispositivo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 bg-white dark:bg-black p-4 border border-yellow-600/20 font-mono text-sm">
                  {recoveryCodes.map((code, idx) => (
                    <div key={idx} className="tracking-widest">{code}</div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-yellow-100/50 dark:bg-yellow-900/30 border-t border-yellow-600/20">
                <Button 
                  onClick={downloadRecoveryCodes}
                  className="w-full rounded-none uppercase text-[10px] tracking-widest font-bold bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Códigos
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setStep("initial")}
                  className="w-full rounded-none uppercase text-[10px] tracking-widest font-bold border-yellow-600 text-yellow-700 dark:text-yellow-400 ml-2 h-9 hover:bg-yellow-600 hover:text-white"
                >
                  Finalizar
                </Button>
              </CardFooter>
            </Card>
          )}

        </motion.div>
      </div>
    </div>
  );
}
