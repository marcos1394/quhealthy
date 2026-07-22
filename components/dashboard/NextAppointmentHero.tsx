"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, Search, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Appointment } from '@/types/appointments';
import { cn } from '@/lib/utils';

interface NextAppointmentHeroProps {
 appointment: Appointment | null;
 onNavigate: (id: number) => void;
 onSearch: () => void;
 locale?: string;
}

export function NextAppointmentHero({ appointment, onNavigate, onSearch, locale = 'es' }: NextAppointmentHeroProps) {
 const t = useTranslations('PatientDashboard');
 const dateLocale = locale === 'es' ? es : enUS;

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-br from-indigo-900 to-teal-800 text-white rounded-3xl p-8 md:p-10 mb-8 flex flex-col justify-center min-h-[300px] shadow-lg">
      
      {appointment ? (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 h-full">
          <div className="space-y-8 flex-1 w-full">
            
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-white">
              <Calendar className="w-4 h-4" /> {t('next_badge', { defaultValue: 'Próxima Intervención' })}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight max-w-2xl">
              {(() => {
                const title = appointment.serviceNameSnapshot || appointment.serviceName || '';
                if (title === 'IN_PERSON') return locale === 'es' ? 'Presencial' : 'In Person';
                if (title === 'ONLINE') return locale === 'es' ? 'En Línea' : 'Online';
                if (title === 'HOME_VISIT') return locale === 'es' ? 'A Domicilio' : 'Home Visit';
                return title;
              })()}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 border-t border-white/20 pt-8 w-full">
              {/* Doctor / Proveedor */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl border border-white/30 flex items-center justify-center shrink-0 bg-white/10 overflow-hidden">
                  {appointment.provider?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={appointment.provider.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-xl">{(appointment.providerNameSnapshot || 'E').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {appointment.providerNameSnapshot || 'Especialista'}
                  </p>
                  <p className="text-xs text-indigo-200 font-medium mt-0.5">
                    {appointment.provider?.specialty || 'Área Médica'}
                  </p>
                </div>
              </div>

              {/* Fecha */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl border border-white/30 flex items-center justify-center shrink-0 bg-white/10">
                  <Calendar className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-indigo-200 font-medium mb-0.5">Fecha Programada</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(appointment.startTime), "d MMM, yyyy", { locale: dateLocale })}
                  </p>
                </div>
              </div>

              {/* Hora */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl border border-white/30 flex items-center justify-center shrink-0 bg-white/10">
                  <Clock className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-indigo-200 font-medium mb-0.5">Hora Estimada</p>
                  <p className="text-sm font-semibold">
                    {format(new Date(appointment.startTime), "HH:mm", { locale: dateLocale })} HRS
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0 lg:pl-10 lg:border-l border-white/20">
            <Button
              onClick={() => onNavigate(appointment.id)}
              className="w-full lg:w-auto h-14 px-8 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-sm font-bold transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              {t('btn_details', { defaultValue: 'Gestionar Expediente' })} <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-6 w-full text-white">
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-2">
            <Search className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">{t('empty_title', { defaultValue: 'Agenda Disponible' })}</h3>
            <p className="text-sm text-indigo-100 font-medium max-w-sm mx-auto">
              {t('empty_desc', { defaultValue: 'No existen registros de citas próximas. ¿Requieres agendar una nueva valoración?' })}
            </p>
          </div>
          <Button
            onClick={onSearch}
            className="mt-6 h-12 px-8 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-sm font-bold transition-colors shadow-sm"
          >
            {t('btn_search', { defaultValue: 'Buscar Especialista' })}
          </Button>
        </div>
      )}
    </div>
  );
}