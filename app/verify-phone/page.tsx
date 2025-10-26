/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useSessionStore } from '@/stores/SessionStore'; // Importación corregida

export default function VerifyPhonePage() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // --- INICIO DE LA CORRECCIÓN ---
  // Obtenemos el usuario de la sesión para saber su rol
  const { user } = useSessionStore();
  // --- FIN DE LA CORRECCIÓN ---

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Llama al endpoint. El backend ya sabe quién es el usuario
      // (provider o consumer) gracias a la cookie de sesión.
      await axios.post(
        '/api/auth/verify-phone', 
        { token },
        { withCredentials: true }
      );

      toast.success("¡Teléfono verificado exitosamente!");
      
      // --- INICIO DE LA LÓGICA DE REDIRECCIÓN INTELIGENTE ---
      // 2. Redirige al usuario al siguiente paso correcto según su rol.
      if (user?.role === 'provider') {
        router.push('/provider/onboarding/checklist');
      } else {
        router.push('/consumer/dashboard'); // O a la página principal de consumidor
      }
      // --- FIN DE LA LÓGICA ---

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al verificar el código.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full border-2 border-purple-500">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold mt-4">Verifica tu Teléfono</CardTitle>
            <p className="text-gray-400">
              Ingresa el código de 6 dígitos que enviamos a tu número de teléfono.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="h-12 text-center text-2xl tracking-[.5em] bg-gray-700 border-gray-600"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-purple-600 hover:bg-purple-700" 
                disabled={isLoading || token.length !== 6}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Verificar Código"}
              </Button>
            </form>
            <div className="text-center mt-4">
                <Button variant="link" className="text-sm text-gray-400">
                    ¿No recibiste un código? Reenviar
                </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}