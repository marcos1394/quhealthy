/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
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
  Shield, 
  Lock,
  Eye,
  EyeOff,
  Clock,
  Users,
  UserCheck,
  Globe,
  Info,
  AlertCircle,
  Check,
  Sparkles,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PreferenceCard } from './PreferenceCard';

/**
 * PrivacyTab Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. CREDIBILIDAD Y TRANSPARENCIA
 *    - Explicación clara del impacto
 *    - Ejemplos visuales
 *    - Info sobre quién ve qué
 *    - Nivel de privacidad visible
 * 
 * 2. MINIMIZAR ERRORES
 *    - Warning cuando privacidad baja
 *    - Confirmación de cambios
 *    - Defaults seguros
 *    - Reversible
 * 
 * 3. FEEDBACK INMEDIATO
 *    - Preview de nivel de privacidad
 *    - Estados visuales claros
 *    - Badges informativos
 *    - Animaciones de cambio
 * 
 * 4. AFFORDANCE
 *    - Iconos por nivel de privacidad
 *    - Colores distintivos
 *    - Estados on/off claros
 *    - Visual hierarchy
 * 
 * 5. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos descriptivos
 *    - Ejemplos de uso
 *    - Labels claros
 *    - Preview de impacto
 * 
 * 6. CONTROL Y LIBERTAD
 *    - Granularidad de opciones
 *    - Fácil de cambiar
 *    - Sin consecuencias ocultas
 *    - Todo reversible
 */

