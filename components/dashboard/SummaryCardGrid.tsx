"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const SummaryCardGrid: React.FC<{ children: React.ReactNode; columns?: number }> = ({ children, columns = 4 }) => {
 return (
 // Estructura Blueprint Grid: gap-0 con bordes Top e Izquierdo en el contenedor padre
 <div className={cn(
 "grid gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]", 
 columns === 1 ? "grid-cols-1" : "", 
 columns === 2 ? "grid-cols-1 md:grid-cols-2" : "",
 columns === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "",
 columns === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : ""
 )}>
 {children}
 </div>
 );
};
