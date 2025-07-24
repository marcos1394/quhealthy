"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { UserRole, Notification } from '@/app/quhealthy/types/dashboard';

interface DashboardHeaderProps {
  role: UserRole;
  notifications: Notification[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ role, notifications }) => {
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-teal-400">
          ¡Bienvenido{role === "proveedor" ? " de vuelta" : ""}!
        </h1>
        <p className="text-gray-400">
          {role === "paciente"
            ? "Gestiona tus citas y servicios de salud y belleza"
            : "Administra tus servicios y clientes"}
        </p>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" className="bg-gray-800 border-gray-700 relative">
          <Bell className="w-4 h-4" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </Button>
        <Button className="bg-teal-500 hover:bg-teal-600">
          {role === "paciente" ? "Agendar Cita" : "Crear Servicio"}
        </Button>
      </div>
    </div>
  );
};