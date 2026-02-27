/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Laptop, 
  Smartphone, 
  Globe, 
  Clock, 
  LogOut, 
  ShieldCheck, 
  MoreVertical,
  Monitor
} from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Tipos
interface Session {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceName: string; // Ej: Chrome en Windows
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  browser: string;
}

// Datos Mock (Simulando respuesta del Backend)
const initialSessions: Session[] = [
  {
    id: "current-123",
    deviceType: "desktop",
    deviceName: "Chrome en Windows 11",
    location: "CDMX, México",
    ip: "189.203.10.5",
    lastActive: "Activo ahora",
    isCurrent: true,
    browser: "Chrome 120.0"
  },
  {
    id: "sess-456",
    deviceType: "mobile",
    deviceName: "Safari en iPhone 14",
    location: "Guadalajara, México",
    ip: "45.23.11.90",
    lastActive: "Hace 2 horas",
    isCurrent: false,
    browser: "Mobile Safari"
  },
  {
    id: "sess-789",
    deviceType: "desktop",
    deviceName: "Firefox en MacOS",
    location: "Monterrey, México",
    ip: "201.10.55.2",
    lastActive: "Hace 1 día",
    isCurrent: false,
    browser: "Firefox 118.0"
  },
];

export default function SessionManagementPage() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [loading, setLoading] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "mobile": return <Smartphone className="w-5 h-5" />;
      case "tablet": return <Monitor className="w-5 h-5" />; // Usando Monitor como fallback de tablet si no hay icono específico
      default: return <Laptop className="w-5 h-5" />;
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    // API Call: await axios.delete(`/api/sessions/${sessionId}`)
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    toast.success("Sesión cerrada correctamente");
  };

  const handleRevokeAll = () => {
    setLoading(true);
    // API Call: await axios.delete('/api/sessions/revoke-all')
    setTimeout(() => {
        setSessions(prev => prev.filter(s => s.isCurrent)); // Dejar solo la actual
        setLoading(false);
        toast.success("Se han cerrado todas las demás sesiones");
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <ShieldCheck className="w-8 h-8 text-purple-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Sesiones Activas</h1>
                <p className="text-gray-400 mt-1">Administra dónde has iniciado sesión con tu cuenta.</p>
            </div>
        </div>

        {sessions.length > 1 && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50">
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar todas las demás
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esto cerrará la sesión en todos los dispositivos excepto en el que estás usando ahora. Tendrás que volver a ingresar en ellos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRevokeAll} className="bg-red-600 hover:bg-red-700 text-white">
                            Sí, cerrar sesiones
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </div>

      {/* Lista de Sesiones */}
      <div className="grid gap-6">
        
        {/* Sesión Actual (Destacada) */}
        {sessions.filter(s => s.isCurrent).map(session => (
            <Card key={session.id} className="bg-purple-900/10 border-purple-500/30 border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="p-3 bg-purple-500 rounded-lg text-white h-fit">
                                {getIcon(session.deviceType)}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white text-lg">{session.deviceName}</h3>
                                    <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-0">Actual</Badge>
                                </div>
                                <p className="text-gray-300 text-sm">{session.browser}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {session.ip}</span>
                                    <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {session.location}</span>
                                    <span className="text-emerald-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Activo ahora</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}

        <Separator className="bg-gray-800" />

        {/* Otras Sesiones */}
        <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider ml-1">Otras sesiones activas</h3>
            
            {sessions.filter(s => !s.isCurrent).length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800 border-dashed">
                    <p>No hay otras sesiones activas.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {sessions.filter(s => !s.isCurrent).map(session => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-900 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-800 rounded-lg text-gray-400">
                                                {getIcon(session.deviceType)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-200">{session.deviceName}</h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span>{session.location}</span>
                                                    <span>•</span>
                                                    <span>{session.lastActive}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="default" className="text-gray-400 hover:text-white">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                                <DropdownMenuItem 
                                                    className="text-red-400 focus:text-red-300 focus:bg-red-900/20 cursor-pointer"
                                                    onClick={() => handleRevokeSession(session.id)}
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}