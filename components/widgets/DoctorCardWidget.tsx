import React from 'react';
import { DoctorCardWidget as DoctorCardWidgetType } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Clock } from 'lucide-react';

interface Props {
  widget: DoctorCardWidgetType;
  onAction?: (action: any) => void;
}

export const DoctorCardWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;

  return (
    <Card className="w-full max-w-sm overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={data.imageUrl} alt={data.name} />
          <AvatarFallback>{data.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-lg">{data.name}</CardTitle>
          <p className="text-sm text-muted-foreground font-medium">{data.specialty}</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {data.clinic && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="font-semibold text-foreground">{data.clinic}</span>
          </div>
        )}
        {(data.rating || data.reviewCount) && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span>{data.rating || 0} / 5.0 {data.reviewCount ? `(${data.reviewCount} opiniones)` : ''}</span>
          </div>
        )}
        {data.languages && data.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.languages.map((lang, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] px-1 py-0">{lang}</Badge>
            ))}
          </div>
        )}
        {data.nextAvailableSlot && (
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <Clock className="h-4 w-4" />
            <span>Próxima cita: {data.nextAvailableSlot}</span>
          </div>
        )}
      </CardContent>
      {actions && actions.length > 0 && (
        <CardFooter className="flex gap-2 flex-wrap">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.type === 'reserve' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onAction && onAction(action)}
              className="flex-1"
            >
              {action.type === 'reserve' ? 'Reservar' : action.type === 'open' ? 'Ver Perfil' : action.type}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
};
