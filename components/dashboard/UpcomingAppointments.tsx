"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Definición de tipo local (o importar de @/types)
export interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string; // formato "10:00 AM"
  status?: 'confirmed' | 'pending';
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments }) => {
  
  if (appointments.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800 h-full">
        <CardHeader>
            <CardTitle className="flex items-center text-xl text-white">
                <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                    <Calendar className="w-5 h-5 text-purple-400"/>
                </div>
                Próximas Citas
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-gray-800 p-4 rounded-full mb-4">
                <Calendar className="w-8 h-8 text-gray-500" />
            </div>
            <p className="font-medium text-white">No tienes citas hoy.</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Comparte tu enlace de perfil para empezar a recibir reservaciones.
            </p>
            <Button variant="link" className="mt-2 text-purple-400">
                Copiar Enlace
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 rounded-lg mr-3 border border-purple-500/20">
                    <Calendar className="w-5 h-5 text-purple-400"/>
                </div>
                <div>
                    <CardTitle className="text-lg text-white">Próximas Citas</CardTitle>
                    <CardDescription className="text-gray-400 text-xs mt-1">
                        Agenda para hoy
                    </CardDescription>
                </div>
            </div>
            <Badge variant="secondary" className="bg-gray-800 text-purple-300 border-gray-700">
              {appointments.length} pendientes
            </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar pt-4">
        <ul className="space-y-3">
          {appointments.map((appt, index) => (
            <motion.li 
              key={appt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex items-center space-x-4 p-3 bg-gray-950/50 hover:bg-gray-800 rounded-xl border border-gray-800 transition-colors"
            >
              {/* Hora */}
              <div className="flex flex-col items-center justify-center min-w-[60px] p-2 bg-gray-900 rounded-lg border border-gray-800 group-hover:border-purple-500/30 transition-colors">
                <Clock className="w-4 h-4 text-purple-400 mb-1" />
                <span className="text-xs font-bold text-white whitespace-nowrap">{appt.time}</span>
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{appt.service}</p>
                <div className="flex items-center mt-1">
                    <User className="w-3 h-3 text-gray-500 mr-1.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400 truncate">{appt.clientName}</p>
                </div>
              </div>

              {/* Status Indicator (Optional) */}
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            </motion.li>
          ))}
        </ul>
      </CardContent>
      
      <div className="p-4 border-t border-gray-800 mt-auto">
        <Link href="/dashboard/calendar" className="w-full">
            <Button variant="ghost" className="w-full justify-between text-gray-400 hover:text-white hover:bg-gray-800 group">
                Ver Calendario Completo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
        </Link>
      </div>
    </Card>
  );
};