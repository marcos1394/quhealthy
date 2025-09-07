"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Link2,
  Shield,
  AlertCircle,
  CheckCircle2,
  Eye,
  XCircle,
  Settings,
  RefreshCw
} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const platforms = [
  { 
    name: "QuHealthy", 
    status: "active", 
    lastSync: "2025-01-08 14:30",
    permissions: [
      "Ver perfil médico",
      "Acceder al historial clínico",
      "Gestionar citas médicas"
    ],
    icon: "💊"
  },
  { 
    name: "QuMarket", 
    status: "active", 
    lastSync: "2025-01-08 13:15",
    permissions: [
      "Procesar pagos",
      "Ver historial de compras",
      "Gestionar direcciones"
    ],
    icon: "🛒"
  }
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function ConnectedPlatforms() {
  const [showPermissions, setShowPermissions] = React.useState<string | null>(null);
  const [revoking, setRevoking] = React.useState<string | null>(null);

  const handleRevokeAccess = (platformName: string) => {
    setRevoking(platformName);
    // Simulate API call
    setTimeout(() => {
      setRevoking(null);
      alert(`Acceso revocado para ${platformName}`);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8"
      {...fadeIn}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Link2 className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Plataformas Vinculadas
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            Gestiona las conexiones y permisos de tus aplicaciones
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 space-y-6">
            {platforms.map((platform) => (
              <motion.div
                key={platform.name}
                className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-all"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-700 rounded-lg text-2xl">
                    {platform.icon}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-teal-300">
                          {platform.name}
                        </h3>
                        <span className="flex items-center gap-1 text-sm text-gray-400">
                          {getStatusIcon(platform.status)}
                          <span>{platform.status === "active" ? "Conectado" : "Error"}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                          onClick={() => setShowPermissions(
                            showPermissions === platform.name ? null : platform.name
                          )}
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button 
                          className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          className="flex items-center gap-2 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          onClick={() => handleRevokeAccess(platform.name)}
                          disabled={revoking === platform.name}
                        >
                          {revoking === platform.name ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm">Revocar</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400">
                      Última sincronización: {platform.lastSync}
                    </div>

                    {showPermissions === platform.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <Alert className="bg-gray-700/50 border-gray-600">
                          <Shield className="w-4 h-4 text-teal-400" />
                          <AlertDescription>
                            <h4 className="font-medium text-teal-300 mb-2">Permisos Otorgados</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {platform.permissions.map((permission, index) => (
                                <li key={index} className="text-gray-400">
                                  {permission}
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
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}