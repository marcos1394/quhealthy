'use client';

import React from 'react';
import { Activity } from 'lucide-react';

interface QhSpinnerProps {
    /** sm = 32px, md = 56px, lg = 80px */
    size?: 'sm' | 'md' | 'lg';
    /** Optional text label below the spinner */
    label?: string;
    /** Additional CSS className */
    className?: string;
}

const sizes = {
    sm: { outer: 'w-8 h-8', inner: 'w-5 h-5', icon: 'w-3 h-3', border: 'border-[3px]' },
    md: { outer: 'w-14 h-14', inner: 'w-9 h-9', icon: 'w-5 h-5', border: 'border-4' },
    lg: { outer: 'w-20 h-20', inner: 'w-12 h-12', icon: 'w-6 h-6', border: 'border-4' },
};

/**
 * QhSpinner — QuHealthy branded loading spinner
 *
 * Matches the Editorial HealthTech design system:
 * - Outer spinning ring in `medical-500` / `medical-600`
 * - Inner circle with `Activity` icon pulsing
 * - Full dark/light mode support
 *
 * Usage:
 *   <QhSpinner />
 *   <QhSpinner size="lg" label="Cargando..." />
 */
export function QhSpinner({ size = 'md', label, className = '' }: QhSpinnerProps) {
    const s = sizes[size];

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Outer spinning ring */}
                <div
                    className={`absolute ${s.outer} rounded-full ${s.border} border-medical-500/20 dark:border-medical-400/20 border-t-medical-600 dark:border-t-medical-400 animate-spin`}
                />
                {/* Inner icon container */}
                <div
                    className={`${s.inner} bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 z-10`}
                >
                    <Activity className={`${s.icon} text-medical-600 dark:text-medical-400 animate-pulse`} />
                </div>
            </div>
            {label && (
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                    {label}
                </span>
            )}
        </div>
    );
}
