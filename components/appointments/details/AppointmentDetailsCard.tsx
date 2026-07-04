import React from 'react';
import { User, Stethoscope, FileText } from 'lucide-react';

export function AppointmentDetailsCard({
 providerNameSnapshot,
 serviceNameSnapshot,
 serviceName,
 consumerSymptoms
}: {
 providerNameSnapshot?: string;
 serviceNameSnapshot?: string;
 serviceName?: string;
 consumerSymptoms?: string;
}) {
 return (
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <User className="w-4 h-4" strokeWidth={1.5} />
 Detalles Clínicos
 </h3>
 </div>
 <div className="p-8 space-y-8">
 <div className="flex flex-col sm:flex-row gap-6 items-start">
 <div className="w-16 h-16 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 overflow-hidden">
 <span className="text-xl font-bold uppercase">{(providerNameSnapshot || 'E').charAt(0)}</span>
 </div>
 <div className="flex flex-col justify-center h-16">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Especialista Asignado</p>
 <p className="text-xl font-semibold tracking-tight uppercase text-black dark:text-white">
 {providerNameSnapshot || 'Especialista General'}
 </p>
 </div>
 </div>

 <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
 <Stethoscope className="w-3.5 h-3.5" strokeWidth={1.5} /> Procedimiento a Realizar
 </p>
 <p className="text-lg font-semibold tracking-tight text-black dark:text-white uppercase">
 {serviceNameSnapshot || serviceName || 'Consulta Integral'}
 </p>
 </div>

 {consumerSymptoms && (
 <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
 <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> Observaciones del Paciente
 </p>
 <div className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] p-5 text-xs font-light text-black dark:text-white leading-relaxed uppercase tracking-wide">
 "{consumerSymptoms}"
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
