"use client";

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
}

const variantStyles = {
  default: {
    icon: "bg-muted text-muted-foreground",
    trend: "text-muted-foreground",
  },
  primary: {
    icon: "bg-primary/10 text-primary",
    trend: "text-primary",
  },
  success: {
    icon: "bg-chart-3/10 text-chart-3",
    trend: "text-chart-3",
  },
  warning: {
    icon: "bg-chart-4/10 text-chart-4",
    trend: "text-chart-4",
  },
  info: {
    icon: "bg-chart-2/10 text-chart-2",
    trend: "text-chart-2",
  },
};

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  variant = 'default',
}) => {
  const styles = variantStyles[variant];
  
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Left Side - Content */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {value}
              </p>
              
              {trend && (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                    trend.isPositive 
                      ? "bg-chart-3/10 text-chart-3" 
                      : "bg-destructive/10 text-destructive"
                  )}>
                    {trend.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </span>
                  {trend.label && (
                    <span className="text-xs text-muted-foreground">
                      {trend.label}
                    </span>
                  )}
                </div>
              )}
              
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          {/* Right Side - Icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            styles.icon
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
