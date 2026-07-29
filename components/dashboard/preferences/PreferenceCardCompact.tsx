"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PreferenceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
  highlighted?: boolean;
  onClick?: () => void;
}

export const PreferenceCardCompact: React.FC<PreferenceCardProps> = (
  props
) => {
  const {
    icon: Icon,
    title,
    description,
    children,
    className,
    badge,
    highlighted,
  } = props;

  return (
    <Card
      className={cn(
        "bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xs transition-all duration-200 font-sans",
        "hover:border-emerald-500/30 hover:shadow-xs",
        highlighted
          ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20"
          : "",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl shrink-0 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>

          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {title}
              </h4>
              {badge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                  <Sparkles className="w-3 h-3" strokeWidth={2} />
                  <span>{badge}</span>
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
            <div className="space-y-2 pt-1">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};