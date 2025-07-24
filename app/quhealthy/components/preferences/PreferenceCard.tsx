"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface PreferenceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export const PreferenceCard: React.FC<PreferenceCardProps> = ({ icon: Icon, title, description, children, className = "" }) => (
  <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="bg-teal-500/10 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-teal-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-teal-400">{title}</h3>
          <p className="text-sm text-gray-400 mt-1 mb-4">{description}</p>
          {children}
        </div>
      </div>
    </CardContent>
  </Card>
);