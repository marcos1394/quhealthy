import React from 'react';
import { BaseWidget } from '@quhealthy/health-os-contract';
import { DoctorCardWidget, DoctorGalleryWidget, CalendarWidget, AppointmentWidget, PaymentWidget } from '../widgets';
import { useActionEngine } from '@/hooks/useActionEngine';

interface Props {
  widgets: BaseWidget[];
}

export const WidgetRenderer: React.FC<Props> = ({ widgets }) => {
  const { dispatchAction } = useActionEngine();

  const renderWidget = (widget: BaseWidget) => {
    switch (widget.type) {
      case 'DoctorCardWidget':
        return <DoctorCardWidget key={widget.id} widget={widget as any} onAction={dispatchAction} />;
      case 'DoctorGalleryWidget':
        return <DoctorGalleryWidget key={widget.id} widget={widget as any} onAction={dispatchAction} />;
      case 'CalendarWidget':
        return <CalendarWidget key={widget.id} widget={widget as any} onAction={dispatchAction} />;
      case 'AppointmentWidget':
        return <AppointmentWidget key={widget.id} widget={widget as any} onAction={dispatchAction} />;
      case 'PaymentWidget':
        return <PaymentWidget key={widget.id} widget={widget as any} onAction={dispatchAction} />;
      default:
        return (
          <div key={widget.id} className="p-4 border border-red-300 bg-red-50 text-red-700 text-sm rounded">
            Unsupported widget type: {widget.type}
          </div>
        );
    }
  };

  if (!widgets || widgets.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      {widgets.map((widget) => renderWidget(widget))}
    </div>
  );
};
