"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Building2, 
  Mail, 
  Phone, 
  User, 
  Lock,
  Stethoscope,
  Scissors,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { toast } from "react-toastify";



const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const passwordRules = [
  { regex: /.{8,}/, message: "Mínimo 8 caracteres" },
  { regex: /[A-Z]/, message: "Una letra mayúscula" },
  { regex: /[a-z]/, message: "Una letra minúscula" },
  { regex: /\d/, message: "Un número" },
  { regex: /[\W_]/, message: "Un carácter especial" }
];

export default function ProviderSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<"health" | "beauty">("health");
  
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    location: "",
    acceptTerms: false
  });

  const [passwordValidation, setPasswordValidation] = useState(
    passwordRules.map((rule) => ({ ...rule, valid: false }))
  );

  const specialties: Record<"health" | "beauty", { [category: string]: string[] }> = {
    health: {
      "Medicina General": ["Médico General", "Médico Familiar"],
      "Especialidades Médicas": ["Cardiología", "Pediatría", "Ginecología", "Neurología", "Psiquiatría"],
      "Terapias": ["Fisioterapia", "Terapia Ocupacional", "Nutrición"]
    },
    beauty: {
      "Estilismo": ["Estilista", "Barbero", "Colorista"],
      "Cuidado Personal": ["Maquillador Profesional", "Uñas y Manicure"],
      "Spa y Bienestar": ["Masoterapeuta", "Tratamientos Faciales", "Tratamientos Corporales"]
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const inputValue = type === "checkbox" ? checked : value;
  
    if (name === "password") {
      setPasswordValidation(
        passwordRules.map((rule) => ({
          ...rule,
          valid: rule.regex.test(value),
        }))
      );
    }
  
    setFormData({ ...formData, [name]: inputValue });
  };
  



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
  
    const providerData = {
      ...formData,
      role: "provider", // Agregamos el rol de proveedor
    };
  
    try {
      const response = await axios.post("http://localhost:3001/api/providers/signup", providerData);
  
      setSuccess("¡Registro exitoso! Te redirigiremos al Inicio de Sesión :).");
      toast.success("¡Registro exitoso! Te redirigiremos al Inicio de Sesión.", {
        position: "top-right",
        autoClose: 3000,
      });
  
      setTimeout(() => {
        window.location.href = "/quhealthy/authentication/providers/login";
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Ocurrió un error durante el registro. Por favor, intenta nuevamente.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const isStepValid = () => {
    if (step === 1) {
      return formData.email && formData.password && formData.confirmPassword && 
             passwordValidation.every(rule => rule.valid) && 
             formData.password === formData.confirmPassword;
    }
    return formData.name && formData.businessName && formData.phone && 
           formData.specialty && formData.location && formData.acceptTerms;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-xl p-8 rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-lg border border-gray-700"
        {...fadeIn}
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          {serviceType === 'health' ? 
            <Stethoscope className="w-8 h-8 text-teal-400" /> : 
            <Scissors className="w-8 h-8 text-teal-400" />
          }
          <h1 className="text-3xl font-bold text-center text-teal-400">
            Registro de Proveedor
          </h1>
        </div>

        <Tabs 
  defaultValue="health" 
  className="mb-8"
  onValueChange={(value) => setServiceType(value as "health" | "beauty")}
>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="health">Servicios de Salud</TabsTrigger>
    <TabsTrigger value="beauty">Servicios de Belleza</TabsTrigger>
  </TabsList>
</Tabs>


        {(error || success) && (
          <Alert className={`mb-6 ${error ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            <AlertDescription>
              {error || success}
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8 flex justify-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 1 ? 'bg-teal-500' : 'bg-teal-500/20'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              step === 2 ? 'bg-teal-500' : 'bg-teal-500/20'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 2 ? 'bg-teal-500' : 'bg-teal-500/20'
            }`}>
              2
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico profesional"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <div className="space-y-2">
                {passwordValidation.map((rule, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {rule.valid ? 
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> : 
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    }
                    <span className={rule.valid ? 'text-green-500' : 'text-gray-400'}>
                      {rule.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="businessName"
                  placeholder="Nombre del consultorio o negocio"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono de contacto"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  placeholder="Ciudad, Estado"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  required
                />
              </div>

              <select
  name="specialty"
  value={formData.specialty}
  onChange={handleInputChange}
  className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
  required
>
  <option value="">Selecciona tu especialidad</option>
  {Object.entries(specialties[serviceType]).map(([category, subcategories]) => (
    <optgroup key={category} label={category}>
      {subcategories.map((specialty) => (
        <option key={specialty} value={specialty}>
          {specialty}
        </option>
      ))}
    </optgroup>
  ))}
</select>


              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-600 text-teal-500 focus:ring-teal-400"
                />
                <label htmlFor="acceptTerms" className="text-sm">
                  Acepto los términos y condiciones y la política de privacidad
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-6 rounded-lg border border-teal-400 text-teal-400 hover:bg-teal-400/10"
                disabled={loading}
              >
                Anterior
              </button>
            )}
            
            <button
              type={step === 2 ? "submit" : "button"}
              onClick={() => step === 1 && isStepValid() && setStep(2)}
              disabled={!isStepValid() || loading}
              className="flex-1 bg-teal-500 text-white py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : step === 1 ? "Siguiente" : "Completar Registro"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-teal-400 hover:underline">
              Inicia sesión
            </Link>
          </p>
          
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <p>
              Después del registro, necesitarás completar el proceso de verificación 
              y proporcionar documentación adicional.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}