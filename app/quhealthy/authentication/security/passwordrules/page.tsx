"use client";

import React, { useState } from "react";
import { Lock, CheckCircle, AlertCircle, Save } from "lucide-react";
import { toast } from "react-toastify";

export default function PasswordRules() {
  const [minLength, setMinLength] = useState(8);
  const [specialChars, setSpecialChars] = useState(true);
  const [uppercase, setUppercase] = useState(true);

  const handleSave = () => {
    toast.success(
      `Configuración guardada:\n
      - Longitud mínima: ${minLength}\n
      - Caracteres especiales: ${specialChars ? "Sí" : "No"}\n
      - Mayúsculas: ${uppercase ? "Sí" : "No"}`,
      {
        icon: <CheckCircle className="text-teal-500 w-6 h-6" />,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-8 h-8 text-teal-400" />
          <h1 className="text-2xl font-bold text-teal-400">Reglas de Contraseña</h1>
        </div>

        {/* Longitud mínima */}
        <div className="mb-4">
          <label htmlFor="minLength" className="block text-sm mb-2">
            Longitud Mínima:
          </label>
          <input
            id="minLength"
            type="number"
            value={minLength}
            onChange={(e) => setMinLength(Number(e.target.value))}
            className="w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            min={1}
          />
        </div>

        {/* Caracteres especiales */}
        <div className="flex items-center gap-3 mb-4">
          <input
            id="specialChars"
            type="checkbox"
            checked={specialChars}
            onChange={(e) => setSpecialChars(e.target.checked)}
            className="w-5 h-5 text-teal-500 focus:ring-teal-500 rounded focus:outline-none"
          />
          <label htmlFor="specialChars" className="text-sm">
            Requiere Caracteres Especiales
          </label>
        </div>

        {/* Mayúsculas */}
        <div className="flex items-center gap-3 mb-6">
          <input
            id="uppercase"
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="w-5 h-5 text-teal-500 focus:ring-teal-500 rounded focus:outline-none"
          />
          <label htmlFor="uppercase" className="text-sm">
            Requiere Mayúsculas
          </label>
        </div>

        {/* Botón Guardar */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white py-3 px-6 rounded-md hover:bg-teal-600 transition-all"
        >
          <Save className="w-5 h-5" />
          Guardar Configuración
        </button>

        {/* Mensaje de advertencia */}
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          Asegúrate de cumplir con los estándares de seguridad al definir estas reglas.
        </div>
      </div>
    </div>
  );
}
