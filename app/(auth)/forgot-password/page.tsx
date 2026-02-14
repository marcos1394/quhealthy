/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Clock,
  AlertCircle,
  Check,
  RefreshCw,
  Sparkles
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * AccountRecoveryPage Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR ANSIEDAD
 *    - Progress indicator visible (3 pasos)
 *    - Time estimates
 *    - Clear next steps
 *    - Reassuring messages
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Real-time code validation
 *    - Password strength meter
 *    - Step completion indicators
 *    - Success confirmations
 * 
 * 3. CREDIBILIDAD
 *    - Security badges
 *    - Code expiration timer
 *    - Professional design
 *    - Trust indicators
 * 
 * 4. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Visual step indicators
 *    - Method icons
 *    - Clear labels
 *    - Progress breadcrumbs
 * 
 * 5. MINIMIZAR ERRORES
 *    - Code format validation
 *    - Password strength rules
 *    - Resend code option
 *    - Clear error messages
 * 
 * 6. PRIMING
 *    - Success states
 *    - Positive messaging
 *    - Security assurance
 *    - Completion celebration
 */

interface PasswordRule {
  regex: RegExp;
  message: string;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/, message: "Mínimo 8 caracteres" },
  { regex: /[A-Z]/, message: "Una mayúscula" },
  { regex: /\d/, message: "Un número" },
];

