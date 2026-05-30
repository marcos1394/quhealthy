"use client";

import { useIntelligenceAggregate } from "@/hooks/useIntelligence";
import { useBIStore } from "@/store/intelligence.store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export function InstitutionDistributionChart() {
  const { data: rawData, loading, error } = useIntelligenceAggregate('nombre_institucion');
  const setFilter = useBIStore(state => state.setFilter);
  
  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400">Cargando datos...</div>;
  }
  
  if (error || !rawData) {
    return <div className="h-[300px] flex items-center justify-center text-red-400">Error al cargar datos</div>;
  }

  const data = rawData;
  const chartWidth = Math.max(800, data.length * 80);

  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857', '#064e3b'];

  return (
    <div className="h-[400px] w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
      <div style={{ width: chartWidth, height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={160}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar 
            dataKey="total" 
            radius={[4, 4, 0, 0]}
            onClick={(data) => setFilter('institucion', data.label)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            barSize={40}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
