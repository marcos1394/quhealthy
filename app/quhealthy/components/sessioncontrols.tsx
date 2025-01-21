import React from "react";
import { Clock, LogOut, Shield, AlertCircle } from "lucide-react";

interface SessionControlsProps {
  onLogoutAll: () => void;
  onSetExpiration: (expiration: number) => void;
}

export default function SessionControls({ onLogoutAll, onSetExpiration }: SessionControlsProps) {
  const [expiration, setExpiration] = React.useState(30);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const presetTimes = [
    { label: "30 min", value: 30 },
    { label: "1 hora", value: 60 },
    { label: "2 horas", value: 120 },
    { label: "4 horas", value: 240 }
  ];

  const handleSetExpiration = () => {
    if (expiration > 0) {
      onSetExpiration(expiration);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleLogoutAll = () => {
    setShowConfirmation(true);
  };

  const confirmLogoutAll = () => {
    onLogoutAll();
    setShowConfirmation(false);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-700">
        <Shield className="text-teal-400" size={24} />
        <h2 className="text-2xl font-bold text-teal-400">Controles de Sesión</h2>
      </div>

      {/* Expiration Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock size={16} />
          <span>Configurar tiempo de expiración</span>
        </div>
        
        {/* Preset Times */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {presetTimes.map((time) => (
            <button
              key={time.value}
              onClick={() => setExpiration(time.value)}
              className={`p-2 rounded-md transition-all ${
                expiration === time.value
                  ? "bg-teal-500 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>

        {/* Custom Time Input */}
        <div className="relative">
          <input
            type="number"
            value={expiration}
            onChange={(e) => setExpiration(Math.max(1, Number(e.target.value)))}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            min={1}
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            minutos
          </span>
        </div>

        <button
          onClick={handleSetExpiration}
          className="w-full bg-teal-500 text-white py-3 px-6 rounded-md hover:bg-teal-600 transition-all flex items-center justify-center gap-2 group"
        >
          <Clock className="group-hover:rotate-180 transition-transform duration-300" size={20} />
          Establecer Tiempo
        </button>
      </div>

      {/* Logout Controls */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={handleLogoutAll}
          className="w-full bg-gray-700 hover:bg-red-600 text-white py-3 px-6 rounded-md transition-all flex items-center justify-center gap-2 group"
        >
          <LogOut className="group-hover:translate-x-1 transition-transform" size={20} />
          Cerrar Todas las Sesiones
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="absolute bottom-4 right-4 bg-teal-500 text-white px-4 py-2 rounded-md flex items-center gap-2 animate-fade-in">
          <Clock size={20} />
          Tiempo de expiración actualizado
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm mx-4 space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Confirmar acción</h3>
            </div>
            <p className="text-gray-300">
              ¿Estás seguro de que deseas cerrar todas las sesiones activas? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogoutAll}
                className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}