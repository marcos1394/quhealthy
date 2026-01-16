"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface StatBlockProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string; // Opcional: para mostrar "+5% vs mes pasado"
}

export const StatBlock: React.FC<StatBlockProps> = ({ label, value, icon, trend }) => (
  <Card className="bg-gray-900 border-gray-800 shadow-lg hover:border-purple-500/30 transition-all duration-300">
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            {trend && <span className="text-xs text-emerald-400 font-medium">{trend}</span>}
        </div>
      </div>
      <div className="p-3 bg-gray-800 rounded-xl border border-gray-700 text-purple-400 shadow-inner">
        {icon}
      </div>
    </CardContent>
  </Card>
);