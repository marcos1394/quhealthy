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

/**
 * ProviderSignupPage Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR ANSIEDAD
 *    - Multi-step progress visible
 *    - Save progress indicator
 *    - Clear next steps
 *    - Back navigation
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Real-time password validation
 *    - Field-level validation
 *    - Progress percentage
 *    - Success indicators
 * 
 * 3. CREDIBILIDAD
 *    - Social proof stats
 *    - Security badges
 *    - Professional branding
 *    - Trust indicators
 * 
 * 4. PRIMING
 *    - Success examples
 *    - Positive messaging
 *    - Growth stats
 *    - Benefit highlights
 * 
 * 5. MINIMIZAR ERRORES
 *    - Password strength meter
 *    - Confirmation matching
 *    - Format validation
 *    - Clear error messages
 * 
 * 6. SATISFICING
 *    - Social login options
 *    - Quick validation
 *    - Auto-fill support
 *    - Skip optional fields
 */

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
  { id: 1, title: 'Tipo de Servicio', fields: ['serviceType'] },
  { id: 2, title: 'Información Básica', fields: ['name', 'email', 'phone'] },
  { id: 3, title: 'Seguridad', fields: ['password', 'confirmPassword'] },
  { id: 4, title: 'Confirmación', fields: ['acceptTerms'] }
];

