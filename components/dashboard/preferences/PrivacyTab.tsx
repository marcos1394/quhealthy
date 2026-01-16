/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Shield, Lock } from "lucide-react";
import { PreferenceCard } from './PreferenceCard';

interface PrivacyTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({ preferences, setPreferences, editMode }) => {
  
  const updatePrivacy = (key: string, value: any) => {
    setPreferences((prev: any) => ({
        ...prev,
        privacy: { ...prev.privacy, [key]: value }
    }));
  };

  return (
    <div className="space-y-6">
        <PreferenceCard icon={Shield} title="Visibilidad" description="Controla quién puede ver tu actividad.">
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">Mostrar estado en línea</p>
                        <p className="text-xs text-gray-500">Permite ver si estás activo ahora.</p>
                    </div>
                    <Switch 
                        checked={preferences.privacy.showOnlineStatus} 
                        onCheckedChange={(val) => updatePrivacy('showOnlineStatus', val)} 
                        disabled={!editMode} 
                    />
                </div>
                
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">Mostrar última conexión</p>
                        <p className="text-xs text-gray-500">Muestra cuándo fue tu última actividad.</p>
                    </div>
                    <Switch 
                        checked={preferences.privacy.showLastSeen} 
                        onCheckedChange={(val) => updatePrivacy('showLastSeen', val)} 
                        disabled={!editMode} 
                    />
                </div>
            </div>
        </PreferenceCard>

        <PreferenceCard icon={Lock} title="Permisos de Contacto" description="Define quién puede interactuar contigo.">
            <div className="space-y-5">
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">¿Quién puede ver mi perfil completo?</h4>
                    <Select 
                        value={preferences.privacy.showProfile} 
                        onValueChange={(val) => updatePrivacy('showProfile', val)} 
                        disabled={!editMode}
                    >
                        <SelectTrigger className="bg-gray-950 border-gray-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
                            <SelectItem value="all">Todos (Público)</SelectItem>
                            <SelectItem value="contacts">Solo mis contactos</SelectItem>
                            <SelectItem value="none">Nadie (Privado)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300">¿Quién puede enviarme mensajes?</h4>
                    <Select 
                        value={preferences.privacy.allowMessages} 
                        onValueChange={(val) => updatePrivacy('allowMessages', val)} 
                        disabled={!editMode}
                    >
                        <SelectTrigger className="bg-gray-950 border-gray-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
                            <SelectItem value="all">Cualquiera</SelectItem>
                            <SelectItem value="contacts">Solo personas con cita</SelectItem>
                            <SelectItem value="none">Nadie</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </PreferenceCard>
    </div>
  );
};