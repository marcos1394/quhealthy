"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Laptop, Smartphone, Trash2, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

import { securityService } from "@/services/security.service";
import { ActiveSessionResponse } from "@/types/security";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DevicesPage() {
  const t = useTranslations("SettingsSecurity");
  const [sessions, setSessions] = useState<ActiveSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await securityService.getActiveSessions();
      setSessions(data);
    } catch (error) {
      toast.error(t("devices.error_loading") || "Error cargando sesiones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    try {
      await securityService.revokeSession(sessionId);
      toast.success(t("devices.success_revoke") || "Sesión cerrada correctamente");
      setSessions(sessions.filter((s) => s.sessionId !== sessionId));
    } catch (error) {
      toast.error(t("devices.error_revoke") || "Error cerrando la sesión");
    }
  };

  const handleRevokeAll = async () => {
    try {
      await securityService.revokeAllExceptCurrent();
      toast.success(t("devices.success_revoke_all") || "Todas las demás sesiones fueron cerradas");
      fetchSessions();
    } catch (error) {
      toast.error(t("devices.error_revoke_all") || "Error cerrando las sesiones");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/provider/dashboard/settings" className="p-2 border border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
          </Link>
          <div className="p-3 bg-black dark:bg-white border border-black dark:border-white w-fit">
            <Laptop className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter text-black dark:text-white">
              {t("options.devices.title") || "Dispositivos y Sesiones"}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 mt-1">
              {t("options.devices.desc") || "Gestiona dónde has iniciado sesión"}
            </p>
          </div>
        </div>

        <Card className="bg-transparent border-black/20 dark:border-white/20 rounded-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold uppercase tracking-tight">
                  Sesiones Activas
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide mt-1">
                  Revisa dónde has iniciado sesión
                </CardDescription>
              </div>
              {sessions.length > 1 && (
                <Button 
                  onClick={handleRevokeAll}
                  variant="outline" 
                  className="rounded-none border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black uppercase text-[10px] tracking-widest font-bold h-8"
                >
                  <Shield className="w-3 h-3 mr-2" />
                  Cerrar todas las demás
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm uppercase tracking-wide">
                No hay sesiones activas encontradas.
              </div>
            ) : (
              sessions.map((session, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={session.sessionId} 
                  className="flex items-center justify-between p-4 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-black/5 dark:bg-white/5">
                      {session.deviceName?.toLowerCase().includes("mobile") || session.deviceName?.toLowerCase().includes("iphone") || session.deviceName?.toLowerCase().includes("android") ? (
                        <Smartphone className="w-5 h-5 opacity-70" />
                      ) : (
                        <Laptop className="w-5 h-5 opacity-70" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm uppercase tracking-tight">
                          {session.deviceName || "Dispositivo Desconocido"}
                        </span>
                        {session.current && (
                          <Badge variant="outline" className="bg-black text-white dark:bg-white dark:text-black text-[9px] uppercase tracking-widest px-1.5 py-0 rounded-none border-black dark:border-white">
                            Este Dispositivo
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center mt-1">
                        IP: {session.ipAddress} • Última act: {new Date(session.lastActiveAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(session.sessionId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-none h-8 w-8 p-0"
                      title="Cerrar esta sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
