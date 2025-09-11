"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Scissors, Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Shield, Sparkles, Chrome } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";

interface PasswordRule {
  regex: RegExp;
  message: string;
  valid: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  serviceType: 'health' | 'beauty';
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/, message: "Mínimo 8 caracteres" },
  { regex: /[A-Z]/, message: "Una letra mayúscula" },
  { regex: /[a-z]/, message: "Una letra minúscula" },
  { regex: /\d/, message: "Un número" },
  { regex: /[\W_]/, message: "Un carácter especial" },
];

export default function ProviderSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    serviceType: "health"
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleServiceTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceType: value as 'health' | 'beauty' }));
  };

  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({ 
        ...rule, 
        valid: rule.regex.test(formData.password) 
      }))
    );
  }, [formData.password]);

  const isFormValid = (): boolean => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const allPasswordRulesValid = passwordValidation.every(rule => rule.valid);
    
    return !!(
      formData.name.trim().length >= 2 &&
      isEmailValid &&
      allPasswordRulesValid &&
      passwordsMatch &&
      formData.acceptTerms
    );
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
        serviceType: formData.serviceType,
        acceptTerms: formData.acceptTerms, // <-- AÑADE ESTA LÍNEA
        role: "provider"
      };

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/providers/signup`;
      await axios.post(apiUrl, signupData, {
  withCredentials: true,
});
      
      toast.success("¡Cuenta creada exitosamente! Redirigiendo...", { 
        position: "top-right" 
      });
      
      // Redirigir al onboarding después de un breve delay
      setTimeout(() => {
        router.push("/quhealthy/authentication/providers/onboarding/kyc");
      }, 1500);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al crear la cuenta. Inténtalo de nuevo.";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    toast.info("Próximamente disponible", { position: "top-right" });
  };

  // Validaciones individuales
  const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const showEmailError = formData.email && !isEmailValid;
  const isNameValid = formData.name && formData.name.trim().length >= 2;
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsDontMatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Main card */}
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6 text-center bg-gradient-to-br from-gray-800/80 to-gray-700/50 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative inline-flex items-center justify-center w-20 h-20 mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg" />
              <div className="relative flex items-center justify-center w-full h-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600">
                {formData.serviceType === "health" ? (
                  <Stethoscope className="w-10 h-10 text-white drop-shadow-sm" />
                ) : (
                  <Scissors className="w-10 h-10 text-white drop-shadow-sm" />
                )}
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-bounce" />
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Únete a QuHealthy
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-300"
            >
              Crea tu cuenta gratuita y potencia tu práctica profesional
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8 pt-6">
            {/* Service Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Tabs 
                value={formData.serviceType} 
                onValueChange={handleServiceTypeChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 p-1 rounded-xl">
                  <TabsTrigger 
                    value="health" 
                    className="data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 text-gray-300"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Salud
                  </TabsTrigger>
                  <TabsTrigger 
                    value="beauty"
                    className="data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-300 text-gray-300"
                  >
                    <Scissors className="w-4 h-4 mr-2" />
                    Belleza
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Social Login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <Button
                type="button"
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full h-12 bg-gray-700/50 border-2 border-gray-600 hover:bg-gray-600/50 text-gray-300 font-medium transition-all duration-300 group"
              >
                <Chrome className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                Continuar con Google
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-800 text-gray-400">
                    o crea tu cuenta con email
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <Alert variant="destructive" className="border-red-500/50 bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    placeholder="Dr. Juan Pérez"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-gray-700/50 text-white placeholder-gray-400 ${
                      focusedField === 'name' ? 'border-purple-500 shadow-lg shadow-purple-500/20' :
                      isNameValid ? 'border-green-400' :
                      'border-gray-600 hover:border-gray-500'
                    }`}
                    required
                  />
                  {isNameValid && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-purple-400' : 
                    showEmailError ? 'text-red-400' : 
                    isEmailValid ? 'text-green-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-gray-700/50 text-white placeholder-gray-400 ${
                      focusedField === 'email' ? 'border-purple-500 shadow-lg shadow-purple-500/20' :
                      showEmailError ? 'border-red-400' :
                      isEmailValid ? 'border-green-400' :
                      'border-gray-600 hover:border-gray-500'
                    }`}
                    required
                  />
                  {isEmailValid && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                  )}
                  {showEmailError && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                  )}
                </div>
                {showEmailError && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Ingresa un email válido
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-gray-700/50 text-white placeholder-gray-400 ${
                      focusedField === 'password' ? 'border-purple-500 shadow-lg shadow-purple-500/20' :
                      'border-gray-600 hover:border-gray-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-600/50 transition-colors"
                  >
                    {showPassword ? 
                      <EyeOff className="w-4 h-4 text-gray-400" /> : 
                      <Eye className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'confirmPassword' ? 'text-purple-400' : 
                    passwordsDontMatch ? 'text-red-400' :
                    passwordsMatch ? 'text-green-400' : 'text-gray-400'
                  }`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 transition-all duration-300 bg-gray-700/50 text-white placeholder-gray-400 ${
                      focusedField === 'confirmPassword' ? 'border-purple-500 shadow-lg shadow-purple-500/20' :
                      passwordsDontMatch ? 'border-red-400' :
                      passwordsMatch ? 'border-green-400' :
                      'border-gray-600 hover:border-gray-500'
                    }`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    {passwordsMatch && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    {passwordsDontMatch && (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 rounded-md hover:bg-gray-600/50 transition-colors"
                    >
                      {showConfirmPassword ? 
                        <EyeOff className="w-4 h-4 text-gray-400" /> : 
                        <Eye className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>
                {passwordsDontMatch && (
                  <p className="text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <AnimatePresence>
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-700/30 rounded-xl p-4 border border-gray-600"
                  >
                    <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-purple-400" />
                      Requisitos de contraseña
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {passwordValidation.map((rule, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className={`flex-shrink-0 w-4 h-4 mr-3 transition-all duration-300 ${
                            rule.valid ? 'text-green-400 scale-110' : 'text-gray-500'
                          }`}>
                            {rule.valid ? 
                              <CheckCircle2 className="w-full h-full" /> : 
                              <div className="w-2 h-2 bg-gray-500 rounded-full mx-auto mt-1" />
                            }
                          </div>
                          <span className={`transition-colors duration-300 ${
                            rule.valid ? "text-green-400 font-medium" : "text-gray-400"
                          }`}>
                            {rule.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 p-4 bg-purple-900/20 rounded-xl border border-purple-700/50">
                <input 
                  type="checkbox" 
                  name="acceptTerms" 
                  id="acceptTerms" 
                  checked={formData.acceptTerms} 
                  onChange={handleInputChange}
                  className="w-5 h-5 mt-0.5 rounded border-gray-500 text-purple-600 focus:ring-purple-500 bg-gray-700" 
                  required 
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-300 cursor-pointer">
                  Acepto los{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors duration-300">
                    términos y condiciones
                  </Link>
                  {' '}y la{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors duration-300">
                    política de privacidad
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creando cuenta...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Crear mi Cuenta Gratuita
                  </div>
                )}
              </Button>
            </motion.form>
            
            {/* Login Link */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-gray-400 mt-6"
            >
              ¿Ya tienes una cuenta?{' '}
              <Link 
                href="/quhealthy/authentication/providers/login" 
                className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors duration-300"
              >
                Inicia sesión
              </Link>
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6 pt-4 border-t border-gray-600"
            >
              <p className="text-xs text-gray-500 text-center">
                🔒 Datos protegidos con encriptación • ⚡ Configuración en menos de 2 minutos
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}