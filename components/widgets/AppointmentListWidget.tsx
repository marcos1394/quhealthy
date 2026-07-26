import React from 'react';
import { BaseWidget } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppointmentData {
  id: string;
  providerName: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: string;
  modality: string;
  price?: number;
}

interface AppointmentListData {
  content?: AppointmentData[];
}

type AppointmentListWidgetType = BaseWidget<AppointmentListData>;

interface Props {
  widget: AppointmentListWidgetType;
  onAction?: (action: any) => void;
}

export const AppointmentListWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data } = widget;
  const appointments = data.content || [];

  if (appointments.length === 0) {
    return (
      <Card className="w-full max-w-sm min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No tienes citas próximas programadas.
        </CardContent>
      </Card>
    );
  }

  const statusLabel: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  };

  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    CONFIRMED: 'bg-quhealthy-green/10 text-quhealthy-green dark:bg-emerald-900/30 dark:text-emerald-400',
    COMPLETED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white min-w-0">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="truncate">Mis Citas</span>
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 max-h-[350px]">
        <div className="p-4 space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-3 hover:border-gray-300 dark:hover:border-gray-700 transition-colors min-w-0">
              <div className="flex justify-between items-start gap-2 mb-2 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white line-clamp-1 min-w-0">{appt.providerName}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${statusColor[appt.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[appt.status] || appt.status}
                </span>
              </div>
              
              <div className="grid gap-1.5 text-xs">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 min-w-0">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate min-w-0">{appt.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 min-w-0">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate min-w-0">{appt.startTime} - {appt.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 min-w-0">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate min-w-0">{appt.modality === 'ONLINE' ? 'Videoconsulta' : 'Presencial'}</span>
                </div>
              </div>
              
              {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs px-2.5 py-0 rounded-lg text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
                    onClick={() => onAction && onAction({ type: 'invoke_tool', payload: { tool: 'cancelAppointment', args: { appointmentId: String(appt.id) } } })}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
