"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaGoogle, FaGithub, FaDiscord } from "react-icons/fa";
import axios from "axios";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
  
    try {
      const response = await axios.post("http://localhost:3001/auth/login", {
        email: formData.email,
        password: formData.password,
      });
  
      if (response.data.success) {
        setSuccess("Inicio de sesión exitoso. ¡Bienvenido de nuevo!");
      } else {
        setError(response.data.message || "Credenciales incorrectas. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.get(`http://localhost:3001/auth/${provider}`);
      if (response.data.success) {
        setSuccess(`Inicio de sesión con ${provider} exitoso. ¡Bienvenido!`);
      } else {
        setError(`Error al iniciar sesión con ${provider}.`);
      }
    } catch (err) {
      console.error(err);
      setError(`Ocurrió un error inesperado con ${provider}. Por favor, intenta de nuevo.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center relative p-4">
      {/* Neon Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-pink-500 opacity-30 blur-2xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 opacity-30 blur-2xl animate-pulse delay-2000" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md p-8 rounded-lg shadow-lg bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 backdrop-blur-lg"
        {...fadeIn}
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-teal-400">Iniciar Sesión</h1>

        {/* Mensajes de éxito y error */}
        {error && (
          <div className="bg-red-500 text-white text-center py-2 px-4 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500 text-white text-center py-2 px-4 rounded mb-4">
            {success}
          </div>
        )}

        {/* Formulario de inicio de sesión */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="Ingresa tu Correo Electronico"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Ingresa tu Contraseña"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-teal-600"
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="my-6 border-t border-gray-600" />

        {/* Inicio de sesión con terceros */}
        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin("google")}
            className="w-full bg-red-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-red-600 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <FaGoogle size={20} /> {loading ? "Conectando..." : "Iniciar con Google"}
          </button>
          <button
            onClick={() => handleSocialLogin("github")}
            className="w-full bg-gray-700 text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-800 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <FaGithub size={20} /> {loading ? "Conectando..." : "Iniciar con GitHub"}
          </button>
          <button
            onClick={() => handleSocialLogin("discord")}
            className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-purple-700 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <FaDiscord size={20} /> {loading ? "Conectando..." : "Iniciar con Discord"}
          </button>
        </div>

        <p className="mt-4 text-center text-sm">
          <Link href="/quhealthy/recovery" className="text-teal-400 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/quhealthy/signup" className="text-teal-400 hover:underline">
            Regístrate
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
