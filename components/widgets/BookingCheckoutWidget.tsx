import React, { useState } from 'react';
import { BaseWidget } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarCheck, Stethoscope, FileText } from 'lucide-react';
import { PatientSelector } from '@/components/booking/PatientSelector';
import { useBookingStore } from '@/hooks/useBookingStore';

interface Props {
  widget: BaseWidget;
  onAction?: (action: any) => void;
}

export const BookingCheckoutWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;
  const { dependentId } = useBookingStore();
  const [symptoms, setSymptoms] = useState('');
  const [shareVault, setShareVault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    setIsSubmitting(true);
    
    // Buscar la acción de confirm_booking
    const confirmAction = actions?.find(a => a.type === 'confirm_booking');
    
    if (confirmAction && onAction) {
      onAction({
        ...confirmAction,
        payload: {
          ...confirmAction.payload,
          doctorId: data.doctorId,
          serviceId: data.serviceId,
          dateTime: data.dateTime,
          dependentId: dependentId ? dependentId.toString() : null,
          symptoms: symptoms.trim(),
          shareVaultAccess: shareVault
        }
      });
    }
  };

  const formattedDate = new Date(data.dateTime).toLocaleString('es-MX', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });

  return (
    <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
      <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-white min-w-0">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate font-bold">Confirma tu Cita</span>
            <span className="text-xs text-gray-500 font-medium truncate capitalize">{formattedDate}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-6 min-w-0 p-4 sm:p-5">
        
        {/* Patient Selector */}
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-[#0a0a0a]">
          <PatientSelector />
        </div>

        {/* Symptoms */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            ¿Cuál es el motivo de tu consulta?
          </Label>
          <Textarea 
            placeholder="Describe brevemente tus síntomas o motivo de la visita..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="resize-none h-24 bg-gray-50 dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500"
          />
        </div>

        {/* Share Vault */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10">
          <Switch 
            checked={shareVault}
            onCheckedChange={setShareVault}
            className="mt-0.5 data-[state=checked]:bg-emerald-600"
          />
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer flex items-center gap-1.5" onClick={() => setShareVault(!shareVault)}>
              <FileText className="w-4 h-4 text-emerald-600" />
              Compartir Expediente Clínico (Vault)
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Permite al médico revisar tu historial, recetas previas y estudios de laboratorio antes y durante la consulta para un mejor diagnóstico.
            </p>
          </div>
        </div>

      </CardContent>

      <CardFooter className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10">
        <Button 
          onClick={handleConfirm}
          disabled={isSubmitting || !symptoms.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-bold shadow-md shadow-emerald-900/20"
        >
          {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
        </Button>
      </CardFooter>
    </Card>
  );
};
