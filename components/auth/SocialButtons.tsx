// Ubicación: src/components/auth/SocialAuthButtons.tsx (o su ruta correspondiente)
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation'; // 🚀 ADDED: Para poder redirigir al usuario

// ✅ Hook y Tipos alineados
import { useAuth } from '@/hooks/useAuth';
import { UserRole, AuthResponse } from '@/types/auth';

interface SocialAuthButtonsProps {
  role?: UserRole; // 'PROVIDER' | 'CONSUMER'
  onSuccess?: (response: AuthResponse) => void;
}

export default function SocialAuthButtons({
  role = 'PROVIDER',
  onSuccess
}: SocialAuthButtonsProps) {

  const router = useRouter(); // 🚀 ADDED
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { loginWithGoogle } = useAuth(); // Este hook llama internamente al service que ya rutea /apple o /google

  // ==========================================
  // 🚀 LÓGICA DE ENRUTAMIENTO (EL EMBUDO)
  // ==========================================
  const handleRedirection = (response: AuthResponse) => {
    const { status, role: userRole, user } = response;

    if (!status.emailVerified) {
      router.push('/verify-email');
      return;
    }

    if (!status.onboardingComplete) {
      router.push('/onboarding');
      return;
    }

    // Si todo está completo, lo mandamos a su panel
    if (userRole === 'PROVIDER') {
      router.push('/provider/dashboard');
    } else {
      router.push('/patient/dashboard');
    }
  };

  // ==========================================
  // 1. CONFIGURACIÓN GOOGLE
  // ==========================================
  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      try {
        setLoadingProvider('google');
        // Enviamos provider: "GOOGLE" para que el service use /api/auth/social/google
        const response = await loginWithGoogle({
          provider: "GOOGLE",
          token: tokenResponse.access_token,
          role: role as "CONSUMER" | "PROVIDER"
        });

        toast.success(`¡Bienvenido, ${response.user?.firstName || ''}!`);
        if (onSuccess) onSuccess(response);

        // 🚀 Ejecutamos el embudo de redirección
        handleRedirection(response);

      } catch (error: any) {
        // El error ya lo maneja el interceptor/hook, aquí solo detenemos el loading
      } finally {
        // En un flujo real no detienes el loading si vas a redirigir (para evitar parpadeos),
        // pero lo dejamos por si la redirección falla o hay error.
        setLoadingProvider(null);
      }
    },
    onError: () => setLoadingProvider(null)
  });

  // ==========================================
  // 2. CONFIGURACIÓN APPLE (FIX FF-002)
  // ==========================================
  const handleAppleSignIn = async () => {
    // Nota: Aquí integrarías la librería 'react-apple-login' o el script de Apple.
    try {
      setLoadingProvider('apple');
      
      const appleToken = "TOKEN_RECIBIDO_DE_APPLE"; 

      const response = await loginWithGoogle({
        provider: "APPLE",
        token: appleToken,
        role: role as "CONSUMER" | "PROVIDER"
      });

      toast.success(`¡Bienvenido, ${response.user?.firstName || ''}!`);
      if (onSuccess) onSuccess(response);

      // 🚀 Ejecutamos el embudo de redirección
      handleRedirection(response);

    } catch (error: any) {
       // Manejo de error
    } finally {
      setLoadingProvider(null);
    }
  };

  // ==========================================
  // 3. ESTRUCTURA VISUAL (DICCIONARIO)
  // ==========================================
  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      bgColor: 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700',
      onClick: () => googleLogin(),
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M17.057 12.822c.018 2.392 2.046 3.193 2.071 3.204-.017.054-.323 1.107-1.07 2.201-.645.945-1.314 1.887-2.373 1.906-1.037.019-1.371-.611-2.563-.611-1.192 0-1.562.592-2.544.629-1.02.038-1.791-.983-2.438-1.928-1.325-1.931-2.336-5.454-1.01-7.755.658-1.141 1.83-1.864 3.102-1.883 1.019-.019 1.98.702 2.604.702.623 0 1.777-.87 2.992-.746.509.021 1.936.204 2.854 1.545-.072.045-1.705.993-1.685 2.941zM14.636 4.545c.548-.663.917-1.583.816-2.503-.79.032-1.745.527-2.312 1.189-.509.589-.955 1.529-.836 2.427.88.069 1.785-.45 2.332-1.113z" />
        </svg>
      ),
      bgColor: 'bg-slate-900 hover:bg-slate-800 border-transparent text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
      onClick: handleAppleSignIn,
    }
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      {socialProviders.map((provider, index) => (
        <motion.div
          key={provider.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="w-full"
        >
          <Button
            type="button"
            variant="outline"
            onClick={provider.onClick}
            disabled={loadingProvider !== null}
            className={cn(
              "w-full h-11 relative flex items-center justify-center gap-3 transition-all duration-200 shadow-sm border rounded-xl",
              provider.bgColor,
              loadingProvider !== null && loadingProvider !== provider.id ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
            )}
          >
            {loadingProvider === provider.id ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Conectando...</span>
              </>
            ) : (
              <>
                <span className="absolute left-4">{provider.icon}</span>
                <span className="text-sm font-medium">Continuar con {provider.name}</span>
              </>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}