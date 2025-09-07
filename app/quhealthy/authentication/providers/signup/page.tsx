"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, Scissors,  Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";

import { FormData, PasswordRule, ServiceType } from '@/app/quhealthy/types/signup';
import { SignupStep1 } from '@/app/quhealthy/components/signup/SignupStep1';
import { SignupStep2 } from '@/app/quhealthy/components/signup/SignupStep2';
import { StepIndicator } from '@/app/quhealthy/components/signup/StepIndicator';
import { LocationData } from "@/app/quhealthy/types/location";

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
    subCategoryId: 0, // <-- Campo de estado añadido
    tagIds: [],         // <-- Campo de estado añadido
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
  // La función ahora acepta los 3 parámetros correctamente
 // --- INICIO DE LA CORRECCIÓN ---
  // Se envuelve la función en useCallback para estabilizarla
  const handleSelectionChange = useCallback((categoryId: number, subCategoryId: number, tagIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      categoryProviderId: categoryId,
      subCategoryId: subCategoryId,
      tagIds: tagIds,
    }));
  }, []); // El array de dependencias vacío significa que esta función nunca cambiará
  // --- FIN DE LA CORRECCIÓN ---

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // El backend espera 'tagId' (singular), así que enviamos el primero del array para el MVP.
    const providerData = { ...formData, role: "provider", tagId: formData.tagIds[0] || null };

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/providers/signup`;
      await axios.post(apiUrl, providerData);
      
      setSuccess("¡Registro exitoso! Te redirigiremos.");
      toast.success("¡Registro exitoso!", { position: "top-right" });
      
      setTimeout(() => {
        router.push("/quhealthy/authentication/providers/login");
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Ocurrió un error.";
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
    // Se actualiza la validación para incluir la subcategoría
    return (!!formData.name && !!formData.businessName && !!formData.phone && !!formData.address && formData.acceptTerms && formData.categoryProviderId > 0 && formData.subCategoryId > 0);
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
            // Se pasa la función con el nombre correcto
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