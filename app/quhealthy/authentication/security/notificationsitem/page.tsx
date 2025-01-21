"use client";

import React from "react";
import { ShieldAlert, Lock, Info, CheckCircle2 } from "lucide-react";

interface NotificationItemProps {
    type: keyof typeof NotificationIcons; // Restricción a las claves de NotificationIcons
    message: string; // Mensaje de la notificación.
    date: string; // Fecha de la notificación.
  }
  

const NotificationIcons = {
  login: <ShieldAlert className="w-6 h-6 text-yellow-400" />,
  device: <Lock className="w-6 h-6 text-red-400" />,
  update: <Info className="w-6 h-6 text-blue-400" />,
  success: <CheckCircle2 className="w-6 h-6 text-green-400" />,
};

const NotificationItem: React.FC<NotificationItemProps> = ({ type, message, date }) => {
  const icon = NotificationIcons[type] || <Info className="w-6 h-6 text-gray-400" />;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-md shadow-sm hover:bg-gray-600 transition-colors">
      {/* Icono de la notificación */}
      <div>{icon}</div>

      {/* Contenido de la notificación */}
      <div className="flex-1">
        <p className="text-gray-300">{message}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
