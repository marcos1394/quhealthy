"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface Distribution {
  label: string;
  total: number;
}

export function StateDistributionChart() {
  const [data, setData] = useState<Distribution[]>([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://localhost:8087";
    fetch(`${url}/api/intelligence/states`)
      .then(res => res.json())
      .then(d => {
        // Mostramos solo el Top 10 para que la gráfica sea legible
        setData(d.slice(0, 10));
      })
      .catch(err => console.error(err));
  }, []);

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400">Cargando datos...</div>;
  }

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
