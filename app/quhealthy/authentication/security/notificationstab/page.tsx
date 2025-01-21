"use client";

import React, { useEffect, useState } from "react";
import { Bell, ShieldAlert, Lock } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Notification {
  id: string;
  type: string; // "login", "device", "update", etc.
  message: string;
  date: string;
  icon: React.ReactNode;
}

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications from the backend
    const fetchNotifications = async () => {
      try {
        const data: Notification[] = [
          {
            id: "1",
            type: "login",
            message: "Nuevo inicio de sesión desde un dispositivo desconocido.",
            date: "2025-01-09 14:35",
            icon: <ShieldAlert className="w-6 h-6 text-yellow-400" />,
          },
          {
            id: "2",
            type: "device",
            message: "Se ha eliminado un dispositivo de confianza.",
            date: "2025-01-08 10:12",
            icon: <Lock className="w-6 h-6 text-red-400" />,
          },
        ];
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Card className="bg-gray-800 border-gray-700 w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 bg-teal-500/10 p-3 rounded-full w-fit">
          <Bell className="w-8 h-8 text-teal-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-teal-400">
          Notificaciones de Seguridad
        </h1>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-300">Cargando notificaciones...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-400">No tienes notificaciones recientes.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center gap-4 p-4 bg-gray-700 rounded-md"
            >
              {notification.icon}
              <div>
                <p className="text-gray-300">{notification.message}</p>
                <p className="text-sm text-gray-500">{notification.date}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsTab;
