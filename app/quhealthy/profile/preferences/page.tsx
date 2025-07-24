"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Settings, Save, X, Bell, Sun, Globe, Shield, Calendar, Mail, Clock, DollarSign } from "lucide-react";

// Importa los tipos y los nuevos componentes
import { AppPreferences, UserRole, NotificationType } from '@/app/quhealthy/types/preferences';
import { NotificationsTab } from '@/app/quhealthy/components/preferences/NotificationsTab';
import { AppearanceTab } from '@/app/quhealthy/components/preferences/AppearanceTab';
import { LanguageTab } from '@/app/quhealthy/components/preferences/LanguageTab';
import { PrivacyTab } from '@/app/quhealthy/components/preferences/PrivacyTab';

const initialPreferences: AppPreferences = {
  notifications: { enabled: true, email: true, push: true, sms: false, appointments: true, messages: true, updates: true, requests: true, promotions: true, reminders: true },
  appearance: { theme: "system", fontSize: "medium", reduceMotion: false, highContrast: false },
  language: "es", currency: "MXN", timeFormat: "12",
  timeZone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  privacy: { showOnlineStatus: true, showLastSeen: true, showProfile: "all", allowMessages: "all" },
};

const notificationTypes: Record<UserRole, NotificationType[]> = {
  paciente: [
    { id: "appointments", label: "Recordatorios de citas", icon: Calendar, description: "Recibe notificaciones sobre tus próximas citas" },
    { id: "messages", label: "Mensajes nuevos", icon: Mail, description: "Notificaciones de mensajes de proveedores" },
    { id: "updates", label: "Actualizaciones de servicio", icon: Bell, description: "Cambios y actualizaciones en los servicios" },
    { id: "promotions", label: "Promociones y ofertas", icon: DollarSign, description: "Ofertas especiales de tus proveedores favoritos" },
  ],
  proveedor: [
    { id: "requests", label: "Solicitudes de servicio", icon: Calendar, description: "Nuevas solicitudes de citas" },
    { id: "messages", label: "Mensajes de pacientes", icon: Mail, description: "Mensajes de tus pacientes" },
    { id: "updates", label: "Actualizaciones de plataforma", icon: Bell, description: "Novedades y cambios importantes" },
    { id: "reminders", label: "Recordatorios", icon: Clock, description: "Recordatorios de citas próximas" },
  ],
};

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<AppPreferences>(initialPreferences);
  const [originalPreferences, setOriginalPreferences] = useState<AppPreferences>(initialPreferences);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const role: UserRole = "proveedor"; // Simulación, esto vendría de la sesión del usuario

  useEffect(() => {
    // Aquí cargarías las preferencias del usuario desde tu API
    setLoading(true);
    setTimeout(() => {
      // setPreferences(fetchedPreferences);
      // setOriginalPreferences(fetchedPreferences);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de guardado en API
      setEditMode(false);
      setSuccess("¡Preferencias actualizadas exitosamente!");
      setOriginalPreferences(preferences);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Error al actualizar las preferencias.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPreferences(originalPreferences);
    setEditMode(false);
    setError(null);
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-900 text-white p-4 md:p-8">
      <Card className="max-w-4xl mx-auto bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-teal-500/10 p-3 rounded-full"><Settings className="w-8 h-8 text-teal-400" /></div>
              <div>
                <h1 className="text-2xl font-bold text-teal-400">Preferencias</h1>
                <p className="text-sm text-gray-400">Personaliza tu experiencia en la plataforma</p>
              </div>
            </div>
            {!editMode ? (
              <Button onClick={() => setEditMode(true)} className="bg-teal-500 hover:bg-teal-600"><Settings className="w-4 h-4 mr-2" /> Editar</Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline"><X className="w-4 h-4 mr-2" /> Cancelar</Button>
                <Button onClick={handleSave} className="bg-teal-500 hover:bg-teal-600" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Guardar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {(error || success) && <Alert className={`mb-6 ${error ? "border-red-800" : "border-green-800"}`}><AlertDescription>{error || success}</AlertDescription></Alert>}
          
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="bg-gray-700/50 border-gray-600">
              <TabsTrigger value="notifications" className="data-[state=active]:bg-teal-500"><Bell className="w-4 h-4 mr-2" /> Notificaciones</TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-teal-500"><Sun className="w-4 h-4 mr-2" /> Apariencia</TabsTrigger>
              <TabsTrigger value="language" className="data-[state=active]:bg-teal-500"><Globe className="w-4 h-4 mr-2" /> Idioma</TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-teal-500"><Shield className="w-4 h-4 mr-2" /> Privacidad</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications"><NotificationsTab preferences={preferences} setPreferences={setPreferences} editMode={editMode} role={role} notificationTypes={notificationTypes} /></TabsContent>
            <TabsContent value="appearance"><AppearanceTab preferences={preferences} setPreferences={setPreferences} editMode={editMode} /></TabsContent>
            <TabsContent value="language"><LanguageTab preferences={preferences} setPreferences={setPreferences} editMode={editMode} /></TabsContent>
            <TabsContent value="privacy"><PrivacyTab preferences={preferences} setPreferences={setPreferences} editMode={editMode} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};