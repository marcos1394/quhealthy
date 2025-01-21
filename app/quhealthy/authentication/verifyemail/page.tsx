"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";
import axios from "axios";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1); // 1: Enter email, 2: Verify code

  const handleEmailSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:3001/auth/send-verification-email", { email });
      setSuccess("Se ha enviado un código de verificación a tu correo electrónico.");
      setStep(2);
    } catch (err) {
      setError("No se pudo enviar el correo de verificación. Verifica tu correo electrónico.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:3001/auth/verify-email", { email, code });
      setSuccess("¡Correo electrónico verificado exitosamente!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError("Código inválido. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center relative">
      {/* Neon Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-pink-500 opacity-30 blur-2xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 opacity-30 blur-2xl animate-pulse delay-2000" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md p-8 rounded-lg shadow-lg bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 backdrop-blur-lg"
        {...fadeIn}
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-teal-400">Verificar Correo</h1>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
              <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-teal-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar código de verificación"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeVerification} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa el código de verificación"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-teal-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Verificar correo"}
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        {success && <p className="mt-4 text-center text-sm text-green-500">{success}</p>}

        <p className="mt-6 text-center text-sm">
          ¿Ya verificaste tu correo?{" "}
          <Link href="/login" className="text-teal-400 hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
