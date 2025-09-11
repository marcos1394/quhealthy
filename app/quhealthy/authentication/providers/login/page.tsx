"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  LogIn, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Loader2,
  Shield,
  Stethoscope,
  ArrowRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";




const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Define las URLs de los endpoints para fácil modificación

export default function ProviderLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter()

  // Real-time validation
  const validateField = (name: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Formato de correo inválido';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'La contraseña es requerida';
        } else if (value.length < 6) {
          errors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else {
          delete errors.password;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
    
    // Clear global error when user starts typing
    if (error) setError("");
  };

  const isFormValid = () => {
    return formData.email && 
           formData.password && 
           Object.keys(validationErrors).length === 0 &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // 1. Hacemos la llamada a la RUTA RELATIVA para que el proxy de Vercel la intercepte.
    //    Mantenemos 'withCredentials' para que el navegador envíe la cookie httpOnly.
    const { data } = await axios.post(
      '/api/providers/login', 
      formData,
      { withCredentials: true }
    );

    toast.success("Inicio de sesión exitoso. Verificando tu estado...", {
      position: "top-right",
      autoClose: 1500,
    });

    // 2. Extraemos el objeto 'onboarding' de la respuesta del backend.
    const { onboarding } = data;
    let nextRoute = '/quhealthy/profile/providers/dashboard'; // Ruta por defecto para usuarios activos.

    // 3. LÓGICA DE REDIRECCIÓN INTELIGENTE:
    // Si el onboarding NO está completo...
    if (!onboarding.isComplete) {
      console.log("Onboarding incompleto. Redirigiendo al checklist.");
      // ...lo enviamos al panel de tareas de onboarding.
      nextRoute = '/quhealthy/authentication/providers/onboarding/checklist';
    } 
    // Si el onboarding SÍ está completo, pero no tiene un plan activo...
    else if (!onboarding.hasActivePlan) {
      console.log("Onboarding completo, pero sin plan activo. Redirigiendo a planes.");
      // ...lo enviamos a la página de planes.
      nextRoute = '/quhealthy/profile/providers/plans';
    }
    
    console.log(`✅ Estado verificado. Redirigiendo a: ${nextRoute}`);
    
    // 4. Usamos router.push para una navegación más fluida en Next.js
    router.push(nextRoute);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || "Error al iniciar sesión. Verifica tus credenciales.";
    setError(errorMessage);
    toast.error(errorMessage, { position: "top-right" });
    setLoading(false); // Detenemos la carga solo en caso de error
  }
};

  const getFieldStatus = (fieldName: string) => {
    if (!formData[fieldName as keyof typeof formData]) return 'default';
    if (validationErrors[fieldName]) return 'error';
    return 'success';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-30" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header Card */}
        <motion.div
          className="text-center mb-8"
          variants={staggerItem}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-teal-500 rounded-2xl mb-6 shadow-2xl">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-400 text-sm">
            Ingresa a tu cuenta profesional de QuHealthy
          </p>
        </motion.div>

        {/* Main Login Card */}
        <motion.div
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10"
          variants={staggerItem}
        >
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-red-500/10 border-red-500/30 text-red-200">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div className="space-y-2" variants={staggerItem}>
              <label className="block text-sm font-medium text-gray-300">
                Correo electrónico
              </label>
              <div className="relative group">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'email' 
                    ? 'text-purple-400' 
                    : getFieldStatus('email') === 'success'
                    ? 'text-teal-400'
                    : getFieldStatus('email') === 'error'
                    ? 'text-red-400'
                    : 'text-gray-500'
                }`} />
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-11 pr-12 py-4 rounded-xl bg-white/5 backdrop-blur-sm border-2 transition-all duration-300 text-white placeholder-gray-500 ${
                    focusedField === 'email'
                      ? 'border-purple-400 bg-white/10 shadow-lg shadow-purple-400/20'
                      : getFieldStatus('email') === 'success'
                      ? 'border-teal-400 bg-teal-900/10'
                      : getFieldStatus('email') === 'error'
                      ? 'border-red-400 bg-red-900/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  required
                />
                {getFieldStatus('email') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-400" />
                )}
              </div>
              <AnimatePresence>
                {validationErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs mt-1"
                  >
                    {validationErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div className="space-y-2" variants={staggerItem}>
              <label className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'password' 
                    ? 'text-purple-400' 
                    : getFieldStatus('password') === 'success'
                    ? 'text-teal-400'
                    : getFieldStatus('password') === 'error'
                    ? 'text-red-400'
                    : 'text-gray-500'
                }`} />
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-11 pr-12 py-4 rounded-xl bg-white/5 backdrop-blur-sm border-2 transition-all duration-300 text-white placeholder-gray-500 ${
                    focusedField === 'password'
                      ? 'border-purple-400 bg-white/10 shadow-lg shadow-purple-400/20'
                      : getFieldStatus('password') === 'success'
                      ? 'border-teal-400 bg-teal-900/10'
                      : getFieldStatus('password') === 'error'
                      ? 'border-red-400 bg-red-900/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {validationErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-400 text-xs mt-1"
                  >
                    {validationErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                loading || !isFormValid()
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
              variants={staggerItem}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          className="flex items-center justify-center space-x-2 mt-6 text-gray-400 text-sm"
          variants={staggerItem}
        >
          <Shield className="w-4 h-4 text-teal-400" />
          <span>Conexión segura y encriptada</span>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          className="mt-8 space-y-4 text-center"
          variants={staggerItem}
        >
          <Link 
            href="/quhealthy/authentication/providers/recoverypassword" 
            className="block text-sm text-gray-400 hover:text-purple-400 transition-colors duration-200"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          
          <div className="flex items-center justify-center space-x-1 text-sm text-gray-400">
            <span>¿No tienes cuenta?</span>
            <Link 
              href="/quhealthy/authentication/providers/signup" 
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              Regístrate aquí
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}