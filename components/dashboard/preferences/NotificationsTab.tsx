/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { 
  BellRing, 
  Smartphone,
  Mail,
  Bell,
  MessageSquare,
  Info,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Calendar,
  Star,
  FileText,
  Gift,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PreferenceCard } from './PreferenceCard';

/**
 * NotificationsTab Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. FEEDBACK INMEDIATO
 *    - Preview de notificaciones
 *    - Contador de canales activos
 *    - Animaciones al toggle
 *    - Estado visual claro
 * 
 * 2. AFFORDANCE
 *    - Iconos por canal
 *    - Estados on/off claros
 *    - Colores distintivos
 *    - Badges informativos
 * 
 * 3. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos descriptivos
 *    - Ejemplos de uso
 *    - Labels claros
 *    - Agrupación lógica
 * 
 * 4. MINIMIZAR ERRORES
 *    - Warning cuando todo está off
 *    - Confirmación visual
 *    - Defaults inteligentes
 *    - Info tooltips
 * 
 * 5. CREDIBILIDAD
 *    - Ejemplos de notificaciones
 *    - Frecuencia indicada
 *    - Privacy info
 *    - Control granular
 * 
 * 6. MINIMIZAR CARGA COGNITIVA
 *    - Agrupado por categoría
 *    - Opciones organizadas
 *    - Prioridad visual
 *    - Una decisión a la vez
 */

// Tipos
export type UserRole = 'provider' | 'consumer';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  [key: string]: boolean;
}

interface NotificationsTabProps {
  preferences: { notifications: NotificationPreferences };
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
  role: UserRole;
}

