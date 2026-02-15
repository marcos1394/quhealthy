"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Mail,
  Sparkles,
  ArrowRight,
  Shield,
  Stethoscope,
  User,
  AlertCircle,
  Badge,
  Clock,
  RefreshCw
} from 'lucide-react';

// Services
import { authService } from '@/services/auth.services';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * Componente interno que maneja la lógica de los SearchParams.
 * Debe estar dentro de Suspense para evitar errores de hidratación en Next.js App Router.
 */
function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  // El rol es opcional, solo para personalizar el saludo (provider/consumer)
  const roleParam = searchParams.get('role'); 

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando la seguridad de tu enlace...');
  const [progress, setProgress] = useState(10);
  const [countdown, setCountdown] = useState(5);

  // --- EFECTO: Simulación de Progreso (UX) ---
  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 15));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [status]);

  // --- EFECTO: Cuenta Regresiva para Redirección ---
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push('/login?verified=true');
    }
  }, [status, countdown, router]);

  // --- EFECTO PRINCIPAL: Verificar Token ---
  useEffect(() => {
    const verify = async () => {
      // 1. Validar presencia del token
      if (!token) {
        setStatus('error');
        setMessage('El enlace de verificación es inválido o está incompleto.');
        setProgress(100);
        return;
      }

      try {
        // 2. Llamada al Backend (GET /api/auth/verify-email?token=...)
        // No necesitamos pasar el rol al backend, él ya sabe quién es por el token.
        await authService.verifyEmail(token);
        
        // 3. Éxito
        setProgress(100);
        setStatus('success');
        setMessage('¡Tu cuenta ha sido verificada exitosamente!');
      } catch (error: any) {
        // 4. Error
        setProgress(100);
        setStatus('error');
        // Mensaje amigable desde el backend o fallback
        const msg = error.response?.data?.message || 'El enlace ha expirado o ya fue utilizado.';
        setMessage(msg);
      }
    };

    // Pequeño delay artificial para que el usuario vea la animación de carga (UX)
    // y no sea un parpadeo instantáneo.
    const timeout = setTimeout(() => {
        verify();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [token]);

  // --- UI HELPERS ---
  const isProvider = roleParam === 'provider';
  
  // Icono dinámico según rol
  const RoleIcon = isProvider ? Stethoscope : User;

  // Role content mapping
  const roleContent = isProvider 
    ? {
        title: 'Proveedor de Salud',
        welcome: '¡Bienvenido, Proveedor!',
        message: 'Tu cuenta de proveedor está lista para atender pacientes.',
        color: 'purple' as const,
      }
    : {
        title: 'Paciente',
        welcome: '¡Bienvenido!',
        message: 'Tu cuenta está lista para acceder a los servicios de salud.',
        color: 'pink' as const,
      };

  // Determine if should show redirect countdown
  const shouldRedirect = true;

  // Handle redirect function
  const handleRedirect = () => {
    router.push('/login?verified=true');
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
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl overflow-hidden">
          <CardContent className="p-8">
            
            <AnimatePresence mode="wait">
              
              {/* Loading State */}
              {status === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full flex items-center justify-center border-2 border-purple-500/20"
                  >
                    <Mail className="w-10 h-10 text-purple-400" />
                  </motion.div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white">
                      Verificando tu Email
                    </h1>
                    <p className="text-gray-400">
                      Por favor espera mientras confirmamos tu cuenta
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500">Verificando</span>
                      <span className="text-purple-400">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Security Info */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300/80 text-left">
                      Estamos verificando tu identidad de forma segura para proteger tu cuenta.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Success State */}
              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6"
                >
                  {/* Success Icon with Animation */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      delay: 0.2 
                    }}
                    className="relative mx-auto w-24 h-24"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full blur-xl" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/20">
                      <CheckCircle className="w-12 h-12 text-emerald-400" />
                      <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-400 fill-yellow-400 animate-pulse" />
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Badge 
                        className={cn(
                          "mb-2",
                          roleContent.color === 'pink' 
                            ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        )}
                      >
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {roleContent.title}
                      </Badge>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl font-black text-white"
                    >
                      {roleContent.welcome}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-400"
                    >
                      Tu cuenta ha sido verificada exitosamente
                    </motion.p>
                  </div>

                  {/* Success Info Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-emerald-400 mb-1">
                          ✓ Email Verificado
                        </p>
                        <p className="text-xs text-emerald-300/80">
                          {roleContent.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Countdown Timer */}
                  {shouldRedirect && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 text-sm text-gray-400"
                    >
                      <Clock className="w-4 h-4" />
                      <span>
                        Redirigiendo en {countdown} segundo{countdown !== 1 ? 's' : ''}...
                      </span>
                    </motion.div>
                  )}

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button 
                      onClick={handleRedirect}
                      className={cn(
                        "w-full h-12 text-base font-bold shadow-xl",
                        roleContent.color === 'pink'
                          ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                          : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      )}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Comenzar Ahora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {/* Error State */}
              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-6"
                >
                  {/* Error Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20"
                  >
                    <XCircle className="w-10 h-10 text-red-400" />
                  </motion.div>

                  <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white">
                      Error de Verificación
                    </h1>
                    <p className="text-gray-400">
                      {message}
                    </p>
                  </div>

                  {/* Error Details */}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3 text-left">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-300/80 space-y-2">
                        <p className="font-semibold text-red-400">Posibles causas:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>El enlace ha expirado (24 horas de validez)</li>
                          <li>El enlace ya fue utilizado</li>
                          <li>El enlace está incompleto o dañado</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      onClick={() => router.push('/login')}
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 h-11"
                    >
                      Ir a Iniciar Sesión
                    </Button>

                    <Button 
                      onClick={() => window.location.reload()}
                      variant="ghost"
                      className="w-full text-gray-400 hover:bg-gray-800 h-11"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Intentar de Nuevo
                    </Button>
                  </div>

                  {/* Help Text */}
                  <div className="text-xs text-gray-500 pt-2">
                    ¿Necesitas ayuda? Contacta a{' '}
                    <a 
                      href="mailto:support@quhealthy.com" 
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      support@quhealthy.com
                    </a>
                  </div>
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
            <Shield className="w-3 h-3" />
            <span>Verificación segura con cifrado SSL</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Main exported component with Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto" />
            <p className="text-gray-400 text-sm">Cargando verificación...</p>
          </div>
        </div>
      }
    >
      <VerificationContent />
    </Suspense>
  );
}