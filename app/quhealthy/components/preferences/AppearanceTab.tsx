"use client";
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Moon } from "lucide-react";
import { PreferenceCard } from './PreferenceCard';
import { AppPreferences } from '@/app/quhealthy/types/preferences';

interface AppearanceTabProps {
  preferences: AppPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<AppPreferences>>;
  editMode: boolean;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ preferences, setPreferences, editMode }) => {
  return (
    <PreferenceCard icon={Moon} title="Tema y visualización" description="Personaliza la apariencia de la aplicación">
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Tema</h4>
          <Select
            value={preferences.appearance.theme}
            onValueChange={(value) => setPreferences(prev => ({ ...prev, appearance: { ...prev.appearance, theme: value } }))}
            disabled={!editMode}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between"><p>Reducir movimiento</p><Switch checked={preferences.appearance.reduceMotion} onCheckedChange={(val) => setPreferences(prev => ({ ...prev, appearance: { ...prev.appearance, reduceMotion: val } }))} disabled={!editMode} /></div>
        <div className="flex items-center justify-between"><p>Alto contraste</p><Switch checked={preferences.appearance.highContrast} onCheckedChange={(val) => setPreferences(prev => ({ ...prev, appearance: { ...prev.appearance, highContrast: val } }))} disabled={!editMode} /></div>
      </div>
    </PreferenceCard>
  );
};