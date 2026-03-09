"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ✅ Importamos nuestro Hook y Tipos alineados
import { useAuth } from '@/hooks/useAuth';
import { UserRole, AuthResponse } from '@/types/auth';
import { handleApiError } from '@/lib/handleApiError';

interface SocialAuthButtonsProps {
  role?: UserRole; // 'PROVIDER' | 'CONSUMER'
  // ✅ Callback clave: Recibe la respuesta del backend para que el padre (LoginPage) redirija
  onSuccess?: (response: AuthResponse) => void;
}

export default function SocialAuthButtons({
  role = 'PROVIDER',
  onSuccess
}: SocialAuthButtonsProps) {

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // 1. Instanciamos nuestro hook que ya maneja el Store Global
  const { loginWithGoogle } = useAuth();

  // 2. Configuración de Google Login
  const googleLogin = useGoogleLogin({
    // Pedimos solo lo básico para evitar bloqueos de permisos
    scope: 'openid email profile',

    onSuccess: async (tokenResponse) => {
      try {
        setLoadingProvider('google');

        // A. Llamamos al Backend a través del Hook
        // El hook se encarga de guardar el token y el usuario en el SessionStore
        const response = await loginWithGoogle({
          provider: "GOOGLE",
          token: tokenResponse.access_token,
          role: role as "CONSUMER" | "PROVIDER"
        });

        toast.success(`¡Bienvenido! Sesión iniciada.`);

        // B. Pasamos la respuesta al componente padre (LoginPage) para que haga la redirección
        if (onSuccess) {
          onSuccess(response);
        }

      } catch (error: any) {
        // El hook useAuth ya procesa el mensaje de error del backend
        const msg = error.message || 'Error al iniciar sesión con Google';
        return;
      } finally {
        setLoadingProvider(null);
      }
    },
    onError: () => {
      return;
      setLoadingProvider(null);
    }
  });

  // --- Placeholders para Apple y Facebook ---

  const handleAppleSignIn = async () => {
    // setLoadingProvider('apple');
    toast.info('Inicio de sesión con Apple próximamente');
  };

  const handleFacebookLogin = async () => {
    // setLoadingProvider('facebook');
    toast.info('Inicio de sesión con Facebook próximamente');
  };

  // --- Configuración Visual de los Botones ---

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
      bgColor: 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700',
      onClick: () => googleLogin(), // ✅ Ejecuta la función del hook de Google
    },
    // Descomentar cuando se implementen
    /*
    {
      id: 'apple',
      name: 'Apple',
      icon: <AppleIcon />, 
      bgColor: 'bg-black hover:bg-gray-900 text-white border-black',
      onClick: handleAppleSignIn,
    },
    */
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
              "w-full h-11 relative flex items-center justify-center gap-3 transition-all duration-200 shadow-sm border",
              provider.bgColor,
              // Estilo disabled
              loadingProvider !== null && loadingProvider !== provider.id ? "opacity-50 cursor-not-allowed" : "",
              "hover:shadow-md"
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