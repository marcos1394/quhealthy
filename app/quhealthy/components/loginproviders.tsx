"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Link2,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Settings,
  RefreshCw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const providers = [
  { 
    name: "Google",
    icon: "🔑",
    status: "unlinked",
    benefits: [
      "Inicio de sesión con un clic",
      "Sincronización de contactos",
      "Respaldo de datos"
    ]
  },
  { 
    name: "Facebook",
    icon: "📱",
    status: "linked",
    lastUsed: "2025-01-08 14:30",
    benefits: [
      "Compartir contenido social",
      "Conexión con amigos",
      "Eventos sincronizados"
    ]
  },
  { 
    name: "Discord",
    icon: "💬",
    status: "linked",
    lastUsed: "2025-01-07 09:15",
    benefits: [
      "Chat en tiempo real",
      "Notificaciones instantáneas",
      "Compartir estados"
    ]
  }
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

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

export default function LoginProviders() {
  const [linking, setLinking] = React.useState<string | null>(null);
  const [showDetails, setShowDetails] = React.useState<string | null>(null);

  const handleLinkProvider = (providerName: string) => {
    setLinking(providerName);
    // Simulate API call
    setTimeout(() => {
      setLinking(null);
      alert(`Vinculado con ${providerName}`);
    }, 1500);
  };

  const handleUnlinkProvider = (providerName: string) => {
    setLinking(providerName);
    // Simulate API call
    setTimeout(() => {
      setLinking(null);
      alert(`Desvinculado de ${providerName}`);
    }, 1500);
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8"
      {...fadeIn}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Lock className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Métodos de Inicio de Sesión
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            Gestiona tus opciones de autenticación y seguridad
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <motion.div 
              className="grid grid-cols-1 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {providers.map((provider) => (
                <motion.div
                  key={provider.name}
                  variants={itemVariants}
                  className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-all"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-700 rounded-lg text-2xl">
                      {provider.icon}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-teal-300">
                            {provider.name}
                          </h3>
                          <span className="flex items-center gap-1 text-sm">
                            {provider.status === "linked" ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-400" />
                            )}
                            <span className={provider.status === "linked" ? "text-green-400" : "text-yellow-400"}>
                              {provider.status === "linked" ? "Vinculado" : "No vinculado"}
                            </span>
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                            onClick={() => setShowDetails(
                              showDetails === provider.name ? null : provider.name
                            )}
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                              provider.status === "linked"
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                : "bg-teal-500/10 hover:bg-teal-500/20 text-teal-400"
                            }`}
                            onClick={() => provider.status === "linked" 
                              ? handleUnlinkProvider(provider.name)
                              : handleLinkProvider(provider.name)
                            }
                            disabled={linking === provider.name}
                          >
                            {linking === provider.name ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : provider.status === "linked" ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                            <span className="text-sm">
                              {provider.status === "linked" ? "Desvincular" : "Vincular"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {provider.lastUsed && (
                        <div className="text-sm text-gray-400">
                          Último uso: {provider.lastUsed}
                        </div>
                      )}

                      {showDetails === provider.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4"
                        >
                          <Alert className="bg-gray-700/50 border-gray-600">
                            <Shield className="w-4 h-4 text-teal-400" />
                            <AlertDescription>
                              <h4 className="font-medium text-teal-300 mb-2">Beneficios de {provider.name}</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {provider.benefits.map((benefit, index) => (
                                  <li key={index} className="text-gray-400">
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}