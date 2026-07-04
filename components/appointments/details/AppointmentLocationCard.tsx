import React from 'react';
import { MapPin, Video, Clock } from 'lucide-react';

export function AppointmentLocationCard({
 isOnline,
 meetLink,
 locationAddress
}: {
 isOnline: boolean;
 meetLink?: string;
 locationAddress?: string;
}) {
 return (
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between bg-gray-50 dark:bg-[#050505]">
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <MapPin className="w-4 h-4" strokeWidth={1.5} />
 Logística de Asistencia
 </h3>
 </div>
 <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
 <div className="w-14 h-14 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
 {isOnline ? <Video className="w-6 h-6" strokeWidth={1.5} /> : <MapPin className="w-6 h-6" strokeWidth={1.5} />}
 </div>
 <div className="flex-1">
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
 Modalidad: {isOnline ? 'TELEMEDICINA' : 'ATENCIÓN PRESENCIAL'}
 </p>
 
 {isOnline ? (
 <div className="space-y-3 mt-2">
 <p className="text-xs font-light leading-relaxed text-black dark:text-white">
 El enlace cifrado para la transmisión se activará minutos antes de su consulta.
 </p>
 {meetLink ? (
 <a href={meetLink} target="_blank" rel="noreferrer" className="inline-flex border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[9px] font-bold uppercase tracking-widest px-4 py-2 transition-colors">
 <Video className="w-3 h-3 mr-2" strokeWidth={1.5} /> Iniciar Transmisión
 </a>
 ) : (
 <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
 <Clock className="w-3 h-3" strokeWidth={2} /> Enlace en generación
 </span>
 )}
 </div>
 ) : (
 <p className="text-sm font-semibold tracking-tight text-black dark:text-white uppercase leading-relaxed mt-2">
 {locationAddress || 'DIRECCIÓN NO ESPECIFICADA. CONTACTE AL PROVEEDOR.'}
 </p>
 )}
 </div>
 </div>
 </div>
 );
}
