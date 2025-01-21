"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Save, ShieldCheck } from "lucide-react";

export default function LockoutSettings() {
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Mostrar confirmación por 3 segundos
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-lg w-full bg-gray-800 p-6 rounded-lg shadow-lg relative">
        {/* Header */}
        <h1 className="text-2xl font-bold text-teal-400 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-400" />
          Configuración de Bloqueo de Cuenta
        </h1>
        <p className="text-gray-400 mb-6">
          Configura el número máximo de intentos de inicio de sesión fallidos antes de que la cuenta sea bloqueada.
        </p>

        {/* Slider */}
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Máximo de Intentos Fallidos:{" "}
          <span className="text-teal-400 font-bold">{maxAttempts}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={maxAttempts}
          onChange={(e) => setMaxAttempts(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-teal"
        />

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full mt-6 bg-teal-500 text-white py-3 px-6 rounded-md hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Guardar Configuración
        </button>

        {/* Confirmation Alert */}
        {isSaved && (
          <motion.div
            className="absolute top-4 right-4 bg-teal-500 text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Configuración guardada correctamente</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
