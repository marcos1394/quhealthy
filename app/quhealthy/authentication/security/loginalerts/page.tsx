"use client";

import React, { useState } from "react";
import { Switch } from "@headlessui/react";
import { Bell, BellOff, Clock, Settings, Mail, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginAlerts() {
  const [enabled, setEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState("24/7");

  const toggleAlerts = () => setEnabled(!enabled);

  const handleSaveSettings = () => {
    alert(`
      Configuración guardada:
      Notificaciones: ${enabled ? "Activadas" : "Desactivadas"}
      Por correo: ${emailEnabled ? "Sí" : "No"}
      Por SMS: ${smsEnabled ? "Sí" : "No"}
      Horario: ${notificationTime}
    `);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-lg w-full bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
        {/* Encabezado */}
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-8 h-8 text-teal-400" />
          ) : (
            <BellOff className="w-8 h-8 text-red-400" />
          )}
          <h1 className="text-2xl font-bold text-teal-400">
            Configuración de Notificaciones
          </h1>
        </div>

        {/* Estado general de alertas */}
        <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
          <span className="text-white font-medium">Notificaciones</span>
          <Switch
            checked={enabled}
            onChange={toggleAlerts}
            className={`${
              enabled ? "bg-teal-500" : "bg-red-500"
            } relative inline-flex items-center h-6 rounded-full w-12 transition-colors`}
          >
            <span
              className={`${
                enabled ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </Switch>
        </div>

        {/* Configuración detallada */}
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-6"
          >
            {/* Opciones de tipo de notificación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-300 mb-2">
                Tipo de Notificaciones
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="email"
                    checked={emailEnabled}
                    onChange={() => setEmailEnabled(!emailEnabled)}
                    className="accent-teal-500 w-4 h-4"
                  />
                  <label htmlFor="email" className="text-gray-400">
                    <Mail className="inline-block w-5 h-5 mr-2 text-teal-400" />
                    Por correo
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sms"
                    checked={smsEnabled}
                    onChange={() => setSmsEnabled(!smsEnabled)}
                    className="accent-teal-500 w-4 h-4"
                  />
                  <label htmlFor="sms" className="text-gray-400">
                    <Smartphone className="inline-block w-5 h-5 mr-2 text-teal-400" />
                    Por SMS
                  </label>
                </div>
              </div>
            </div>

            {/* Configuración de horarios */}
            <div>
              <h2 className="text-lg font-semibold text-gray-300 mb-2">
                Horario de Notificaciones
              </h2>
              <select
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="w-full bg-gray-700 text-white py-2 px-3 rounded-md focus:ring-2 focus:ring-teal-500"
              >
                <option value="24/7">24/7</option>
                <option value="Solo horarios laborales">
                  Solo horarios laborales
                </option>
                <option value="Personalizado">Personalizado</option>
              </select>
            </div>

            {/* Botón de Guardar */}
            <button
              onClick={handleSaveSettings}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md transition-all"
            >
              Guardar Configuración
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
