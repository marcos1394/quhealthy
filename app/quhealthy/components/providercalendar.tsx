/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { 
  Calendar,
  Clock, 
  User,
  Loader2,
  RefreshCcw,
  CalendarDays,
  CalendarClock
} from "lucide-react";
import axios from "axios";

interface ProviderAvailability {
  id: string;
  providerName: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface ProviderAvailabilityCalendarProps {
  onProviderSelect: (providerName: string, date: string) => void;
}

const ProviderAvailabilityCalendar: React.FC<ProviderAvailabilityCalendarProps> = ({
  onProviderSelect,
}) => {
  const [availability, setAvailability] = useState<ProviderAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedView, setSelectedView] = useState<string>("dayGridMonth");
  const [selectedEvent, setSelectedEvent] = useState<ProviderAvailability | null>(null);

  const fetchAvailability = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("/api/providers/availability");
      setAvailability(response.data.availability || []);
    } catch (err) {
      setError("No se pudo cargar la disponibilidad. Por favor, intenta de nuevo.");
      toast.error("Error al cargar la disponibilidad.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const events = availability.map((item) => ({
    id: item.id,
    title: item.providerName,
    start: `${item.date}T${item.startTime}`,
    end: `${item.date}T${item.endTime}`,
  }));

  const handleEventClick = (info: any) => {
    const selected = availability.find((event) => event.id === info.event.id);
    if (selected) {
      setSelectedEvent(selected);
      onProviderSelect(selected.providerName, selected.date);
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8" />
            Disponibilidad de Proveedores
          </h1>

          <motion.div 
            className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {loading ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
                <p className="text-gray-300">Cargando disponibilidad...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-red-400 mb-4">{error}</p>
                <motion.button
                  onClick={fetchAvailability}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reintentar
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <motion.button
                    onClick={() => setSelectedView("dayGridMonth")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedView === "dayGridMonth"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CalendarDays className="w-4 h-4" />
                    Mes
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedView("timeGridWeek")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedView === "timeGridWeek"
                        ? "bg-teal-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CalendarClock className="w-4 h-4" />
                    Semana
                  </motion.button>
                </div>

                <div className="calendar-container">
                <FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView={selectedView}
  headerToolbar={{
    left: "prev,next today",
    center: "title",
    right: "",
  }}
  events={events}
  eventClick={handleEventClick}
  eventColor="rgb(20 184 166)"
  eventClassNames="hover:opacity-80 cursor-pointer transition-opacity"
  locale="es"
  height="auto"
  contentHeight={600}
/>

                </div>

                <AnimatePresence>
                  {selectedEvent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 p-4 bg-gray-700/50 rounded-lg"
                    >
                      <h3 className="text-lg font-semibold text-teal-400 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Detalle de la Cita
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4" />
                          <span>Proveedor: {selectedEvent.providerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4" />
                          <span>Fecha: {new Date(selectedEvent.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4" />
                          <span>Hora: {selectedEvent.startTime} - {selectedEvent.endTime}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProviderAvailabilityCalendar;