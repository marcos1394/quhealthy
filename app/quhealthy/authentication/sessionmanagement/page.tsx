"use client";

import React, { useState } from "react";
// import useSessionData from "../../hooks/usesessiondata"; // <-- Comentado para no usar lógica real
import SessionList from "../../components/sessionlist";
import SessionDetails from "../../components/sessiondetails";
import SessionControls from "../../components/sessioncontrols";

export default function SessionManagementPage() {
  /*
  // Código original comentado:
  const {
    sessions,
    selectedSession,
    loading,
    setSelectedSession,
    fetchSessions,
    handleSessionLogout,
    handleLogoutAllSessions,
  } = useSessionData();
  */

  // Datos dummy para ilustrar el componente
  const [sessions, setSessions] = useState([
    {
      id: "1",
      device: "Laptop Windows",
      location: "Ciudad de México, México",
      ip: "192.168.1.10",
      lastActivity: "2025-01-10T14:00:00.000Z",
      browser: "Chrome",
      os: "Windows 10",
    },
    {
      id: "2",
      device: "Smartphone Android",
      location: "Monterrey, México",
      ip: "192.168.1.45",
      lastActivity: "2025-01-11T08:30:00.000Z",
      browser: "Firefox",
      os: "Android 12",
    },
    {
      id: "3",
      device: "Tablet iOS",
      location: "Guadalajara, México",
      ip: "192.168.1.99",
      lastActivity: "2025-01-11T09:10:00.000Z",
      browser: "Safari",
      os: "iOS 15",
    },
  ]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [showControls, setShowControls] = useState(false); // Estado para controlar la visibilidad de los controles

  // Funciones dummy
  const handleLogout = (sessionId: string) => {
    console.log("Cerrando sesión con ID:", sessionId);
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
  };

  const handleLogoutAll = () => {
    console.log("Cerrando todas las sesiones");
    setSessions([]);
  };

  const handleSetExpiration = (time: number) => {
    console.log(`Tiempo de expiración configurado a ${time} minutos`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-teal-400 text-center">
          Gestión de Sesiones Activas
        </h1>

        {/* Botón para mostrar/ocultar controles */}
        <div className="text-center">
          <button
            onClick={() => setShowControls((prev) => !prev)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-all"
          >
            {showControls ? "Ocultar Controles" : "Mostrar Controles"}
          </button>
        </div>

        {/* Controles de sesión (ocultos por defecto) */}
        {showControls && (
          <SessionControls
            onLogoutAll={handleLogoutAll}
            onSetExpiration={handleSetExpiration}
          />
        )}

        {/* Lista de sesiones */}
        <SessionList
          sessions={sessions}
          onLogout={handleLogout}
          onViewDetails={(sessionId) => {
            const session = sessions.find((s) => s.id === sessionId);
            setSelectedSession(session || null);
          }}
        />

        {/* Detalles de la sesión */}
        {selectedSession && (
          <SessionDetails
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
          />
        )}
      </div>
    </div>
  );
}
