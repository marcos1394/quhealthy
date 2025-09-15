"use client";



import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/app/quhealthy/types/dashboard'; // 1. Importamos el tipo centralizado

// 2. La prop 'appointments' ahora usa el tipo importado

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments }) => {
  if (appointments.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader>
            <CardTitle className="flex items-center text-xl">
                <Calendar className="w-6 h-6 mr-3 text-purple-400"/>
                Próximas Citas
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-center text-gray-400 py-8">
                <Calendar className="mx-auto w-12 h-12 text-gray-600 mb-4" />
                <p className="font-medium">No tienes citas próximas.</p>
                <p className="text-sm">Las nuevas citas agendadas a través de QuHealthy aparecerán aquí.</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-purple-400"/>
                <CardTitle className="text-xl">Próximas Citas</CardTitle>
            </div>
            <span className="bg-purple-500/20 text-purple-300 text-sm font-bold px-3 py-1 rounded-full">
              {appointments.length}
            </span>
        </div>
        <CardDescription>Tus siguientes citas programadas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {appointments.map((appt, index) => (
            <motion.li 
              key={appt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 bg-gray-700/40 rounded-lg border border-gray-600/50"
            >
              <div className="p-3 bg-gray-900/50 rounded-full border border-gray-600">
                <Clock className="w-5 h-5 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                {/* 3. Usamos los nombres de campo correctos del backend */}
                <p className="font-semibold text-white truncate">{appt.service}</p>
                <p className="text-sm text-gray-400 flex items-center truncate">
                  <User className="w-3 h-3 mr-1.5 flex-shrink-0" />
                  {appt.clientName}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-purple-300">{appt.time}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
      <div className="p-4 border-t border-gray-700/50">
        <Button variant="outline" className="w-full border-gray-600 hover:bg-purple-500/10 hover:text-purple-300">
            Ver Calendario Completo
        </Button>
      </div>
    </Card>
  );
};