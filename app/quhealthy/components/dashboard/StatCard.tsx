import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StatCard as StatCardType } from '@/app/quhealthy/types/dashboard'; // Asumimos que los tipos están en un archivo

export const StatCard = ({ stat }: { stat: StatCardType }) => (
  <Card className={`${stat.color} border-0`}>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-300 text-sm">{stat.title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
          {stat.trend !== undefined && (
            <p className={`text-sm mt-1 ${
              stat.trend > 0 ? "text-emerald-400" : stat.trend < 0 ? "text-red-400" : "text-gray-400"
            }`}>
              {stat.trend > 0 ? "+" : ""}{stat.trend}% vs. periodo anterior
            </p>
          )}
        </div>
        {stat.icon}
      </div>
    </CardContent>
  </Card>
);