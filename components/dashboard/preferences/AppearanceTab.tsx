/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Moon, Eye } from "lucide-react";
import { PreferenceCard } from './PreferenceCard';

interface AppearanceTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ preferences, setPreferences, editMode }) => {
  
  const updateAppearance = (key: string, value: any) => {
    setPreferences((prev: any) => ({
        ...prev,
        appearance: { ...prev.appearance, [key]: value }
    }));
  };

  return (
    <div className="space-y-6">
        <PreferenceCard icon={Moon} title="Tema" description="Personaliza la apariencia de la aplicación.">
            <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Modo de color</h4>
                <Select 
                    value={preferences.appearance.theme} 
                    onValueChange={(val) => updateAppearance('theme', val)} 
                    disabled={!editMode}
                >
                    <SelectTrigger className="bg-gray-950 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
                        <SelectItem value="light">Claro (Light)</SelectItem>
                        <SelectItem value="dark">Oscuro (Dark)</SelectItem>
                        <SelectItem value="system">Igual al Sistema</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </PreferenceCard>

        <PreferenceCard icon={Eye} title="Accesibilidad" description="Ajustes para mejorar la legibilidad.">
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <p className="text-white font-medium">Reducir movimiento</p>
                    <Switch 
                        checked={preferences.appearance.reduceMotion} 
                        onCheckedChange={(val) => updateAppearance('reduceMotion', val)} 
                        disabled={!editMode} 
                    />
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-white font-medium">Alto contraste</p>
                    <Switch 
                        checked={preferences.appearance.highContrast} 
                        onCheckedChange={(val) => updateAppearance('highContrast', val)} 
                        disabled={!editMode} 
                    />
                </div>
            </div>
        </PreferenceCard>
    </div>
  );
};