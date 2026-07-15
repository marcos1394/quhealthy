"use client"
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import axiosInstance from "@/lib/axios";

export default function StaffActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Auth');
  
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token de activación inválido o faltante.");
    }
  }, [token]);

  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[!@#$%^&*]/.test(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    
    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post('/api/auth/staff/activate', {
        token,
        password
      });
      
      toast.success("Cuenta activada exitosamente. Ahora puedes iniciar sesión.");
      router.push("/login");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Ocurrió un error durante la activación.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
        <Card className="max-w-md w-full border-black dark:border-white rounded-none">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <CardTitle className="text-xl font-black uppercase tracking-widest mt-4">Enlace Inválido</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wider text-gray-500">
              No se ha proporcionado un token de activación válido.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline"
              className="w-full rounded-none border-black dark:border-white uppercase tracking-widest text-[10px] font-bold"
              onClick={() => router.push("/")}
            >
              Volver al inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
      <Card className="max-w-md w-full border-black dark:border-white rounded-none shadow-2xl">
        <CardHeader className="text-center space-y-2 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="mx-auto w-12 h-12 bg-black dark:bg-white flex items-center justify-center">
            <Lock className="w-6 h-6 text-white dark:text-black" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-widest mt-4">Activar Cuenta</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Define tu contraseña para acceder a la clínica
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium uppercase tracking-wider">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none border-black dark:border-white focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white pr-10"
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-none border-black dark:border-white focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white pr-10"
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black dark:hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-none bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 uppercase tracking-widest text-[10px] font-bold transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Activar Cuenta</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
