import React, { useRef, useState, useEffect } from 'react';
import { DoctorGalleryWidget as DoctorGalleryWidgetType, DoctorCardData } from '@quhealthy/health-os-contract';
import { DoctorCardWidget } from './DoctorCardWidget';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyFavorites } from '@/hooks/useMyFavorites';

interface Props {
  widget: DoctorGalleryWidgetType;
  onAction?: (action: any) => void;
}

export const DoctorGalleryWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { favoriteIds } = useMyFavorites('PROVIDER');
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const doctors = data.doctors || [];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 4);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 4);
      setIsScrollable(scrollWidth > clientWidth + 4);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    checkScroll();
    
    const timer1 = setTimeout(checkScroll, 100);
    const timer2 = setTimeout(checkScroll, 300);
    const timer3 = setTimeout(checkScroll, 800);
    
    const ro = new ResizeObserver(() => checkScroll());
    ro.observe(el);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      ro.disconnect();
    };
  }, [doctors]);

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
    <div className="w-full max-w-full min-w-0 relative py-2 overflow-hidden">
      <div className="flex justify-between items-center gap-3 mb-2 px-1 min-w-0">
        <h4 className="text-sm font-semibold text-muted-foreground truncate min-w-0">Resultados Encontrados ({doctors.length})</h4>
        {/* Navigation controls inline */}
        {isScrollable && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm disabled:opacity-30 hover:bg-quhealthy-green/5 dark:hover:bg-emerald-900/20 hover:text-quhealthy-green dark:hover:text-emerald-400 hover:border-quhealthy-green/30 dark:hover:border-emerald-800/50 transition-colors" 
              onClick={() => scroll('left')}
              disabled={!showLeftScroll}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Anterior</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm disabled:opacity-30 hover:bg-quhealthy-green/5 dark:hover:bg-emerald-900/20 hover:text-quhealthy-green dark:hover:text-emerald-400 hover:border-quhealthy-green/30 dark:hover:border-emerald-800/50 transition-colors" 
              onClick={() => scroll('right')}
              disabled={!showRightScroll}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Siguiente</span>
            </Button>
          </div>
        )}
      </div>

      <div className="relative min-w-0">
        {isScrollable && showLeftScroll && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-1 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full bg-white/95 text-gray-700 shadow-lg ring-1 ring-black/5 hover:bg-white dark:bg-black/80 dark:text-white dark:ring-white/10"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Anterior</span>
          </Button>
        )}
        {isScrollable && showRightScroll && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-1 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full bg-white/95 text-gray-700 shadow-lg ring-1 ring-black/5 hover:bg-white dark:bg-black/80 dark:text-white dark:ring-white/10"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Siguiente</span>
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={() => requestAnimationFrame(checkScroll)}
          className="flex gap-3 pb-3 pt-1 snap-x scroll-smooth touch-pan-x overflow-x-auto max-w-full"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          {doctors.map((doctor: DoctorCardData, idx: number) => {
          const providerId = String((doctor as any).providerId ?? doctor.id ?? '');

          const mockWidget = {
            id: `doc-card-${idx}`,
            type: 'DoctorCardWidget' as const,
            data: doctor,
            actions: (actions || []).map(a => ({
              ...a,
              payload: {
                ...a.payload,
                entityId: providerId,
                entityName: doctor.name
              }
            }))
          };
          
          return (
            <div key={providerId} className="snap-start shrink-0 w-[min(78vw,260px)] sm:w-[260px]">
              <DoctorCardWidget
                widget={mockWidget}
                onAction={onAction}
                isFavorited={favoriteIds.has(Number(providerId))}
              />
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}
