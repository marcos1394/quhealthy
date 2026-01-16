"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Scissors, Loader2, AlertCircle, Sparkles, Eye, EyeOff, Check } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Tipos
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

export default function ProviderSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    serviceType: "health", // 'health' | 'beauty'
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  // Manejadores de cambio
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleServiceChange = (value: string) => {
    setFormData(prev => ({ ...prev, serviceType: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, acceptTerms: checked }));
  };

  // Validación de contraseña en tiempo real
  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({ 
        ...rule, 
        valid: rule.regex.test(formData.password) 
      }))
    );
  }, [formData.password]);

  // Validación global del formulario
  const isFormValid = (): boolean => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const allPasswordRulesValid = passwordValidation.every(rule => rule.valid);
    
    return !!(
      formData.name.trim().length >= 2 &&
      isEmailValid &&
      allPasswordRulesValid &&
      passwordsMatch &&
      formData.acceptTerms &&
      formData.phone.trim().length >= 10
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error("Por favor completa todos los campos requeridos.");
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
        phone: formData.phone.trim(),
        acceptTerms: formData.acceptTerms,
        role: "provider"
      };

      // Llamada al API (Ruta relativa, asumiendo proxy o misma API)
      await axios.post('/api/auth/provider/signup', signupData);
      
      toast.success("¡Cuenta creada! Iniciando configuración...", { position: "top-center" });
      
      // REDIRECCIÓN ESTRATÉGICA:
      // No mandamos al dashboard directo, mandamos al "Onboarding" para completar perfil.
      setTimeout(() => {
         router.push("/onboarding/profile"); 
      }, 1500);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al crear la cuenta. Inténtalo de nuevo.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo Animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl overflow-hidden">
          
          {/* Header con Icono Dinámico */}
          <div className="p-8 pb-6 text-center bg-gradient-to-br from-gray-900 to-gray-800 relative border-b border-gray-800">
             <motion.div
               key={formData.serviceType} // Animar cuando cambia el tipo
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="mx-auto w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg relative"
             >
                {formData.serviceType === "health" ? (
                  <Stethoscope className="w-10 h-10 text-white" />
                ) : (
                  <Scissors className="w-10 h-10 text-white" />
                )}
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
             </motion.div>

             <h1 className="text-3xl font-bold text-white mb-2">Únete a QuHealthy</h1>
             <p className="text-gray-400 text-sm">Potencia tu práctica profesional hoy mismo.</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Selector de Tipo de Servicio (Tabs ShadCN) */}
                <div className="space-y-3">
                    <Label className="text-gray-300">¿Cuál es tu especialidad principal?</Label>
                    <Tabs value={formData.serviceType} onValueChange={handleServiceChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-800 h-12">
                            
                            <TabsTrigger value="health" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-10">
                                <Stethoscope className="w-4 h-4 mr-2" /> Salud
                            </TabsTrigger>
                            <TabsTrigger value="beauty" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white h-10">
                                <Scissors className="w-4 h-4 mr-2" /> Belleza
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">Nombre Profesional / Clínica</Label>
                            <Input 
                                id="name" name="name" 
                                placeholder="Ej: Dr. Alejandro o Clínica Vital" 
                                value={formData.name} onChange={handleInputChange} 
                                className="bg-gray-800/50 border-gray-700 h-11 focus:border-purple-500" 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Correo Profesional</Label>
                            <Input 
                                id="email" name="email" type="email"
                                placeholder="contacto@tuclinica.com" 
                                value={formData.email} onChange={handleInputChange} 
                                className="bg-gray-800/50 border-gray-700 h-11 focus:border-purple-500" 
                            />
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-300">Teléfono (WhatsApp)</Label>
                            <Input 
                                id="phone" name="phone" type="tel"
                                placeholder="+52 55 1234 5678" 
                                value={formData.phone} onChange={handleInputChange} 
                                className="bg-gray-800/50 border-gray-700 h-11 focus:border-purple-500" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                        <div className="relative">
                            <Input 
                                id="password" name="password" 
                                type={showPassword ? "text" : "password"}
                                value={formData.password} onChange={handleInputChange} 
                                className="bg-gray-800/50 border-gray-700 h-11 pr-10 focus:border-purple-500" 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {/* Indicadores de Seguridad */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {passwordValidation.map((rule, idx) => (
                                <span key={idx} className={cn("text-xs flex items-center px-2 py-1 rounded-full border", rule.valid ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-gray-800 border-gray-700 text-gray-500")}>
                                    {rule.valid && <Check size={10} className="mr-1" />} {rule.message}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Contraseña</Label>
                        <div className="relative">
                            <Input 
                                id="confirmPassword" name="confirmPassword" 
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword} onChange={handleInputChange} 
                                className={cn("bg-gray-800/50 border-gray-700 h-11 pr-10", formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500" : "")}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Términos y Condiciones (Checkbox ShadCN) */}
                <div className="flex items-start space-x-3 p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                    <Checkbox 
                        id="terms" 
                        checked={formData.acceptTerms}
                        onCheckedChange={handleCheckboxChange}
                        className="mt-1 data-[state=checked]:bg-purple-600 border-gray-500"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label htmlFor="terms" className="text-sm font-medium text-gray-300 cursor-pointer">
                            Acepto los términos y condiciones
                        </label>
                        <p className="text-xs text-gray-500">
                            Al registrarte, aceptas nuestros <Link href="/terms" className="text-purple-400 hover:underline">Términos de Servicio</Link> y <Link href="/privacy" className="text-purple-400 hover:underline">Política de Privacidad</Link>.
                        </p>
                    </div>
                </div>

                {/* Mensaje de Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                            <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button 
                    type="submit" 
                    disabled={!isFormValid() || loading} 
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-900/20"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center"><Sparkles className="mr-2 w-5 h-5"/> Crear Cuenta Profesional</span>}
                </Button>
            </form>

            <div className="mt-6 text-center border-t border-gray-800 pt-6">
                <p className="text-sm text-gray-400">
                    ¿Ya tienes una cuenta de proveedor?{' '}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}