/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Lock, ArrowRight, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AccountRecoveryPage() {
  const router = useRouter();
  
  // Estados del flujo
  const [step, setStep] = useState(1); // 1: Método, 2: Verificar Código, 3: Nueva Password
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // PASO 1: Enviar Código
  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = method === "email" 
        ? "/api/auth/recovery/send-email" 
        : "/api/auth/recovery/send-sms";

      await axios.post(endpoint, { contact });
      
      setSuccess(`Código enviado a tu ${method === "email" ? "correo" : "celular"}.`);
      toast.success("Código enviado correctamente");
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message || "No pudimos enviar el código. Verifica tus datos.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Verificar Código
  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/recovery/verify-code", { contact, code });
      setSuccess("Código verificado. Ahora crea tu nueva contraseña.");
      toast.success("Código correcto");
      setStep(3);
    } catch (err: any) {
      setError("Código inválido o expirado.");
      toast.error("El código no es válido");
    } finally {
      setLoading(false);
    }
  };

  // PASO 3: Cambiar Contraseña
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres.");
        return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/recovery/reset-password", {
        contact,
        code, // Reenviamos el código o un token temporal para seguridad
        newPassword,
      });
      
      setSuccess("¡Contraseña actualizada exitosamente!");
      toast.success("Contraseña restablecida");
      
      // Redirigir al login
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (err: any) {
      setError("No se pudo actualizar la contraseña. Intenta nuevamente.");
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl">
          <CardHeader className="text-center border-b border-gray-800 pb-6">
            <div className="mx-auto w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 border border-purple-500/20">
                <KeyRound className="w-7 h-7 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Recuperar Cuenta</CardTitle>
            <CardDescription className="text-gray-400">
                {step === 1 && "Te ayudaremos a restablecer tu acceso."}
                {step === 2 && "Hemos enviado un código de seguridad."}
                {step === 3 && "Crea una nueva contraseña segura."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
                
              {/* --- PASO 1: METODO --- */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleMethodSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label className="text-gray-300">Método de recuperación</Label>
                    <Select value={method} onValueChange={(val: "email" | "phone") => setMethod(val)}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                        <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="email">Correo Electrónico</SelectItem>
                        <SelectItem value="phone">Mensaje de Texto (SMS)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">
                        {method === "email" ? "Tu Correo" : "Tu Teléfono"}
                    </Label>
                    <div className="relative">
                      {method === "email" ? (
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      ) : (
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      )}
                      <Input
                        type={method === "email" ? "email" : "tel"}
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder={method === "email" ? "ejemplo@correo.com" : "+52..."}
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white h-11 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center">Enviar Código <ArrowRight className="ml-2 w-4 h-4"/></span>}
                  </Button>
                </motion.form>
              )}

              {/* --- PASO 2: VERIFICACION --- */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleCodeVerification}
                  className="space-y-5"
                >
                  <div className="bg-purple-900/20 border border-purple-800 p-3 rounded-lg flex items-center mb-2">
                    <CheckCircle2 className="text-purple-400 w-5 h-5 mr-2" />
                    <p className="text-sm text-purple-200">Código enviado a: <span className="font-bold">{contact}</span></p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Código de 6 dígitos</Label>
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      className="bg-gray-800/50 border-gray-700 text-white h-12 text-center text-2xl tracking-[0.5em] font-mono focus:border-purple-500"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Verificar Código"}
                  </Button>
                  
                  <div className="text-center">
                    <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-white underline">
                        ¿No recibiste el código? Cambiar método
                    </button>
                  </div>
                </motion.form>
              )}

              {/* --- PASO 3: NUEVA PASSWORD --- */}
              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handlePasswordReset}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nueva Contraseña</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="********"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white h-11 focus:border-purple-500"
                        required
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Confirmar Contraseña</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="********"
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white h-11 focus:border-purple-500"
                        required
                        />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base text-white">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Restablecer Contraseña"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Mensajes Globales */}
            {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                    <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </motion.div>
            )}
            
            {success && step === 3 && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                    <Alert className="bg-emerald-900/20 border-emerald-900 text-emerald-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                </motion.div>
            )}

            <div className="mt-6 text-center border-t border-gray-800 pt-4">
                <Link href="/login" className="text-sm text-purple-400 hover:text-purple-300 font-semibold hover:underline flex items-center justify-center">
                    Volver a Iniciar Sesión
                </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}