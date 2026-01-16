/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- Componente Interno del Formulario ---
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tokens de la URL
  const selector = searchParams.get('selector');
  const verifier = searchParams.get('verifier');
  // Soporte para token simple (algunos backends usan solo ?token=xyz)
  const simpleToken = searchParams.get('token');

  // Estados
  const [tokenState, setTokenState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 1. Validar Token al montar
  useEffect(() => {
    const validateToken = async () => {
      // Si no hay tokens, es inválido de entrada
      if (!simpleToken && (!selector || !verifier)) {
        setTokenState('invalid');
        return;
      }

      try {
        // Validamos contra el backend antes de mostrar el formulario
        // Nota: Asegúrate de que esta ruta exista en tu API
        await axios.post("/api/auth/reset-password/validate", { 
            selector, 
            verifier, 
            token: simpleToken 
        });
        setTokenState('valid');
      } catch (err) {
        console.error("Token inválido", err);
        setTokenState('invalid');
      }
    };

    validateToken();
  }, [selector, verifier, simpleToken]);

  // 2. Enviar Nueva Contraseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
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
      toast.success("Contraseña restablecida correctamente");

      // Redirigir al login
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

  // --- RENDERIZADO CONDICIONAL ---

  // Estado: Cargando validación
  if (tokenState === 'checking') {
    return (
      <div className="flex flex-col justify-center items-center py-10 space-y-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-gray-400 text-sm">Verificando enlace de seguridad...</p>
      </div>
    );
  }

  // Estado: Token Inválido
  if (tokenState === 'invalid') {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Enlace no válido</AlertTitle>
        <AlertDescription className="mt-2">
          Este enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.
        </AlertDescription>
        <div className="mt-4">
            <Link href="/forgot-password">
                <Button variant="outline" className="border-red-800 text-red-200 hover:bg-red-900/50 hover:text-white">
                    Solicitar nuevo enlace
                </Button>
            </Link>
        </div>
      </Alert>
    );
  }

  // Estado: Éxito
  if (success) {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">¡Contraseña Actualizada!</h2>
        <p className="text-gray-400">
            Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión en unos segundos.
        </p>
        <Link href="/login">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4">
                Ir a Iniciar Sesión ahora
            </Button>
        </Link>
      </div>
    );
  }

  // Estado: Formulario Válido
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AnimatePresence>
        {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200 mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <Label className="text-gray-300">Nueva Contraseña</Label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white h-11 focus:border-purple-500"
            required
            />
            <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Confirmar Contraseña</Label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            className="pl-10 bg-gray-800/50 border-gray-700 text-white h-11 focus:border-purple-500"
            required
            />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 h-11 text-base text-white font-bold shadow-lg shadow-purple-900/20">
        {loading ? <Loader2 className="animate-spin mr-2" /> : "Cambiar Contraseña"}
      </Button>
    </form>
  );
}

// --- Componente Principal (Página) ---
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-gray-950 to-gray-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl">
          <CardHeader className="text-center border-b border-gray-800 pb-6">
            <CardTitle className="text-2xl font-bold text-white mb-2">Restablecer Contraseña</CardTitle>
            <CardDescription className="text-gray-400">
                Ingresa una nueva contraseña segura para tu cuenta.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Suspense es obligatorio para usar useSearchParams en Next.js 13+ */}
            <Suspense fallback={
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}