export default function ProviderSignupPage() {
  const router = useRouter();
  const { registerProvider, error: apiError } = useAuth();
  
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    serviceType: "health",
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  // Calculate progress - FEEDBACK INMEDIATO
  const calculateProgress = () => {
    const totalFields = ['serviceType', 'name', 'email', 'phone', 'password', 'confirmPassword', 'acceptTerms'];
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

  const handleServiceChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceType: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, acceptTerms: checked }));
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

  // Step validation
  const isStepValid = (step: number): boolean => {
    const stepConfig = SIGNUP_STEPS.find(s => s.id === step);
    if (!stepConfig) return false;

    switch (step) {
      case 1:
        return !!formData.serviceType;
      case 2:
        return !!(
          formData.name.trim().length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
          formData.phone.trim().length >= 10
        );
      case 3:
        return !!(
          passwordValidation.every(rule => rule.valid) &&
          formData.password === formData.confirmPassword &&
          formData.confirmPassword.length > 0
        );
      case 4:
        return formData.acceptTerms;
      default:
        return false;
    }
  };

  const isFormValid = (): boolean => {
    return SIGNUP_STEPS.every(step => isStepValid(step.id));
  };

  // Navigation
  const handleNextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, SIGNUP_STEPS.length));
    } else {
      toast.error("Por favor completa los campos requeridos");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error("Por favor completa todos los campos.");
      return;
    }

    // 2. Estado de carga visual
    setLoading(true); 

    try {
      // Preparación de datos (Igual que tenías)
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'Pendiente';
      const categoryId = formData.serviceType === 'HEALTH' ? 1 : 2;
      const defaultBusinessName = `Consultorio de ${firstName}`;

      const signupData: RegisterProviderRequest = {
        firstName,
        lastName,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        businessName: defaultBusinessName, 
        parentCategoryId: categoryId,
        termsAccepted: formData.acceptTerms
      };

      // Llamada a la API
      await registerProvider(signupData);
      
      // 3. ✅ CAMBIO: No redirigimos. Mostramos la vista de éxito.
      toast.success("Cuenta creada. Revisa tu correo.");
      setIsRegistrationSuccess(true);
      window.scrollTo(0, 0); // Subir para que vea el mensaje

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error en el registro");
    } finally {
      setLoading(false);
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

        <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Panel - Benefits - PRIMING */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block lg:col-span-2 space-y-6"
          >
            <div>
              <h2 className="text-4xl font-black text-white mb-3">
                Impulsa tu Práctica Profesional
              </h2>
              <p className="text-gray-400 text-lg">
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
                    className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4"
                  >
                    <Icon className={cn(
                      "w-8 h-8 mb-2",
                      stat.color === 'emerald' ? "text-emerald-400" : "",
                      stat.color === 'blue' ? "text-blue-400" : "",
                      stat.color === 'purple' ? "text-purple-400" : "",
                      stat.color === 'yellow' ? "text-yellow-400" : ""
                    )} />
                    <p className="text-white font-bold">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Benefits List */}
            <div className="space-y-3">
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
                  className="flex items-center gap-3 text-gray-300"
                >
                  <div className="p-1 bg-emerald-500/10 rounded-full">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Security Badge */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-blue-400 font-bold text-sm">100% Seguro</p>
                <p className="text-blue-300/60 text-xs">
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
            <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="p-8 pb-6 text-center bg-gradient-to-br from-gray-900 to-gray-800 relative border-b border-gray-800">
                <motion.div
                  key={formData.serviceType}
                  initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  className="mx-auto w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl relative"
                >
                  {formData.serviceType === "health" ? (
                    <Stethoscope className="w-10 h-10 text-white" />
                  ) : (
                    <Scissors className="w-10 h-10 text-white" />
                  )}
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                </motion.div>

                <h1 className="text-3xl font-black text-white mb-2">
                  Únete a QuHealthy
                </h1>
                <p className="text-gray-400">
                  Crea tu cuenta profesional en minutos
                </p>

                {/* Progress Bar */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Progreso</span>
                    <span className="text-purple-400">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Step Indicators */}
                <div className="mt-4 flex justify-between">
                  {SIGNUP_STEPS.map((step, index) => (
                    <div 
                      key={step.id}
                      className="flex items-center"
                    >
                      <button
                        onClick={() => {
                          if (step.id <= currentStep) {
                            setCurrentStep(step.id);
                          }
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                          currentStep === step.id ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900" : "",
                          isStepValid(step.id) 
                            ? "bg-emerald-500 text-white" 
                            : currentStep > step.id
                            ? "bg-gray-700 text-gray-400"
                            : currentStep === step.id
                            ? "bg-purple-600 text-white"
                            : "bg-gray-800 text-gray-600"
                        )}
                      >
                        {isStepValid(step.id) ? <Check className="w-4 h-4" /> : step.id}
                      </button>
                      {index < SIGNUP_STEPS.length - 1 && (
                        <div className={cn(
                          "w-8 h-0.5 mx-1",
                          isStepValid(step.id) ? "bg-emerald-500" : "bg-gray-800"
                        )} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8">
                {/* Social Auth Buttons */}
                <SocialAuthButtons role="PROVIDER" />

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

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <AnimatePresence mode="wait">
                    {/* Step 1: Service Type */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div>
                          <Label className="text-gray-300 text-base font-bold mb-3 block">
                            ¿Cuál es tu especialidad principal?
                          </Label>
                          <Tabs 
                            value={formData.serviceType} 
                            onValueChange={handleServiceChange} 
                            className="w-full"
                          >
                            <TabsList className="grid w-full grid-cols-2 bg-gray-800 h-14">
                              <TabsTrigger 
                                value="health" 
                                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-12 text-base"
                              >
                                <Stethoscope className="w-5 h-5 mr-2" /> Salud
                              </TabsTrigger>
                              <TabsTrigger 
                                value="beauty" 
                                className="data-[state=active]:bg-pink-600 data-[state=active]:text-white h-12 text-base"
                              >
                                <Scissors className="w-5 h-5 mr-2" /> Belleza
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Basic Info */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-gray-300">
                            Nombre Profesional / Clínica
                          </Label>
                          <Input 
                            id="name" 
                            name="name" 
                            placeholder="Ej: Dr. Alejandro o Clínica Vital" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            className="bg-gray-800/50 border-gray-700 h-12 focus:border-purple-500" 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-300">
                            Correo Profesional
                          </Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email"
                            placeholder="contacto@tuclinica.com" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            className="bg-gray-800/50 border-gray-700 h-12 focus:border-purple-500" 
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-gray-300">
                            Teléfono (WhatsApp)
                          </Label>
                          <Input 
                            id="phone" 
                            name="phone" 
                            type="tel"
                            placeholder="+52 55 1234 5678" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            className="bg-gray-800/50 border-gray-700 h-12 focus:border-purple-500" 
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Security */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-gray-300">
                            Contraseña
                          </Label>
                          <div className="relative">
                            <Input 
                              id="password" 
                              name="password" 
                              type={showPassword ? "text" : "password"}
                              value={formData.password} 
                              onChange={handleInputChange} 
                              className="bg-gray-800/50 border-gray-700 h-12 pr-12 focus:border-purple-500" 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
                                  "text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all",
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

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-gray-300">
                            Confirmar Contraseña
                          </Label>
                          <div className="relative">
                            <Input 
                              id="confirmPassword" 
                              name="confirmPassword" 
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword} 
                              onChange={handleInputChange} 
                              className={cn(
                                "bg-gray-800/50 border-gray-700 h-12 pr-12",
                                formData.confirmPassword && formData.password !== formData.confirmPassword 
                                  ? "border-red-500 focus:border-red-500" 
                                  : "focus:border-purple-500"
                              )}
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Las contraseñas no coinciden
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Terms */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div className="flex items-start space-x-3 p-5 bg-purple-900/10 border-2 border-purple-500/20 rounded-xl">
                          <Checkbox 
                            id="terms" 
                            checked={formData.acceptTerms}
                            onCheckedChange={handleCheckboxChange}
                            className="mt-1 data-[state=checked]:bg-purple-600 border-gray-500"
                          />
                          <div className="grid gap-2 leading-none">
                            <label 
                              htmlFor="terms" 
                              className="text-sm font-semibold text-gray-200 cursor-pointer"
                            >
                              Acepto los términos y condiciones
                            </label>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              Al registrarte, aceptas nuestros{' '}
                              <button
                                type="button"
                                onClick={() => setShowTermsModal(true)}
                                className="text-purple-400 hover:text-purple-300 underline"
                              >
                                Términos de Servicio
                              </button>{' '}
                              y{' '}
                              <Link 
                                href="/privacy" 
                                className="text-purple-400 hover:text-purple-300 underline"
                              >
                                Política de Privacidad
                              </Link>.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="flex-1 h-12 border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Anterior
                      </Button>
                    )}
                    
                    {currentStep < SIGNUP_STEPS.length ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        disabled={!isStepValid(currentStep)}
                        className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={!isFormValid() || loading} 
                        className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin mr-2" />
                            Creando cuenta...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 w-5 h-5" />
                            Crear Cuenta Profesional
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center border-t border-gray-800 pt-6">
                  <p className="text-sm text-gray-400">
                    ¿Ya tienes una cuenta?{' '}
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

      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </GoogleOAuthProvider>
  );
}