export default function AccountRecoveryPage() {
  const router = useRouter();
  
  // Flow states
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeTimer, setCodeTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Password validation
  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  // Progress calculation
  const progress = (step / 3) * 100;

  // Code timer countdown
  useEffect(() => {
    if (step === 2 && codeTimer > 0) {
      const timer = setTimeout(() => setCodeTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (codeTimer === 0) {
      setCanResend(true);
    }
  }, [step, codeTimer]);

  // Password validation
  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({ 
        ...rule, 
        valid: rule.regex.test(newPassword) 
      }))
    );
  }, [newPassword]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // STEP 1: Send Code
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
      
      setSuccess(`Código enviado a tu ${method === "email" ? "correo" : "celular"}`);
      toast.success("Código de verificación enviado", { icon: <span>"✉️"</span> });
      setStep(2);
      setCodeTimer(300);
      setCanResend(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || "No pudimos enviar el código. Verifica tus datos.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend Code
  const handleResendCode = async () => {
    setCanResend(false);
    setCodeTimer(300);
    await handleMethodSubmit(new Event('submit') as any);
  };

  // STEP 2: Verify Code
  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/recovery/verify-code", { contact, code });
      setSuccess("Código verificado correctamente");
      toast.success("✓ Código verificado", { icon: <span> "🔓" </span> });
      setStep(3);
    } catch (err: any) {
      setError("Código inválido o expirado. Intenta nuevamente.");
      toast.error("Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.every(rule => rule.valid)) {
      setError("La contraseña no cumple los requisitos de seguridad");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/recovery/reset-password", {
        contact,
        code,
        newPassword,
      });
      
      setSuccess("¡Contraseña actualizada exitosamente!");
      toast.success("🎉 Contraseña restablecida", { position: "top-center" });
      
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
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl">
          
          {/* Header */}
          <CardHeader className="text-center border-b border-gray-800 pb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20 relative"
            >
              <KeyRound className="w-8 h-8 text-purple-400" />
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
            </motion.div>
            
            <CardTitle className="text-2xl font-black text-white">
              Recuperar Cuenta
            </CardTitle>
            
            <CardDescription className="text-gray-400">
              {step === 1 && "Elige cómo deseas recuperar tu acceso"}
              {step === 2 && "Ingresa el código que te enviamos"}
              {step === 3 && "Crea una nueva contraseña segura"}
            </CardDescription>

            {/* Progress Bar - MINIMIZAR ANSIEDAD */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-500">Paso {step} de 3</span>
                <span className="text-purple-400">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step Indicators */}
              <div className="flex justify-between mt-4">
                {[1, 2, 3].map((stepNum) => (
                  <div 
                    key={stepNum}
                    className="flex items-center gap-2"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      step > stepNum 
                        ? "bg-emerald-500 text-white" 
                        : step === stepNum
                        ? "bg-purple-600 text-white ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900"
                        : "bg-gray-800 text-gray-600"
                    )}>
                      {step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    <span className="hidden sm:block text-xs text-gray-500">
                      {stepNum === 1 && "Método"}
                      {stepNum === 2 && "Código"}
                      {stepNum === 3 && "Contraseña"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
                
              {/* STEP 1: Method Selection */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleMethodSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <Label className="text-gray-300 font-semibold">
                      Método de recuperación
                    </Label>
                    <Select value={method} onValueChange={(val: "email" | "phone") => setMethod(val)}>
                      <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white h-12">
                        <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="email">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-400" />
                            <span>Correo Electrónico</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-400" />
                            <span>Mensaje de Texto (SMS)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-300 font-semibold">
                      {method === "email" ? "Tu Correo Electrónico" : "Tu Número de Teléfono"}
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
                        placeholder={method === "email" ? "ejemplo@correo.com" : "+52 55 1234 5678"}
                        className="pl-11 bg-gray-800/50 border-gray-700 text-white h-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        required
                      />
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300/80">
                      Te enviaremos un código de 6 dígitos para verificar tu identidad de forma segura.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !contact} 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-bold shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Enviando código...
                      </>
                    ) : (
                      <>
                        Enviar Código de Verificación
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}

              {/* STEP 2: Code Verification */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleCodeVerification}
                  className="space-y-5"
                >
                  {/* Success Message */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-emerald-400 mb-1">
                          Código Enviado
                        </p>
                        <p className="text-xs text-emerald-300/80">
                          Revisa {method === "email" ? "tu correo" : "tus mensajes"}: <span className="font-bold">{contact}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-between bg-gray-950 rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Código válido por:</span>
                    </div>
                    <Badge className={cn(
                      "font-mono text-sm",
                      codeTimer < 60 ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {formatTime(codeTimer)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-300 font-semibold">
                      Código de Verificación
                    </Label>
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCode(value);
                      }}
                      placeholder="000000"
                      className="bg-gray-800/50 border-gray-700 text-white h-14 text-center text-3xl tracking-[0.5em] font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      maxLength={6}
                      required
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Ingresa el código de 6 dígitos
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || code.length !== 6} 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-bold shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 w-5 h-5" />
                        Verificar Código
                      </>
                    )}
                  </Button>

                  {/* Resend Code */}
                  <div className="text-center pt-2">
                    {canResend ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendCode}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reenviar Código
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-500">
                        ¿No recibiste el código? Espera {formatTime(codeTimer)}
                      </p>
                    )}
                  </div>

                  {/* Back Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full border-gray-700 text-gray-400 hover:bg-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cambiar Método
                  </Button>
                </motion.form>
              )}

              {/* STEP 3: New Password */}
              {step === 3 && (
                <motion.form
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handlePasswordReset}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <Label className="text-gray-300 font-semibold">
                      Nueva Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="pl-11 pr-12 bg-gray-800/50 border-gray-700 text-white h-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {/* Password Strength */}
                    <div className="flex flex-wrap gap-2">
                      {passwordValidation.map((rule, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all",
                            rule.valid 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                              : "bg-gray-800 border-gray-700 text-gray-500"
                          )}
                        >
                          {rule.valid ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
                          {rule.message}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-300 font-semibold">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className={cn(
                          "pl-11 pr-12 bg-gray-800/50 text-white h-12",
                          confirmPassword && newPassword !== confirmPassword
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-700 focus:border-purple-500"
                        )}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={
                      loading || 
                      !passwordValidation.every(r => r.valid) || 
                      newPassword !== confirmPassword
                    } 
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 h-12 text-base font-bold shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 w-5 h-5" />
                        Restablecer Contraseña
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Error/Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4"
                >
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              {success && step === 3 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4"
                >
                  <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <AlertDescription className="font-semibold">{success}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to Login */}
            <div className="mt-6 text-center border-t border-gray-800 pt-6">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Iniciar Sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}