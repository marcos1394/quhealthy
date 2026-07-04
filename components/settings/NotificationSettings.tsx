"use client";

import React, { useState } from "react";
import { Bell, Smartphone, Mail, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function NotificationSettings() {
 const [preferences, setPreferences] = useState({
 marketing: false,
 medicalReminders: true,
 systemUpdates: true,
 });

 const togglePreference = (key: keyof typeof preferences) => {
 setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
 };

 return (
 <div className="space-y-8">
 <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
 <div>
 <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <Bell className="w-4 h-4" strokeWidth={1.5} /> Preferencias de Notificaciones
 </h2>
 <p className="text-sm text-gray-500 font-light mt-1">Controla cómo y cuándo quieres que QuHealthy se comunique contigo.</p>
 </div>
 </div>

 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800">
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Canales de Comunicación</h3>
 </div>
 <div className="p-6 divide-y divide-gray-200 dark:divide-gray-800">
 
 <div className="py-6 flex items-center justify-between first:pt-0 last:pb-0">
 <div>
 <p className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight">Recordatorios Médicos</p>
 <p className="text-xs text-gray-500 mt-1">Citas, toma de medicamentos y alertas de parámetros vitales.</p>
 </div>
 <Switch 
 checked={preferences.medicalReminders} 
 onCheckedChange={() => togglePreference('medicalReminders')} 
 className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
 />
 </div>

 <div className="py-6 flex items-center justify-between first:pt-0 last:pb-0">
 <div>
 <p className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight">Actualizaciones del Sistema</p>
 <p className="text-xs text-gray-500 mt-1">Nuevas integraciones, reportes mensuales y seguridad.</p>
 </div>
 <Switch 
 checked={preferences.systemUpdates} 
 onCheckedChange={() => togglePreference('systemUpdates')} 
 className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
 />
 </div>

 <div className="py-6 flex items-center justify-between first:pt-0 last:pb-0">
 <div>
 <p className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight">Promociones y Ofertas</p>
 <p className="text-xs text-gray-500 mt-1">Descuentos en consultas y alianzas exclusivas.</p>
 </div>
 <Switch 
 checked={preferences.marketing} 
 onCheckedChange={() => togglePreference('marketing')} 
 className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
 />
 </div>

 </div>
 </div>

 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] opacity-60">
 <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <Smartphone className="w-4 h-4" strokeWidth={1.5} /> Dispositivos Registrados (Push)
 </h3>
 <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 border border-amber-600 px-2 py-0.5">Próximamente</span>
 </div>
 <div className="p-6 text-center text-sm text-gray-500 py-12">
 La gestión de dispositivos push se configurará al lanzar la app móvil.
 </div>
 </div>
 </div>
 );
}
