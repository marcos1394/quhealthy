"use client";

import { useIntelligenceAggregate } from "@/hooks/useIntelligence";
import { useBIStore } from "@/store/intelligence.store";
import {
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export function StateDistributionChart() {
 const { data: rawData, loading, error } = useIntelligenceAggregate('entidad');
 const setFilter = useBIStore(state => state.setFilter);
 
 if (loading) {
 return <div className="h-[300px] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">PROCESANDO DATOS...</div>;
 }
 
 if (error || !rawData) {
 return <div className="h-[300px] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-red-500">ERROR DE CONSULTA</div>;
 }

 const data = rawData;
 const chartHeight = Math.max(300, data.length * 40);

 return (
 <div className="h-[400px] w-full overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-[#0a0a0a] dark:[&::-webkit-scrollbar-thumb]:bg-gray-800">
 <div style={{ height: chartHeight, width: '100%' }}>
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 layout="vertical"
 data={data}
 margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
 >
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" strokeOpacity={0.5} />
 <XAxis type="number" hide />
 <YAxis 
 dataKey="label" 
 type="category" 
 width={180} 
 axisLine={{ stroke: '#000', strokeWidth: 1 }} 
 tickLine={false}
 tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} 
 />
 <Tooltip 
 cursor={{ fill: 'rgba(0,0,0,0.05)' }}
 contentStyle={{ 
 backgroundColor: '#ffffff', 
 borderRadius: '0px', 
 border: '1px solid #000000', 
 boxShadow: '4px 4px 0 0 #000',
 color: '#000000',
 fontSize: '10px',
 textTransform: 'uppercase',
 fontWeight: 'bold',
 letterSpacing: '0.1em'
 }}
 itemStyle={{ color: '#000000' }}
 />
 <Bar 
 dataKey="total" 
 radius={[0, 0, 0, 0]} 
 onClick={(data) => setFilter('estado', data.label)}
 className="cursor-pointer hover:opacity-70 transition-opacity"
 barSize={20}
 >
 {data.map((entry, index) => (
 <Cell key={`cell-${index}`} fill="#111111" />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 );
}