/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Moon, 
  Eye,
  Sun,
  Monitor,
  Zap,
  Palette,
  Sparkles,
  Check,
  Info,
  Contrast,
  ToggleLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PreferenceCard } from './PreferenceCard';

/**
 * AppearanceTab Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEEDBACK INMEDIATO
 *    - Preview en tiempo real de cambios
 *    - Indicadores visuales de estado
 *    - Animaciones suaves al cambiar
 * 
 * 2. AFFORDANCE VISUAL
 *    - Iconos por tema (Sun/Moon/Monitor)
 *    - Estados disabled claros
 *    - Preview cards interactivas
 * 
 * 3. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos descriptivos
 *    - Labels claros
 *    - Ejemplos visuales
 * 
 * 4. MINIMIZAR ERRORES
 *    - Cambios reversibles
 *    - Preview antes de guardar
 *    - Confirmación visual
 * 
 * 5. CREDIBILIDAD
 *    - Info tooltips
 *    - Badges con contexto
 *    - Descripciones claras
 * 
 * 6. ACCESIBILIDAD
 *    - Opciones de contraste
 *    - Reducir movimiento
 *    - WCAG compliance
 */

interface AppearanceTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ 
  preferences, 
  setPreferences, 
  editMode 
}) => {
  const [previewTheme, setPreviewTheme] = useState(preferences.appearance.theme);
  const [showPreview, setShowPreview] = useState(false);

  // Sync preview con preferences cuando cambian
  useEffect(() => {
    setPreviewTheme(preferences.appearance.theme);
  }, [preferences.appearance.theme]);

  const updateAppearance = (key: string, value: any) => {
    setPreferences((prev: any) => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value }
    }));

    // Mostrar preview brevemente
    if (key === 'theme') {
      setShowPreview(true);
      setTimeout(() => setShowPreview(false), 2000);
    }
  };

  // Helper para iconos de tema - RECONOCIMIENTO
  const getThemeIcon = (theme: string) => {
    const icons = {
      light: <Sun className="w-5 h-5 text-amber-400" />,
      dark: <Moon className="w-5 h-5 text-purple-400" />,
      system: <Monitor className="w-5 h-5 text-blue-400" />
    };
    return icons[theme as keyof typeof icons] || <Monitor className="w-5 h-5" />;
  };

  // Helper para color de tema - PRIMING
  const getThemeColor = (theme: string) => {
    const colors = {
      light: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      dark: 'from-medical-500/20 to-indigo-500/20 border-purple-500/30',
      system: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
    };
    return colors[theme as keyof typeof colors] || colors.system;
  };

  return (
    <div className="space-y-6">
      
      {/* Theme Selection - AFFORDANCE VISUAL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreferenceCard 
          icon={Palette} 
          title="Tema de Interfaz" 
          description="Personaliza la apariencia visual de la aplicación"
        >
          <div className="space-y-4">
            
            {/* Theme Selector con Preview - FEEDBACK INMEDIATO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Modo de Color
                </h4>
                {preferences.appearance.theme !== 'system' && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Personalizado
                  </Badge>
                )}
              </div>

              <Select 
                value={preferences.appearance.theme} 
                onValueChange={(val) => updateAppearance('theme', val)} 
                disabled={!editMode}
              >
                <SelectTrigger 
                  className={cn(
                    "bg-slate-950/50 border-slate-700 text-white h-12 transition-all",
                    editMode ? "hover:border-purple-500/50" : ""
                  )}
                >
                  <div className="flex items-center gap-2">
                    {getThemeIcon(preferences.appearance.theme)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                  <SelectItem value="light">
                    <div className="flex items-center gap-3">
                      <Sun className="w-4 h-4 text-amber-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Claro (Light)</span>
                        <span className="text-xs text-slate-500">Fondo blanco, ideal para día</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-3">
                      <Moon className="w-4 h-4 text-purple-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Oscuro (Dark)</span>
                        <span className="text-xs text-slate-500">Reduce fatiga visual nocturna</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-blue-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Igual al Sistema</span>
                        <span className="text-xs text-slate-500">Sincroniza con tu dispositivo</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview Cards - RECONOCIMIENTO */}
            <div className="grid grid-cols-3 gap-3">
              {['light', 'dark', 'system'].map((theme) => (
                <motion.button
                  key={theme}
                  onClick={() => editMode && updateAppearance('theme', theme)}
                  disabled={!editMode}
                  whileHover={editMode ? { scale: 1.05 } : {}}
                  whileTap={editMode ? { scale: 0.95 } : {}}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200",
                    "bg-gradient-to-br",
                    getThemeColor(theme),
                    preferences.appearance.theme === theme 
                      ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950" 
                      : "opacity-60 hover:opacity-100",
                    !editMode ? "cursor-not-allowed opacity-50" :""
                  )}
                >
                  {/* Check indicator */}
                  {preferences.appearance.theme === theme && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}

                  <div className="flex flex-col items-center gap-2">
                    {getThemeIcon(theme)}
                    <span className="text-xs font-semibold text-white capitalize">
                      {theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Oscuro'}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Preview Toast - FEEDBACK INMEDIATO */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-purple-400" />
                  <p className="text-sm text-purple-300">
                    Tema actualizado a <span className="font-bold capitalize">{previewTheme}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* Accessibility Options - CREDIBILIDAD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PreferenceCard 
          icon={Eye} 
          title="Accesibilidad" 
          description="Ajustes para mejorar la experiencia visual y reducir fatiga"
        >
          <div className="space-y-6">
            
            {/* Reduce Motion - AFFORDANCE */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <ToggleLeft className="w-4 h-4 text-slate-500" />
                    <p className="text-white font-semibold">Reducir Movimiento</p>
                    {preferences.appearance.reduceMotion && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                        Activo
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 pl-6">
                    Desactiva animaciones y transiciones para reducir mareos
                  </p>
                </div>
                <Switch 
                  checked={preferences.appearance.reduceMotion} 
                  onCheckedChange={(val) => updateAppearance('reduceMotion', val)} 
                  disabled={!editMode}
                  className={cn(
                    !editMode ? "opacity-50 cursor-not-allowed" : ""
                  )}
                />
              </div>

              {/* Info tooltip - CREDIBILIDAD */}
              {preferences.appearance.reduceMotion && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2"
                >
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">
                    Las animaciones están desactivadas. Recomendado para personas sensibles al movimiento.
                  </p>
                </motion.div>
              )}
            </div>

            {/* High Contrast - PRIMING */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-slate-500" />
                    <p className="text-white font-semibold">Alto Contraste</p>
                    {preferences.appearance.highContrast && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                        Activo
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 pl-6">
                    Aumenta el contraste para mejorar la legibilidad
                  </p>
                </div>
                <Switch 
                  checked={preferences.appearance.highContrast} 
                  onCheckedChange={(val) => updateAppearance('highContrast', val)} 
                  disabled={!editMode}
                  className={cn(
                    !editMode ? "opacity-50 cursor-not-allowed" : ""
                  )}
                />
              </div>

              {/* Preview del contraste - FEEDBACK VISUAL */}
              {preferences.appearance.highContrast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300">
                      Modo de alto contraste activado. Los textos serán más visibles.
                    </p>
                  </div>

                  {/* Contrast preview */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-slate-500 font-medium">Contraste Normal</p>
                      <p className="text-sm text-slate-400">Ejemplo de texto</p>
                    </div>
                    <div className="bg-black border-2 border-white rounded-lg p-3 space-y-1">
                      <p className="text-xs text-slate-300 font-medium">Alto Contraste</p>
                      <p className="text-sm text-white font-semibold">Ejemplo de texto</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* WCAG Compliance Badge - CREDIBILIDAD */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-white">
                    Cumplimiento WCAG 2.1 AA
                  </p>
                  <p className="text-xs text-slate-400">
                    {preferences.appearance.highContrast 
                      ? "Contraste de color mejorado para máxima legibilidad"
                      : "Configuración estándar de accesibilidad"
                    }
                  </p>
                </div>
              </div>
            </motion.div>
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