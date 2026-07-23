import React, { useRef } from 'react';
import { DoctorGalleryWidget as DoctorGalleryWidgetType, DoctorCardData, HealthOSAction } from '@quhealthy/health-os-contract';
import { DoctorCardWidget } from './DoctorCardWidget';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  widget: DoctorGalleryWidgetType;
  onAction?: (action: any) => void;
}

export const DoctorGalleryWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full relative group py-2">
      <div className="flex justify-between items-center mb-2 px-1">
        <h4 className="text-sm font-semibold text-muted-foreground">Resultados Encontrados ({data.doctors.length})</h4>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-background/50 hover:bg-background/80 shadow-sm transition-all" onClick={() => scroll('left')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-background/50 hover:bg-background/80 shadow-sm transition-all" onClick={() => scroll('right')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 pb-4 snap-x scroll-smooth touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {data.doctors.map((doctor: DoctorCardData, idx: number) => {
          // Construimos un mini-widget simulado para reusar el DoctorCardWidget
          const mockWidget = {
            id: `doc-card-${idx}`,
            type: 'DoctorCardWidget' as const,
            data: doctor,
            actions: actions || [] // Pasamos las acciones del gallery hacia cada tarjeta (ej. 'reserve')
          };
          
          return (
            <div key={doctor.id} className="snap-start shrink-0 w-[280px]">
              <DoctorCardWidget widget={mockWidget} onAction={onAction} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
