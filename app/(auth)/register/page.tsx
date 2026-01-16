"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Eye, EyeOff, Loader2, Check } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

// Reglas de validación
interface PasswordRule {
  regex: RegExp;
  message: string;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/, message: "Mínimo 8 caracteres" },
  { regex: /[A-Z]/, message: "Una mayúscula" },
  { regex: /\d/, message: "Un número" },
];

export default function ConsumerSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // Validación en tiempo real de contraseña
  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({ ...rule, valid: rule.regex.test(formData.password) }))
    );
  }, [formData.password]);

  const isFormValid = (): boolean => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const allPasswordRulesValid = passwordValidation.every(rule => rule.valid);
    
    return !!(formData.name.trim().length >= 2 && isEmailValid && allPasswordRulesValid && passwordsMatch);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Revisa los campos requeridos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: "consumer" // Aseguramos que el backend sepa que es un consumidor
      };

      // NOTA: Asegúrate de que este endpoint exista en tu carpeta app/api/...
      await axios.post('/api/auth/signup', signupData);
      
      toast.success("¡Bienvenido a QuHealthy!");
      
      // Redirigir al login o directo al dashboard si tu API devuelve un token/cookie
      router.push('/login'); 

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al conectar con el servidor.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondos decorativos alineados con la Landing Page */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-gray-800">
             {/* Logo o Icono */}
            <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
              <UserPlus className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Crear Cuenta Paciente</h1>
            <p className="text-gray-400 text-sm">Comienza tu viaje hacia el bienestar.</p>
          </div>
          
          <div className="p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Nombre Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Juan Pérez"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 h-11"
                    required
                  />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="******"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 h-11 pr-10"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Indicadores de fortaleza de contraseña */}
                <div className="flex gap-2 mt-2 flex-wrap">
                    {passwordValidation.map((rule, idx) => (
                        <div key={idx} className={`flex items-center text-xs ${rule.valid ? 'text-emerald-400' : 'text-gray-500'} transition-colors duration-300`}>
                            {rule.valid ? <Check size={12} className="mr-1" /> : <div className="w-3 h-3 rounded-full border border-gray-600 mr-1" />}
                            {rule.message}
                        </div>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="******"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`bg-gray-800/50 text-white h-11 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : 'border-gray-700 focus:border-purple-500'
                  }`}
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className="w-full h-12 text-base font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : 'Crear Cuenta'}
              </Button>
            </form>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}