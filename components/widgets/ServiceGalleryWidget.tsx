import React, { useRef, useState, useEffect } from 'react';
import { BaseWidget, HealthOSAction } from '@quhealthy/health-os-contract';
import { ChevronLeft, ChevronRight, Stethoscope, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ServiceCardWidget } from './ServiceCardWidget';

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
  const [isScrollable, setIsScrollable] = useState(false);

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
    
    const ro = new ResizeObserver(() => checkScroll());
    ro.observe(el);
    
    return () => ro.disconnect();
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
    const doctorId = (actions?.find(a => a.type === 'reserve')?.payload as any)?.doctorId || '';
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
        {isScrollable && (
          <div className="flex items-center gap-1.5">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm disabled:opacity-30 hover:bg-quhealthy-green/5 dark:hover:bg-emerald-900/20 hover:text-quhealthy-green dark:hover:text-emerald-400 hover:border-quhealthy-green/30 dark:hover:border-emerald-800/50 transition-colors" 
              onClick={() => scroll('left')}
              disabled={!showLeftScroll}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm disabled:opacity-30 hover:bg-quhealthy-green/5 dark:hover:bg-emerald-900/20 hover:text-quhealthy-green dark:hover:text-emerald-400 hover:border-quhealthy-green/30 dark:hover:border-emerald-800/50 transition-colors" 
              onClick={() => scroll('right')}
              disabled={!showRightScroll}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={() => requestAnimationFrame(checkScroll)}
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
          <div key={service.serviceId} className="snap-start shrink-0 w-[260px]">
            <ServiceCardWidget
              service={service}
              doctorId={(actions?.find(a => a.type === 'reserve')?.payload as any)?.doctorId || ''}
              onSelect={handleSelectService}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
