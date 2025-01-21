"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  Settings,
  Heart,
  Sparkles,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react";

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface GeneralPreferences {
  marketingEmails: boolean;
  appointmentReminders: boolean;
  healthTips: boolean;
  beautyTips: boolean;
}

interface PatientPreferencesForm {
  notificationPreferences: NotificationPreferences;
  generalPreferences: GeneralPreferences;
  preferredTimeForNotifications: string;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

const PatientPreferences: React.FC = () => {
  const [form, setForm] = useState<PatientPreferencesForm>({
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
    generalPreferences: {
      marketingEmails: true,
      appointmentReminders: true,
      healthTips: false,
      beautyTips: true,
    },
    preferredTimeForNotifications: "morning",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section: "notificationPreferences" | "generalPreferences"
  ) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: checked,
      },
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, preferredTimeForNotifications: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/patients/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Error al guardar las preferencias");
      toast.success("¡Preferencias actualizadas exitosamente!");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al guardar las preferencias");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Configura tus Preferencias
          </h1>

          <motion.div
            className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-xl"
            variants={fadeIn}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Notification Preferences */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xl font-semibold text-teal-400">
                  <Bell className="w-6 h-6" />
                  <h2>Preferencias de Notificación</h2>
                </div>
                <div className="grid gap-4">
                  {[
                    { name: "email", icon: Mail, label: "Notificaciones por correo electrónico" },
                    { name: "sms", icon: MessageSquare, label: "Notificaciones por SMS" },
                    { name: "push", icon: Bell, label: "Notificaciones push" }
                  ].map(({ name, icon: Icon, label }) => (
                    <motion.label
                      key={name}
                      className="flex items-center p-4 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <input
                        type="checkbox"
                        name={name}
                        checked={form.notificationPreferences[name as keyof NotificationPreferences]}
                        onChange={(e) => handleCheckboxChange(e, "notificationPreferences")}
                        className="form-checkbox h-5 w-5 text-teal-500 rounded"
                      />
                      <span className="ml-3 flex items-center gap-2 text-white">
                        <Icon className="w-5 h-5 text-teal-400" />
                        {label}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* General Preferences */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xl font-semibold text-teal-400">
                  <Settings className="w-6 h-6" />
                  <h2>Preferencias Generales</h2>
                </div>
                <div className="grid gap-4">
                  {[
                    { name: "marketingEmails", icon: Mail, label: "Recibir correos promocionales" },
                    { name: "appointmentReminders", icon: Calendar, label: "Recordatorios de citas" },
                    { name: "healthTips", icon: Heart, label: "Consejos de salud" },
                    { name: "beautyTips", icon: Sparkles, label: "Consejos de belleza" }
                  ].map(({ name, icon: Icon, label }) => (
                    <motion.label
                      key={name}
                      className="flex items-center p-4 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <input
                        type="checkbox"
                        name={name}
                        checked={form.generalPreferences[name as keyof GeneralPreferences]}
                        onChange={(e) => handleCheckboxChange(e, "generalPreferences")}
                        className="form-checkbox h-5 w-5 text-teal-500 rounded"
                      />
                      <span className="ml-3 flex items-center gap-2 text-white">
                        <Icon className="w-5 h-5 text-teal-400" />
                        {label}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Preferred Time */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-semibold text-teal-400">
                  <Clock className="w-6 h-6" />
                  <h2>Horario Preferido</h2>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={form.preferredTimeForNotifications}
                    onChange={handleSelectChange}
                    className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                  >
                    <option value="morning">Mañana (8:00 - 12:00)</option>
                    <option value="afternoon">Tarde (12:00 - 17:00)</option>
                    <option value="evening">Noche (17:00 - 21:00)</option>
                  </select>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-lg font-semibold bg-teal-500 text-white hover:bg-teal-600 
                          transition-colors disabled:bg-teal-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Settings className="w-5 h-5" />
                    Guardar Preferencias
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientPreferences;