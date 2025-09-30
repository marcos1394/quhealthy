/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link as LinkIcon, CheckCircle, Facebook, Instagram } from 'lucide-react';

export default function MarketingPage() {
  const { user, fetchSession } = useSessionStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Verificamos si la conexión fue exitosa al volver de Facebook
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    if (success) {
      toast.success("¡Cuenta de Facebook/Instagram conectada exitosamente!");
      fetchSession(); // Recargamos la sesión para ver el nuevo estado
      router.replace('/provider/dashboard/marketing'); // Limpiamos la URL
    }
    if (error) {
      toast.error("No se pudo conectar la cuenta.");
      router.replace('/provider/dashboard/marketing');
    }
  }, [searchParams, router, fetchSession]);

  const handleConnectFacebook = async () => {
    try {
      // 1. Pedimos la URL de autorización a nuestro backend
      const { data } = await axios.get('/api/auth/social/facebook', { withCredentials: true });
      // 2. Redirigimos al usuario a la página de consentimiento de Meta
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error("No se pudo iniciar la conexión.");
    }
  };

  const isFacebookConnected = user?.socialConnections?.some(c => c.platform === 'facebook');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Centro de Marketing</h1>
      <p className="text-gray-400">Conecta tus redes sociales para empezar a crear contenido con IA y programar publicaciones.</p>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Conexiones Sociales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-[#1877F2] rounded-full flex items-center justify-center text-white"><Facebook size={20}/></div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white"><Instagram size={20}/></div>
              </div>
              <div>
                <p className="font-medium text-white">Facebook & Instagram</p>
                <p className="text-sm text-gray-400">Publica en tus páginas de negocio.</p>
              </div>
            </div>
            {isFacebookConnected ? (
              <div className="flex items-center gap-2 text-green-400 font-semibold">
                <CheckCircle className="w-5 h-5"/>
                <span>Conectado</span>
              </div>
            ) : (
              <Button onClick={handleConnectFacebook}>
                <LinkIcon className="w-4 h-4 mr-2"/>
                Conectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}