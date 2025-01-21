"use client";

import React from "react";
import { motion } from "framer-motion";
import { Laptop, Smartphone, MapPin, Clock, Shield, AlertTriangle, X } from "lucide-react";

// Define el tipo para los dispositivos
interface Device {
  id: number;
  name: string;
  type: string;
  lastUsed: string;
  location: string;
  browser: string;
  ip: string;
  isCurrentDevice: boolean;
}

const devices: Device[] = [
  {
    id: 1,
    name: "Laptop - Windows",
    type: "laptop",
    lastUsed: "2025-01-08",
    location: "México",
    browser: "Chrome",
    ip: "192.168.1.1",
    isCurrentDevice: true,
  },
  {
    id: 2,
    name: "iPhone 13",
    type: "mobile",
    lastUsed: "2025-01-06",
    location: "Estados Unidos",
    browser: "Safari",
    ip: "192.168.1.2",
    isCurrentDevice: false,
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function DeviceManagement() {
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null); // Cambiar el tipo aquí

  const handleDeviceRemove = (device: Device) => {
    setSelectedDevice(device); // Ahora acepta un objeto del tipo `Device`
    setShowConfirmDialog(true);
  };

  const confirmRemove = () => {
    console.log("Dispositivo eliminado:", selectedDevice);
    setShowConfirmDialog(false);
    setSelectedDevice(null);
  };

  const getDeviceIcon = (type: string) => {
    return type === "laptop" ? (
      <Laptop className="w-6 h-6 text-teal-400" />
    ) : (
      <Smartphone className="w-6 h-6 text-teal-400" />
    );
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8"
      {...fadeIn}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Shield className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            Dispositivos Confiables
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            Administra los dispositivos que tienen acceso a tu cuenta
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {devices.map((device) => (
            <motion.div
              key={device.id}
              className="p-6 border-b border-gray-700 last:border-b-0"
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="p-3 bg-gray-700 rounded-lg">{getDeviceIcon(device.type)}</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-teal-300">{device.name}</h2>
                      {device.isCurrentDevice && (
                        <span className="px-2 py-1 text-xs bg-teal-400/10 text-teal-400 rounded-full">
                          Dispositivo actual
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Último uso: {device.lastUsed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{device.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>IP: {device.ip}</span>
                      <span>•</span>
                      <span>{device.browser}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeviceRemove(device)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  disabled={device.isCurrentDevice}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal de confirmación */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-semibold text-white">Confirmar eliminación</h3>
              </div>
              <p className="text-gray-400 mb-6">
                ¿Estás seguro de que deseas eliminar este dispositivo? Esta acción no se puede
                deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRemove}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Eliminar dispositivo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
