import React from 'react';
import { DoctorCardWidget as DoctorCardWidgetType } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Info } from 'lucide-react';

interface Props {
  widget: DoctorCardWidgetType;
  onAction?: (action: any) => void;
}

export const DoctorCardWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;
  const brandColor = data.primaryColor || '#10b981'; // Default to quhealthy-green

  return (
    <Card 
      className="w-full max-w-sm overflow-hidden transition-all duration-300 border border-emerald-100 shadow-md shadow-primary/5 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-[#0a0a0a] rounded-2xl group flex flex-col h-full"
      style={{ borderColor: `${brandColor}40` }}
    >
      {/* Banner Superior si existe */}
      {data.bannerUrl && (
        <div 
          className="h-16 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${data.bannerUrl})` }}
        />
      )}

      <CardHeader className={`flex flex-row items-center gap-4 pb-2 pt-4 px-4 ${data.bannerUrl ? 'mt-[-30px]' : ''}`}>
        <Avatar 
          className="h-16 w-16 border-4 shadow-sm transition-transform group-hover:scale-105 bg-white"
          style={{ borderColor: 'white' }}
        >
          <AvatarImage src={data.imageUrl} alt={data.name} className="object-cover" />
          <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">{data.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className={`flex flex-col ${data.bannerUrl ? 'mt-4' : ''}`}>
          <CardTitle className="text-lg font-bold text-foreground leading-tight line-clamp-1" title={data.name}>{data.name}</CardTitle>
          <p className="text-sm font-medium mt-0.5 line-clamp-1" style={{ color: brandColor }}>{data.specialty}</p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-2.5 text-sm pt-2 px-4 flex-1">
        {(data.rating || data.reviewCount) && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
            <span>{data.rating || 0} / 5.0 {data.reviewCount ? `(${data.reviewCount} reseñas)` : ''}</span>
          </div>
        )}

        {data.bio && (
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2 italic border-l-2 pl-2" style={{ borderLeftColor: brandColor }}>
            "{data.bio}"
          </div>
        )}

        {data.clinic && (
          <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-1.5 rounded-lg mt-1">
            <span className="font-semibold text-foreground text-xs">{data.clinic}</span>
          </div>
        )}
        
        {data.languages && data.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.languages.map((lang, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full border-none" style={{ backgroundColor: `${brandColor}20`, color: brandColor }}>{lang}</Badge>
            ))}
          </div>
        )}
        
        {data.nextAvailableSlot && (
          <div className="flex items-center gap-1.5 text-muted-foreground mt-auto pt-2 text-xs">
            <Clock className="h-3.5 w-3.5" style={{ color: brandColor }} />
            <span>Próxima cita: <span className="font-medium text-foreground">{data.nextAvailableSlot}</span></span>
          </div>
        )}
      </CardContent>

      {actions && actions.length > 0 && (
        <CardFooter className="flex gap-2 flex-wrap pt-3 pb-4 px-4 mt-auto border-t border-emerald-50 dark:border-emerald-950/50">
          {actions.map((action, idx) => {
            const isPrimary = action.type === 'reserve';
            return (
              <Button
                key={idx}
                variant={isPrimary ? 'default' : 'secondary'}
                size="sm"
                onClick={() => onAction && onAction(action)}
                className={`flex-1 rounded-full font-medium transition-transform active:scale-95 ${isPrimary ? 'shadow-md text-white' : ''}`}
                style={isPrimary ? { backgroundColor: brandColor, boxShadow: `0 4px 14px 0 ${brandColor}40` } : {}}
              >
                {isPrimary ? 'Reservar' : action.type === 'open' ? 'Ver Perfil' : action.type}
              </Button>
            );
          })}
        </CardFooter>
      )}
    </Card>
  );
};
