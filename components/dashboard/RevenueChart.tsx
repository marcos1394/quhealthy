"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";

const mockData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 5500 },
    { name: "Mar", revenue: 4800 },
    { name: "Apr", revenue: 7000 },
    { name: "May", revenue: 8600 },
    { name: "Jun", revenue: 10200 },
    { name: "Jul", revenue: 9500 },
    { name: "Aug", revenue: 12500 }
];

export const RevenueChart = () => {
    // Assuming you might want to switch translation context later, currently unused
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={mockData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                    onMouseMove={(state: any) => {
                        if (state.isTooltipActive) {
                            setActiveIndex(state.activeTooltipIndex);
                        } else {
                            setActiveIndex(null);
                        }
                    }}
                    onMouseLeave={() => setActiveIndex(null)}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
