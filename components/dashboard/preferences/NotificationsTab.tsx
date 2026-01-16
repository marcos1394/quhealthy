/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Switch } from "@/components/ui/switch";
import { BellRing, Smartphone } from "lucide-react";
import { PreferenceCard } from './PreferenceCard';

// Definimos tipos locales para independencia
export type UserRole = 'provider' | 'consumer';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  [key: string]: boolean; // Index signature para tipos dinámicos
}

interface NotificationsTabProps {
  preferences: { notifications: NotificationPreferences };
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
  role: UserRole;
}

// Configuración de notificaciones por rol
const NOTIFICATION_TYPES = {
  provider: [
    { id: 'new_appointment', label: 'Nuevas Citas', description: 'Recibe aviso cuando alguien agende contigo.' },
    { id: 'cancellations', label: 'Cancelaciones', description: 'Si un paciente cancela o reprograma.' },
    { id: 'reviews', label: 'Nuevas Reseñas', description: 'Cuando recibas feedback de un paciente.' },
  ],
  consumer: [
    { id: 'reminders', label: 'Recordatorios de Cita', description: 'Avisos 24h y 1h antes de tu consulta.' },
    { id: 'promotions', label: 'Ofertas y Paquetes', description: 'Descuentos especiales de tus doctores.' },
    { id: 'documents', label: 'Documentos Listos', description: 'Cuando tu doctor suba una receta o estudio.' },
  ]
};

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ 
  preferences, 
  setPreferences, 
  editMode, 
  role 
}) => {
  
  const handleToggle = (key: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Canales */}
      <PreferenceCard 
        icon={Smartphone} 
        title="Canales de Contacto" 
        description="¿Por dónde prefieres que te contactemos?"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <p className="text-white font-medium">Email</p>
                <p className="text-xs text-gray-500">Resumen diario y recibos.</p>
            </div>
            <Switch 
                checked={preferences.notifications.email} 
                onCheckedChange={(val) => handleToggle('email', val)} 
                disabled={!editMode} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <p className="text-white font-medium">Notificaciones Push</p>
                <p className="text-xs text-gray-500">Alertas en tiempo real al navegador.</p>
            </div>
            <Switch 
                checked={preferences.notifications.push} 
                onCheckedChange={(val) => handleToggle('push', val)} 
                disabled={!editMode} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <p className="text-white font-medium">SMS / WhatsApp</p>
                <p className="text-xs text-gray-500">Avisos urgentes a tu celular.</p>
            </div>
            <Switch 
                checked={preferences.notifications.sms} 
                onCheckedChange={(val) => handleToggle('sms', val)} 
                disabled={!editMode} 
            />
          </div>
        </div>
      </PreferenceCard>
      
      {/* Tipos específicos según rol */}
      <PreferenceCard 
        icon={BellRing} 
        title="Tipos de Alerta" 
        description="Personaliza qué eventos son importantes para ti."
      >
        <div className="space-y-5">
          {NOTIFICATION_TYPES[role].map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
              <Switch 
                checked={preferences.notifications[item.id] ?? true} 
                onCheckedChange={(val) => handleToggle(item.id, val)} 
                disabled={!editMode}
              />
            </div>
          ))}
        </div>
      </PreferenceCard>

    </div>
  );
};