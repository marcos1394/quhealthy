import React, { useState } from "react";
import { 
  Monitor, 
  LogOut, 
  ChevronRight, 
  Search,
  MapPin,
  Shield,
  Clock,
  Plus,
  Laptop,
  Smartphone,
  Tablet
} from "lucide-react";

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActivity: string;
}

interface SessionListProps {
  sessions: Session[];
  onLogout: (sessionId: string) => void;
  onViewDetails: (sessionId: string) => void;
}

export default function SessionList({ sessions, onLogout, onViewDetails }: SessionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof Session>("lastActivity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType.toLowerCase().includes("mobile")) return Smartphone;
    if (deviceType.toLowerCase().includes("tablet")) return Tablet;
    return Laptop;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeDiff = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) return `Hace ${minutes} minutos`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} horas`;
    return `Hace ${Math.floor(minutes / 1440)} días`;
  };

  const filteredSessions = sessions
    .filter(session => 
      session.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ip.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      }
      return a[sortBy] < b[sortBy] ? 1 : -1;
    });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por dispositivo, ubicación o IP..."
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-teal-400 text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.device);
          return (
            <div
              key={session.id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer group"
              onClick={() => onViewDetails(session.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-800 rounded-lg text-teal-400">
                    <DeviceIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {session.device}
                      <span className="text-sm text-gray-400 font-normal">
                        • {session.ip}
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {session.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {getTimeDiff(session.lastActivity)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogout(session.id);
                    }}
                    className="p-2 hover:bg-red-500 rounded-lg transition-colors group-hover:text-white"
                    title="Cerrar sesión"
                  >
                    <LogOut size={20} />
                  </button>
                  <ChevronRight 
                    size={20} 
                    className="text-gray-400 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filteredSessions.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Shield className="mx-auto mb-4 opacity-50" size={48} />
            <p>No se encontraron sesiones activas</p>
          </div>
        )}
      </div>
    </div>
  );
}