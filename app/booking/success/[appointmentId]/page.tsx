/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { notFound } from 'next/navigation';
import { CheckCircle2, Calendar,  User, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';

// Lógica para obtener los datos en un Componente de Servidor
async function getAppointment(id: string) {
    try {
        const token = (await cookies()).get('token')?.value;
        const res = await fetch(`${process.env.API_URL}/api/appointments/${id}`, {
            headers: { 'Cookie': `token=${token}` }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export default async function BookingSuccessPage({ params }: { params: { appointmentId: string } }) {
  const appointment = await getAppointment(params.appointmentId);
  if (!appointment) notFound();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-lg border border-green-500/30 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">¡Cita Confirmada!</h1>
        <p className="text-gray-300 mb-8">Hemos enviado una confirmación a tu correo.</p>

        <div className="text-left space-y-4 bg-gray-900/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center">
            <User className="w-5 h-5 text-purple-400 mr-3"/>
            <div>
              <p className="text-sm text-gray-400">Profesional</p>
              <p className="font-semibold text-white">{appointment.provider.name}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-purple-400 mr-3"/>
            <div>
              <p className="text-sm text-gray-400">Fecha y Hora</p>
              <p className="font-semibold text-white">
                {new Date(appointment.startTime).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' a las '}
                {new Date(appointment.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-purple-400 mr-3"/>
            <div>
              <p className="text-sm text-gray-400">Total Pagado</p>
              <p className="font-semibold text-white">${appointment.priceAtBooking}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
            <Button variant="outline" className="flex-1 border-gray-600">Añadir al Calendario</Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Ir a Mis Citas</Button>
        </div>
      </div>
    </div>
  );
}