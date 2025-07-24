"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";
import { Appointment, UserRole } from '@/app/quhealthy/types/dashboard';

interface RecentActivityProps {
  appointments: Appointment[];
  role: UserRole;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ appointments, role }) => {
  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{appointment.serviceName}</h3>
            <p className="text-gray-400">
              {role === "paciente" ? appointment.providerName : appointment.clientName}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{new Date(appointment.dateTime).toLocaleString()}</span>
            </div>
            {appointment.notes && (
              <div className="flex items-center gap-2 mt-1">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{appointment.notes}</span>
              </div>
            )}
          </div>
          <Badge className={
            appointment.status === "scheduled" ? "bg-blue-500/20 text-blue-400"
            : appointment.status === "completed" ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400"
          }>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl text-white">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map(renderAppointmentCard)}
      </CardContent>
    </Card>
  );
};