/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldAlert, Lock, Info, Check, Trash2, Key, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// ShadCN UI
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from '@/components/ui/QhSpinner';

// Tipos
interface Notification {
  id: string;
  type: "login" | "device" | "security" | "password";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// Mock Data (Fallback)
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "login",
    title: "Nuevo inicio de sesión",
    message: "Detectamos un acceso desde Chrome en Windows (México).",
    date: "Hace 2 horas",
    read: false,
  },
  {
    id: "2",
    type: "device",
    title: "Dispositivo eliminado",
    message: "El dispositivo 'iPhone 11' ha sido desconectado de tu cuenta.",
    date: "Ayer, 10:12 AM",
    read: true,
  },
  {
    id: "3",
    type: "password",
    title: "Contraseña actualizada",
    message: "Tu contraseña principal fue cambiada exitosamente via email.",
    date: "05 Ene, 2025",
    read: true,
  },
];

export default function SecurityNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar Notificaciones
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Intentar llamada real
        const response = await axios.get('/api/security/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.warn("API de notificaciones no disponible, usando mocks.");
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "login": return <ShieldAlert className="w-5 h-5 text-yellow-400" />;
      case "device": return <Lock className="w-5 h-5 text-blue-400" />;
      case "password": return <Key className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5 text-slate-400 dark:text-slate-500" />;
    }
  };

  // 2. Marcar todo como leído
  const markAllRead = async () => {
    try {
        // Optimistic UI Update
        const previousState = [...notifications];
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        
        // API Call
        await axios.post('/api/security/notifications/read-all');
        toast.success("Todas las notificaciones marcadas como leídas");
    } catch (error) {
        console.error("Error updating notifications status", error);
        // No revertimos el estado para no molestar al usuario en Demo mode
    }
  };

  // 3. Eliminar notificación individual
  const deleteNotification = async (id: string) => {
    try {
        // Optimistic UI Update
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // API Call
        await axios.delete(`/api/security/notifications/${id}`);
    } catch (error) {
        console.error("Error deleting notification", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-medical-500/10 rounded-xl border border-medical-500/20">
                <Bell className="w-8 h-8 text-purple-500" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Notificaciones de Seguridad</h1>
                <p className="text-slate-400 dark:text-slate-500 mt-1">Alertas importantes sobre la integridad de tu cuenta.</p>
            </div>
        </div>
        
        {notifications.length > 0 && (
            <Button 
                variant="outline" 
                size="sm"
                onClick={markAllRead}
                className="border-medical-500/30 text-medical-300 hover:bg-medical-500/20 hover:text-medical-200"
            >
                <Check className="w-4 h-4 mr-2" /> Marcar todo leído
            </Button>
        )}
      </div>

      <Card className="bg-slate-900 dark:bg-slate-950/90 backdrop-blur-xl border-slate-800 dark:border-slate-800/50 shadow-xl">
        <CardContent className="p-0">
            {loading ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-600 flex flex-col items-center gap-3">
                    <QhSpinner size="md" />
                    <p>Cargando alertas...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                    <div className="bg-slate-800 dark:bg-slate-900 p-4 rounded-full">
                        <Bell className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-medium">No tienes notificaciones recientes.</p>
                    <p className="text-gray-600 text-sm">Te avisaremos cuando suceda algo importante.</p>
                </div>
            ) : (
                <ScrollArea className="h-[500px] w-full rounded-md">
                    <div className="divide-y divide-gray-800">
                        <AnimatePresence>
                            {notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0, padding: 0 }}
                                    className={`p-6 flex gap-4 transition-colors hover:bg-slate-800 dark:bg-slate-900/30 group ${!notification.read ? 'bg-medical-900/10' : ''}`}
                                >
                                    {/* Icono */}
                                    <div className="mt-1 p-2 rounded-lg bg-slate-950 dark:bg-slate-950 border border-slate-800 dark:border-slate-800/50 h-fit">
                                        {getIcon(notification.type)}
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm font-semibold ${!notification.read ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {notification.title}
                                                {!notification.read && (
                                                    <Badge className="ml-2 bg-medical-600 hover:bg-medical-600 text-[10px] px-1.5 py-0 h-5">NUEVO</Badge>
                                                )}
                                            </h4>
                                            <span className="text-xs text-slate-500 dark:text-slate-600 whitespace-nowrap ml-4">
                                                {notification.date}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
                                            {notification.message}
                                        </p>
                                    </div>

                                    {/* Acciones (Solo visibles en hover) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center pl-2">
                                        <Button
                                            variant="ghost"
                                            size="default"
                                            className="h-8 w-8 text-slate-500 dark:text-slate-600 hover:text-red-400 hover:bg-red-900/20"
                                            onClick={() => deleteNotification(notification.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            )}
        </CardContent>
      </Card>
    </div>
  );
}