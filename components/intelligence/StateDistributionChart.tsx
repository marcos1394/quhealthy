"use client";

import { useIntelligenceStates } from "@/hooks/useIntelligence";

export function StateDistributionChart() {
  const { data: rawData, loading, error } = useIntelligenceStates();
  
  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400">Cargando datos...</div>;
  }
  
  if (error || !rawData) {
    return <div className="h-[300px] flex items-center justify-center text-red-400">Error al cargar datos</div>;
  }

  const data = rawData.slice(0, 10);

  return (
    <div className="h-[300px] w-full">
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
            width={120} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="total" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
