"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, Scissors, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";

// Importa los tipos y los componentes hijos
import { FormData, PasswordRule, ServiceType } from '@/app/quhealthy/types/signup';
import { SignupStep1 } from '@/app/quhealthy/components/signup/SignupStep1';
import { SignupStep2 } from '@/app/quhealthy/components/signup/SignupStep2';
import { StepIndicator } from '@/app/quhealthy/components/signup/StepIndicator';
import { LocationData } from "@/app/quhealthy/types/location"; // Importa el tipo de ubicación

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
  const [success, setSuccess] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<ServiceType>("health");
  
  const [formData, setFormData] = useState<FormData>({
    name: "", businessName: "", email: "", phone: "", password: "", confirmPassword: "",
    address: "", lat: 0, lng: 0, acceptTerms: false, parentCategoryId: 1,
    categoryProviderId: 0, 
    tagId: 0, // Mantenemos tagId para el MVP, pero ahora podría ser un array en el futuro
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRulesConfig.map((rule) => ({ ...rule, valid: false }))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLocationSelect = (location: LocationData) => {
    setFormData(prev => ({
      ...prev,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
    }));
  };

  // --- INICIO DE LA CORRECCIÓN ---
  // Nueva función que maneja la selección de categoría y el array de tags
  const handleSelectionChange = (categoryId: number, tagIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      categoryProviderId: categoryId,
      // Para el MVP, guardamos solo el primer tag seleccionado en el campo `tagId`.
      // En el futuro, el backend deberá ser actualizado para aceptar un array de tags.
      tagId: tagIds[0] || 0,
    }));
  };
  // --- FIN DE LA CORRECCIÓN ---

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const providerData = { ...formData, role: "provider" };
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/providers/signup`;
      await axios.post(apiUrl, providerData);
      
      setSuccess("¡Registro exitoso! Te redirigiremos al Inicio de Sesión.");
      toast.success("¡Registro exitoso! Te redirigiremos.", { position: "top-right" });
      
      setTimeout(() => {
        router.push("/quhealthy/authentication/providers/login");
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Ocurrió un error. Intenta nuevamente.";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (): boolean => {
    if (step === 1) {
      return (!!formData.email && !!formData.password && formData.password === formData.confirmPassword && passwordValidation.every(rule => rule.valid));
    }
    // La validación ahora comprueba que al menos un tag haya sido seleccionado (tagId > 0)
    return (!!formData.name && !!formData.businessName && !!formData.phone && !!formData.address && formData.acceptTerms && formData.categoryProviderId > 0 && formData.tagId > 0);
  };

  useEffect(() => {
    setPasswordValidation(
      passwordRulesConfig.map(rule => ({ ...rule, valid: rule.regex.test(formData.password) }))
    );
  }, [formData.password]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-900 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl p-8 rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-lg border border-gray-700"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          {serviceType === "health" ? <Stethoscope className="w-8 h-8 text-purple-400" /> : <Scissors className="w-8 h-8 text-purple-400" />}
          <h1 className="text-3xl font-bold text-center text-purple-400">Registro de Proveedor</h1>
        </div>

        <Tabs defaultValue="health" className="mb-8" onValueChange={(value) => setServiceType(value as ServiceType)}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
            <TabsTrigger value="health" className="data-[state=active]:bg-purple-500">Salud</TabsTrigger>
            <TabsTrigger value="beauty" className="data-[state=active]:bg-purple-500">Belleza</TabsTrigger>
          </TabsList>
        </Tabs>

        {(error || success) && <Alert className={`mb-4 ${error ? "border-red-500" : "border-green-500"}`}><AlertDescription>{error || success}</AlertDescription></Alert>}
        
        <StepIndicator step={step} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <SignupStep1 formData={formData} passwordValidation={passwordValidation} handleInputChange={handleInputChange} />
          ) : (
            // Se actualiza la prop que se pasa a SignupStep2
            <SignupStep2 
              formData={formData} 
              serviceType={serviceType} 
              handleInputChange={handleInputChange} 
              onLocationSelect={handleLocationSelect} 
              onSelectionChange={handleSelectionChange} 
            />
          )}

          <div className="flex gap-4 pt-4">
            {step === 2 && <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Anterior</Button>}
            <Button type={step === 2 ? "submit" : "button"} onClick={() => step === 1 && isStepValid() && setStep(2)} disabled={!isStepValid() || loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : step === 1 ? 'Siguiente' : 'Completar Registro'}
            </Button>
          </div>
        </form>
        
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes una cuenta? <Link href="/quhealthy/authentication/providers/login" className="text-purple-400 hover:underline">Inicia sesión</Link>
        </p>

      </motion.div>
    </div>
  );
}