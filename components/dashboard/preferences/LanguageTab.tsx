/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Globe, DollarSign, Clock } from "lucide-react";
import { PreferenceCard } from './PreferenceCard';

const languages = [ { code: "es", label: "Español", flag: "🇪🇸" }, { code: "en", label: "English", flag: "🇺🇸" } ];
const currencies = [ { code: "MXN", label: "Peso Mexicano (MXN)" }, { code: "USD", label: "US Dollar (USD)" } ];
const timeFormats = [ { code: "12", label: "12 horas (AM/PM)" }, { code: "24", label: "24 horas (Militar)" } ];

interface LanguageTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const LanguageTab: React.FC<LanguageTabProps> = ({ preferences, setPreferences, editMode }) => {
  
  const updatePref = (key: string, value: string) => {
    setPreferences((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      
      <PreferenceCard icon={Globe} title="Idioma y Región" description="Selecciona el idioma de la interfaz.">
        <Select 
            value={preferences.language} 
            onValueChange={(val) => updatePref('language', val)} 
            disabled={!editMode}
        >
          <SelectTrigger className="bg-gray-950 border-gray-700 text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
            {languages.map(l => <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </PreferenceCard>

      <PreferenceCard icon={DollarSign} title="Moneda Principal" description="Moneda para mostrar precios y cobros.">
        <Select 
            value={preferences.currency} 
            onValueChange={(val) => updatePref('currency', val)} 
            disabled={!editMode}
        >
          <SelectTrigger className="bg-gray-950 border-gray-700 text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
            {currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </PreferenceCard>

      <PreferenceCard icon={Clock} title="Formato de Hora" description="Preferencia de visualización horaria.">
        <Select 
            value={preferences.timeFormat} 
            onValueChange={(val) => updatePref('timeFormat', val)} 
            disabled={!editMode}
        >
          <SelectTrigger className="bg-gray-950 border-gray-700 text-white"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
            {timeFormats.map(t => <SelectItem key={t.code} value={t.code}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </PreferenceCard>

    </div>
  );
};