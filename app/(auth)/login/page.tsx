"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  Loader2, 
  User, 
  Stethoscope, 
  ArrowRight,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from "axios";
import { toast } from "react-toastify";

// Components
import SocialAuthButtons from '@/components/auth/SocialButtons';

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, loading: authLoading } = useAuth(); // 👈 Usamos nuestro hook
  const [showPassword, setShowPassword] = useState(false);
  
  const [userType, setUserType] = useState<"consumer" | "provider">("consumer");
  
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    rememberMe: false 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRememberMeChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, rememberMe: checked }));
  };

  const handleTabChange = (value: string) => {
    setUserType(value as "consumer" | "provider");
    setError("");
  };

  const isFormValid = (): boolean => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    return isEmailValid && formData.password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError("Por favor ingresa un email y contraseña válidos");
      return;
    }

    setLoading(true); 
    setError("");

    try {
      // 1. Ejecución del Login
      // Si el email NO está verificado, el backend lanzará error (403/401)
      // y caeremos en el catch de abajo.
      const response = await login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      toast.success(`¡Bienvenido de nuevo!`);

      // 3. Lógica de Redirección Inteligente
      const role = response.role; // "PROVIDER" | "CONSUMER" | "ADMIN"

      if (role === 'ADMIN') {
        router.push("/admin/dashboard");
      } 
      else if (role === 'PROVIDER') {
        // ✅ LÓGICA DE ONBOARDING
        // Verificamos si el flag onboardingComplete es true o false
        const isOnboardingComplete = response.status?.onboardingComplete;
        
        if (isOnboardingComplete) {
            // Ya terminó todo, va a su panel de control real
            router.push("/dashboard");
        } else {
            // Falta completar perfil, documentos o plan.
            // Lo enviamos al "Panel de Onboarding" (Hub)
            router.push("/onboarding"); 
        }
      } 
      else {
        // Es CONSUMER (Paciente)
        router.push("/patient/discover");
      }

      router.refresh();

    } catch (err: any) {
      console.error(err);
      // Aquí capturamos si la cuenta no está verificada aún
      const errorMessage = err.message || "Credenciales incorrectas.";
      
      if (errorMessage.includes("verificar")) {
         setError("Debes verificar tu correo antes de entrar. Revisa tu bandeja de entrada.");
      } else {
         setError(errorMessage);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Role-specific messaging
  const getRoleContent = () => {
    if (userType === "consumer") {
      return {
        title: "Bienvenido de Nuevo",
        subtitle: "Accede para gestionar tus citas",
        icon: User,
        color: "purple",
        benefits: [
          "Agenda citas rápidamente",
          "Revisa tu historial médico",
          "Gestiona tus pagos"
        ]
      };
    } else {
      return {
        title: "Portal Profesional",
        subtitle: "Gestiona tu práctica y pacientes",
        icon: Stethoscope,
        color: "pink",
        benefits: [
          "Administra tu agenda",
          "Gestiona tus pacientes",
          "Revisa tus ingresos"
        ]
      };
    }
  };

  const roleContent = getRoleContent();
  const RoleIcon = roleContent.icon;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Benefits - PRIMING */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col justify-center space-y-6"
          >
            <div>
              <motion.div
                key={userType}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4",
                  roleContent.color === "purple" 
                    ? "bg-purple-500/10 border border-purple-500/20" 
                    : "bg-pink-500/10 border border-pink-500/20"
                )}
              >
                <RoleIcon className={cn(
                  "w-5 h-5",
                  roleContent.color === "purple" ? "text-purple-400" : "text-pink-400"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  roleContent.color === "purple" ? "text-purple-400" : "text-pink-400"
                )}>
                  {userType === "consumer" ? "Área de Pacientes" : "Área Profesional"}
                </span>
              </motion.div>

              <h2 className="text-4xl font-black text-white mb-3">
                {roleContent.title}
              </h2>
              <p className="text-gray-400 text-lg">
                {roleContent.subtitle}
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              {roleContent.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <div className={cn(
                    "p-1 rounded-full",
                    roleContent.color === "purple" 
                      ? "bg-purple-500/10" 
                      : "bg-pink-500/10"
                  )}>
                    <CheckCircle2 className={cn(
                      "w-4 h-4",
                      roleContent.color === "purple" ? "text-purple-400" : "text-pink-400"
                    )} />
                  </div>
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-blue-400 font-bold text-sm">Conexión Segura</p>
                <p className="text-blue-300/60 text-xs">
                  Tus datos están protegidos con SSL
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="p-8 pb-6 text-center border-b border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800">
                <Link href="/" className="inline-block mb-6 group">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                      QuHealthy
                    </span>
                  </div>
                </Link>
                
                <h1 className="text-2xl font-black text-white mb-2">
                  Iniciar Sesión
                </h1>
                <p className="text-gray-400 text-sm">
                  Accede a tu cuenta para continuar
                </p>
              </div>

              <div className="p-8">
                
                {/* User Type Selector - RECONOCIMIENTO */}
                <Tabs 
                  defaultValue="consumer" 
                  value={userType} 
                  onValueChange={handleTabChange} 
                  className="w-full mb-6"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800 h-12 p-1">
                    <TabsTrigger 
                      value="consumer" 
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-10 text-base font-semibold"
                    >
                      <User className="w-4 h-4 mr-2" /> Paciente
                    </TabsTrigger>
                    <TabsTrigger 
                      value="provider" 
                      className="data-[state=active]:bg-pink-600 data-[state=active]:text-white h-10 text-base font-semibold"
                    >
                      <Stethoscope className="w-4 h-4 mr-2" /> Proveedor
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Social Login - SATISFICING */}
                <SocialAuthButtons 
                  role={userType === "consumer" ? "CONSUMER" : "PROVIDER"} 
                />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900 text-gray-500">
                      O continúa con email
                    </span>
                  </div>
                </div>

                {/* Error Alert - FEEDBACK INMEDIATO */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6"
                    >
                      <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-gray-300 font-semibold">
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={userType === 'consumer' ? "tu@email.com" : "contacto@clinica.com"}
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-11 bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-12"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-gray-300 font-semibold">
                        Contraseña
                      </Label>
                      <Link 
                        href="/forgot-password" 
                        className="text-xs text-purple-400 hover:text-purple-300 hover:underline font-semibold"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-11 pr-12 bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-12"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Remember Me */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox 
                      id="remember" 
                      checked={formData.rememberMe}
                      onCheckedChange={handleRememberMeChange}
                      className="data-[state=checked]:bg-purple-600 border-gray-600"
                    />
                    <label 
                      htmlFor="remember" 
                      className="text-sm text-gray-400 cursor-pointer"
                    >
                      Mantener sesión iniciada
                    </label>
                  </motion.div>

                  {/* Submit Button - PRIMING */}
                  <Button
                    type="submit"
                    disabled={!isFormValid() || loading}
                    className={cn(
                      "w-full h-12 text-base font-bold text-white shadow-xl transition-all duration-300",
                      userType === 'consumer' 
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800" 
                        : "bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 w-5 h-5" /> 
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </form>

                {/* Signup Link */}
                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                  <p className="text-sm text-gray-400 mb-3">
                    ¿Aún no tienes una cuenta?
                  </p>
                  
                  <Link 
                    href={userType === 'consumer' ? "/consumer-signup" : "/signup"}
                    className={cn(
                      "inline-flex items-center text-sm font-bold px-6 py-3 rounded-lg transition-all group",
                      userType === 'consumer'
                        ? "bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 border border-purple-500/20"
                        : "bg-pink-600/10 text-pink-400 hover:bg-pink-600/20 border border-pink-500/20"
                    )}
                  >
                    Crear Cuenta {userType === 'consumer' ? 'de Paciente' : 'Profesional'}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}