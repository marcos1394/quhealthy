/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Globe, 
  DollarSign, 
  Clock,
  Check,
  Info,
  Sparkles,
  Calendar,
  MapPin,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PreferenceCard } from './PreferenceCard';

/**
 * LanguageTab Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEEDBACK INMEDIATO
 *    - Preview en tiempo real de cambios
 *    - Ejemplos visuales de formato
 *    - Confirmación de selección
 * 
 * 2. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Banderas por idioma
 *    - Símbolos de moneda
 *    - Ejemplos de hora
 * 
 * 3. MINIMIZAR ERRORES
 *    - Preview antes de aplicar
 *    - Ejemplos claros
 *    - Reversible
 * 
 * 4. CREDIBILIDAD
 *    - Info sobre timezone
 *    - Ejemplos reales
 *    - Context tooltips
 * 
 * 5. AFFORDANCE
 *    - Iconos descriptivos
 *    - Estados hover
 *    - Visual feedback
 * 
 * 6. MINIMIZAR CARGA COGNITIVA
 *    - Opciones agrupadas lógicamente
 *    - Ejemplos visuales
 *    - Una decisión a la vez
 */

// Datos
const languages = [
  { code: "es", label: "Español", flag: "🇪🇸", nativeName: "Español" },
  { code: "en", label: "English", flag: "🇺🇸", nativeName: "English" },
  { code: "pt", label: "Português", flag: "🇧🇷", nativeName: "Português" },
  { code: "fr", label: "Français", flag: "🇫🇷", nativeName: "Français" }
];

const currencies = [
  { code: "MXN", label: "Peso Mexicano", symbol: "$", example: "1,234.56" },
  { code: "USD", label: "US Dollar", symbol: "$", example: "1,234.56" },
  { code: "EUR", label: "Euro", symbol: "€", example: "1.234,56" },
  { code: "BRL", label: "Real Brasileiro", symbol: "R$", example: "1.234,56" }
];

const timeFormats = [
  { code: "12", label: "12 horas (AM/PM)", example: "3:45 PM" },
  { code: "24", label: "24 horas (Militar)", example: "15:45" }
];

