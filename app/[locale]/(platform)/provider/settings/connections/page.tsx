"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Globe, 
  Trash2, 
  Plus, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Tipos
interface Connection {
  id: string;
  provider: "google" | "microsoft" | "github" | "facebook";
  email: string;
  connectedAt: string;
  status: "active" | "expired";
}

// Datos Mock (Fallback)
const mockConnections: Connection[] = [
  {
    id: "conn-1",
    provider: "google",
    email: "dr.marcos@gmail.com",
    connectedAt: "10 Ene, 2025",
    status: "active"
  },
  {
    id: "conn-2",
    provider: "microsoft",
    email: "marcos@hospital.com",
    connectedAt: "12 Dic, 2024",
    status: "expired" // Ejemplo de token vencido
  }
];

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>(mockConnections);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Simulación de conectar nuevo proveedor
  const handleConnect = (provider: string) => {
    setConnecting(provider);
    // Aquí redirigirías a tu endpoint de OAuth: window.location.href = `/api/auth/${provider}`
    setTimeout(() => {
        setConnecting(null);
        toast.info("Redirigiendo al proveedor de identidad...");
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    toast.success("Cuenta desconectada exitosamente");
  };

  const getProviderIcon = (provider: string) => {
    // En un proyecto real usarías SVGs de marcas. Aquí usamos texto/iconos genéricos.
    switch (provider) {
        case "google": return <span className="font-bold text-white">G</span>; // Placeholder
        case "microsoft": return <span className="font-bold text-blue-400">M</span>;
        case "github": return <span className="font-bold text-gray-400">Gh</span>;
        default: return <Globe className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProviderName = (provider: string) => {
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Shield className="w-8 h-8 text-purple-500" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Cuentas Conectadas (SSO)</h1>
            <p className="text-gray-400 mt-1">Gestiona los métodos de inicio de sesión externos.</p>
        </div>
      </div>

      <div className="grid gap-6">
        
        {/* Alerta Informativa */}
        <Alert className="bg-blue-900/10 border-blue-900/50 text-blue-200">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400 font-semibold">Seguridad SSO</AlertTitle>
            <AlertDescription className="text-xs mt-1">
                Al conectar una cuenta, podrás iniciar sesión con un solo clic. Si desconectas todas las cuentas, asegúrate de tener una contraseña establecida.
            </AlertDescription>
        </Alert>

        {/* Cuentas Activas */}
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white text-lg">Mis Conexiones</CardTitle>
                <CardDescription>Proveedores de identidad vinculados actualmente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {connections.length > 0 ? (
                    connections.map((conn) => (
                        <motion.div 
                            key={conn.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-xl group hover:border-gray-700 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                    {getProviderIcon(conn.provider)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-white">{getProviderName(conn.provider)}</h4>
                                        {conn.status === 'active' ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] h-5 px-1.5">Activo</Badge>
                                        ) : (
                                            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px] h-5 px-1.5 flex gap-1">
                                                <AlertCircle className="w-3 h-3" /> Reconectar
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{conn.email}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-600 hidden sm:block">Conectado el {conn.connectedAt}</span>
                                <Button 
                                    variant="ghost" 
                                    size="default"
                                    onClick={() => handleDisconnect(conn.id)}
                                    className="text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                        No tienes cuentas vinculadas.
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Añadir Nuevas Conexiones */}
        <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white text-lg">Añadir otra cuenta</CardTitle>
                <CardDescription>Vincula servicios adicionales para facilitar tu acceso.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {['google', 'microsoft', 'github'].map((provider) => {
                        const isConnected = connections.some(c => c.provider === provider);
                        if (isConnected) return null; // No mostrar si ya está conectado

                        return (
                            <Button
                                key={provider}
                                variant="outline"
                                className="h-auto py-4 bg-gray-950 border-gray-800 hover:bg-gray-800 hover:text-white justify-start gap-3"
                                onClick={() => handleConnect(provider)}
                                disabled={!!connecting}
                            >
                                {connecting === provider ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                        <Plus className="w-4 h-4 text-gray-400" />
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="font-semibold">{getProviderName(provider)}</p>
                                    <p className="text-xs text-gray-500">Conectar cuenta</p>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}