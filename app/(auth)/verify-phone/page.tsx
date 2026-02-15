/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { 
  Loader2, 
  ShieldCheck, 
  Smartphone,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

// Store
import { useSessionStore } from '@/stores/SessionStore';
import { cn } from '@/lib/utils';

/**
 * VerifyPhonePage Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR ANSIEDAD
 *    - Code expiration timer
 *    - Resend countdown
 *    - Clear status messages
 *    - Progress indicators
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Real-time code validation
 *    - Character counter
 *    - Success/error states
 *    - Auto-format input
 * 
 * 3. CREDIBILIDAD
 *    - Security badges
 *    - SMS confirmation
 *    - Professional design
 *    - Trust indicators
 * 
 * 4. MINIMIZAR ERRORES
 *    - Auto-focus input
 *    - Format validation
 *    - Clear error messages
 *    - Resend option
 * 
 * 5. PRIMING
 *    - Success celebration
 *    - Positive messaging
 *    - Next step guidance
 *    - Welcome messaging
 * 
 * 6. SATISFICING
 *    - Quick resend
 *    - Auto-submit on 6 digits
 *    - One-click verification
 *    - Skip option
 */

export default function VerifyPhonePage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Timer states
  const [codeTimer, setCodeTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const router = useRouter();
  const { user } = useSessionStore();

  // Code expiration timer
  useEffect(() => {
    if (codeTimer > 0) {
      const timer = setTimeout(() => setCodeTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [codeTimer]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-format code input
  const handleCodeChange = (value: string) => {
    const formattedValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(formattedValue);
    setError('');
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !isLoading) {
      handleSubmit();
    }
  }, [code]);

  // Submit verification
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.post(
        '/api/auth/verify-phone', 
        { token: code },
        { withCredentials: true }
      );

      setSuccess(true);
      toast.success("🎉 ¡Teléfono verificado exitosamente!", { 
        position: "top-center" 
      });

      // Redirect based on role
      setTimeout(() => {
        if (user?.role === 'PROVIDER') {
          router.push('/provider/onboarding/checklist');
        } else {
          router.push('/dashboard');
        }
      }, 2000);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Código inválido. Intenta nuevamente.";
      setError(errorMsg);
      toast.error(errorMsg);
      setCode('');
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      await axios.post('/api/auth/resend-phone-code', {}, { 
        withCredentials: true 
      });

      toast.success("Código reenviado exitosamente");
      setCodeTimer(300);
      setCanResend(false);
      setResendCooldown(60); // 1 minute cooldown between resends

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Error al reenviar el código";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  // Skip verification (optional)
  const handleSkip = () => {
    if (user?.role === 'PROVIDER') {
      router.push('/provider/onboarding/checklist?phone_pending=true');
    } else {
      router.push('/dashboard?phone_pending=true');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 relative overflow-hidden">
      
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
              className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center border-2 border-purple-500/20 relative mb-4"
            >
              <Smartphone className="w-10 h-10 text-purple-400" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
            </motion.div>

            <CardTitle className="text-2xl font-black text-white mb-2">
              Verifica tu Teléfono
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Ingresa el código de 6 dígitos que enviamos por SMS
            </p>

            {/* Phone Number Display */}
            {user?.phone && (
              <div className="mt-4 inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-mono">
                  {user.phone}
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-6">
            
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  
                  {/* Timer Badge */}
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

                  {/* Code Input */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-300">
                        Código de Verificación
                      </label>
                      <Input
                        type="text"
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                        className={cn(
                          "h-14 text-center text-3xl tracking-[0.5em] font-mono",
                          "bg-gray-800/50 border-gray-700 text-white",
                          "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                          error && "border-red-500"
                        )}
                        disabled={isLoading || success}
                      />
                      <p className="text-xs text-gray-500 text-center">
                        {code.length}/6 dígitos
                      </p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-base font-bold shadow-xl"
                      disabled={isLoading || code.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 w-5 h-5" />
                          Verificar Código
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Resend Section */}
                  <div className="text-center space-y-3">
                    {canResend && resendCooldown === 0 ? (
                      <Button
                        variant="ghost"
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="animate-spin mr-2 w-4 h-4" />
                            Reenviando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 w-4 h-4" />
                            Reenviar Código
                          </>
                        )}
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {resendCooldown > 0 
                          ? `Podrás reenviar en ${resendCooldown}s`
                          : `¿No recibiste el código? Espera ${formatTime(codeTimer)}`
                        }
                      </p>
                    )}
                  </div>

                  {/* Info Card */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300/80">
                      Revisa tus mensajes de texto. El código puede tardar hasta 1 minuto en llegar.
                    </p>
                  </div>

                  {/* Skip Option */}
                  <div className="text-center border-t border-gray-800 pt-4">
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="text-gray-400 hover:text-gray-300 text-sm"
                    >
                      Verificar más tarde
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                /* Success State */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-6"
                >
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20 relative"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-400 fill-yellow-400 animate-pulse" />
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">
                      ¡Teléfono Verificado!
                    </h2>
                    <p className="text-gray-400">
                      Tu número ha sido confirmado exitosamente
                    </p>
                  </div>

                  {/* Success Info */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-emerald-400 mb-1">
                          ✓ Verificación Completa
                        </p>
                        <p className="text-xs text-emerald-300/80">
                          Redirigiendo a tu {user?.role === 'PROVIDER' ? 'panel de control' : 'dashboard'}...
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push(user?.role === 'PROVIDER' ? '/provider/onboarding/checklist' : '/dashboard')}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-base font-bold shadow-xl"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Continuar
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-900/50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-800">
            <ShieldCheck className="w-3 h-3" />
            <span>Verificación segura por SMS</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}