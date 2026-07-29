"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SummaryCardGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export const SummaryCardGrid: React.FC<SummaryCardGridProps> = ({
  children,
  columns = 4,
  className,
}) => {
  const columnClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 w-full font-sans",
        columnClasses[columns] || columnClasses[4],
        className
      )}
    >
      {children}
    </div>
  );
};