"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";
import axios from "axios";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Define las URLs de los endpoints para fácil modificación
const API_BASE_URL = "http://localhost:3001/api/providers"; // Ajusta si es necesario

export default function ProviderLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Intento de inicio de sesión
      console.log("🚀 Iniciando sesión...");
      const loginResponse = await axios.post(
        `${API_BASE_URL}/login`,
        formData,
        { withCredentials: true } // Para manejo de cookies
      );

      // Respuesta exitosa (Axios considera 2xx como éxito por defecto)
      toast.success("Inicio de sesión exitoso. Verificando estado...", {
        position: "top-right",
        autoClose: 1500,
      });

      // 2. Verificar si tiene un plan activo
      console.log("🔍 Verificando plan activo...");
      const planResponse = await axios.get(
        `${API_BASE_URL}/active-plan`,
        { withCredentials: true } // Envía la cookie establecida en el login
      );
      console.log("Respuesta de /active-plan:", planResponse.data);
      const { hasPlan } = planResponse.data;

      // 3. Redirección si no hay plan
      if (!hasPlan) {
        console.log("🚫 Sin plan activo. Redirigiendo a /profile/providers/plans...");
        toast.info("Por favor, selecciona un plan para continuar.", { position: "top-center", autoClose: 3000 });
        window.location.href = "/quhealthy/profile/providers/plans";
        // setLoading(false); // Asegúrate que el estado de carga se detenga si usas return
        return; // Detiene la ejecución aquí
      }

      // 4. Verificar estado de onboarding (solo si tiene plan)
      console.log("🔍 Plan activo encontrado. Verificando estado de onboarding...");
      const onboardingResponse = await axios.get(
        `${API_BASE_URL}/onboarding-status`,
        { withCredentials: true } // Envía la cookie
      );
      console.log("Respuesta de /onboarding-status:", onboardingResponse.data);
      const { isOnboardingComplete } = onboardingResponse.data;

      // 5. Redirección final basada en onboarding
      if (!isOnboardingComplete) {
        console.log("⏳ Onboarding incompleto. Redirigiendo a /authentication/providers/onboarding...");
        toast.info("Completa los pasos de configuración para acceder al dashboard.", { position: "top-center", autoClose: 3000 });
        // Redirige a la página principal de onboarding. Esa página contendrá la lógica
        // para llevar al usuario al paso específico pendiente (KYC, License, Marketplace).
        window.location.href = "/quhealthy/authentication/providers/onboarding";
      } else {
        console.log("✅ Onboarding completo. Redirigiendo a /profile/providers/dashboard...");
        window.location.href = "/quhealthy/profile/providers/dashboard";
      }

    } catch (err: any) {
      // Captura errores de CUALQUIERA de las llamadas axios (login, plan, onboarding)
      console.error("❌ Error durante el proceso de inicio de sesión/verificación:", err);
      let errorMessage = "Error inesperado. Intenta de nuevo más tarde.";
      if (axios.isAxiosError(err)) {
          // Error de red o respuesta del servidor con código de error (4xx, 5xx)
          errorMessage = err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
          // Otro tipo de error (ej., error de JavaScript antes de la llamada)
          errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });

    } finally {
      // Asegura que el estado de carga se desactive sin importar el resultado
      setLoading(false);
    }
  };


  // --- Resto del JSX del componente (sin cambios) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md p-8 rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-lg border border-gray-700"
        {...fadeIn}
      >
        <div className="flex items-center justify-center gap-3 mb-8">
            <LogIn className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-center text-purple-400">
                Iniciar Sesión
            </h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
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

          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span>Verificando...</span> {/* Cambiado texto de carga */}
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <p className="text-center text-sm text-gray-400">
            ¿Olvidaste tu contraseña?{" "}
            <Link href="/quhealthy/authentication/providers/recoverypassword" className="text-purple-400 hover:underline">
              Recupérala aquí
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link href="/quhealthy/authentication/providers/signup" className="text-purple-400 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}