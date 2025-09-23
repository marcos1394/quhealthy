/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/stores/SessionStore';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Loader2, Save, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns-tz';

export default function ConsumerSettingsPage() {
  const { user, fetchSession } = useSessionStore();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    birthDate: '', // Se manejará como string 'YYYY-MM-DD' para el input de fecha
    preferredLanguage: 'es',
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    marketingEmailsOptIn: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cuando el usuario del store de sesión se carga, llenamos el formulario.
    if (user) {
      // Usamos 'as any' porque el tipo 'UserSession' del store es más simple
      // que el estado completo del formulario que manejamos aquí.
      const fullUserData = user as any;

      setFormData({
        name: fullUserData.name || '',
        phoneNumber: fullUserData.phoneNumber || '',
        // El input de fecha espera un formato 'YYYY-MM-DD'
        birthDate: fullUserData.birthDate ? format(new Date(fullUserData.birthDate), 'yyyy-MM-dd') : '',
        preferredLanguage: fullUserData.preferredLanguage || 'es',
        emailNotificationsEnabled: fullUserData.emailNotificationsEnabled ?? true,
        smsNotificationsEnabled: fullUserData.smsNotificationsEnabled ?? false,
        marketingEmailsOptIn: fullUserData.marketingEmailsOptIn ?? false,
      });
    }
  }, [user]); // Este efecto se ejecuta cada vez que el objeto 'user' cambia.

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put('/api/consumer/profile', formData, { withCredentials: true });
      toast.success("Perfil actualizado exitosamente.");
      // Forzamos la recarga de la sesión para actualizar el Navbar y otros componentes
      await fetchSession();
    } catch (error) {
      toast.error("No se pudo actualizar tu perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-3xl font-bold text-white mb-8">Configuración de la Cuenta</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
        {/* Sección de Perfil */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><User/> Perfil Personal</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" value={user.email} disabled />
              <p className="text-xs text-gray-400 mt-1">El correo electrónico no se puede cambiar.</p>
            </div>
             <div>
              <Label htmlFor="phoneNumber">Número de Teléfono</Label>
              <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Ej. 555-123-4567"/>
            </div>
          </div>
        </div>
        
        {/* Sección de Notificaciones (ejemplo de campos booleanos) */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Bell/> Preferencias de Notificación</h2>
            <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Notificaciones por Correo</Label>
                <Switch id="emailNotifications" defaultChecked={true} />
            </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </motion.div>
  );
}