"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronRight, Users, Calendar, Activity, Wallet, MessagesSquare, FileText, AlertCircle } from "lucide-react";
import { Appointment, Notification, UserRole } from '@/app/quhealthy/types/dashboard';

interface SidebarProps {
  appointments: Appointment[];
  notifications: Notification[];
  role: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ appointments, notifications, role }) => {
  return (
    <div className="space-y-6">
      {/* Próximas Citas */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Próximas Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{appointment.serviceName}</p>
                  <p className="text-sm text-gray-400">{new Date(appointment.dateTime).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.map(notification => (
            <Alert key={notification.id} className={`${
              notification.type === "success" ? "bg-emerald-500/20 border-emerald-500/50" :
              notification.type === "warning" ? "bg-yellow-500/20 border-yellow-500/50" :
              "bg-blue-500/20 border-blue-500/50"
            } ${!notification.isRead ? "border-l-4" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <AlertTitle className="text-white mb-1">{notification.title}</AlertTitle>
                  <AlertDescription className="text-gray-400 text-sm">{notification.message}</AlertDescription>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notification.date).toLocaleString()}</p>
                </div>
                {!notification.isRead && (<div className="w-2 h-2 rounded-full bg-blue-400"></div>)}
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>
      
      {/* (Podrías crear más componentes para Acciones Rápidas y Resumen de Perfil si quieres) */}
    </div>
  );
};