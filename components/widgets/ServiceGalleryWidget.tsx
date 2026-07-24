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
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 4);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [services]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 270;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 400);
    }
  };

  const handleSelectService = (service: any) => {
    // Send a chat message to the agent with the selected service info
    const doctorId = actions?.find(a => a.type === 'reserve')?.payload?.doctorId || '';
    const intentText = `Quiero reservar el servicio "${service.name}"`;
    const hiddenCtx = `Service ID: ${service.serviceId}, Doctor ID: ${doctorId}, Precio: $${service.price} MXN`;
    
    window.dispatchEvent(new CustomEvent('healthos:send_intent', { 
      detail: { text: intentText, hiddenContext: hiddenCtx } 
    }));
  };

  if (!services.length) return null;

  return (
    <div className="w-full min-w-0 relative py-2" style={{ maxWidth: '100%' }}>
      <div className="flex justify-between items-center mb-2 px-1">
        <h4 className="text-sm font-semibold text-muted-foreground">Servicios Disponibles ({services.length})</h4>
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
        {services.map((service: any) => (
          <Card key={service.serviceId} className="snap-start shrink-0 w-[240px] flex flex-col p-4 gap-3 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-2">
              <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight flex-1">
                {service.name}
              </p>
            </div>
            
            <div className="flex flex-col gap-1.5 mt-1">
              {service.durationMinutes && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{service.durationMinutes} minutos</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CreditCard className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-quhealthy-green dark:text-emerald-400">
                  ${service.price} MXN
                </span>
              </div>
            </div>

            <Button 
              className="w-full mt-auto bg-quhealthy-green hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl" 
              onClick={() => handleSelectService(service)}
            >
              Seleccionar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
