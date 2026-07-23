import React from 'react';
import { BaseWidget } from '@quhealthy/health-os-contract';
import { DoctorCardWidget, CalendarWidget } from '../widgets';
import { useActionEngine } from '@/hooks/useActionEngine';

// Registry of supported widgets
const WIDGET_REGISTRY: Record<string, React.FC<any>> = {
  DoctorCardWidget: DoctorCardWidget,
  CalendarWidget: CalendarWidget,
  // PaymentWidget: PaymentWidget,
  // VaultSummaryWidget: VaultSummaryWidget,
};

interface Props {
  widgets: BaseWidget[];
}

export const WidgetRenderer: React.FC<Props> = ({ widgets }) => {
  const { dispatchAction } = useActionEngine();

  if (!widgets || widgets.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      {widgets.map((widget) => {
        const WidgetComponent = WIDGET_REGISTRY[widget.type];
        
        if (!WidgetComponent) {
          console.warn(`Widget type ${widget.type} is not registered in WidgetRenderer.`);
          return (
            <div key={widget.id} className="p-4 border border-dashed text-sm text-muted-foreground">
              [Unsupported Widget: {widget.type}]
            </div>
          );
        }

        return (
          <WidgetComponent 
            key={widget.id} 
            widget={widget} 
            onAction={dispatchAction} 
          />
        );
      })}
    </div>
  );
};
