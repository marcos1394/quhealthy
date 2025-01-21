"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Lock, 
  Shield, 
  Laptop, 
  Clock, 
  Activity, 
  Bell 
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const securityOptions = [
  {
    id: "password-rules",
    title: "Reglas de Contraseña",
    description: "Configura reglas avanzadas para contraseñas seguras.",
    icon: <Lock className="w-8 h-8 text-teal-400" />,
    link: "/quhealthy/authentication/security/passwordrules",
  },
  {
    id: "login-alerts",
    title: "Alertas de Inicio de Sesión",
    description: "Recibe notificaciones de logins sospechosos.",
    icon: <Bell className="w-8 h-8 text-teal-400" />,
    link: "/quhealthy/authentication/security/loginalerts",
  },
  {
    id: "device-management",
    title: "Dispositivos Confiables",
    description: "Administra los dispositivos confiables vinculados a tu cuenta.",
    icon: <Laptop className="w-8 h-8 text-teal-400" />, // Ícono alternativo
    link: "/quhealthy/authentication/security/devicemanagement",
  },
  {
    id: "activity-logs",
    title: "Historial de Actividades",
    description: "Consulta el historial completo de actividades de tu cuenta.",
    icon: <Activity className="w-8 h-8 text-teal-400" />,
    link: "/quhealthy/authentication/security/activitylogs",
  },
  {
    id: "lockout-settings",
    title: "Bloqueo de Cuenta",
    description: "Configura bloqueos en caso de intentos fallidos de acceso.",
    icon: <Shield className="w-8 h-8 text-teal-400" />,
    link: "/quhealthy/authentication/security/lockoutsettings",
  },
];

export default function AccountSecurity() {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8"
      {...fadeIn}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Shield className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Configuración de Seguridad
          </h1>
          <p className="text-gray-400 text-lg">
            Administra y protege tu cuenta con nuestras herramientas avanzadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityOptions.map((option) => (
            <Link key={option.id} href={option.link} passHref>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer transition-transform"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gray-700 rounded-lg">{option.icon}</div>
                  <div>
                    <h2 className="text-xl font-semibold text-teal-300">
                      {option.title}
                    </h2>
                    <p className="text-sm text-gray-400">{option.description}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Clock className="w-6 h-6 text-gray-400 hover:text-teal-300 transition-colors" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
