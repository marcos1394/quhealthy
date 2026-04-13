// Ubicación: src/components/booking/success/AppointmentSummary.tsx
"use client";

import React from 'react';
import { User, CalendarCheck, Calendar, MapPin, Clock, Phone, DollarSign, Check, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  t: any;
  appointment: any;
  formattedDateTime: string;
}

export function AppointmentSummary({ t, appointment, formattedDateTime }: Props) {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-medical-50 dark:bg-medical-500/10 flex items-center justify-center border-2 border-medical-200 dark:border-medical-500/30">
          <FileText className="w-5 h-5 text-medical-600 dark:text-medical-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('cart_summary') || 'Resumen'}</h2>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Provider */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><User className="w-5 h-5 text-blue-500 dark:text-blue-400" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('label_provider')}</p>
                <p className="font-bold text-slate-900 dark:text-white text-lg">{appointment.providerNameSnapshot || 'Médico Asignado'}</p>
                {appointment.providerPhoneSnapshot && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {appointment.providerPhoneSnapshot}</p>}
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-xl"><CalendarCheck className="w-5 h-5 text-pink-500 dark:text-pink-400" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('label_service')}</p>
                <p className="font-bold text-slate-900 dark:text-white text-lg">{appointment.serviceNameSnapshot || appointment.serviceName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {appointment.durationMinutes ? `${appointment.durationMinutes} min` : 'Estándar'} <span className="mx-1">•</span> {appointment.type === 'ONLINE' ? 'En línea' : 'Presencial'}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"><Calendar className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('label_date')}</p>
                <p className="font-bold text-slate-900 dark:text-white text-lg capitalize">{formattedDateTime}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl"><MapPin className="w-5 h-5 text-amber-500 dark:text-amber-400" /></div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('label_location')}</p>
                <p className="font-bold text-slate-900 dark:text-white text-base leading-tight mt-1">{appointment.type === 'ONLINE' ? 'Enlace por correo' : (appointment.locationAddress || 'Por confirmar')}</p>
              </div>
            </div>
          </div>

          {/* Price Banner */}
          <div className="mt-6 flex items-start gap-4 p-5 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-200 dark:border-medical-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-medical-200/30 dark:bg-medical-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="p-3 bg-medical-100 dark:bg-medical-500/20 rounded-xl relative z-10"><DollarSign className="w-6 h-6 text-medical-600 dark:text-medical-400" /></div>
            <div className="flex-1 relative z-10">
              <p className="text-xs font-bold text-medical-500/70 dark:text-medical-300/70 uppercase tracking-wider mb-1">{t('label_price')}</p>
              <p className="font-bold text-3xl text-slate-900 dark:text-white">${(appointment.totalPrice || appointment.price || 0).toLocaleString('es-MX')} <span className="text-lg text-medical-600 dark:text-medical-400 font-bold ml-1">{appointment.currency || 'MXN'}</span></p>
            </div>
            <Badge className="bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hidden sm:flex items-center mt-2 relative z-10"><Check className="w-3 h-3 mr-1" /> Completado</Badge>
          </div>
        </CardContent>
      </Card>
    </>
  );
}