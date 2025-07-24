"use client";
import React from 'react';

interface StatBlockProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}

export const StatBlock: React.FC<StatBlockProps> = ({ label, value, icon }) => (
  <div className="bg-gray-700/50 p-4 rounded-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400">{label}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      {icon}
    </div>
  </div>
);