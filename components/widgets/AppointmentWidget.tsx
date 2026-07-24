import React from 'react';
import { AppointmentWidget as AppointmentWidgetType } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface Props {
  widget: AppointmentWidgetType;
  onAction?: (action: any) => void;
}

export const AppointmentWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;

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
    <Card className="w-full max-w-sm bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            Resumen de Cita
          </CardTitle>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[data.status] || 'bg-gray-100 text-gray-600'}`}>
            {statusLabel[data.status] || data.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm pt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">{data.doctorName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-300">{data.date}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-300">{data.time}</span>
        </div>
        {data.location && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <span className="text-gray-500 dark:text-gray-400">{data.location}</span>
          </div>
        )}
        {data.price && data.status === 'PENDING' && (
          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Total a pagar:</span>
            <span className="text-xl font-bold text-quhealthy-green dark:text-emerald-400">${data.price}</span>
          </div>
        )}
      </CardContent>
      {actions && actions.length > 0 && (
        <CardFooter className="flex gap-2 flex-wrap pt-3 pb-4 px-4 border-t border-gray-100 dark:border-gray-800">
          {actions.map((action, idx) => {
            const isPrimary = action.type === 'pay';
            return (
              <Button
                key={idx}
                variant={isPrimary ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAction && onAction(action)}
                className={`flex-1 rounded-xl font-semibold transition-all ${isPrimary ? 'bg-quhealthy-green hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-md shadow-emerald-900/20' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                {isPrimary ? 'Proceder al Pago' : action.type === 'confirm' ? 'Confirmar Cita' : action.type}
              </Button>
            );
          })}
        </CardFooter>
      )}
    </Card>
  );
};
