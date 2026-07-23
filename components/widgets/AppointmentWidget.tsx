import React from 'react';
import { AppointmentWidget as AppointmentWidgetType } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  widget: AppointmentWidgetType;
  onAction?: (action: any) => void;
}

export const AppointmentWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;

  return (
    <Card className="w-full max-w-sm border-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Resumen de Cita</CardTitle>
          <Badge variant={data.status === 'CONFIRMED' ? 'default' : data.status === 'PENDING' ? 'secondary' : 'outline'}>
            {data.status === 'PENDING' ? 'Pendiente' : data.status === 'CONFIRMED' ? 'Confirmada' : data.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{data.doctorName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{data.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{data.time}</span>
        </div>
        {data.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{data.location}</span>
          </div>
        )}
        {data.price && data.status === 'PENDING' && (
          <div className="mt-2 pt-2 border-t flex justify-between items-center font-semibold">
            <span>Total a pagar:</span>
            <span className="text-lg">${data.price}</span>
          </div>
        )}
      </CardContent>
      {actions && actions.length > 0 && (
        <CardFooter className="flex gap-2 flex-wrap">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.type === 'pay' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onAction && onAction(action)}
              className="flex-1 w-full"
            >
              {action.type === 'pay' ? 'Proceder al Pago' : action.type === 'confirm' ? 'Confirmar Cita' : action.type}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
};