// Configuración de canales - RECONOCIMIENTO
const CHANNELS = [
  { 
    id: 'email', 
    label: 'Email',
    icon: Mail,
    description: 'Resumen diario y recibos',
    example: 'ejemplo@email.com',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  { 
    id: 'push', 
    label: 'Notificaciones Push',
    icon: Bell,
    description: 'Alertas en tiempo real al navegador',
    example: 'Navegador web y móvil',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  { 
    id: 'sms', 
    label: 'SMS / WhatsApp',
    icon: MessageSquare,
    description: 'Avisos urgentes a tu celular',
    example: '+52 xxx xxx xxxx',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  }
];

// Configuración de notificaciones por rol - CHUNKING
const NOTIFICATION_TYPES = {
  provider: [
    { 
      id: 'new_appointment', 
      label: 'Nuevas Citas',
      icon: Calendar,
      description: 'Recibe aviso cuando alguien agende contigo',
      priority: 'high',
      frequency: 'Inmediato'
    },
    { 
      id: 'cancellations', 
      label: 'Cancelaciones',
      icon: AlertCircle,
      description: 'Si un paciente cancela o reprograma',
      priority: 'high',
      frequency: 'Inmediato'
    },
    { 
      id: 'reviews', 
      label: 'Nuevas Reseñas',
      icon: Star,
      description: 'Cuando recibas feedback de un paciente',
      priority: 'medium',
      frequency: 'Diario'
    },
  ],
  consumer: [
    { 
      id: 'reminders', 
      label: 'Recordatorios de Cita',
      icon: Calendar,
      description: 'Avisos 24h y 1h antes de tu consulta',
      priority: 'high',
      frequency: '24h y 1h antes'
    },
    { 
      id: 'promotions', 
      label: 'Ofertas y Paquetes',
      icon: Gift,
      description: 'Descuentos especiales de tus doctores',
      priority: 'low',
      frequency: 'Semanal'
    },
    { 
      id: 'documents', 
      label: 'Documentos Listos',
      icon: FileText,
      description: 'Cuando tu doctor suba una receta o estudio',
      priority: 'high',
      frequency: 'Inmediato'
    },
  ]
};

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ 
  preferences, 
  setPreferences, 
  editMode, 
  role 
}) => {
  const [recentlyToggled, setRecentlyToggled] = useState<string | null>(null);

  const handleToggle = (key: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));

    // Show feedback
    setRecentlyToggled(key);
    setTimeout(() => setRecentlyToggled(null), 2000);
  };

  // Helper para contar canales activos - FEEDBACK VISUAL
  const getActiveChannelsCount = () => {
    return CHANNELS.filter(c => preferences.notifications[c.id]).length;
  };

  // Helper para contar notificaciones activas
  const getActiveNotificationsCount = () => {
    return NOTIFICATION_TYPES[role].filter(n => 
      preferences.notifications[n.id] ?? true
    ).length;
  };

  // Helper para badge de prioridad - PRIMING
  const getPriorityBadge = (priority: string) => {
    const configs = {
      high: {
        text: 'Alta',
        className: 'bg-red-500/10 text-red-400 border-red-500/20'
      },
      medium: {
        text: 'Media',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      },
      low: {
        text: 'Baja',
        className: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      }
    };

    const config = configs[priority as keyof typeof configs] || configs.low;

    return (
      <Badge variant="outline" className={cn("text-xs", config.className)}>
        {config.text}
      </Badge>
    );
  };

  const activeChannels = getActiveChannelsCount();
  const activeNotifications = getActiveNotificationsCount();
  const allChannelsOff = activeChannels === 0;

  return (
    <div className="space-y-6">
      
      {/* Summary Card - FEEDBACK VISUAL */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            {activeChannels > 0 ? (
              <Volume2 className="w-5 h-5 text-purple-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white mb-1">
              Estado de Notificaciones
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                {activeChannels} de {CHANNELS.length} canales activos
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                {activeNotifications} de {NOTIFICATION_TYPES[role].length} tipos activos
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Warning cuando todo está apagado - MINIMIZAR ERRORES */}
      <AnimatePresence>
        {allChannelsOff && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400 mb-1">
                Todos los Canales Desactivados
              </p>
              <p className="text-xs text-amber-300/80">
                No recibirás ninguna notificación. Activa al menos un canal para mantenerte informado.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Canales de Contacto - AFFORDANCE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreferenceCard 
          icon={Smartphone} 
          title="Canales de Contacto" 
          description="Elige cómo prefieres recibir notificaciones"
        >
          <div className="space-y-4">
            {CHANNELS.map((channel, index) => {
              const isActive = preferences.notifications[channel.id];
              const Icon = channel.icon;

              return (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative flex items-start justify-between p-4 rounded-xl border-2 transition-all duration-300",
                    isActive 
                      ? `${channel.bgColor} ${channel.borderColor}` 
                      : "bg-gray-950/30 border-gray-800",
                    recentlyToggled === channel.id ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950" : ""
                  )}
                >
                  {/* Check indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}

                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isActive ? channel.bgColor : "bg-gray-800"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isActive ? channel.color : "text-gray-500"
                      )} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-semibold",
                          isActive ? "text-white" : "text-gray-400"
                        )}>
                          {channel.label}
                        </p>
                        {isActive && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            Activo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {channel.description}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {channel.example}
                      </p>
                    </div>
                  </div>

                  <Switch 
                    checked={isActive}
                    onCheckedChange={(val) => handleToggle(channel.id, val)} 
                    disabled={!editMode}
                    className={cn(
                      !editMode ? "opacity-50 cursor-not-allowed" : ""
                    )}
                  />
                </motion.div>
              );
            })}
          </div>
        </PreferenceCard>
      </motion.div>
      
      {/* Tipos de Alerta - CHUNKING */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <PreferenceCard 
          icon={BellRing} 
          title="Tipos de Notificación" 
          description="Personaliza qué eventos son importantes para ti"
        >
          <div className="space-y-4">
            {NOTIFICATION_TYPES[role].map((item, index) => {
              const isActive = preferences.notifications[item.id] ?? true;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative flex items-start justify-between p-4 rounded-xl border-2 transition-all duration-300",
                    isActive 
                      ? "bg-purple-500/5 border-purple-500/20" 
                      : "bg-gray-950/30 border-gray-800",
                    recentlyToggled === item.id ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950" : ""
                  )}
                >
                  {/* Check indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}

                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isActive ? "bg-purple-500/10" : "bg-gray-800"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isActive ? "text-purple-400" : "text-gray-500"
                      )} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={cn(
                          "font-semibold",
                          isActive ? "text-white" : "text-gray-400"
                        )}>
                          {item.label}
                        </p>
                        {getPriorityBadge(item.priority)}
                        {isActive && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            Activo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Zap className="w-3 h-3" />
                        Frecuencia: <span className="text-gray-500">{item.frequency}</span>
                      </div>
                    </div>
                  </div>

                  <Switch 
                    checked={isActive}
                    onCheckedChange={(val) => handleToggle(item.id, val)} 
                    disabled={!editMode}
                    className={cn(
                      !editMode ? "opacity-50 cursor-not-allowed" : ""
                    )}
                  />
                </motion.div>
              );
            })}
          </div>
        </PreferenceCard>
      </motion.div>

      {/* Privacy Info - CREDIBILIDAD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-400 mb-1">
            Tu Privacidad es Importante
          </p>
          <p className="text-xs text-blue-300/80">
            Nunca compartiremos tu información de contacto con terceros. 
            Puedes modificar estas preferencias en cualquier momento.
          </p>
        </div>
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
              Activa el modo de edición para modificar tus preferencias de notificaciones
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};