import React from 'react';
import { CalendarWidget as CalendarWidgetType } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
    <Card className="w-full max-w-md bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
          Disponibilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-center border-b border-gray-100 dark:border-gray-800 pb-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
          />
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Horarios disponibles</h4>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-3 px-1">
              {data.availableSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant="outline"
                  className="flex gap-2 border-quhealthy-green/20 dark:border-emerald-800/30 text-quhealthy-green dark:text-emerald-400 hover:bg-quhealthy-green hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-colors rounded-xl"
                  onClick={() => {
                    const reserveAction = actions?.find(a => a.type === 'reserve');
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
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
