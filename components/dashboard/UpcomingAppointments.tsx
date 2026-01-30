"use client";

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight, Video, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface Appointment {
  id: string;
  clientName: string;
  clientImage?: string;
  service: string;
  time: string;
  duration?: string;
  status?: 'confirmed' | 'pending' | 'in-progress';
  type?: 'in-person' | 'video';
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

const statusConfig = {
  confirmed: { label: 'Confirmada', class: 'status-success' },
  pending: { label: 'Pendiente', class: 'status-warning' },
  'in-progress': { label: 'En curso', class: 'status-info' },
};

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ appointments }) => {
  
  if (appointments.length === 0) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <Calendar className="w-5 h-5 text-primary"/>
            </div>
            Proximas Citas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">Tu agenda esta libre</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            No tienes citas programadas para hoy. Comparte tu enlace de reservas para empezar a recibir pacientes.
          </p>
          <Button variant="outline" className="mt-4">
            Copiar Enlace de Reservas
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg text-foreground">
            <div className="p-2 bg-primary/10 rounded-lg mr-3">
              <Calendar className="w-5 h-5 text-primary"/>
            </div>
            Proximas Citas
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {appointments.length} hoy
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {appointments.map((appt) => {
            const status = statusConfig[appt.status || 'confirmed'];
            
            return (
              <div 
                key={appt.id}
                className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/50 transition-all duration-200"
              >
                {/* Time Block */}
                <div className="flex flex-col items-center justify-center min-w-[56px] py-2 px-3 rounded-lg bg-muted text-center">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground mb-1" />
                  <span className="text-sm font-bold text-foreground">{appt.time}</span>
                  {appt.duration && (
                    <span className="text-[10px] text-muted-foreground">{appt.duration}</span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {appt.service}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={appt.clientImage} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {appt.clientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">
                          {appt.clientName}
                        </span>
                      </div>
                    </div>
                    
                    {/* Type & Status */}
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge 
                        variant="outline" 
                        className={cn("text-[10px] px-2 py-0 h-5 border", status.class)}
                      >
                        {status.label}
                      </Badge>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {appt.type === 'video' ? (
                          <>
                            <Video className="w-3 h-3" />
                            <span>Video</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span>Presencial</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <div className="p-4 border-t border-border mt-auto">
        <Link href="/provider/dashboard/calendar">
          <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground group">
            Ver Calendario Completo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};
