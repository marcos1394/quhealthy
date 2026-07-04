"use client";

import { useIntelligenceSummary } from "@/hooks/useIntelligence";
import { Users, MapPin, Building, Map } from "lucide-react";
import { cn } from "@/lib/utils";

export function IntelligenceSummaryRow() {
 const { data, loading, error } = useIntelligenceSummary();

 if (loading || !data) {
 return (
 <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-8 flex items-center justify-center">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
 EXTRAYENDO MÉTRICAS PRINCIPALES...
 </p>
 </div>
 );
 }
 
 if (error) {
 return (
 <div className="border border-red-500 bg-red-50 dark:bg-red-900/10 p-8 flex items-center justify-center">
 <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
 ERROR DE LECTURA DE MÉTRICAS.
 </p>
 </div>
 );
 }

 const kpis = [
 {
 title: "ACTIVOS IDENTIFICADOS",
 value: data.totalEstablishments.toLocaleString(),
 icon: <Building className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />
 },
 {
 title: "GEORREFERENCIADOS",
 value: data.georeferencedEstablishments.toLocaleString(),
 icon: <MapPin className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />
 },
 {
 title: "SECTOR PRIVADO",
 value: data.privateEstablishments.toLocaleString(),
 icon: <Users className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />
 },
 {
 title: "ENTIDADES CUBIERTAS",
 value: "32 / 32",
 icon: <Map className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />
 }
 ];

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-black dark:border-white bg-white dark:bg-[#0a0a0a] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
 {kpis.map((kpi, idx) => (
 <div 
 key={idx} 
 className={cn(
 "p-6 flex flex-col justify-center",
 idx !== 0 && "border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-800 lg:border-t-0"
 )}
 >
 <div className="flex items-center gap-4 mb-4">
 <div className="p-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]">
 {kpi.icon}
 </div>
 <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-tight">
 {kpi.title}
 </h3>
 </div>
 <p className="text-3xl font-black tracking-tight text-black dark:text-white">
 {kpi.value}
 </p>
 </div>
 ))}
 </div>
 );
}