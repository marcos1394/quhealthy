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
    <Card className="w-full max-w-sm min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-start gap-3 min-w-0">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white min-w-0">
            <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="truncate">Resumen de Cita</span>
          </CardTitle>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColor[data.status] || 'bg-gray-100 text-gray-600'}`}>
            {statusLabel[data.status] || data.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm pt-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white truncate min-w-0">{data.doctorName}</span>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-300 truncate min-w-0">{data.date}</span>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-gray-700 dark:text-gray-300 truncate min-w-0">{data.time}</span>
        </div>
        {data.location && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <span className="text-gray-500 dark:text-gray-400 truncate min-w-0">{data.location}</span>
          </div>
        )}
        {data.price && data.status === 'PENDING' && (
          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-3">
            <span className="font-semibold text-gray-600 dark:text-gray-400">Total a pagar:</span>
            <span className="text-xl font-bold text-quhealthy-green dark:text-emerald-400 shrink-0">${data.price}</span>
          </div>
        )}
      </CardContent>
      {actions && actions.length > 0 && (
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-3 pb-4 px-4 border-t border-gray-100 dark:border-gray-800">
          {actions.map((action, idx) => {
            const isPrimary = action.type === 'pay';
            return (
              <Button
                key={idx}
                variant={isPrimary ? 'success' : 'outline'}
                size="sm"
                onClick={() => onAction && onAction(action)}
                className={`flex-1 w-full min-w-0 rounded-xl font-semibold transition-all ${isPrimary ? 'shadow-md shadow-emerald-900/20' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'}`}
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
