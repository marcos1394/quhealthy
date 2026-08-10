import React from "react";
import { DiabetesLogDto } from "@/services/diabetes.service";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { TrendingUp } from "lucide-react";

export function GlucoseRangeChart({ logs, targetMin = 70, targetMax = 180 }: { logs: DiabetesLogDto[], targetMin?: number, targetMax?: number }) {
  // Sort logs chronologically for the chart
  const data = [...logs]
    .filter(log => log.glucoseLevel)
    .sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime())
    .map(log => ({
      date: new Date(log.logDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      glucose: log.glucoseLevel,
    }));

  if (data.length < 2) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col items-center justify-center text-center">
        <TrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-3" />
        <p className="text-gray-500 text-sm">Registra al menos 2 mediciones para ver tu tendencia de glucosa.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <h3 className="font-bold text-gray-900 dark:text-white">Tendencia de Glucosa</h3>
      </div>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
            
            {/* Rango Objetivo */}
            <ReferenceArea y1={targetMin} y2={targetMax} fill="#10b981" fillOpacity={0.05} />
            
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#9ca3af" }} 
              domain={[Math.min(40, data[0]?.glucose || 40) - 20, Math.max(300, data[data.length-1]?.glucose || 300) + 20]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              labelStyle={{ color: "#6b7280", marginBottom: "4px", fontSize: "12px" }}
              formatter={(value: number) => [`${value} mg/dL`, "Glucosa"]}
            />
            <Line 
              type="monotone" 
              dataKey="glucose" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
