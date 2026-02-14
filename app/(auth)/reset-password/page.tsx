/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff,
  Shield,
  Check,
  Sparkles,
  KeyRound,
  ArrowRight
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * ResetPasswordPage Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR ANSIEDAD
 *    - Token validation feedback
 *    - Clear loading states
 *    - Expiration warnings
 *    - Success confirmation
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Real-time password validation
 *    - Match confirmation visual
 *    - Token verification status
 *    - Success animation
 * 
 * 3. CREDIBILIDAD
 *    - Security badges
 *    - Secure token validation
 *    - Professional design
 *    - Trust indicators
 * 
 * 4. MINIMIZAR ERRORES
 *    - Password strength meter
 *    - Match validation
 *    - Clear error messages
 *    - Token expiration handling
 * 
 * 5. PRIMING
 *    - Success celebration
 *    - Positive messaging
 *    - Security assurance
 *    - Completion feedback
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
  { regex: /[\W_]/, message: "Un carácter especial" },
];

// --- Internal Form Component ---
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL tokens
  const selector = searchParams.get('selector');
  const verifier = searchParams.get('verifier');
  const simpleToken = searchParams.get('token');

  // States
  const [tokenState, setTokenState] = useState<'checking' | 'valid' | 'invalid' | 'expired'>('checking');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password validation
  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!simpleToken && (!selector || !verifier)) {
        setTokenState('invalid');
        return;
      }

      try {
        await axios.post("/api/auth/reset-password/validate", { 
          selector, 
          verifier, 
          token: simpleToken 
        });
        setTokenState('valid');
      } catch (err: any) {
        const errorType = err.response?.data?.type;
        setTokenState(errorType === 'expired' ? 'expired' : 'invalid');
      }
    };

    validateToken();
  }, [selector, verifier, simpleToken]);

  // Password validation
  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({ 
        ...rule, 
        valid: rule.regex.test(password) 
      }))
    );
  }, [password]);

  // Form validation
  const isFormValid = (): boolean => {
    return (
      passwordValidation.every(rule => rule.valid) &&
      password === confirmPassword &&
      confirmPassword.length > 0
    );
  };

  // Submit new password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError("Por favor completa todos los requisitos de seguridad");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/reset-password/confirm", {
        selector,
        verifier,
        token: simpleToken,
        password
      });

      setSuccess(true);
      toast.success("🎉 Contraseña restablecida correctamente", { 
        position: "top-center" 
      });

      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al restablecer. El enlace puede haber expirado.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- CONDITIONAL RENDERING ---

  // State: Checking token
  if (tokenState === 'checking') {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-12 h-12 text-purple-500" />
        </motion.div>
        <div className="text-center">
          <p className="text-gray-300 font-semibold mb-1">Verificando enlace de seguridad...</p>
          <p className="text-gray-500 text-sm">Esto solo tomará un momento</p>
        </div>
      </div>
    );
  }

  // State: Invalid or Expired token
  if (tokenState === 'invalid' || tokenState === 'expired') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            {tokenState === 'expired' ? 'Enlace Expirado' : 'Enlace no válido'}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>
              {tokenState === 'expired' 
                ? 'Este enlace de recuperación ha expirado por seguridad. Por favor solicita uno nuevo.'
                : 'Este enlace de recuperación no es válido o ya fue usado. Por favor solicita uno nuevo.'}
            </p>
            <div className="bg-red-950/30 rounded-lg p-3 border border-red-800/30">
              <p className="text-xs text-red-300/80">
                💡 Los enlaces de recuperación expiran después de 1 hora por tu seguridad.
              </p>
            </div>
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Link href="/forgot-password" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full border-red-800 text-red-200 hover:bg-red-900/50 hover:text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Solicitar Nuevo Enlace
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-red-300 hover:bg-red-900/30"
              >
                Volver al Login
              </Button>
            </Link>
          </div>
        </Alert>
      </motion.div>
    );
  }

  // State: Success
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20 relative"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">
            ¡Contraseña Actualizada!
          </h2>
          <p className="text-gray-400">
            Tu contraseña ha sido cambiada exitosamente
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-sm text-emerald-300/80">
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
        </div>

        <Link href="/login" className="block">
          <Button className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 h-12 text-base font-bold shadow-xl">
            <Sparkles className="w-4 h-4 mr-2" />
            Ir a Iniciar Sesión
          </Button>
        </Link>
      </motion.div>
    );
  }

  // State: Valid form
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* Security Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300/80">
          Crea una contraseña segura que no hayas usado antes en otros sitios.
        </p>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Password */}
      <div className="space-y-3">
        <Label className="text-gray-300 font-semibold">Nueva Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="pl-11 pr-12 bg-gray-800/50 border-gray-700 text-white h-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Password Strength Indicators */}
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
              {rule.valid ? (
                <Check size={12} />
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-600" />
              )}
              {rule.message}
            </span>
          ))}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-3">
        <Label className="text-gray-300 font-semibold">Confirmar Contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            className={cn(
              "pl-11 pr-12 bg-gray-800/50 text-white h-12",
              confirmPassword && password !== confirmPassword
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
            )}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {/* Match Indicator */}
        {confirmPassword && (
          <div className="flex items-center gap-2">
            {password === confirmPassword ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-emerald-400">Las contraseñas coinciden</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-red-400">Las contraseñas no coinciden</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={!isFormValid() || loading} 
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-bold shadow-xl"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Actualizando contraseña...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 w-5 h-5" />
            Cambiar Contraseña
          </>
        )}
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
        <Shield className="w-3 h-3" />
        <span>Conexión segura con cifrado SSL</span>
      </div>
    </form>
  );
}

// --- Main Page Component ---
export default function ResetPasswordPage() {
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
            
            <CardTitle className="text-2xl font-black text-white mb-2">
              Restablecer Contraseña
            </CardTitle>
            <CardDescription className="text-gray-400">
              Crea una nueva contraseña segura para tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Suspense fallback={
              <div className="flex flex-col justify-center items-center py-12 space-y-4">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-gray-400 text-sm">Cargando...</p>
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>

            {/* Footer */}
            <div className="mt-6 text-center border-t border-gray-800 pt-6">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 font-semibold hover:underline"
              >
                Volver a Iniciar Sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}