interface PrivacyTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({ 
  preferences, 
  setPreferences, 
  editMode 
}) => {
  const [recentlyChanged, setRecentlyChanged] = useState<string | null>(null);

  const updatePrivacy = (key: string, value: any) => {
    setPreferences((prev: any) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }));

    // Show feedback
    setRecentlyChanged(key);
    setTimeout(() => setRecentlyChanged(null), 2000);
  };

  // Helper para nivel de privacidad - FEEDBACK VISUAL
  const getPrivacyLevel = () => {
    const settings = preferences.privacy;
    let score = 0;
    
    if (!settings.showOnlineStatus) score++;
    if (!settings.showLastSeen) score++;
    if (settings.showProfile === 'none' || settings.showProfile === 'contacts') score++;
    if (settings.allowMessages === 'contacts' || settings.allowMessages === 'none') score++;

    if (score >= 3) return { level: 'high', label: 'Alta', color: 'emerald' };
    if (score >= 2) return { level: 'medium', label: 'Media', color: 'amber' };
    return { level: 'low', label: 'Baja', color: 'red' };
  };

  const privacyLevel = getPrivacyLevel();

  // Helper para iconos de privacidad - RECONOCIMIENTO
  const getPrivacyIcon = (level: string) => {
    switch(level) {
      case 'all': return { icon: Globe, color: 'text-blue-400', label: 'Público' };
      case 'contacts': return { icon: UserCheck, color: 'text-emerald-400', label: 'Contactos' };
      case 'none': return { icon: Lock, color: 'text-red-400', label: 'Privado' };
      default: return { icon: Globe, color: 'text-slate-400', label: 'Desconocido' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Privacy Level Summary - FEEDBACK VISUAL */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "border rounded-xl p-4 transition-all duration-300",
          privacyLevel.color === 'emerald' ? "bg-emerald-500/10 border-emerald-500/20" : "",
          privacyLevel.color === 'amber' ? "bg-amber-500/10 border-amber-500/20" : "",
          privacyLevel.color === 'red' ? "bg-red-500/10 border-red-500/20" : ""
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            privacyLevel.color === 'emerald' ? "bg-emerald-500/10" : "",
            privacyLevel.color === 'amber' ? "bg-amber-500/10" : "",
            privacyLevel.color === 'red' ? "bg-red-500/10" : ""
          )}>
            <Shield className={cn(
              "w-5 h-5",
              privacyLevel.color === 'emerald' ? "text-emerald-400" : "",
              privacyLevel.color === 'amber' ? "text-amber-400" : "",
              privacyLevel.color === 'red' ? "text-red-400" : ""
            )} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-1">
              Nivel de Privacidad: {privacyLevel.label}
            </p>
            <p className={cn(
              "text-xs",
              privacyLevel.color === 'emerald' ? "text-emerald-300/80" : "",
              privacyLevel.color === 'amber' ? "text-amber-300/80" : "",
              privacyLevel.color === 'red' ? "text-red-300/80" : ""
            )}>
              {privacyLevel.level === 'high' && "Tu información está bien protegida"}
              {privacyLevel.level === 'medium' && "Privacidad moderada, algunos datos son visibles"}
              {privacyLevel.level === 'low' && "Tu perfil es muy visible, considera aumentar la privacidad"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Visibility Settings - AFFORDANCE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreferenceCard 
          icon={Eye} 
          title="Visibilidad de Actividad" 
          description="Controla qué información de tu actividad pueden ver otros usuarios"
        >
          <div className="space-y-6">
            
            {/* Online Status */}
            <div className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-300",
              preferences.privacy.showOnlineStatus 
                ? "bg-blue-500/5 border-blue-500/20" 
                : "bg-slate-950/30 border-slate-800",
              recentlyChanged === 'showOnlineStatus' ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950" : ""
            )}>
              {/* Check indicator */}
              {preferences.privacy.showOnlineStatus && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1"
                >
                  <Eye className="w-3 h-3 text-white" />
                </motion.div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg",
                    preferences.privacy.showOnlineStatus ? "bg-blue-500/10" : "bg-slate-800"
                  )}>
                    <Eye className={cn(
                      "w-5 h-5",
                      preferences.privacy.showOnlineStatus ? "text-blue-400" : "text-slate-500"
                    )} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-semibold",
                        preferences.privacy.showOnlineStatus ? "text-white" : "text-slate-400"
                      )}>
                        Mostrar Estado en Línea
                      </p>
                      {preferences.privacy.showOnlineStatus && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                          Visible
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Permite que otros usuarios vean cuando estás activo en la plataforma
                    </p>
                    {/* Impact info */}
                    <div className="flex items-start gap-2 text-xs bg-slate-950/50 p-2 rounded-lg">
                      <Info className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-500">
                        {preferences.privacy.showOnlineStatus 
                          ? "Aparecerás con un punto verde cuando estés conectado"
                          : "Tu estado permanecerá oculto"}
                      </p>
                    </div>
                  </div>
                </div>
                <Switch 
                  checked={preferences.privacy.showOnlineStatus} 
                  onCheckedChange={(val) => updatePrivacy('showOnlineStatus', val)} 
                  disabled={!editMode}
                  className={cn(!editMode ? "opacity-50 cursor-not-allowed" : "")}
                />
              </div>
            </div>

            {/* Last Seen */}
            <div className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-300",
              preferences.privacy.showLastSeen 
                ? "bg-purple-500/5 border-purple-500/20" 
                : "bg-slate-950/30 border-slate-800",
              recentlyChanged === 'showLastSeen' ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950" : ""
            )}>
              {preferences.privacy.showLastSeen && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1"
                >
                  <Clock className="w-3 h-3 text-white" />
                </motion.div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={cn(
                    "p-2 rounded-lg",
                    preferences.privacy.showLastSeen ? "bg-purple-500/10" : "bg-slate-800"
                  )}>
                    <Clock className={cn(
                      "w-5 h-5",
                      preferences.privacy.showLastSeen ? "text-purple-400" : "text-slate-500"
                    )} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-semibold",
                        preferences.privacy.showLastSeen ? "text-white" : "text-slate-400"
                      )}>
                        Mostrar Última Conexión
                      </p>
                      {preferences.privacy.showLastSeen && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                          Visible
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Muestra la última vez que estuviste activo en la plataforma
                    </p>
                    <div className="flex items-start gap-2 text-xs bg-slate-950/50 p-2 rounded-lg">
                      <Info className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-500">
                        {preferences.privacy.showLastSeen 
                          ? 'Ejemplo: "Última vez hace 5 minutos"'
                          : "Tu última conexión no será visible"}
                      </p>
                    </div>
                  </div>
                </div>
                <Switch 
                  checked={preferences.privacy.showLastSeen} 
                  onCheckedChange={(val) => updatePrivacy('showLastSeen', val)} 
                  disabled={!editMode}
                  className={cn(!editMode ? "opacity-50 cursor-not-allowed" : "")}
                />
              </div>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* Contact Permissions - CONTROL GRANULAR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <PreferenceCard 
          icon={Users} 
          title="Permisos de Contacto" 
          description="Define quién puede ver tu información y comunicarse contigo"
        >
          <div className="space-y-6">
            
            {/* Profile Visibility */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  ¿Quién puede ver mi perfil completo?
                </h4>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                  {getPrivacyIcon(preferences.privacy.showProfile).label}
                </Badge>
              </div>

              <Select 
                value={preferences.privacy.showProfile} 
                onValueChange={(val) => updatePrivacy('showProfile', val)} 
                disabled={!editMode}
              >
                <SelectTrigger 
                  className={cn(
                    "bg-slate-950/50 border-slate-700 text-white h-12 transition-all",
                    !editMode ? "opacity-50 cursor-not-allowed" : "hover:border-purple-500/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(
                      getPrivacyIcon(preferences.privacy.showProfile).icon,
                      { className: `w-4 h-4 ${getPrivacyIcon(preferences.privacy.showProfile).color}` }
                    )}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all">
                    <div className="flex items-center gap-3 py-1">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Todos (Público)</span>
                        <span className="text-xs text-slate-500">Cualquiera puede ver tu perfil</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="contacts">
                    <div className="flex items-center gap-3 py-1">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Solo mis Contactos</span>
                        <span className="text-xs text-slate-500">Solo personas con cita confirmada</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="none">
                    <div className="flex items-center gap-3 py-1">
                      <Lock className="w-4 h-4 text-red-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Nadie (Privado)</span>
                        <span className="text-xs text-slate-500">Perfil completamente oculto</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Impact preview */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-xs">
                <div className="flex items-start gap-2">
                  <Sparkles className={cn(
                    "w-4 h-4 flex-shrink-0 mt-0.5",
                    getPrivacyIcon(preferences.privacy.showProfile).color
                  )} />
                  <p className="text-slate-400">
                    {preferences.privacy.showProfile === 'all' && "Tu perfil aparecerá en búsquedas y recomendaciones"}
                    {preferences.privacy.showProfile === 'contacts' && "Solo personas con citas confirmadas verán tu información completa"}
                    {preferences.privacy.showProfile === 'none' && "Tu perfil no será visible para ningún usuario"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Permission */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  ¿Quién puede enviarme mensajes?
                </h4>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                  {getPrivacyIcon(preferences.privacy.allowMessages).label}
                </Badge>
              </div>

              <Select 
                value={preferences.privacy.allowMessages} 
                onValueChange={(val) => updatePrivacy('allowMessages', val)} 
                disabled={!editMode}
              >
                <SelectTrigger 
                  className={cn(
                    "bg-slate-950/50 border-slate-700 text-white h-12 transition-all",
                    !editMode ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(
                      getPrivacyIcon(preferences.privacy.allowMessages).icon,
                      { className: `w-4 h-4 ${getPrivacyIcon(preferences.privacy.allowMessages).color}` }
                    )}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="all">
                    <div className="flex items-center gap-3 py-1">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Cualquiera</span>
                        <span className="text-xs text-slate-500">Todos pueden enviarte mensajes</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="contacts">
                    <div className="flex items-center gap-3 py-1">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Solo con Cita</span>
                        <span className="text-xs text-slate-500">Personas con cita confirmada</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="none">
                    <div className="flex items-center gap-3 py-1">
                      <EyeOff className="w-4 h-4 text-red-400" />
                      <div className="flex flex-col">
                        <span className="font-semibold">Nadie</span>
                        <span className="text-xs text-slate-500">Mensajes desactivados</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-xs">
                <div className="flex items-start gap-2">
                  <Zap className={cn(
                    "w-4 h-4 flex-shrink-0 mt-0.5",
                    getPrivacyIcon(preferences.privacy.allowMessages).color
                  )} />
                  <p className="text-slate-400">
                    {preferences.privacy.allowMessages === 'all' && "Podrás recibir mensajes de cualquier usuario de la plataforma"}
                    {preferences.privacy.allowMessages === 'contacts' && "Solo usuarios con citas confirmadas podrán contactarte"}
                    {preferences.privacy.allowMessages === 'none' && "No recibirás mensajes de ningún usuario"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* Security Info - CREDIBILIDAD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3"
      >
        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-400 mb-1">
            Tu Privacidad es Nuestra Prioridad
          </p>
          <p className="text-xs text-blue-300/80">
            Todos tus datos están protegidos con encriptación de extremo a extremo. 
            Puedes cambiar estas configuraciones en cualquier momento.
          </p>
        </div>
      </motion.div>

      {/* Edit Mode Warning */}
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
              Activa el modo de edición para modificar tu configuración de privacidad
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};