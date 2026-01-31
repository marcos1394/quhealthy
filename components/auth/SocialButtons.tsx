"use client";

import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/subscriptions';

interface SocialButtonsProps {
  role: UserRole; // 'PROVIDER' o 'CONSUMER'
}

export default function SocialButtons({ role }: SocialButtonsProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        // Llamamos al backend enviando el token y el ROL explícito
        const response = await loginWithGoogle(credentialResponse.credential, role);
        
        toast.success(response.message || "¡Bienvenido!");
        
        // Redirección inteligente según el rol
        setTimeout(() => {
          if (role === 'PROVIDER') {
             // Si es provider nuevo, al onboarding de perfil
             router.push("/onboarding/profile"); 
          } else {
             // Si es paciente, al home o dashboard
             router.push("/dashboard");
          }
        }, 1500);

      } catch (error) {
        // El error ya se muestra en toast o consola, no es necesario hacer más aquí
        console.error("Fallo login social:", error);
      }
    }
  };

  const handleGoogleError = () => {
    toast.error("No se pudo conectar con Google.");
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-6">
      <div className="flex justify-center w-full">
         {/* Botón Enterprise de Google */}
         <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_blue"
            shape="rectangular"
            text={role === 'PROVIDER' ? 'signup_with' : 'signin_with'}
            width="100%"
            useOneTap={false} // Evita popups invasivos en registro
         />
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-900 px-2 text-gray-400">O regístrate con correo</span>
        </div>
      </div>
    </div>
  );
}