"use client";

import { useEffect, useState } from "react";
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

interface Distribution {
  label: string;
  total: number;
}

export function InstitutionDistributionChart() {
  const [data, setData] = useState<Distribution[]>([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://localhost:8087";
    fetch(`${url}/api/intelligence/institutions`)
      .then(res => res.json())
      .then(d => {
        // Tomamos el Top 7 para la gráfica
        setData(d.slice(0, 7));
      })
      .catch(err => console.error(err));
  }, []);

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400">Cargando datos...</div>;
  }

  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669', '#047857', '#064e3b'];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
