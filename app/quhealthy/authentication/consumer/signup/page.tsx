"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";

interface PasswordRule {
  regex: RegExp;
  message: string;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/, message: "Mínimo 8 caracteres" },
  { regex: /[A-Z]/, message: "Una letra mayúscula" },
  { regex: /[a-z]/, message: "Una letra minúscula" },
  { regex: /\d/, message: "Un número" },
];

export default function ConsumerSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
      toast.error("Por favor, completa todos los campos correctamente.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      };

      await axios.post('/api/consumer/auth/signup', signupData, { withCredentials: true });
      
      toast.success("¡Cuenta creada exitosamente! Redirigiendo...", { position: "top-right" });
      
      // Redirigir al dashboard del consumidor
      router.push('/consumer/dashboard');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al crear la cuenta.";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900/20 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl mb-6 shadow-2xl">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Crea tu Cuenta</h1>
            <p className="text-gray-400">Únete a QuHealthy para encontrar y agendar tus servicios de bienestar.</p>
          </div>
          
          <div className="p-8 pt-0">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                >
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                  <label className="block text-sm font-medium text-gray-300">Nombre</label>
                  <div className="relative mt-1">
                      <input
                          type="text"
                          name="name"
                          placeholder="Tu nombre completo"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          required
                      />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Correo electrónico</label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Contraseña</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Crea una contraseña segura"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Confirmar contraseña</label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Repite la contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500 ring-red-500'
                        : 'border-gray-600 focus:ring-teal-400'
                    }`}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Crear Cuenta'}
              </Button>
            </form>
            
            <p className="text-center text-sm text-gray-400 mt-6">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/authentication/consumer/login" className="text-teal-400 hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}