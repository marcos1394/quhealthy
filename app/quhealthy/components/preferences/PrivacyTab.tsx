"use client";
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { PreferenceCard } from './PreferenceCard';
import { AppPreferences } from '@/app/quhealthy/types/preferences';

interface PrivacyTabProps {
  preferences: AppPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<AppPreferences>>;
  editMode: boolean;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({ preferences, setPreferences, editMode }) => {
  return (
    <PreferenceCard icon={Shield} title="Privacidad" description="Configura tus ajustes de privacidad">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p>Mostrar estado en línea</p>
          <Switch checked={preferences.privacy.showOnlineStatus} onCheckedChange={(val) => setPreferences(p => ({ ...p, privacy: { ...p.privacy, showOnlineStatus: val } }))} disabled={!editMode} />
        </div>
        <div className="flex items-center justify-between">
          <p>Mostrar última vez visto</p>
          <Switch checked={preferences.privacy.showLastSeen} onCheckedChange={(val) => setPreferences(p => ({ ...p, privacy: { ...p.privacy, showLastSeen: val } }))} disabled={!editMode} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Visibilidad del perfil</h4>
          <Select value={preferences.privacy.showProfile} onValueChange={(val) => setPreferences(p => ({ ...p, privacy: { ...p.privacy, showProfile: val } }))} disabled={!editMode}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="contacts">Solo contactos</SelectItem>
              <SelectItem value="none">Nadie</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Mensajes directos</h4>
          <Select value={preferences.privacy.allowMessages} onValueChange={(val) => setPreferences(p => ({ ...p, privacy: { ...p.privacy, allowMessages: val } }))} disabled={!editMode}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="contacts">Solo contactos</SelectItem>
              <SelectItem value="none">Nadie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </PreferenceCard>
  );
};