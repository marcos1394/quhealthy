import React from "react";
import { 
  Monitor, 
  Globe, 
  Clock, 
  Shield, 
  Chrome, 
  Settings, 
  X,
  MapPin,
  Activity
} from "lucide-react";

interface SessionDetailsProps {
  session: {
    id: string;
    device: string;
    location: string;
    ip: string;
    lastActivity: string;
    browser: string;
    os: string;
  };
  onClose: () => void;
}

export default function SessionDetails({ session, onClose }: SessionDetailsProps) {
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
    
    if (minutes < 60) return `${minutes} minutos`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} horas`;
    return `${Math.floor(minutes / 1440)} días`;
  };

  const sessionDetails = [
    {
      icon: Monitor,
      label: "Dispositivo",
      value: session.device,
      color: "text-blue-400"
    },
    {
      icon: Chrome,
      label: "Navegador",
      value: session.browser,
      color: "text-yellow-400"
    },
    {
      icon: Settings,
      label: "Sistema Operativo",
      value: session.os,
      color: "text-green-400"
    },
    {
      icon: MapPin,
      label: "Ubicación",
      value: session.location,
      color: "text-red-400"
    },
    {
      icon: Shield,
      label: "Dirección IP",
      value: session.ip,
      color: "text-purple-400"
    },
    {
      icon: Activity,
      label: "Última Actividad",
      value: formatDate(session.lastActivity),
      subtitle: `Hace ${getTimeDiff(session.lastActivity)}`,
      color: "text-teal-400"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg max-w-md w-full transform transition-all animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Globe className="text-teal-400" size={24} />
            <h2 className="text-2xl font-bold text-teal-400">Detalles de la Sesión</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {sessionDetails.map((detail, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className={`p-2 bg-gray-700 rounded-lg ${detail.color}`}>
                <detail.icon size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400">{detail.label}</div>
                <div className="font-medium">{detail.value}</div>
                {detail.subtitle && (
                  <div className="text-sm text-gray-400 mt-1">{detail.subtitle}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 text-white py-3 px-6 rounded-md hover:bg-gray-600 transition-all flex items-center justify-center gap-2 group"
          >
            <X className="group-hover:rotate-90 transition-transform" size={20} />
            Cerrar detalles
          </button>
        </div>
      </div>
    </div>
  );
}