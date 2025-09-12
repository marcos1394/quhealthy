"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
// Cambiado icono Lock por KeyRound (o Send si prefieres)
import { Mail, KeyRound, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";
import axios from "axios";

// Animación consistente
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// URL del endpoint de solicitud de reseteo
const API_BASE_URL = "http://localhost:3001/api/providers"; // Ajusta si es necesario
const REQUEST_RESET_ENDPOINT = `${API_BASE_URL}/request-password-reset`; // Asume este endpoint

export default function ProviderPasswordRecoveryPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Estado para mensaje de éxito

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Limpiar errores al empezar a escribir de nuevo
    if (error) setError("");
    if (successMessage) setSuccessMessage(""); // Ocultar mensaje de éxito si vuelve a escribir
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validación simple de formato de email (opcional, pero buena UX)
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Por favor, introduce un correo electrónico válido.");
        toast.warn("Por favor, introduce un correo electrónico válido.", { position: "top-right" });
        return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage(""); // Limpiar mensaje de éxito previo

    try {
      console.log(`🚀 Solicitando reseteo de contraseña para: ${email}`);
      // Llamada al backend para solicitar el reseteo
      // NO se necesita withCredentials a menos que este endpoint lo requiera (poco común)
      await axios.post(REQUEST_RESET_ENDPOINT, { email });

      // --- Éxito (Importante: Mensaje Genérico por Seguridad) ---
      const successMsg = "Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña en breve. Revisa tu bandeja de entrada (y spam).";
      setSuccessMessage(successMsg);
      toast.success("Solicitud enviada. Revisa tu correo.", { position: "top-right", autoClose: 4000 });
      // setEmail(""); // Opcional: Limpiar campo tras éxito

    } catch (err: any) {
      console.error("❌ Error durante la solicitud de reseteo:", err);
      let errorMessage = "Hubo un problema al procesar tu solicitud. Intenta de nuevo más tarde.";

       // --- Manejo de Errores (Importante: No revelar si el email existe) ---
       // No diferenciamos el error 404 (Not Found) para el usuario.
       // Mostramos un error genérico para cualquier fallo del servidor o red.
      if (axios.isAxiosError(err)) {
          // Solo mostramos un error específico si es, por ejemplo, un 400 (Bad Request) por formato inválido que pasó la validación del front,
          // o un 500 (Server Error). Pero nunca un 404 que confirme que el email no existe.
          if (err.response && err.response.status !== 404) {
             errorMessage = err.response.data?.message || "Error del servidor. Intenta más tarde.";
          }
           // Si es 404, NO actualizamos errorMessage, se mostrará el genérico o incluso el de éxito si se prefiere simularlo.
           // Para simplificar, mostraremos un error genérico en caso de CUALQUIER fallo de axios.
      } else if (err instanceof Error) {
          errorMessage = err.message; // Otros errores JS
      }

      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
       // Consideración avanzada: Podrías incluso elegir mostrar el `successMessage` genérico aquí también
       // para máxima ofuscación contra enumeración de emails, aunque puede ser confuso para el usuario si realmente hubo un error 500.
       // setSuccessMessage("Si existe una cuenta asociada..."); // Alternativa más segura pero potencialmente confusa

    } finally {
      setLoading(false);
    }
  };

  return (
    // Estructura y estilos base iguales al Login
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md p-8 rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-lg border border-gray-700"
        {...fadeIn}
      >
        {/* Encabezado Adaptado */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <KeyRound className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-center text-purple-400">
            Recuperar Contraseña
          </h1>
        </div>

        {/* Mensaje de Éxito */}
        {successMessage && !error && (
           <Alert variant="default" className="mb-6 bg-green-500/10 border-green-500/50 text-green-300">
             {/* Podrías usar un icono de Check o Mail aquí */}
             <Mail className="h-5 w-5 text-green-400"/>
             <AlertDescription>
               {successMessage}
             </AlertDescription>
             {/* Enlace para volver a Login después del éxito */}
             <div className="mt-4 text-center">
                <Link href="/quhealthy/authentication/providers/login" className="text-sm text-purple-400 hover:underline flex items-center justify-center gap-1">
                    <ArrowLeft size={16} /> Volver a Inicio de Sesión
                </Link>
             </div>
           </Alert>
        )}

        {/* Mensaje de Error */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Ocultar formulario si el mensaje de éxito se muestra */}
        {!successMessage && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-center text-sm text-gray-400 mb-4">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            {/* Campo Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico registrado"
                value={email}
                onChange={handleInputChange}
                className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
                required
                aria-label="Correo electrónico"
              />
            </div>

            {/* Botón Adaptado */}
            <button
              type="submit"
              className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Enviando...</span>
                </>
              ) : (
                "Enviar Enlace de Recuperación"
              )}
            </button>
          </form>
        )}

        {/* Enlaces Inferiores Adaptados (solo si el formulario es visible) */}
        {!successMessage && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/quhealthy/authentication/providers/login" className="text-purple-400 hover:underline">
                Inicia Sesión
              </Link>
            </p>
          </div>
        )}

      </motion.div>
    </div>
  );
}