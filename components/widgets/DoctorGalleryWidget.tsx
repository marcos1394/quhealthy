import React, { useRef, useState, useEffect } from 'react';
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
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [data.doctors]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350); // Re-check after smooth scroll finishes
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 relative group py-2 px-6">
      <div className="flex justify-between items-center mb-2 px-1">
        <h4 className="text-sm font-semibold text-muted-foreground">Resultados Encontrados ({data.doctors.length})</h4>
      </div>
      
      {/* Botones Flotantes */}
      {showLeftScroll && (
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background border-border shadow-md transition-all flex opacity-90 hover:opacity-100" 
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {showRightScroll && (
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background border-border shadow-md transition-all flex opacity-90 hover:opacity-100" 
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-4 pb-4 pt-1 snap-x scroll-smooth touch-pan-x"
        // Mostramos el scrollbar en desktop para mejor usabilidad, y lo ocultamos en webkit para mobile si se desea
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {data.doctors.map((doctor: DoctorCardData, idx: number) => {
          const mockWidget = {
            id: `doc-card-${idx}`,
            type: 'DoctorCardWidget' as const,
            data: doctor,
            actions: (actions || []).map(a => ({
              ...a,
              payload: {
                ...a.payload,
                entityId: doctor.id,
                entityName: doctor.name
              }
            }))
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
}
