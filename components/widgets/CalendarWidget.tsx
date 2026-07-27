import React from 'react';
import { CalendarWidget as CalendarWidgetType } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar
import { es } from 'date-fns/locale';
import { Clock } from 'lucide-react';

interface Props {
  widget: CalendarWidgetType;
  onAction?: (action: any) => void;
}

export const CalendarWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;
  const [date, setDate] = React.useState<Date | undefined>(
    data.selectedDate ? new Date(data.selectedDate) : new Date()
  );

  return (
    <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-white min-w-0">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <span className="truncate">Disponibilidad</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 min-w-0 px-3 sm:px-6">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4 overflow-x-auto">
          <div className="min-w-max flex justify-center">
            <Calendar
              mode="single"
              locale={es}
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                  if (onAction) {
                    onAction({
                      type: 'change_date',
                      payload: { date: newDate.toISOString() }
                    } as any);
                  }
                }
              }}
              className="rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
            />
          </div>
        </div>
        
        <div className="space-y-3 min-w-0">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Horarios disponibles</h4>
          <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex w-max space-x-3 px-1">
              {(!data.availableSlots || data.availableSlots.length === 0) ? (
                <div className="w-full text-center py-6 px-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Sin horarios disponibles. Prueba seleccionando otra fecha.
                  </p>
                </div>
              ) : (
                data.availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className="flex gap-2 border-quhealthy-green/20 dark:border-emerald-800/30 text-quhealthy-green dark:text-emerald-400 hover:bg-quhealthy-green hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-colors rounded-xl"
                    onClick={() => {
                      const reserveAction = actions?.find(a => a.type === 'initiate_checkout');
                      if (reserveAction && onAction) {
                        onAction({
                          ...reserveAction,
                          payload: {
                            ...reserveAction.payload,
                            scheduleTime: slot.startTime,
                          }
                        });
                      }
                    }}
                  >
                    <Clock className="w-4 h-4" />
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
