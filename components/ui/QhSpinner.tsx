/* eslint-disable react-doctor/no-react19-deprecated-apis */
'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface QhSpinnerProps {
 /** sm = 24px, md = 40px, lg = 64px */
 size?: 'sm' | 'md' | 'lg';
 /** Optional text label below the spinner */
 label?: string;
 /** Additional CSS className */
 className?: string;
}

const sizes = {
 sm: "w-6 h-6",
 md: "w-10 h-10",
 lg: "w-16 h-16"
};

/**
 * QhSpinner — Architectural Loading Spinner
 *
 * Minimalist geometric loader:
 * - Static outer frame
 * - Spinning inner solid block
 * - Strict typography for labels
 */
export function QhSpinner({ size = 'md', label, className = '' }: QhSpinnerProps) {
 const dim = sizes[size];

 return (
 <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
 {/* Geometric Spinner */}
 <div className={cn("relative flex items-center justify-center", dim)}>
 {/* Marco estático (Blueprint frame) */}
 <div className="absolute inset-0 border border-gray-200 dark:border-gray-800" />
 
 {/* Bloque interior rotatorio */}
 <div className="absolute inset-1.5 bg-black dark:bg-white animate-[spin_2s_cubic-bezier(0.68,-0.55,0.26,1.55)_infinite]" />
 </div>

 {/* Label Editorial */}
 {label && (
 <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
 {label}
 </span>
 )}
 </div>
 );
}