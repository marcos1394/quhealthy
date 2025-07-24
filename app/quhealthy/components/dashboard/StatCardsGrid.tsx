"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StatCard as StatCardType } from '@/app/quhealthy/types/dashboard';

export const StatCardsGrid: React.FC<{ stats: StatCardType[] }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.color} border-0`}>
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
      ))}
    </div>
  );
};