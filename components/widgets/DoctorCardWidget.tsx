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
    <Card className="w-full max-w-sm overflow-hidden transition-all duration-300 border-none shadow-md shadow-primary/5 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-background to-muted/20 rounded-2xl group">
      <CardHeader className="flex flex-row items-center gap-4 pb-2 pt-5">
        <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm transition-transform group-hover:scale-105">
          <AvatarImage src={data.imageUrl} alt={data.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">{data.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-lg font-bold text-foreground leading-tight">{data.name}</CardTitle>
          <p className="text-sm text-primary font-medium mt-0.5">{data.specialty}</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2.5 text-sm pt-2">
        {data.clinic && (
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-1.5 rounded-lg">
            <span className="font-semibold text-foreground text-xs">{data.clinic}</span>
          </div>
        )}
        {(data.rating || data.reviewCount) && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
            <span>{data.rating || 0} / 5.0 {data.reviewCount ? `(${data.reviewCount} reseñas)` : ''}</span>
          </div>
        )}
        {data.languages && data.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.languages.map((lang, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border-none">{lang}</Badge>
            ))}
          </div>
        )}
        {data.nextAvailableSlot && (
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1 text-xs">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Próxima cita: <span className="font-medium text-foreground">{data.nextAvailableSlot}</span></span>
          </div>
        )}
      </CardContent>
      {actions && actions.length > 0 && (
        <CardFooter className="flex gap-2 flex-wrap pt-2 pb-4">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.type === 'reserve' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onAction && onAction(action)}
              className={`flex-1 rounded-full font-medium transition-transform active:scale-95 ${action.type === 'reserve' ? 'shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
            >
              {action.type === 'reserve' ? 'Reservar' : action.type === 'open' ? 'Ver Perfil' : action.type}
            </Button>
          ))}
        </CardFooter>
      )}
    </Card>
  );
};
