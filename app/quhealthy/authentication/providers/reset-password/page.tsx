"use client"; // Directiva necesaria para hooks de cliente como useState, useEffect, useSearchParams, useRouter

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation'; // Hooks para URL y redirección
import { motion } from "framer-motion";
import { Lock, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"; // Iconos necesarios
import { Alert, AlertDescription } from "@/components/ui/alert"; // Asumiendo ruta correcta
import { toast } from "react-toastify";
import axios from "axios";

// Animación consistente
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Endpoints del Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/auth"; // Usar variable de entorno si es posible
const VALIDATE_RESET_ENDPOINT = `${API_BASE_URL}/validate-reset-token`;
const RESET_PASSWORD_ENDPOINT = `${API_BASE_URL}/reset-password`;

// --- Componente Interno para Lógica Principal ---
function ResetPasswordForm() {
  // Hooks de Next.js y React
  const searchParams = useSearchParams();
  const router = useRouter(); // Para redirección programática

  // Obtener tokens de la URL
  const selector = searchParams.get('selector');
  const verifier = searchParams.get('verifier');

  // Estados del componente
  const [tokenState, setTokenState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado de carga (validación inicial + submit)
  const [submitError, setSubmitError] = useState(""); // Errores específicos del envío del formulario
  const [validationError, setValidationError] = useState(""); // Errores de la validación inicial del token
  const [successMessage, setSuccessMessage] = useState(""); // Mensaje de éxito post-actualización
  const [formSubmitted, setFormSubmitted] = useState(false); // Flag para estado de éxito final

  // Efecto para validar el token al cargar el componente
  useEffect(() => {
    const validateToken = async () => {
      // Solo validar si estamos en el estado inicial 'checking'
      if (tokenState !== 'checking') {
        console.log("Saltando re-validación de token, estado actual:", tokenState);
        return;
      }

      // Verificar que ambos tokens existan en la URL
      if (!selector || !verifier) {
        setValidationError("Enlace inválido o incompleto.");
        setTokenState('invalid');
        setLoading(false); // Termina la carga inicial (fallida)
        return;
      }

      console.log(`🚀 Validando selector: ${selector}, verifier: ${verifier ? 'Presente' : 'Ausente'}`); // Log mejorado
      setLoading(true); // Inicia carga para validación

      try {
        // Llamada al backend para validar
        await axios.post(VALIDATE_RESET_ENDPOINT, { selector, verifier });
        console.log("✅ Tokens S/V válidos.");
        setTokenState('valid'); // Marcar token como válido
        setValidationError(""); // Limpiar errores previos
      } catch (err: any) {
        console.error("❌ Error al validar el token:", err);
        const message = err.response?.data?.message || "El enlace de reseteo es inválido o ha expirado.";
        setValidationError(message);
        setTokenState('invalid'); // Marcar token como inválido
        // toast.error(message, { position: "top-right" }); // Opcional, ya se muestra Alert
      } finally {
        setLoading(false); // Termina carga de validación
      }
    };

    validateToken();
    // Dependencias: Ejecutar si cambian selector, verifier o el estado inicial
  }, [selector, verifier, tokenState]);


  // Manejador para cambios en los inputs de contraseña
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
    if (submitError) setSubmitError(""); // Limpiar error de submit al escribir
  };

  // Manejador para el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevenir recarga de página
    setSubmitError(""); // Limpiar errores previos

    // --- Validaciones Frontend ---
    if (!password || !confirmPassword) {
      setSubmitError("Por favor, completa ambos campos de contraseña.");
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setSubmitError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    // --- Fin Validaciones ---

    // Re-obtener tokens actuales por seguridad (aunque no deberían cambiar)
    const currentSelector = searchParams.get('selector');
    const currentVerifier = searchParams.get('verifier');

    // Verificar estado y tokens antes de enviar
    if (!currentSelector || !currentVerifier || tokenState !== 'valid') {
      setSubmitError("La solicitud no es válida o el enlace ha expirado. Intenta solicitar un nuevo enlace.");
      return;
    }

    setLoading(true); // Iniciar carga para el submit
    try {
      console.log(`🚀 Intentando actualizar contraseña S/V: Selector=${currentSelector}`);
      // Llamada al backend para actualizar la contraseña
      await axios.post(RESET_PASSWORD_ENDPOINT, {
        selector: currentSelector,
        verifier: currentVerifier,
        password // La nueva contraseña
      });

      console.log("✅ Contraseña actualizada exitosamente en backend.");
      // --- Manejo de Éxito ---
      setSuccessMessage("¡Tu contraseña ha sido actualizada exitosamente! Redirigiendo a inicio de sesión...");
      setFormSubmitted(true); // Marcar como enviado con éxito
      setPassword(""); // Limpiar campos
      setConfirmPassword("");
      toast.success("Contraseña actualizada.", { position: "top-right" });

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/quhealthy/authentication/providers/login'); // Ajusta la ruta si es necesario
      }, 3000);
      // --- FIN MANEJO DE ÉXITO ---

    } catch (err: any) {
      console.error("❌ Error al actualizar la contraseña:", err);
      // Mostrar error específico del backend o uno genérico
      const message = err.response?.data?.message || "No se pudo actualizar la contraseña. Inténtalo de nuevo o solicita otro enlace.";
      setSubmitError(message);
      toast.error(message, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false); // Terminar carga del submit
    }
  };


  // --- Renderizado Condicional Lógico ---

  // 1. Estado de Carga Inicial (Validando Token)
  if (tokenState === 'checking') {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        {/* Spinner más grande para carga inicial */}
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        <span className="ml-4 text-gray-300 text-lg">Validando enlace...</span>
      </div>
    );
  }

  // 2. Estado de Token Inválido (Detectado inicialmente o si falla validación)
  if (tokenState === 'invalid') {
    return (
      <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-400">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>
          {validationError || "Este enlace de reseteo es inválido o ha expirado."}
        </AlertDescription>
        <div className="mt-4 space-y-2 text-center">
             <Link href="/quhealthy/authentication/providers/recovery" className="text-sm text-purple-400 hover:underline block">
                Solicitar un nuevo enlace
             </Link>
             <Link href="/quhealthy/authentication/providers/login" className="text-sm text-gray-300 hover:underline block">
                Volver a Inicio de Sesión
             </Link>
        </div>
      </Alert>
    );
  }

  // 3. Estado de Éxito (Formulario Enviado Correctamente)
  if (formSubmitted) {
    return (
        <Alert variant="default" className="mb-6 bg-green-500/10 border-green-500/50 text-green-300">
          <CheckCircle className="h-5 w-5 text-green-400"/>
          <AlertDescription>
            {successMessage || "Contraseña actualizada exitosamente."}
          </AlertDescription>
          {/* El spinner aquí indica la redirección inminente */}
          <div className="mt-4 flex justify-center items-center text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
              Redirigiendo...
          </div>
          {/* Opcional: Mantener el link por si la redirección falla */}
          {/* <div className="mt-2 text-center">
             <Link href="/quhealthy/authentication/providers/login" className="text-sm text-purple-400 hover:underline flex items-center justify-center gap-1">
                 <ArrowLeft size={16} /> Ir a Inicio de Sesión ahora
             </Link>
           </div> */}
        </Alert>
    );
  }

  // 4. Estado Válido y Formulario NO Enviado: Mostrar Formulario de Reseteo
  //    (tokenState === 'valid' && !formSubmitted)
  return (
    <>
      {/* Mensaje de Error del Submit (si ocurre durante el envío) */}
      {submitError && (
        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            {submitError}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-center text-sm text-gray-400 mb-4">
          Introduce y confirma tu nueva contraseña.
        </p>
        {/* Campo Nueva Contraseña */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
          <input
            type="password"
            name="password"
            placeholder="Nueva Contraseña"
            value={password}
            onChange={handleInputChange}
            className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
            required
            aria-label="Nueva Contraseña"
            minLength={8} // Añadir validación HTML básica
          />
        </div>
        {/* Campo Confirmar Contraseña */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-500" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar Nueva Contraseña"
            value={confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-10 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-white placeholder-gray-400"
            required
            aria-label="Confirmar Nueva Contraseña"
            minLength={8} // Añadir validación HTML básica
          />
        </div>

        {/* Botón Actualizar */}
        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          disabled={loading} // Deshabilitado durante la carga del submit
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <span>Actualizando...</span>
            </>
          ) : (
            "Actualizar Contraseña"
          )}
        </button>
      </form>
    </>
  );
}


// --- Componente Principal de la Página ---
// Responsable del layout general y de usar Suspense
export default function ProviderResetPasswordPage() {
    return (
     // Estructura y estilos base iguales al Login/Recovery
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Contenedor principal */}
      <motion.div
        className="relative z-10 w-full max-w-md p-8 rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-lg border border-gray-700"
        {...fadeIn} // Aplica animación
      >
        {/* Encabezado */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Lock className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-center text-purple-400">
            Restablecer Contraseña
          </h1>
        </div>

        {/* Suspense para la carga de useSearchParams */}
        <Suspense fallback={
            // Fallback visual simple durante la carga inicial del componente interno
            <div className="flex justify-center items-center min-h-[100px]">
                 <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
         }>
           {/* Renderiza el componente que contiene la lógica */}
           <ResetPasswordForm />
        </Suspense>

      </motion.div>
    </div>
    );
}