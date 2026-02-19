"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  Scissors, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Check,
  ChevronRight,
  ArrowLeft,
  Shield,
  TrendingUp,
  Users,
  Calendar,
  Award
} from "lucide-react";
import { toast } from "react-toastify";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Components
import SocialAuthButtons from '@/components/auth/SocialButtons';
import TermsModal from '@/components/auth/TermsModal';

// Enterprise Integration
import { useAuth } from "@/hooks/useAuth";
import { RegisterProviderRequest, ServiceType } from "@/types/auth";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
interface PasswordRule {
  regex: RegExp;
  message: string;
  valid: boolean;
}

const passwordRulesConfig: Omit<PasswordRule, 'valid'>[] = [
  { regex: /.{8,}/, message: "Mínimo 8 caracteres" },
  { regex: /[A-Z]/, message: "Una mayúscula" },
  { regex: /\d/, message: "Un número" },
  { regex: /[\W_]/, message: "Un carácter especial" },
];

// Steps configuration
const SIGNUP_STEPS = [
  { id: 1, title: 'Crear Cuenta', fields: ['name', 'email', 'password', 'confirmPassword', 'acceptTerms'] }
];

export default function ProviderSignupPage() {
  const router = useRouter();
  const { registerProvider, error: apiError } = useAuth();
  
  // Estados Visuales
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  // Progreso
  const calculateProgress = () => {
    const totalFields = ['name', 'email', 'password', 'confirmPassword', 'acceptTerms'];
    const completedFields = totalFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return value !== '' && value !== false;
    });
    return (completedFields.length / totalFields.length) * 100;
  };

  const progress = calculateProgress();

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, acceptTerms: checked }));
  };

  // Validación de Password
  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({ 
        ...rule, 
        valid: rule.regex.test(formData.password) 
      }))
    );
  }, [formData.password]);

  // Validación del Formulario
  const isFormValid = (): boolean => {
    const isNameValid = formData.name.trim().length >= 2;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isPasswordValid = 
      passwordValidation.every(rule => rule.valid) &&
      formData.password === formData.confirmPassword &&
      formData.confirmPassword.length > 0;
    const areTermsAccepted = formData.acceptTerms;

    return isNameValid && isEmailValid && isPasswordValid && areTermsAccepted;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error("Por favor completa todos los campos correctamente.");
      return;
    }

    setLoading(true); 

    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const signupData: RegisterProviderRequest = {
        firstName,
        lastName,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        termsAccepted: formData.acceptTerms
      };

      await registerProvider(signupData);


      
      toast.success("Cuenta creada. Revisa tu correo.");
      // 3. 🔥 LA PIEZA FALNTANTE: Redirigir al Onboarding
      // Como el registro ya te devuelve el token (según tu JSON),
      // el middleware o el hook de auth detectará la sesión y permitirá entrar.
      router.push("/onboarding");

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        
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

        <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Left Panel - Benefits - CENTERED */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex lg:col-span-2 flex-col justify-center space-y-8"
          >
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Impulsa tu Práctica Profesional
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Únete a miles de profesionales que ya confían en QuHealthy
              </p>
            </div>

            {/* Stats - CREDIBILIDAD */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: '+10k Profesionales', color: 'emerald' },
                { icon: Calendar, label: '+50k Citas/mes', color: 'blue' },
                { icon: TrendingUp, label: '+40% Ingresos', color: 'purple' },
                { icon: Award, label: '4.8★ Rating', color: 'yellow' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
                  >
                    <Icon className={cn(
                      "w-10 h-10 mb-3",
                      stat.color === 'emerald' ? "text-emerald-400" : "",
                      stat.color === 'blue' ? "text-blue-400" : "",
                      stat.color === 'purple' ? "text-purple-400" : "",
                      stat.color === 'yellow' ? "text-yellow-400" : ""
                    )} />
                    <p className="text-white font-bold text-sm leading-tight">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {[
                'Agenda online 24/7',
                'Pagos automáticos seguros',
                'Recordatorios automáticos',
                'Perfil público optimizado',
                'Soporte prioritario'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.6 }}
                  className="flex items-center gap-3 text-gray-300 group"
                >
                  <div className="p-1.5 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500/20 transition-colors">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-base">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Security Badge */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-400 font-bold text-base">100% Seguro</p>
                <p className="text-blue-300/70 text-sm leading-relaxed">
                  Tus datos están encriptados y protegidos
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <Card className="bg-gradient-to-br from-gray-900/95 to-gray-900/80 backdrop-blur-xl border-gray-800 shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="p-8 pb-6 text-center bg-gradient-to-br from-gray-900 to-gray-800/50 relative border-b border-gray-800/50">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mx-auto w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/20 relative"
                >
                  <TrendingUp className="w-10 h-10 text-white" />
                  <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-400 fill-yellow-400 animate-pulse" />
                </motion.div>

                <h1 className="text-4xl font-black text-white mb-2">
                  Únete a QuHealthy
                </h1>
                <p className="text-gray-400 text-base max-w-md mx-auto">
                  Crea tu cuenta profesional y digitaliza tu práctica hoy mismo
                </p>
              </div>

              <div className="p-8 md:p-10">
                {/* Social Auth Buttons */}
                <SocialAuthButtons role="PROVIDER" />

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900 text-gray-500 font-medium">
                      O continúa con email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Nombre */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300 font-semibold text-sm">
                        Nombre Completo *
                      </Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="Ej: Dr. Alejandro Pérez" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        className="bg-gray-800/50 border-gray-700 h-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" 
                      />
                    </div>
                    
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300 font-semibold text-sm">
                        Correo Electrónico *
                      </Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email"
                        placeholder="tu@correo.com" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className="bg-gray-800/50 border-gray-700 h-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" 
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-300 font-semibold text-sm">
                        Contraseña *
                      </Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          name="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password} 
                          onChange={handleInputChange} 
                          className="bg-gray-800/50 border-gray-700 h-12 pr-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      
                      {/* Password Rules */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {passwordValidation.map((rule, idx) => (
                          <span 
                            key={idx} 
                            className={cn(
                              "text-xs flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all duration-300",
                              rule.valid 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                : "bg-gray-800 border-gray-700 text-gray-500"
                            )}
                          >
                            {rule.valid && <Check size={12} />}
                            {rule.message}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300 font-semibold text-sm">
                        Confirmar Contraseña *
                      </Label>
                      <div className="relative">
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword" 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword} 
                          onChange={handleInputChange} 
                          className={cn(
                            "bg-gray-800/50 border-gray-700 h-12 pr-12 transition-all",
                            formData.confirmPassword && formData.password !== formData.confirmPassword 
                              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                              : "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          )}
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
                        <motion.p 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400 flex items-center gap-1.5 mt-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          Las contraseñas no coinciden
                        </motion.p>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="flex items-start space-x-3 p-5 bg-purple-900/10 border border-purple-500/20 rounded-xl transition-colors hover:border-purple-500/30">
                      <Checkbox 
                        id="terms" 
                        checked={formData.acceptTerms}
                        onCheckedChange={handleCheckboxChange}
                        className="mt-1 data-[state=checked]:bg-purple-600 border-gray-500"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label 
                          htmlFor="terms" 
                          className="text-sm font-semibold text-gray-200 cursor-pointer select-none"
                        >
                          Acepto los términos y condiciones
                        </label>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Al registrarte, aceptas nuestros{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-purple-400 hover:text-purple-300 underline transition-colors"
                          >
                            Términos de Servicio
                          </button>{' '}
                          y{' '}
                          <Link 
                            href="/privacy" 
                            className="text-purple-400 hover:text-purple-300 underline transition-colors"
                          >
                            Política de Privacidad
                          </Link>.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* API Error */}
                  <AnimatePresence>
                    {apiError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{apiError}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading || !isFormValid()} 
                      className={cn(
                        "w-full h-14 text-base font-bold rounded-xl shadow-xl transition-all duration-300 transform",
                        isFormValid() 
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20" 
                          : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                      )}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 w-5 h-5" />
                          Creando tu cuenta...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 w-5 h-5 text-yellow-300" />
                          Crear Cuenta Profesional
                        </>
                      )}
                    </Button>
                    
                    <p className="text-center text-xs text-gray-500 mt-4">
                      No te pediremos tarjeta de crédito para empezar.
                    </p>
                  </div>
                </form>

                {/* Login Link */}
                <div className="mt-8 text-center border-t border-gray-800 pt-6">
                  <p className="text-sm text-gray-400">
                    ¿Ya tienes una cuenta?{' '}
                    <Link 
                      href="/login" 
                      className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-colors"
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

      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </GoogleOAuthProvider>
  );
}