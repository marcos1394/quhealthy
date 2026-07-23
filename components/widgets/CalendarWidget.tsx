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
  // Simplification for the widget: assume selectedDate can be updated internally or passed down
  const [date, setDate] = React.useState<Date | undefined>(
    data.selectedDate ? new Date(data.selectedDate) : new Date()
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Disponibilidad</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-center border-b pb-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        
        {/* Render slots for the selected day */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium leading-none">Horarios disponibles</h4>
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex w-max space-x-2">
              {data.availableSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant="outline"
                  className="flex gap-2"
                  onClick={() => {
                    // Si el widget tiene una acción predeterminada de reserva, podríamos dispararla con este horario
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
