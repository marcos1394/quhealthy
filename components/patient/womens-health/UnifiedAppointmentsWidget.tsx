"use client";

import React from "react";
import { Calendar, User, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnifiedAppointmentsWidget({ appointments }: { appointments: any[] }) {
  // Sort upcoming appointments by date (assuming they have a date, or just list them)
  const upcoming = appointments && appointments.length > 0 ? appointments.slice(0, 3) : [];

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Próximas Citas</h3>
            <p className="text-sm text-gray-500">Ginecología y Pediatría</p>
          </div>
        </div>
      </div>

      {upcoming.length > 0 ? (
        <div className="space-y-3">
          {upcoming.map((apt, i) => {
            const isBaby = !!apt.dependentId;
            return (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isBaby ? 'bg-teal-100 text-teal-600' : 'bg-pink-100 text-pink-600'}`}>
                  {isBaby ? <Baby className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {isBaby ? 'Cita Pediátrica' : 'Cita Ginecológica'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Estado: {apt.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No hay citas programadas.</p>
          <Button variant="link" className="text-orange-600 text-sm mt-2">Agendar cita</Button>
        </div>
      )}
    </div>
  );
}
