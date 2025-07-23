"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import axios from "axios";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function AccountRecoveryPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1); // 1: seleccionar método, 2: verificar código, 3: resetear contraseña
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint =
        method === "email"
          ? "http://localhost:3001/account-recovery/send-email"
          : "http://localhost:3001/account-recovery/send-sms";

      await axios.post(endpoint, { contact });
      setSuccess(
        `Se ha enviado un código a tu ${
          method === "email" ? "correo electrónico" : "número de teléfono"
        }.`
      );
      setStep(2);
    } catch (err) {
      setError("No se pudo enviar el código de recuperación. Por favor, verifica tu información.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:3001/account-recovery/verify-code", { contact, code });
      setSuccess("Código verificado correctamente.");
      setStep(3);
    } catch (err) {
      setError("Código inválido. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:3001/account-recovery/reset-password", {
        contact,
        code,
        newPassword,
      });
      setSuccess("¡Contraseña actualizada exitosamente!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError("No se pudo actualizar la contraseña. Por favor, intenta de nuevo.");
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
        <h1 className="text-3xl font-bold text-center mb-6 text-teal-400">
          Recuperación Avanzada de Cuenta
        </h1>

        {step === 1 && (
          <form onSubmit={handleMethodSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Método de Recuperación</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as "email" | "phone")}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="email">Correo Electrónico</option>
                <option value="phone">Teléfono</option>
              </select>
            </div>
            <div className="relative">
              <input
                type={method === "email" ? "email" : "text"}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={
                  method === "email" ? "Correo Electrónico" : "Número de Teléfono"
                }
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
              {method === "email" ? (
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              ) : (
                <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-teal-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar Código"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeVerification} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de Recuperación"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-teal-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Verificar Código"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva Contraseña"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Contraseña"
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-teal-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        {success && <p className="mt-4 text-center text-sm text-green-500">{success}</p>}

        <p className="mt-6 text-center text-sm">
          ¿Recordaste tu contraseña?{" "}
          <Link href="/login" className="text-teal-400 hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
