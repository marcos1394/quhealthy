"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, Smartphone, MapPin, Clock, Shield, Trash2, Monitor, Loader2, Info } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Tipos
interface Device {
  id: number;
  name: string;
  type: "laptop" | "mobile" | "tablet" | "desktop";
  lastUsed: string;
  location: string;
  browser: string;
  ip: string;
  isCurrentDevice: boolean;
}

// Mock Data (Fallback)
const mockDevices: Device[] = [
  {
    id: 1,
    name: "MacBook Pro",
    type: "laptop",
    lastUsed: "Ahora",
    location: "CDMX, México",
    browser: "Chrome 120.0",
    ip: "189.203.10.5",
    isCurrentDevice: true,
  },
  {
    id: 2,
    name: "iPhone 14 Pro",
    type: "mobile",
    lastUsed: "Hace 2 horas",
    location: "CDMX, México",
    browser: "Safari Mobile",
    ip: "189.203.10.5",
    isCurrentDevice: false,
  },
  {
    id: 3,
    name: "Windows Desktop",
    type: "desktop",
    lastUsed: "5 de Enero, 2025",
    location: "Guadalajara, México",
    browser: "Edge",
    ip: "45.23.11.90",
    isCurrentDevice: false,
  },
];

export default function DeviceManagementPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch de Dispositivos
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/security/devices');
        setDevices(response.data);
      } catch (error) {
        console.warn("API no disponible, cargando mocks:", error);
        setDevices(mockDevices);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "laptop": return <Laptop className="w-6 h-6" />;
      case "mobile": return <Smartphone className="w-6 h-6" />;
      case "desktop": return <Monitor className="w-6 h-6" />;
      default: return <Laptop className="w-6 h-6" />;
    }
  };

  // 2. Manejar Revocación
  const handleRevoke = async () => {
    if (!deviceToDelete) return;
    setIsDeleting(true);

    try {
      // Intentar llamada real a la API
      await axios.delete(`/api/security/devices/${deviceToDelete.id}`);
      
      // Actualizar estado si éxito
      setDevices(prev => prev.filter(d => d.id !== deviceToDelete.id));
      toast.success("Dispositivo desconectado correctamente");
    } catch (error) {
      console.error("Error al desconectar (Demo mode)", error);
      
      // Fallback para demo: simular éxito aunque falle la API
      setDevices(prev => prev.filter(d => d.id !== deviceToDelete.id));
      toast.success("Dispositivo desconectado (Simulación)");
    } finally {
      setIsDeleting(false);
      setDeviceToDelete(null);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-gray-400 text-sm">Cargando dispositivos...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Shield className="w-8 h-8 text-purple-500" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dispositivos Conectados</h1>
            <p className="text-gray-400 mt-1">Gestiona los dispositivos que tienen acceso a tu cuenta.</p>
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
              layout
            >
              <Card className={`border-gray-800 bg-gray-900/50 transition-all ${device.isCurrentDevice ? 'border-l-4 border-l-purple-500 bg-purple-900/5' : ''}`}>
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  {/* Icono y Detalles Principales */}
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${device.isCurrentDevice ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-white">{device.name}</h3>
                        {device.isCurrentDevice && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 border-0">
                            Este dispositivo
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm flex items-center gap-2">
                        {device.browser} <span className="text-gray-600">•</span> {device.ip}
                      </p>
                    </div>
                  </div>

                  {/* Detalles Secundarios */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-gray-400 md:ml-auto">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {device.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {device.lastUsed}
                    </div>
                  </div>

                  {/* Acción */}
                  <div className="md:ml-4 flex items-center">
                    {device.isCurrentDevice ? (
                        <div className="flex items-center text-emerald-500 text-sm font-medium px-3 py-2 bg-emerald-500/10 rounded-lg">
                            <span className="relative flex h-2 w-2 mr-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Activo ahora
                        </div>
                    ) : (
                        <Button 
                            variant="outline" 
                            className="border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-900/50 transition-colors"
                            onClick={() => setDeviceToDelete(device)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Desconectar
                        </Button>
                    )}
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {devices.length === 0 && !loading && (
            <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                <Info className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No se encontraron dispositivos conectados.</p>
            </div>
        )}
      </div>

      {/* Alerta de Confirmación (ShadCN) */}
      <AlertDialog open={!!deviceToDelete} onOpenChange={() => !isDeleting && setDeviceToDelete(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Desconectar dispositivo?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Se cerrará la sesión en <strong>{deviceToDelete?.name}</strong>. Si el dispositivo está siendo usado por alguien más, perderá el acceso inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
                disabled={isDeleting}
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
                Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
                onClick={(e) => { e.preventDefault(); handleRevoke(); }} // Prevent default to handle async logic manually
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {isDeleting ? "Desconectando..." : "Sí, desconectar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}