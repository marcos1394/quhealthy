/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Settings, Save, X, Bell, Moon, Globe, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Componentes Personalizados (Asegúrate de que las rutas coincidan con donde los guardaste)
import { NotificationsTab, UserRole, NotificationPreferences } from '@/components/dashboard/preferences/NotificationsTab';
import { AppearanceTab } from '@/components/dashboard/preferences/AppearanceTab';
import { LanguageTab } from '@/components/dashboard/preferences/LanguageTab';
import { PrivacyTab } from '@/components/dashboard/preferences/PrivacyTab';

// Tipos Globales para la Página
interface AppPreferences {
  notifications: NotificationPreferences;
  appearance: { theme: string; reduceMotion: boolean; highContrast: boolean };
  language: string;
  currency: string;
  timeFormat: string;
  timeZone: string;
  privacy: { showOnlineStatus: boolean; showLastSeen: boolean; showProfile: string; allowMessages: string };
}

const initialPreferences: AppPreferences = {
  notifications: { 
    email: true, push: true, sms: false, 
    // Provider specific
    new_appointment: true, cancellations: true, reviews: true,
    // Consumer specific
    reminders: true, promotions: false, documents: true 
  },
  appearance: { theme: "dark", reduceMotion: false, highContrast: false },
  language: "es", 
  currency: "MXN", 
  timeFormat: "12",
  timeZone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  privacy: { showOnlineStatus: true, showLastSeen: true, showProfile: "all", allowMessages: "all" },
};

export default function SettingsPage() {
  // Simulación de rol (esto vendría de tu useSessionStore)
  // Cambia a 'consumer' para probar la vista del paciente
  const role: UserRole = "provider"; 

  const [preferences, setPreferences] = useState<AppPreferences>(initialPreferences);
  const [originalPreferences, setOriginalPreferences] = useState<AppPreferences>(initialPreferences);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Simulación de carga desde API
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    
    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalPreferences(preferences);
      setEditMode(false);
      setStatusMessage({ type: 'success', text: "Preferencias guardadas correctamente." });
      toast.success("Configuración actualizada.");
      
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: "No se pudieron guardar los cambios." });
      toast.error("Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPreferences(originalPreferences);
    setEditMode(false);
    setStatusMessage(null);
    toast.info("Cambios descartados.");
  };

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            <p className="text-gray-400 font-medium">Cargando configuración...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Card Principal */}
        <Card className="bg-gray-900 border-gray-800 shadow-xl">
            <CardHeader className="border-b border-gray-800 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                            <Settings className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Configuración</h1>
                            <p className="text-sm text-gray-400">Personaliza tu experiencia en QuHealthy.</p>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center gap-3">
                        {!editMode ? (
                            <Button 
                                onClick={() => setEditMode(true)} 
                                className="bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-lg hover:shadow-purple-500/20"
                            >
                                <Settings className="w-4 h-4 mr-2" /> Editar Preferencias
                            </Button>
                        ) : (
                            <>
                                <Button 
                                    variant="ghost" 
                                    onClick={handleCancel} 
                                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                                >
                                    <X className="w-4 h-4 mr-2" /> Cancelar
                                </Button>
                                <Button 
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Guardar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                
                {/* Mensajes de Estado */}
                {statusMessage && (
                    <Alert className={`mb-6 border ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <AlertDescription className="ml-2 font-medium">
                            {statusMessage.text}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Tabs de Configuración */}
                <Tabs defaultValue="notifications" className="space-y-8">
                    <TabsList className="bg-gray-950 border border-gray-800 p-1 w-full justify-start overflow-x-auto rounded-xl h-auto gap-1">
                        <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 py-2.5 px-4 rounded-lg transition-all">
                            <Bell className="w-4 h-4 mr-2" /> Notificaciones
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 py-2.5 px-4 rounded-lg transition-all">
                            <Moon className="w-4 h-4 mr-2" /> Apariencia
                        </TabsTrigger>
                        <TabsTrigger value="language" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 py-2.5 px-4 rounded-lg transition-all">
                            <Globe className="w-4 h-4 mr-2" /> Idioma
                        </TabsTrigger>
                        <TabsTrigger value="privacy" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-400 py-2.5 px-4 rounded-lg transition-all">
                            <Shield className="w-4 h-4 mr-2" /> Privacidad
                        </TabsTrigger>
                    </TabsList>

                    <div className="min-h-[400px]">
                        <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
                            <NotificationsTab 
                                preferences={preferences} 
                                setPreferences={setPreferences} 
                                editMode={editMode} 
                                role={role} 
                            />
                        </TabsContent>
                        
                        <TabsContent value="appearance" className="mt-0 focus-visible:outline-none">
                            <AppearanceTab 
                                preferences={preferences} 
                                setPreferences={setPreferences} 
                                editMode={editMode} 
                            />
                        </TabsContent>
                        
                        <TabsContent value="language" className="mt-0 focus-visible:outline-none">
                            <LanguageTab 
                                preferences={preferences} 
                                setPreferences={setPreferences} 
                                editMode={editMode} 
                            />
                        </TabsContent>
                        
                        <TabsContent value="privacy" className="mt-0 focus-visible:outline-none">
                            <PrivacyTab 
                                preferences={preferences} 
                                setPreferences={setPreferences} 
                                editMode={editMode} 
                            />
                        </TabsContent>
                    </div>
                </Tabs>

            </CardContent>
        </Card>

      </div>
    </div>
  );
}