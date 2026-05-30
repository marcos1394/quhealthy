"use client";

import { useIntelligenceSummary } from "@/hooks/useIntelligence";
import { Users, MapPin, Building, Map } from "lucide-react";

export function IntelligenceSummaryRow() {
  const { data, loading, error } = useIntelligenceSummary();

  if (loading || !data) {
    return <div className="animate-pulse flex gap-4 h-24">Cargando métricas...</div>;
  }
  
  if (error) {
    return <div className="text-red-300">Error al cargar métricas</div>;
  }

  const kpis = [
    {
      title: "Establecimientos Activos",
      value: data.totalEstablishments.toLocaleString(),
      icon: <Building className="h-6 w-6 text-blue-300" />,
      color: "bg-blue-800/50 border-blue-700",
    },
    {
      title: "Georreferenciados",
      value: data.georeferencedEstablishments.toLocaleString(),
      icon: <MapPin className="h-6 w-6 text-emerald-300" />,
      color: "bg-emerald-800/50 border-emerald-700",
    },
    {
      title: "Sector Privado",
      value: data.privateEstablishments.toLocaleString(),
      icon: <Users className="h-6 w-6 text-purple-300" />,
      color: "bg-purple-800/50 border-purple-700",
    },
    {
      title: "Estados Cubiertos",
      value: "32",
      icon: <Map className="h-6 w-6 text-amber-300" />,
      color: "bg-amber-800/50 border-amber-700",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <div key={idx} className={`rounded-xl border p-6 flex flex-col justify-center backdrop-blur-sm shadow-xl ${kpi.color}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/10">
              {kpi.icon}
            </div>
            <h3 className="text-sm font-medium text-slate-300">{kpi.title}</h3>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}
