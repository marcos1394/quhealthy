"use client";
import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { toast } from "react-toastify";
import LocationMapModal from "@/app/quhealthy/components/locationmapmodal";
import EnhancedCategorySelection from "@/app/quhealthy/components/categoryselection";

// Interfaces
interface CategoryProvider {
  id: number;
  name: string;
  tags: {
    id: number;
    name: string;
  }[];
}

interface FormData {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  lat: number;
  lng: number;
  acceptTerms: boolean;
  parentCategoryId: number;
  categoryProviderId: number;
  tagId: number;
}

interface PasswordRule {
  regex: RegExp;
  message: string;
  valid: boolean;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const passwordRules = [
  { regex: /.{8,}/, message: "Mínimo 8 caracteres" },
  { regex: /[A-Z]/, message: "Una letra mayúscula" },
  { regex: /[a-z]/, message: "Una letra minúscula" },
  { regex: /\d/, message: "Un número" },
  { regex: /[\W_]/, message: "Un carácter especial" },
];

const ProviderSignupPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<"health" | "beauty">("health");
  const [showTooltip, setShowTooltip] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    lat: 0,
    lng: 0,
    parentCategoryId: 1,
    categoryProviderId: 0,
    tagId: 0,
    acceptTerms: false,
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordRule[]>(
    passwordRules.map((rule) => ({ ...rule, valid: false }))
  );

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData((prev) => ({
      ...prev,
      lat: location.lat,
      lng: location.lng,
      address: location.address,
    }));
  };

  const handleCategorySelect = (categoryId: number, tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      categoryProviderId: categoryId,
      tagId: tagId,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let inputValue: string | boolean = value;

    if (type === "checkbox") {
      inputValue = (e.target as HTMLInputElement).checked;
    }

    if (name === "password") {
      setPasswordValidation(
        passwordRules.map((rule) => ({
          ...rule,
          valid: rule.regex.test(value),
        }))
      );
    }

    setFormData((prev) => ({ ...prev, [name]: inputValue }));
  };

  // Ocultar tooltip después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPasswordValidation(
      passwordRules.map((rule) => ({
        ...rule,
        valid: rule.regex.test(formData.password),
      }))
    );
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const providerData = {
      ...formData,
      role: "provider",
    };

    try {
      await axios.post("http://localhost:3001/api/providers/signup", providerData);

      setSuccess("¡Registro exitoso! Te redirigiremos al Inicio de Sesión :).");
      toast.success("¡Registro exitoso! Te redirigiremos al Inicio de Sesión.", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        window.location.href = "/quhealthy/authentication/providers/login";
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Ocurrió un error durante el registro. Por favor, intenta nuevamente.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (): boolean => {
    if (step === 1) {
      return Boolean(
        formData.email &&
          formData.password &&
          formData.confirmPassword &&
          passwordValidation.every((rule) => rule.valid) &&
          formData.password === formData.confirmPassword
      );
    }

    return Boolean(
      formData.name &&
        formData.businessName &&
        formData.phone &&
        formData.address &&
        formData.lat &&
        formData.lng &&
        formData.categoryProviderId &&
        formData.tagId &&
        formData.acceptTerms
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-2xl p-8 rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-lg border border-gray-700"
        {...fadeIn}
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          {serviceType === "health" ? (
            <Stethoscope className="w-8 h-8 text-purple-400" />
          ) : (
            <Scissors className="w-8 h-8 text-purple-400" />
          )}
          <h1 className="text-3xl font-bold text-center text-purple-400">Registro de Proveedor</h1>
        </div>

        <Tabs
          defaultValue="health"
          className="mb-8"
          onValueChange={(value) => {
            setServiceType(value as "health" | "beauty");
            setFormData((prev) => ({
              ...prev,
              parentCategoryId: value === "health" ? 1 : 2, // Si es "health" = 1, si es "beauty" = 2
            }));
          }}
        >
          <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 rounded-lg">
            <TabsTrigger value="health" className="py-2 text-gray-300 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Servicios de Salud
            </TabsTrigger>
            <TabsTrigger value="beauty" className="py-2 text-gray-300 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              Servicios de Belleza
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {(error || success) && (
          <Alert className={`mb-6 ${error ? "bg-red-500/20 border-red-500" : "bg-green-500/20 border-green-500"}`}>
            <AlertDescription className="text-white">{error || success}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 1 ? "bg-purple-500" : "bg-purple-500/20"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 ${step === 2 ? "bg-purple-500" : "bg-purple-500/20"}`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 2 ? "bg-purple-500" : "bg-purple-500/20"
              }`}
            >
              2
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico profesional"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                {passwordValidation.map((rule, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {rule.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className={rule.valid ? "text-green-500" : "text-gray-400"}>
                      {rule.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                <input
                  type="text"
                  name="businessName"
                  placeholder="Nombre del consultorio o negocio"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Teléfono de contacto"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
                  required
                />
              </div>

              <LocationMapModal onLocationSelect={handleLocationSelect} />

              <EnhancedCategorySelection
                serviceType={serviceType}
                onCategorySelect={handleCategorySelect}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-400"
                  required
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-300">
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
                className="flex-1 py-3 px-6 rounded-lg border border-purple-400 text-purple-400 hover:bg-purple-400/10 transition-all duration-200"
                disabled={loading}
              >
                Anterior
              </button>
            )}

            <button
              type={step === 2 ? "submit" : "button"}
              onClick={() => step === 1 && isStepValid() && setStep(2)}
              disabled={!isStepValid() || loading}
              className="flex-1 bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando...</span>
                </div>
              ) : step === 1 ? (
                "Siguiente"
              ) : (
                "Completar Registro"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          <p className="text-center text-sm text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/quhealthy/authentication/providers/login"
              className="text-purple-400 hover:underline transition-colors duration-200"
            >
              Inicia sesión
            </Link>
          </p>

          <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
            <div className="flex items-start gap-2 text-sm text-gray-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-400" />
              <div className="space-y-2">
                <p className="font-medium">Proceso de verificación requerido</p>
                <p className="text-gray-400">
                  Después del registro, necesitarás completar un proceso de verificación que incluye:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  <li>Validación de identidad profesional</li>
                  <li>Documentación que acredite tu especialidad</li>
                  <li>Comprobante de dirección del consultorio</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {showTooltip && (
          <div className="fixed bottom-4 right-4 p-4 bg-purple-500/90 rounded-lg shadow-lg max-w-xs animate-bounce-slow hidden md:block">
            <div className="flex items-start gap-2 text-white">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">¿Necesitas ayuda?</p>
                <p className="text-sm mt-1">
                  Nuestro equipo está disponible 24/7 para asistirte en el proceso de registro
                </p>
              </div>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-white hover:text-gray-300 transition-colors duration-200"
              >
                ✖
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProviderSignupPage;

// Estilos globales necesarios
const styles = `
  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .animate-bounce-slow {
    animation: bounce-slow 3s infinite;
  }
`;