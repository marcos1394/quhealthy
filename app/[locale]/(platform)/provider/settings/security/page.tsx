"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Lock, 
  Shield, 
  Laptop, 
  Activity, 
  Bell, 
  Smartphone,
  ChevronRight
} from "lucide-react";

// ShadCN UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Configuración de las opciones de seguridad
const securityOptions = [
  {
    id: "2fa",
    title: "Autenticación de Dos Pasos (2FA)",
    description: "Añade una capa extra de seguridad a tu cuenta usando tu celular.",
    icon: Smartphone,
    link: "/settings/2fa", // Ruta corregida hacia el componente que hicimos antes
    status: "Recomendado",
    color: "text-purple-400"
  },
  {
    id: "password",
    title: "Contraseña",
    description: "Cambia tu contraseña o configura reglas de complejidad.",
    icon: Lock,
    link: "/settings/security/password",
    color: "text-blue-400"
  },
  {
    id: "login-alerts",
    title: "Alertas de Inicio de Sesión",
    description: "Recibe notificaciones cuando alguien entre desde un dispositivo nuevo.",
    icon: Bell,
    link: "/settings/security/alerts",
    color: "text-yellow-400"
  },
  {
    id: "devices",
    title: "Dispositivos Conectados",
    description: "Revisa y cierra sesión en dispositivos que no reconozcas.",
    icon: Laptop,
    link: "/settings/security/devices",
    color: "text-emerald-400"
  },
  {
    id: "activity",
    title: "Historial de Actividad",
    description: "Auditoría completa de acciones realizadas en tu cuenta.",
    icon: Activity,
    link: "/settings/security/activity",
    color: "text-orange-400"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Encabezado de la Sección */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Shield className="w-8 h-8 text-purple-500" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Centro de Seguridad</h1>
            <p className="text-gray-400 mt-1">Gestiona la protección de tu cuenta y datos sensibles.</p>
        </div>
      </div>

      {/* Grid de Opciones */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {securityOptions.map((option) => {
          const Icon = option.icon;
          
          return (
            <Link key={option.id} href={option.link} className="block group h-full">
              <motion.div variants={itemVariants} className="h-full">
                <Card className="h-full bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10 group-hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-3 rounded-lg bg-gray-800 group-hover:bg-gray-700 transition-colors ${option.color}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        {option.status && (
                            <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-800 text-[10px]">
                                {option.status}
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {option.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-sm leading-relaxed mb-4">
                        {option.description}
                    </CardDescription>
                    
                    <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors mt-auto pt-2">
                        Configurar <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}