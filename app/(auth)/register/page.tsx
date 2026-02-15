"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Eye, 
  EyeOff, 
  Loader2, 
  Check,
  Heart,
  Calendar,
  Shield,
  Sparkles,
  ChevronRight,
  Star,
  Users,
  TrendingUp,
  X
} from "lucide-react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from "axios";
import { toast } from "react-toastify";

// Components
import SocialAuthButtons from '@/components/auth/SocialButtons';
import PrivacyModal from '@/components/auth/Privacymodal';

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { RegisterConsumerRequest } from "@/types/auth";

/**
 * ConsumerSignupPage Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. SATISFICING
 *    - Social login prioritized
 *    - Minimal required fields
 *    - Quick signup flow
 *    - Auto-fill support
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Real-time validation
 *    - Progress indicator
 *    - Field-level feedback
 *    - Success states
 * 
 * 3. PRIMING
 *    - Benefits highlighted
 *    - Social proof stats
 *    - Trust indicators
 *    - Positive messaging
 * 
 * 4. CREDIBILIDAD
 *    - Security badges
 *    - User testimonials
 *    - Professional design
 *    - Trust signals
 * 
 * 5. MINIMIZAR ERRORES
 *    - Password strength meter
 *    - Email validation
 *    - Match confirmation
 *    - Clear error messages
 */

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
  const { registerConsumer, loading: authLoading } = useAuth();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptPrivacy: false,
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  // Calculate progress - FEEDBACK INMEDIATO
  const calculateProgress = () => {
    const fields = ['name', 'email', 'password', 'confirmPassword', 'acceptPrivacy'];
    const completed = fields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return value !== '' && value !== false;
    });
    return (completed.length / fields.length) * 100;
  };

  const progress = calculateProgress();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleCheckboxChange = (checked: boolean) => {
  setFormData(prev => ({ 
    ...prev, 
    acceptPrivacy: checked, // Para el UI
    acceptTerms: checked    // Para la validación y el Backend
  }));
};

  // Password validation
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

    // 1. Validación Frontend
    if (!isFormValid()) {
      toast.error("Por favor completa todos los campos requeridos y acepta los términos.");
      return;
    }

    try {
      // --- LÓGICA DE TRANSFORMACIÓN ---
      // Dividimos el nombre completo en partes
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Pendiente'; 
      // --------------------------------

      // 2. Construcción del Payload (DTO)
      // Debe coincidir EXACTAMENTE con RegisterConsumerRequest.java
      const signupData: RegisterConsumerRequest = {
        firstName: firstName,                // 👈 Mapeado desde la división
        lastName: lastName,                  // 👈 Mapeado desde la división
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone ? formData.phone.trim() : undefined, 
        termsAccepted: formData.acceptTerms, // 👈 Se envía como 'termsAccepted' para Java
        // Campos opcionales de marketing si los tienes en el estado:
        utmSource: "web_direct", 
        utmMedium: "organic"
      };

      // 3. Llamada al Backend vía Hook
      // Recuerda que este hook debe estar configurado para llamar a /api/auth/register/consumer
      const response = await registerConsumer(signupData);
      
      // 4. Éxito
      toast.success(response.message || "¡Bienvenido a QuHealthy!", { 
        position: "top-center",
      });
      
      // 5. Redirección al Login (para que valide su email)
      setTimeout(() => {
        router.push('/login'); 
      }, 1500);

    } catch (err: any) {
      // 6. Manejo de Errores
      // El hook useAuth ya extrae el mensaje: "El email ya existe", "Contraseña débil", etc.
      const errorMessage = err.message || "Error al crear la cuenta de paciente";
      toast.error(errorMessage, { position: "top-center" });
    }
  };
  
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
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Panel - Benefits - PRIMING */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:col-span-2 space-y-6"
          >
            <div>
              <h2 className="text-4xl font-black text-white mb-3">
                Tu Salud en un Click
              </h2>
              <p className="text-gray-400 text-lg">
                Encuentra y agenda con los mejores profesionales
              </p>
            </div>

            {/* Stats - CREDIBILIDAD */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: '+50k Usuarios', color: 'emerald' },
                { icon: Star, label: '4.8★ Rating', color: 'yellow' },
                { icon: Calendar, label: '+100k Citas', color: 'blue' },
                { icon: TrendingUp, label: '95% Satisfacción', color: 'purple' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4"
                  >
                    <Icon className={cn(
                      "w-8 h-8 mb-2",
                      stat.color === 'emerald' ? "text-emerald-400" : "",
                      stat.color === 'yellow' ? "text-yellow-400" : "",
                      stat.color === 'blue' ? "text-blue-400" : "",
                      stat.color === 'purple' ? "text-purple-400" : "",
                    )} />
                    <p className="text-white font-bold">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
              {[
                'Agenda citas en segundos',
                'Compara precios y reseñas',
                'Recordatorios automáticos',
                'Historial médico centralizado',
                'Pagos seguros en línea'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <div className="p-1 bg-emerald-500/10 rounded-full">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-blue-400 font-bold text-sm">100% Seguro</p>
                <p className="text-blue-300/60 text-xs">
                  Tus datos están protegidos
                </p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-2">
                "QuHealthy me ayudó a encontrar al especialista perfecto. ¡Super fácil y rápido!"
              </p>
              <p className="text-gray-500 text-xs">- María G.</p>
            </div>
          </motion.div>

          {/* Right Panel - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="p-8 pb-6 text-center bg-gradient-to-br from-gray-900 to-gray-800 relative border-b border-gray-800">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  className="mx-auto w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl relative"
                >
                  <Heart className="w-10 h-10 text-white" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                </motion.div>

                <h1 className="text-3xl font-black text-white mb-2">
                  Crea tu Cuenta
                </h1>
                <p className="text-gray-400">
                  Únete a miles de usuarios satisfechos
                </p>

                {/* Progress Bar */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Progreso</span>
                    <span className="text-purple-400">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              <div className="p-8">
                
                {/* Social Auth - SATISFICING */}
                <SocialAuthButtons role="CONSUMER" />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900 text-gray-500">
                      O regístrate con email
                    </span>
                  </div>
                </div>

                {/* Error Alert */}
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
                  
                  {/* Name Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="text-gray-300 font-semibold">
                      Nombre Completo
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ej: Juan Pérez López"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={cn(
                        "bg-gray-800/50 border-gray-700 text-white h-12 transition-all",
                        "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                        !formData.name ? "border-red-500/30" : ""
                      )}
                      required
                    />
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email" className="text-gray-300 font-semibold">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-12"
                      required
                    />
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password" className="text-gray-300 font-semibold">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-12 pr-12"
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
                    
                    {/* Password Strength Indicators */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {passwordValidation.map((rule, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all",
                            rule.valid 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                              : "bg-gray-800 border-gray-700 text-gray-500"
                          )}
                        >
                          {rule.valid ? (
                            <Check size={12} />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-gray-600" />
                          )}
                          {rule.message}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="text-gray-300 font-semibold">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={cn(
                          "bg-gray-800/50 text-white h-12 pr-12",
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-700 focus:border-purple-500 focus:ring-purple-500/20"
                        )}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                        <X className="w-3 h-3" />
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </motion.div>

                  {/* Privacy Checkbox */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-start space-x-3 p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl"
                  >
                  <Checkbox 
  id="terms" // Cambiamos el ID a terms para ser semánticos
  checked={formData.acceptTerms} // 👈 Ahora lee acceptTerms
  onCheckedChange={handleCheckboxChange} // 👈 Usa el handler que actualiza ambos
  className="mt-1 data-[state=checked]:bg-purple-600 border-gray-500"
/>
                    <div className="grid gap-1.5 leading-none">
                      <label 
                        htmlFor="privacy" 
                        className="text-sm font-semibold text-gray-200 cursor-pointer"
                      >
                        Acepto la política de privacidad
                      </label>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Al registrarte, aceptas nuestra{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-purple-400 hover:text-purple-300 underline"
                        >
                          Política de Privacidad
                        </button>
                        {' '}y{' '}
                        <Link 
                          href="/terms" 
                          className="text-purple-400 hover:text-purple-300 underline"
                        >
                          Términos de Servicio
                        </Link>.
                      </p>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!isFormValid() || authLoading}
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl transition-all"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 w-5 h-5" />
                        Crear Cuenta Gratis
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
                
                {/* Login Link */}
                <div className="text-center mt-6 border-t border-gray-800 pt-6">
                  <p className="text-sm text-gray-400">
                    ¿Ya tienes cuenta?{' '}
                    <Link 
                      href="/login" 
                      className="text-purple-400 hover:text-purple-300 font-semibold hover:underline"
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Privacy Modal */}
      <PrivacyModal 
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </GoogleOAuthProvider>
  );
}