"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  MapPin,
  Download
} from "lucide-react";

const logs = [
  { 
    id: 1, 
    activity: "Inicio de sesión exitoso", 
    type: "success",
    timestamp: "2025-01-08 14:30", 
    ip: "192.168.1.1",
    location: "Ciudad de México",
    device: "Windows PC - Chrome",
  },
  { 
    id: 2, 
    activity: "Intento de inicio de sesión fallido", 
    type: "error",
    timestamp: "2025-01-08 13:15", 
    ip: "192.168.1.2",
    location: "Nueva York",
    device: "iPhone - Safari",
  },
  { 
    id: 3, 
    activity: "Cambio de contraseña", 
    type: "warning",
    timestamp: "2025-01-07 16:45", 
    ip: "192.168.1.1",
    location: "Ciudad de México",
    device: "Windows PC - Chrome",
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ActivityLogs() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("all");

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Activity className="w-5 h-5 text-teal-400" />;
    }
  };

  const filteredLogs = logs
    .filter(log => 
      (selectedType === "all" || log.type === selectedType) &&
      (log.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
       log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
       log.device.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8"
      {...fadeIn}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Activity className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Historial de Actividades
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            Monitorea la actividad y seguridad de tu cuenta
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Filtros y Búsqueda */}
          <div className="p-4 border-b border-gray-700 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar actividad..."
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="success">Exitosos</option>
                  <option value="error">Errores</option>
                  <option value="warning">Advertencias</option>
                </select>
                <button className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Actividades */}
          <div className="divide-y divide-gray-700">
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                className="p-4 hover:bg-gray-700/50 transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-700 rounded-lg">
                    {getActivityIcon(log.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-teal-300">
                        {log.activity}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{log.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{log.location}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex gap-4 text-sm text-gray-500">
                      <span>IP: {log.ip}</span>
                      <span>•</span>
                      <span>{log.device}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No se encontraron actividades que coincidan con los filtros.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

