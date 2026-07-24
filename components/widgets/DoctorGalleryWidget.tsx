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
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 4);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    // Delay initial check to let the DOM render
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [data.doctors]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 290;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 400);
    }
  };

  return (
    <div className="w-full min-w-0 relative py-2" style={{ maxWidth: '100%' }}>
      <div className="flex justify-between items-center mb-2 px-1">
        <h4 className="text-sm font-semibold text-muted-foreground">Resultados Encontrados ({data.doctors.length})</h4>
        {/* Navigation controls inline */}
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 rounded-full bg-background border-border shadow-sm disabled:opacity-30" 
            onClick={() => scroll('left')}
            disabled={!showLeftScroll}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 rounded-full bg-background border-border shadow-sm disabled:opacity-30" 
            onClick={() => scroll('right')}
            disabled={!showRightScroll}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-3 pb-3 pt-1 snap-x scroll-smooth touch-pan-x overflow-x-auto"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
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
            <div key={doctor.id} className="snap-start shrink-0 w-[260px]">
              <DoctorCardWidget widget={mockWidget} onAction={onAction} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
