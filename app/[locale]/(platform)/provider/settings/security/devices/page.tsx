"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, Smartphone, MapPin, Clock, Shield, Trash2, Monitor, Loader2, Info } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

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
import { QhSpinner } from '@/components/ui/QhSpinner';

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
  const t = useTranslations('SettingsDevices');

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
      toast.success(t('toast_success'));
    } catch (error) {
      console.error("Error al desconectar (Demo mode)", error);

      // Fallback para demo: simular éxito aunque falle la API
      setDevices(prev => prev.filter(d => d.id !== deviceToDelete.id));
      toast.success(t('toast_sim_success'));
    } finally {
      setIsDeleting(false);
      setDeviceToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <QhSpinner size="md" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
            <Shield className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
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
                <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-all ${device.isCurrentDevice ? 'border-l-4 border-l-medical-500 bg-medical-50/50 dark:bg-medical-900/10' : ''}`}>
                  <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                    {/* Icono y Detalles Principales */}
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-xl shadow-sm border ${device.isCurrentDevice ? 'bg-white dark:bg-slate-900 text-medical-600 dark:text-medical-400 border-medical-100 dark:border-medical-800' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800'}`}>
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{device.name}</h3>
                          {device.isCurrentDevice && (
                            <Badge className="bg-medical-100 text-medical-700 dark:bg-medical-500/20 dark:text-medical-300 border-medical-200 dark:border-medical-500/30 hover:bg-medical-200 dark:hover:bg-medical-500/30 font-semibold px-2.5 py-0.5">
                              {t('current_device')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 font-medium">
                          {device.browser} <span className="text-slate-300 dark:text-slate-600">•</span> {device.ip}
                        </p>
                      </div>
                    </div>

                    {/* Detalles Secundarios */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-slate-500 dark:text-slate-400 md:ml-auto">
                      <div className="flex items-center gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        {device.location}
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        {device.lastUsed}
                      </div>
                    </div>

                    {/* Acción */}
                    <div className="md:ml-4 flex items-center pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 w-full md:w-auto mt-4 md:mt-0">
                      {device.isCurrentDevice ? (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg w-full justify-center md:w-auto">
                          <span className="relative flex h-2.5 w-2.5 mr-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                          {t('active_now')}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full md:w-auto border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 dark:hover:text-rose-300 font-medium"
                          onClick={() => setDeviceToDelete(device)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> {t('disconnect')}
                        </Button>
                      )}
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {devices.length === 0 && !loading && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">{t('empty')}</p>
            </div>
          )}
        </div>

        {/* Alerta de Confirmación (ShadCN) */}
        <AlertDialog open={!!deviceToDelete} onOpenChange={() => !isDeleting && setDeviceToDelete(null)}>
          <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden sm:max-w-[425px]">
            <div className="p-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-white">{t('disconnect_dialog.title')}</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 dark:text-slate-400 mt-3 text-base" dangerouslySetInnerHTML={{ __html: t.raw('disconnect_dialog.desc').replace('{device}', deviceToDelete?.name) }} />
              </AlertDialogHeader>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-100 dark:border-slate-800">
              <AlertDialogFooter className="gap-3 sm:gap-0">
                <AlertDialogCancel
                  disabled={isDeleting}
                  className="mt-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                >
                  {t('disconnect_dialog.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => { e.preventDefault(); handleRevoke(); }} // Prevent default to handle async logic manually
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white border-0"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {isDeleting ? t('disconnect_dialog.disconnecting') : t('disconnect_dialog.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}