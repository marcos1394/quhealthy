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
 <div className="flex items-center justify-between pb-2">
 <div>
 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
 <Bell className="w-5 h-5 text-emerald-600" strokeWidth={2} /> Preferencias de Notificaciones
 </h2>
 <p className="text-base text-gray-500 mt-1">Controla cómo y cuándo quieres que QuHealthy se comunique contigo.</p>
 </div>
 </div>

 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
 <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800">
 <h3 className="text-base font-bold text-gray-900 dark:text-white">Canales de Comunicación</h3>
 </div>
 <div className="p-6 divide-y divide-gray-100 dark:divide-gray-800">
 
 <div className="py-6 flex items-center justify-between first:pt-0 last:pb-0">
 <div>
 <p className="text-base font-bold text-gray-900 dark:text-white">Recordatorios Médicos</p>
 <p className="text-sm text-gray-500 mt-1">Citas, toma de medicamentos y alertas de parámetros vitales.</p>
 </div>
 <Switch 
 checked={preferences.medicalReminders} 
 onCheckedChange={() => togglePreference('medicalReminders')} 
 className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
 />
 </div>

 <div className="py-6 flex items-center justify-between first:pt-0 last:pb-0">
 <div>
 <p className="text-base font-bold text-gray-900 dark:text-white">Actualizaciones del Sistema</p>
 <p className="text-sm text-gray-500 mt-1">Nuevas integraciones, reportes mensuales y seguridad.</p>
 </div>
 <Switch 
 checked={preferences.systemUpdates} 
 onCheckedChange={() => togglePreference('systemUpdates')} 
 className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
 />
 </div>

 <div className="py-6 flex items-center justify-between first:pt-0 last:pb-0">
 <div>
 <p className="text-base font-bold text-gray-900 dark:text-white">Promociones y Ofertas</p>
 <p className="text-sm text-gray-500 mt-1">Descuentos en consultas y alianzas exclusivas.</p>
 </div>
 <Switch 
 checked={preferences.marketing} 
 onCheckedChange={() => togglePreference('marketing')} 
 className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
 />
 </div>

 </div>
 </div>

 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm opacity-60 overflow-hidden">
 <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
 <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
 <Smartphone className="w-5 h-5 text-gray-500" strokeWidth={2} /> Dispositivos Registrados (Push)
 </h3>
 <span className="inline-flex text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-lg">Próximamente</span>
 </div>
 <div className="p-6 text-center text-sm text-gray-500 py-12">
 La gestión de dispositivos push se configurará al lanzar la app móvil.
 </div>
 </div>
 </div>
 );
}
