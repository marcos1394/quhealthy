"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  Calendar as CalendarIcon,
  Timer,
  UserCheck,
  ArrowRight,
  X
} from "lucide-react";
import ProviderAvailabilityCalendar from "../components/providercalendar";

interface Appointment {
  provider: string;
  date: string;
  time: string;
}

const ScheduleAppointment: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const handleProviderSelection = (providerName: string, date: string) => {
    setSelectedProvider(providerName);
    setSelectedDate(date);
    setSelectedTime(null);
    toast.info(`Seleccionaste al proveedor: ${providerName}`, {
      icon: <UserCheck className="w-5 h-5 text-teal-400" />
    });
  };

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !selectedProvider) {
      toast.error("Por favor, completa todos los campos antes de agendar.", {
        icon: <X className="w-5 h-5 text-red-400" />
      });
      return;
    }

    const newAppointment: Appointment = {
      provider: selectedProvider,
      date: selectedDate,
      time: selectedTime,
    };

    setAppointments((prev) => [...prev, newAppointment]);
    setIsConfirmationVisible(true);

    toast.success("Cita agendada exitosamente.", {
      icon: <CheckCircle className="w-5 h-5 text-green-400" />
    });
  };

  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedProvider(null);
    setIsConfirmationVisible(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8" />
            Agenda tu Cita
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6"
            >
              <h2 className="text-xl font-semibold text-teal-400 mb-6 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                Selecciona Fecha y Proveedor
              </h2>
              <ProviderAvailabilityCalendar onProviderSelect={handleProviderSelection} />
            </motion.div>

            {/* Details Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6"
            >
              <h2 className="text-xl font-semibold text-teal-400 mb-6 flex items-center gap-2">
                <User className="w-6 h-6" />
                Completa los Detalles
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Fecha seleccionada
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={selectedDate ? new Date(selectedDate).toLocaleDateString() : ""}
                      readOnly
                      className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      placeholder="Selecciona una fecha en el calendario"
                    />
                    <CalendarIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Horario disponible
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative"
                  >
                    <select
                      value={selectedTime || ""}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all appearance-none"
                      disabled={!selectedDate}
                    >
                      <option value="">Selecciona un horario</option>
                      {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"]
                        .map(time => (
                          <option key={time} value={time}>
                            {time} hrs
                          </option>
                        ))}
                    </select>
                    <Clock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Proveedor seleccionado
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={selectedProvider || ""}
                      readOnly
                      className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                      placeholder="Selecciona un proveedor en el calendario"
                    />
                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  </motion.div>
                </div>

                <motion.button
                  onClick={handleSchedule}
                  className="w-full bg-teal-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!selectedDate || !selectedTime || !selectedProvider}
                >
                  <ArrowRight className="w-5 h-5" />
                  Agendar Cita
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {isConfirmationVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm z-50"
              >
                <motion.div
                  className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                >
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CheckCircle className="w-16 h-16 text-green-400" />
                      </motion.div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-teal-400">
                      ¡Cita Agendada!
                    </h3>
                    
                    <div className="space-y-2 text-gray-300">
                      <p className="flex items-center justify-center gap-2">
                        <CalendarIcon className="w-5 h-5" />
                        {new Date(selectedDate!).toLocaleDateString()}
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5" />
                        {selectedTime} hrs
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <User className="w-5 h-5" />
                        {selectedProvider}
                      </p>
                    </div>

                    <motion.button
                      onClick={resetForm}
                      className="mt-6 px-6 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Aceptar
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ScheduleAppointment;