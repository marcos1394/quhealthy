import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { BaseWidget } from '@quhealthy/health-os-contract';
import { 
  DoctorCardWidget, 
  DoctorGalleryWidget, 
  CalendarWidget, 
  AppointmentWidget, 
  PaymentWidget,
  VaultDocumentWidget,
  ServiceGalleryWidget
} from '../widgets';
import { useActionEngine } from '@/hooks/useActionEngine';

interface Props {
  widgets: BaseWidget[];
}

export const WidgetRenderer: React.FC<Props> = ({ widgets }) => {
  const { dispatchAction } = useActionEngine();

  const renderWidget = (widget: BaseWidget) => {
    switch (widget.type) {
      case 'DoctorCardWidget':
        return (
          <DoctorCardWidget 
            key={widget.id} 
            widget={widget as any} 
            onAction={dispatchAction} 
          />
        );
      case 'DoctorGalleryWidget':
        return (
          <DoctorGalleryWidget 
            key={widget.id} 
            widget={widget as any} 
            onAction={dispatchAction} 
          />
        );
      case 'CalendarWidget':
        return (
          <CalendarWidget 
            key={widget.id} 
            widget={widget as any} 
            onAction={dispatchAction} 
          />
        );
      case 'AppointmentWidget':
        return (
          <AppointmentWidget 
            key={widget.id} 
            widget={widget as any} 
            onAction={dispatchAction} 
          />
        );
      case 'PaymentWidget':
        return (
          <PaymentWidget 
            key={widget.id} 
            widget={widget as any} 
            onAction={dispatchAction} 
          />
        );
      case 'VaultDocumentWidget':
        return (
          <VaultDocumentWidget 
            key={widget.id} 
            widget={widget as any} 
            onAction={dispatchAction} 
          />
        );
      case 'ServiceGalleryWidget':
        return (
          <ServiceGalleryWidget 
            key={widget.id} 
            widget={widget as any} 
            onAction={dispatchAction} 
          />
        );
      default:
        return (
          <div
            key={widget.id}
            className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-xs font-semibold shadow-2xs font-sans"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
              <AlertTriangle className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold">Módulo no compatible</p>
              <p className="text-[11px] font-medium text-amber-700/80 dark:text-amber-400/80">
                Tipo de widget no reconocido: <code className="font-mono bg-amber-100/50 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md">{widget.type}</code>
              </p>
            </div>
          </div>
        );
    }
  };

  if (!widgets || widgets.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5 w-full my-2 font-sans">
      {widgets.map((widget, index) => (
        <motion.div
          key={widget.id || index}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
          className="w-full"
        >
          {renderWidget(widget)}
        </motion.div>
      ))}
    </div>
  );
};