interface LanguageTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const LanguageTab: React.FC<LanguageTabProps> = ({ 
  preferences, 
  setPreferences, 
  editMode 
}) => {
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const updatePref = (key: string, value: string) => {
    setPreferences((prev: any) => ({ ...prev, [key]: value }));
    
    // Mostrar preview brevemente
    setShowPreview(key);
    setTimeout(() => setShowPreview(null), 2000);
  };

  // Helper para obtener datos actuales - RECONOCIMIENTO
  const getCurrentLanguage = () => languages.find(l => l.code === preferences.language);
  const getCurrentCurrency = () => currencies.find(c => c.code === preferences.currency);
  const getCurrentTimeFormat = () => timeFormats.find(t => t.code === preferences.timeFormat);

  // Helper para preview de hora actual - FEEDBACK VISUAL
  const getCurrentTime = (format: string) => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12'
    };
    return now.toLocaleTimeString('es-MX', options);
  };

  return (
    <div className="space-y-6">
      
      {/* Language Selection - RECONOCIMIENTO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreferenceCard 
          icon={Globe} 
          title="Idioma de Interfaz" 
          description="Idioma principal para mostrar textos y mensajes"
        >
          <div className="space-y-4">
            
            {/* Language Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Idioma Actual
                </h4>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                  <Globe className="w-3 h-3 mr-1" />
                  {getCurrentLanguage()?.nativeName}
                </Badge>
              </div>

              <Select 
                value={preferences.language} 
                onValueChange={(val) => updatePref('language', val)} 
                disabled={!editMode}
              >
                <SelectTrigger 
                  className={cn(
                    "bg-gray-950/50 border-gray-700 text-white h-12 transition-all",
                    editMode ? "hover:border-purple-500/50" : ""
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCurrentLanguage()?.flag}</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
                  {languages.map(l => (
                    <SelectItem key={l.code} value={l.code}>
                      <div className="flex items-center gap-3 py-1">
                        <span className="text-xl">{l.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-semibold">{l.label}</span>
                          <span className="text-xs text-gray-500">{l.nativeName}</span>
                        </div>
                        {preferences.language === l.code && (
                          <Check className="w-4 h-4 text-purple-400 ml-auto" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview Toast - FEEDBACK INMEDIATO */}
            <AnimatePresence>
              {showPreview === 'language' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-purple-400" />
                  <p className="text-sm text-purple-300">
                    Idioma actualizado a <span className="font-bold">{getCurrentLanguage()?.label}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Language Info - CREDIBILIDAD */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300">
                El cambio de idioma afectará todos los textos de la interfaz. 
                Los datos ingresados por ti permanecerán en su idioma original.
              </p>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* Currency Selection - PRIMING */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PreferenceCard 
          icon={DollarSign} 
          title="Moneda Principal" 
          description="Moneda predeterminada para mostrar precios y realizar cobros"
        >
          <div className="space-y-4">
            
            {/* Currency Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Moneda Actual
                </h4>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {getCurrentCurrency()?.code}
                </Badge>
              </div>

              <Select 
                value={preferences.currency} 
                onValueChange={(val) => updatePref('currency', val)} 
                disabled={!editMode}
              >
                <SelectTrigger 
                  className={cn(
                    "bg-gray-950/50 border-gray-700 text-white h-12 transition-all",
                    editMode ? "hover:border-emerald-500/50" : ""
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
                  {currencies.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-400 font-bold">{c.symbol}</span>
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold">{c.label} ({c.code})</span>
                          <span className="text-xs text-gray-500">Ejemplo: {c.symbol}{c.example}</span>
                        </div>
                        {preferences.currency === c.code && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview Toast */}
            <AnimatePresence>
              {showPreview === 'currency' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm text-emerald-300">
                    Moneda actualizada a <span className="font-bold">{getCurrentCurrency()?.code}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price Preview - RECONOCIMIENTO VISUAL */}
            <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-300">
                  Vista Previa de Precios
                </p>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Consulta</p>
                  <p className="text-lg font-bold text-white">
                    {getCurrentCurrency()?.symbol}500.00
                  </p>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Suscripción</p>
                  <p className="text-lg font-bold text-white">
                    {getCurrentCurrency()?.symbol}1,250.00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* Time Format Selection - AFFORDANCE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <PreferenceCard 
          icon={Clock} 
          title="Formato de Hora" 
          description="Preferencia de visualización horaria en toda la aplicación"
        >
          <div className="space-y-4">
            
            {/* Time Format Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  Formato Actual
                </h4>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <Clock className="w-3 h-3 mr-1" />
                  {getCurrentTimeFormat()?.code}h
                </Badge>
              </div>

              <Select 
                value={preferences.timeFormat} 
                onValueChange={(val) => updatePref('timeFormat', val)} 
                disabled={!editMode}
              >
                <SelectTrigger 
                  className={cn(
                    "bg-gray-950/50 border-gray-700 text-white h-12 transition-all",
                    editMode ? "hover:border-blue-500/50" : ""
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-gray-300">
                  {timeFormats.map(t => (
                    <SelectItem key={t.code} value={t.code}>
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold">{t.label}</span>
                          <span className="text-xs text-gray-500">Ejemplo: {t.example}</span>
                        </div>
                        {preferences.timeFormat === t.code && (
                          <Check className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview Toast */}
            <AnimatePresence>
              {showPreview === 'timeFormat' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-blue-400" />
                  <p className="text-sm text-blue-300">
                    Formato actualizado a <span className="font-bold">{getCurrentTimeFormat()?.label}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live Time Preview - FEEDBACK VISUAL */}
            <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Hora Actual
                </p>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                  En vivo
                </Badge>
              </div>
              <div className="text-center py-4">
                <p className="text-3xl font-black text-white tabular-nums">
                  {getCurrentTime(preferences.timeFormat)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Formato: {getCurrentTimeFormat()?.label}
                </p>
              </div>
            </div>

            {/* Timezone Info - CREDIBILIDAD */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-blue-300 font-semibold mb-1">
                  Zona Horaria Detectada
                </p>
                <p className="text-xs text-blue-300/80">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* Edit Mode Warning - MINIMIZAR ERRORES */}
      {!editMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-400 mb-1">
              Modo de Solo Lectura
            </p>
            <p className="text-xs text-amber-300/80">
              Activa el modo de edición para modificar estas preferencias
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};