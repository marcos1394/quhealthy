import React, { useRef, useState, useEffect } from 'react';
import { BaseWidget, HealthOSAction } from '@quhealthy/health-os-contract';
import { ChevronLeft, ChevronRight, Stethoscope, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  widget: BaseWidget;
  onAction?: (action: any) => void;
}

export const ServiceGalleryWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;
  const services = data?.services || [];
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
  }, [services]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 350);
    }
  };

  const handleReserve = (serviceId: string) => {
    const reserveAction = actions?.find(a => a.type === 'reserve');
    if (reserveAction && onAction) {
      onAction({
        ...reserveAction,
        payload: {
          ...reserveAction.payload,
          serviceId
        }
      });
    }
  };

  if (!services.length) return null;

  return (
    <div className="w-full max-w-full min-w-0 relative group py-2 px-6">
      <div className="flex justify-between items-center mb-2 px-1">
        <h4 className="text-sm font-semibold text-muted-foreground">Servicios Disponibles ({services.length})</h4>
      </div>
      
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
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {services.map((service: any) => (
          <Card key={service.serviceId} className="snap-start shrink-0 w-[260px] flex flex-col p-4 gap-3 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400">
                <Stethoscope className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight flex-1">
                {service.name}
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{service.durationMinutes} minutos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CreditCard className="w-4 h-4" />
                <span className="font-semibold text-quhealthy-green dark:text-emerald-400">
                  ${service.price} MXN
                </span>
              </div>
            </div>

            <Button 
              className="w-full mt-auto bg-quhealthy-green hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700" 
              onClick={() => handleReserve(service.serviceId)}
            >
              Seleccionar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
