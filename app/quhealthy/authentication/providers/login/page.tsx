"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

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
      // Llamada al endpoint de inicio de sesión
      const response = await axios.post(
        "http://localhost:3001/api/providers/login",
        formData,
        { withCredentials: true } // Necesario para enviar cookies
      );
  
      if (response.status === 200) {
        toast.success("Inicio de sesión exitoso. Verificando planes...", {
          position: "top-right",
          autoClose: 3000,
        });
  
        console.log("Enviando petición a /api/providers/active-plan...");
        const planResponse = await axios.get(
          "http://localhost:3001/api/providers/active-plan",
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
  
        console.log("Respuesta de /api/providers/active-plan:", planResponse.data);
  
        const { hasPlan, hasKYC, hasLicense, hasMarketplaceConfigured } = planResponse.data;
  
        // **Validar redirección**
        if (!hasPlan) {
          window.location.href = "/quhealthy/profile/providers/plans";
        } else if (!hasKYC) {
          window.location.href = "/quhealthy/authentication/providers/onboarding/kyc";
        } else if (!hasLicense) {
          window.location.href = "/quhealthy/authentication/providers/onboarding/validatelicense";
        } else if (!hasMarketplaceConfigured) {
          window.location.href = "/quhealthy/authentication/providers/onboarding/marketplaceconfiguration";
        } else {
          window.location.href = "/quhealthy/profile/providers/dashboard";
        }
      } else {
        setError(response.data.message || "Credenciales incorrectas. Intenta de nuevo.");
      }
    } catch (err: any) {
      console.error("Error en /api/providers/active-plan:", err);
      const errorMessage = err.response?.data?.message || "Error inesperado. Intenta de nuevo.";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md p-8 rounded-xl shadow-2xl bg-gray-800/90 backdrop-blur-lg border border-gray-700"
        {...fadeIn}
      >
        <h1 className="text-3xl font-bold text-center text-teal-400 mb-8">
          Iniciar Sesión
        </h1>

        {error && (
          <div className="bg-red-500/20 text-red-500 text-sm rounded p-3 mb-4">
            <AlertCircle className="inline-block w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
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

          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-400">
            ¿Olvidaste tu contraseña?{" "}
            <Link href="/quhealthy/authentication/recovery" className="text-teal-400 hover:underline">
              Recupérala aquí
            </Link>
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">
            ¿No tienes cuenta?{" "}
            <Link href="/quhealthy/authentication/providers/signup" className="text-teal-400 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
