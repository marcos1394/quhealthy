"use client";

import React from 'react';
import { m } from 'framer-motion';
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreferenceCard } from "./PreferenceCard";

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

export const PreferenceCardAction: React.FC<PreferenceCardProps & { 
 actionLabel?: string;
 onAction?: () => void;
}> = (props) => {
 const { actionLabel = "Configurar", onAction, ...cardProps } = props;

 return (
 <PreferenceCard {...cardProps}>
 {props.children}
 
 {onAction && (
 <m.button
 onClick={(e) => {
 e.stopPropagation();
 onAction();
 }}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className={cn(
 "mt-4 w-full px-4 py-2 rounded-lg font-medium text-sm",
 "bg-purple-500/10 text-purple-400 border border-purple-500/20",
 "hover:bg-medical-500/20 hover:border-purple-500/30",
 "transition-all duration-200",
 "flex items-center justify-center gap-2"
 )}
 >
 {actionLabel}
 <ChevronRight className="w-4 h-4" />
 </m.button>
 )}
 </PreferenceCard>
 );
};
