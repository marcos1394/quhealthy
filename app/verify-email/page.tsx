/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Componente interno para manejar la lógica (requerido por Next.js para useSearchParams)
function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu cuenta, por favor espera...');

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (!token || !role) {
      setStatus('error');
      setMessage('El enlace de verificación es inválido o está incompleto.');
      return;
    }

    // Llamamos al endpoint del backend que creamos
    axios.get(`/api/auth/verify-email?token=${token}&role=${role}`)
      .then(response => {
        setStatus('success');
        setMessage('¡Tu cuenta ha sido verificada exitosamente!');
        
        // Redirigimos al login correcto después de 3 segundos
        setTimeout(() => {
          const loginUrl = role === 'provider' 
            ? '/quhealthy/authentication/providers/login' 
            : '/quhealthy/authentication/consumer/login';
          router.push(`${loginUrl}?verified=true`);
        }, 3000);
      })
      .catch(error => {
        setStatus('error');
        setMessage(error.response?.data?.message || 'El enlace es inválido o ha expirado.');
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          )}
          {status === 'error' && (
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          )}
          
          <h1 className="text-2xl font-bold mb-2">
            {status === 'loading' && 'Verificando...'}
            {status === 'success' && '¡Verificación Exitosa!'}
            {status === 'error' && 'Error de Verificación'}
          </h1>
          <p className="text-gray-400 mb-6">{message}</p>

          {status !== 'loading' && (
            <Button 
              onClick={() => {
                const loginUrl = searchParams.get('role') === 'provider' 
                  ? '/provider/authentication/login' 
                  : '/login';
                router.push(loginUrl);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Ir a Iniciar Sesión
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal que exportamos, usando Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader2 className="w-12 h-12 text-purple-400 animate-spin"/></div>}>
      <VerificationContent />
    </Suspense>
  );
}