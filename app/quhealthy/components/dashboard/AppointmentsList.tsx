import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Appointment } from '@/app/quhealthy/types/dashboard';

export const AppointmentsList = ({ appointments }: { appointments: Appointment[] }) => (
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
);