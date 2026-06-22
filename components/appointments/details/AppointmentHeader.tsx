import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function AppointmentHeader({ 
  appointmentId, 
  statusLabel, 
  badgeClass 
}: { 
  appointmentId: number | string; 
  statusLabel: string; 
  badgeClass: string; 
}) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
      <div className="flex items-center gap-6">
        <button type="button" 
          onClick={() => router.push('/patient/dashboard/appointments')} 
          className="w-14 h-14 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
              Folio: #{appointmentId}
            </span>
            <span className={cn(
              "border px-2 py-1 text-[9px] font-bold uppercase tracking-widest",
              badgeClass
            )}>
              {statusLabel}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase">
            Auditoría de Cita Médica
          </h1>
        </div>
      </div>
    </div>
  );
}
