"use client";
import React from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Languages, DollarSign, Clock, MapPin } from "lucide-react";
import { PreferenceCard } from './PreferenceCard';
import { AppPreferences } from '@/app/quhealthy/types/preferences';

const languages = [ { code: "es", label: "Español", flag: "🇪🇸" }, { code: "en", label: "English", flag: "🇺🇸" } ];
const currencies = [ { code: "MXN", label: "Peso Mexicano (MXN)" }, { code: "USD", label: "US Dollar (USD)" } ];
const timeFormats = [ { code: "12", label: "12 horas (AM/PM)" }, { code: "24", label: "24 horas" } ];

interface LanguageTabProps {
  preferences: AppPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<AppPreferences>>;
  editMode: boolean;
}

export const LanguageTab: React.FC<LanguageTabProps> = ({ preferences, setPreferences, editMode }) => {
  return (
    <div className="space-y-4">
      <PreferenceCard icon={Languages} title="Idioma" description="Selecciona tu idioma preferido">
        <Select value={preferences.language} onValueChange={(val) => setPreferences(p => ({ ...p, language: val }))} disabled={!editMode}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{languages.map(l => <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>)}</SelectContent>
        </Select>
      </PreferenceCard>
      <PreferenceCard icon={DollarSign} title="Moneda" description="Configura tu moneda preferida">
        <Select value={preferences.currency} onValueChange={(val) => setPreferences(p => ({ ...p, currency: val }))} disabled={!editMode}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{currencies.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
      </PreferenceCard>
      <PreferenceCard icon={Clock} title="Formato de hora" description="Elige cómo se muestra la hora">
        <Select value={preferences.timeFormat} onValueChange={(val) => setPreferences(p => ({ ...p, timeFormat: val }))} disabled={!editMode}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{timeFormats.map(t => <SelectItem key={t.code} value={t.code}>{t.label}</SelectItem>)}</SelectContent>
        </Select>
      </PreferenceCard>
      <PreferenceCard icon={MapPin} title="Zona horaria" description="Tu zona horaria actual" className="opacity-60">
        <p>{preferences.timeZone} <span className="text-xs ml-2">(Detectada automáticamente)</span></p>
      </PreferenceCard>
    </div>
  );
};