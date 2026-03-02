"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, Search } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es, enUS } from 'date-fns/locale'; // Idealmente dinámico según el locale actual

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Appointment } from '@/types/appointments';

interface NextAppointmentHeroProps {
  appointment: Appointment | null;
  onNavigate: (id: number) => void;
  onSearch: () => void;
  locale?: string; // Para formatear la fecha según el idioma
}

export function NextAppointmentHero({ appointment, onNavigate, onSearch, locale = 'es' }: NextAppointmentHeroProps) {
  const t = useTranslations('PatientDashboard');
  const dateLocale = locale === 'es' ? es : enUS;

  return (
    <div className="lg:col-span-2 relative overflow-hidden h-full min-h-[320px] rounded-3xl bg-gradient-to-br from-medical-700 to-medical-900 dark:from-medical-800 dark:to-medical-950 p-8 shadow-xl border border-medical-500/30 flex flex-col justify-center group transition-all duration-500 hover:shadow-medical-500/10">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-medical-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-medical-500/30 transition-colors"></div>

      {appointment ? (
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 h-full">
          <div className="space-y-6 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-medical-100 text-[10px] font-bold uppercase tracking-widest">
              <Calendar className="w-3 h-3" /> {t('next_badge', { defaultValue: 'PRÓXIMA CITA' })}
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
              {appointment.serviceNameSnapshot || appointment.serviceName}
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-medical-100">
              {/* Avatar del Doctor */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white/30 shadow-md">
                  <AvatarImage src={appointment.provider?.image} alt={appointment.providerNameSnapshot} />
                  <AvatarFallback className="bg-medical-500 text-white font-black">
                    {(appointment.providerNameSnapshot || 'D').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-white text-lg leading-tight">
                    {appointment.providerNameSnapshot || 'Especialista'}
                  </p>
                  <p className="text-sm text-medical-300 font-medium">
                    {appointment.provider?.specialty || 'Consultorio Médico'}
                  </p>
                </div>
              </div>

              <div className="h-12 w-[1px] bg-white/10 hidden sm:block"></div>

              {/* Fecha y Hora */}
              <div className="space-y-1.5 justify-center flex flex-col">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-medical-300" />
                  <span className="font-semibold text-white capitalize">
                    {formatInTimeZone(new Date(appointment.startTime), 'UTC', "EEEE d 'de' MMMM", { locale: dateLocale })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-medical-300" />
                  <span className="font-medium text-medical-100">
                    {formatInTimeZone(new Date(appointment.startTime), 'UTC', "h:mm a", { locale: dateLocale })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto self-stretch flex items-center mt-4 md:mt-0">
            <Button
              onClick={() => onNavigate(appointment.id)}
              className="w-full md:w-auto bg-white text-medical-900 hover:bg-medical-50 font-black py-7 px-10 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              {t('btn_details', { defaultValue: 'Gestionar Cita' })}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-5 relative z-10 w-full h-full text-white">
          <div className="p-5 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-sm shadow-inner">
            <Search className="w-10 h-10 text-medical-200" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{t('empty_title', { defaultValue: 'Tu agenda está libre' })}</h3>
            <p className="text-medical-100 max-w-sm font-light text-sm">
              {t('empty_desc', { defaultValue: 'No tienes citas programadas próximamente. ¿Es momento de un chequeo?' })}
            </p>
          </div>
          <Button
            onClick={onSearch}
            className="bg-white text-medical-900 hover:bg-medical-50 mt-4 rounded-xl font-bold px-8 py-6 shadow-md transition-all hover:scale-105"
          >
            {t('btn_search', { defaultValue: 'Encontrar Médico' })}
          </Button>
        </div>
      )}
    </div>
  );
}