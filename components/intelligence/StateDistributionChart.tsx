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

export function StateDistributionChart() {
  const { data: rawData, loading, error } = useIntelligenceAggregate('entidad');
  const setFilter = useBIStore(state => state.setFilter);
  
  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400">Cargando datos...</div>;
  }
  
  if (error || !rawData) {
    return <div className="h-[300px] flex items-center justify-center text-red-400">Error al cargar datos</div>;
  }

  const data = rawData;
  const chartHeight = Math.max(300, data.length * 40);

  return (
    <div className="h-[400px] w-full overflow-y-auto pr-2 custom-scrollbar">
      <div style={{ height: chartHeight, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="label" 
            type="category" 
            width={180} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar 
            dataKey="total" 
            fill="#6366f1" 
            radius={[4, 4, 0, 0]} 
            onClick={(data) => setFilter('estado', data.label)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#6366f1" />
            ))}
          </Bar>
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
