"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, Loader2, User, Stethoscope, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para controlar si es Paciente o Proveedor
  const [userType, setUserType] = useState<"consumer" | "provider">("consumer");
  
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    rememberMe: false 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleTabChange = (value: string) => {
    setUserType(value as "consumer" | "provider");
    setError(""); // Limpiar errores al cambiar de pestaña
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Definimos el endpoint y la redirección según el tipo de usuario
      const endpoint = userType === "consumer" 
        ? "/api/auth/consumer/login" 
        : "/api/auth/provider/login";
        
      const redirectPath = userType === "consumer"
        ? "/discover" // O "/dashboard"
        : "/dashboard"; // Dashboard del proveedor

      // Hacemos la petición
      await axios.post(endpoint, {
        email: formData.email,
        password: formData.password
      });

      toast.success(`¡Bienvenido de nuevo!`, { position: "top-center" });
      
      // Redirección
      router.push(redirectPath);
      router.refresh(); // Actualiza los componentes de servidor (Navbar)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Credenciales incorrectas. Verifica tu correo y contraseña.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo Animado (Coherente con el resto del sitio) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-gray-950 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-2xl overflow-hidden">
          
          <div className="p-8 pb-6 text-center border-b border-gray-800">
            <Link href="/" className="inline-block mb-6 group">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                  QuHealthy
                </span>
            </Link>
            
            <h1 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h1>
            <p className="text-gray-400 text-sm">Accede a tu cuenta para continuar.</p>
          </div>

          <div className="p-8">
            {/* Selector de Tipo de Usuario */}
            <Tabs defaultValue="consumer" value={userType} onValueChange={handleTabChange} className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 h-11 p-1">
                <TabsTrigger value="consumer" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white h-9">
                  <User className="w-4 h-4 mr-2" /> Paciente
                </TabsTrigger>
                <TabsTrigger value="provider" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white h-9">
                  <Stethoscope className="w-4 h-4 mr-2" /> Proveedor
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={userType === 'consumer' ? "tu@email.com" : "contacto@clinica.com"}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                    <Link href="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 hover:underline">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white focus:border-purple-500 h-11"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Botón de envío dinámico */}
              <Button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className={`w-full h-12 text-base font-bold text-white shadow-lg transition-all duration-300 ${
                    userType === 'consumer' 
                    ? "bg-purple-600 hover:bg-purple-700 shadow-purple-900/20" 
                    : "bg-pink-600 hover:bg-pink-700 shadow-pink-900/20"
                }`}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : (
                    <span className="flex items-center">
                        <LogIn className="mr-2 w-5 h-5" /> 
                        {userType === 'consumer' ? 'Ingresar como Paciente' : 'Ingresar como Proveedor'}
                    </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-sm text-gray-400 mb-2">
                ¿Aún no tienes una cuenta?
              </p>
              
              {/* Link de registro dinámico según la pestaña activa */}
              <Link 
                href={userType === 'consumer' ? "/register" : "/provider/register"}
                className="inline-flex items-center text-sm font-semibold text-white hover:text-purple-400 transition-colors group"
              >
                Regístrate como {userType === 'consumer' ? 'Paciente' : 'Proveedor'}
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}