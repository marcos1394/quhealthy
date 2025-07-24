"use client";
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Mail, Smartphone, Phone } from "lucide-react";
import { PreferenceCard } from './PreferenceCard';
import { AppPreferences, UserRole, NotificationType } from '@/app/quhealthy/types/preferences';

interface NotificationsTabProps {
  preferences: AppPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<AppPreferences>>;
  editMode: boolean;
  role: UserRole;
  notificationTypes: Record<UserRole, NotificationType[]>;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ preferences, setPreferences, editMode, role, notificationTypes }) => {
  const handleToggle = (key: keyof AppPreferences['notifications'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-4">
      <PreferenceCard icon={Phone} title="Canales de Notificación" description="Elige cómo quieres recibir las alertas.">
        <div className="space-y-4">
          <div className="flex items-center justify-between"><p>Email</p><Switch checked={preferences.notifications.email} onCheckedChange={(val) => handleToggle('email', val)} disabled={!editMode} /></div>
          <div className="flex items-center justify-between"><p>Push</p><Switch checked={preferences.notifications.push} onCheckedChange={(val) => handleToggle('push', val)} disabled={!editMode} /></div>
          <div className="flex items-center justify-between"><p>SMS</p><Switch checked={preferences.notifications.sms} onCheckedChange={(val) => handleToggle('sms', val)} disabled={!editMode} /></div>
        </div>
      </PreferenceCard>
      
      <PreferenceCard icon={Mail} title="Tipos de Notificación" description="Selecciona qué notificaciones deseas recibir.">
        <div className="space-y-4">
          {notificationTypes[role].map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
              <Switch 
                checked={preferences.notifications[item.id]} 
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