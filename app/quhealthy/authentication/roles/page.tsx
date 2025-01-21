"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User,
  UserCog,
  ArrowRight,
  Calendar,
  Settings,
  Users,
  ScrollText,
  Bell,
  Heart,
  Stethoscope,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async (role: string) => {
    try {
      setIsLoading(true);
      setSelectedRole(role);
      
      // Simular una pequeña carga para mejor UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      localStorage.setItem("userRole", role);
      toast.success(`Rol de ${role === "patient" ? "Paciente" : "Proveedor"} seleccionado`, {
        icon: role === "patient" ? 
          <User className="w-5 h-5 text-green-400" /> : 
          <UserCog className="w-5 h-5 text-green-400" />
      });
      
      router.push(role === "patient" ? "/dashboard/patient" : "/dashboard/provider");
    } catch (error) {
      toast.error("Error al seleccionar el rol", {
        icon: <AlertCircle className="w-5 h-5 text-red-400" />
      });
    }
  };

  const roleCards = [
    {
      id: "patient",
      title: "Paciente",
      description: "Accede a servicios de salud y belleza personalizados",
      icon: <User className="w-6 h-6" />,
      features: [
        { icon: <Calendar className="w-4 h-4" />, text: "Agenda citas fácilmente" },
        { icon: <Heart className="w-4 h-4" />, text: "Seguimiento de tratamientos" },
        { icon: <Bell className="w-4 h-4" />, text: "Recordatorios personalizados" }
      ]
    },
    {
      id: "provider",
      title: "Proveedor",
      description: "Gestiona tus servicios y conecta con pacientes",
      icon: <UserCog className="w-6 h-6" />,
      features: [
        { icon: <Users className="w-4 h-4" />, text: "Gestión de pacientes" },
        { icon: <ScrollText className="w-4 h-4" />, text: "Control de agenda" },
        { icon: <Settings className="w-4 h-4" />, text: "Configuración de servicios" }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Stethoscope className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Bienvenido a QuHealthy
            </h1>
            <p className="text-gray-300 text-lg">
              Selecciona tu rol para acceder a las funcionalidades personalizadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roleCards.map((role) => (
              <motion.div
                key={role.id}
                className={`
                  bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden
                  ${selectedRole === role.id ? 'ring-2 ring-teal-400' : ''}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.button
                  onClick={() => handleRoleSelection(role.id)}
                  className="w-full h-full text-left"
                  disabled={isLoading}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-teal-500/20 rounded-lg text-teal-400">
                        {role.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {role.title}
                        </h2>
                        <p className="text-sm text-gray-400">
                          {role.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {role.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <div className="p-1.5 bg-gray-700/50 rounded text-teal-400">
                            {feature.icon}
                          </div>
                          <span className="text-sm">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <motion.div
                        className="p-2 bg-teal-500/20 rounded-lg text-teal-400"
                        whileHover={{ x: 5 }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {selectedRole === role.id && isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}