"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Utilidad de ShadCN para clases

interface PreferenceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export const PreferenceCard: React.FC<PreferenceCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  children, 
  className = "" 
}) => (
  <Card className={cn("bg-gray-900 border-gray-800 shadow-sm", className)}>
    <CardContent className="p-6">
      <div className="flex items-start gap-5">
        <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 shrink-0">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          </div>
          {/* Separador sutil */}
          <div className="w-full h-px bg-gray-800 my-2" />
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);