"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Mail, Smartphone, Save, Loader2, Info } from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginAlertsPage() {
  const [enabled, setEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState("always");
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    
    // Simulación API
    // await axios.put('/api/settings/notifications', { ... });
    
    setTimeout(() => {
        setLoading(false);
        toast.success("Configuración de alertas actualizada");
    }, 1000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <Bell className="w-8 h-8 text-purple-500" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Alertas de Inicio de Sesión</h1>
            <p className="text-gray-400 mt-1">Recibe notificaciones sobre actividad sospechosa en tu cuenta.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-gray-800 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-white">Estado de Alertas</CardTitle>
                    <CardDescription>
                        Activa o desactiva todas las notificaciones de seguridad.
                    </CardDescription>
                </div>
                <Switch 
                    checked={enabled} 
                    onCheckedChange={setEnabled}
                    className="data-[state=checked]:bg-purple-600"
                />
            </div>
          </CardHeader>
          
          <Separator className="bg-gray-800" />

          <AnimatePresence>
            {enabled && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <CardContent className="space-y-6 pt-6">
                        
                        {/* Canales */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Canales de envío</h3>
                            
                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-gray-950/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-md">
                                        <Mail className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Correo Electrónico</p>
                                        <p className="text-xs text-gray-500">Enviar a tu@email.com</p>
                                    </div>
                                </div>
                                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-800 bg-gray-950/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-800 rounded-md">
                                        <Smartphone className="w-5 h-5 text-gray-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Mensaje SMS</p>
                                        <p className="text-xs text-gray-500">Pueden aplicar cargos</p>
                                    </div>
                                </div>
                                <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                            </div>
                        </div>

                        {/* Frecuencia / Horario */}
                        <div className="space-y-3">
                            <Label className="text-gray-300">Frecuencia de Notificación</Label>
                            <Select value={notificationTime} onValueChange={setNotificationTime}>
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Selecciona horario" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                    <SelectItem value="always">Siempre (24/7)</SelectItem>
                                    <SelectItem value="suspicous">Solo actividad de alto riesgo</SelectItem>
                                    <SelectItem value="new_device">Solo nuevos dispositivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg flex gap-3">
                            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-200">
                                Te recomendamos mantener activadas las alertas por correo para recibir avisos inmediatos si alguien accede a tu cuenta desde una ubicación desconocida.
                            </p>
                        </div>

                    </CardContent>
                </motion.div>
            )}
          </AnimatePresence>

          <CardFooter className="border-t border-gray-800 pt-6 flex justify-end">
            <Button 
                onClick={handleSaveSettings} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px]"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                    </>
                )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}