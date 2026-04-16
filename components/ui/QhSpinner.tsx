'use client';

import React from 'react';

interface QhSpinnerProps {
    /** sm = 40px, md = 64px, lg = 96px */
    size?: 'sm' | 'md' | 'lg';
    /** Optional text label below the spinner */
    label?: string;
    /** Additional CSS className */
    className?: string;
}

const sizes = {
    sm: { container: 40, heart: 16, ring: 36, strokeWidth: 2.5, ecgWidth: 60, innerCircle: 25 },
    md: { container: 64, heart: 24, ring: 56, strokeWidth: 3, ecgWidth: 100, innerCircle: 39 },
    lg: { container: 96, heart: 36, ring: 84, strokeWidth: 3.5, ecgWidth: 140, innerCircle: 59 },
};

/**
 * QhSpinner — QuHealthy Heartbeat Loading Spinner
 *
 * HealthTech-branded loader with:
 * - Beating heart SVG with heartbeat keyframe animation
 * - Outer rotating ring with medical-600 gradient
 * - ECG pulse line animation below
 * - Full dark/light mode support
 *
 * Usage:
 *   <QhSpinner />
 *   <QhSpinner size="lg" label="Cargando..." />
 */
export function QhSpinner({ size = 'md', label, className = '' }: QhSpinnerProps) {
    const s = sizes[size];
    const halfContainer = s.container / 2;
    const ringRadius = s.ring / 2;
    const dashLen = ringRadius * Math.PI * 0.75;
    const gapLen = ringRadius * Math.PI * 1.25;

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            {/* Inject global keyframes once */}
            <style dangerouslySetInnerHTML={{ __html: QH_KEYFRAMES }} />

            {/* Heart + Ring */}
            <div className="relative flex items-center justify-center" style={{ width: s.container, height: s.container }}>
                {/* Outer rotating ring */}
                <svg
                    style={{ position: 'absolute', inset: 0, animation: 'qh-rotate 2s linear infinite' }}
                    width={s.container}
                    height={s.container}
                    viewBox={`0 0 ${s.container} ${s.container}`}
                >
                    <defs>
                        <linearGradient id={`qh-rg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--qh-ring-color, #0d9488)" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle
                        cx={halfContainer}
                        cy={halfContainer}
                        r={ringRadius}
                        fill="none"
                        className="stroke-medical-500/15 dark:stroke-medical-400/15"
                        strokeWidth={s.strokeWidth}
                    />
                    {/* Active arc */}
                    <circle
                        cx={halfContainer}
                        cy={halfContainer}
                        r={ringRadius}
                        fill="none"
                        stroke={`url(#qh-rg-${size})`}
                        strokeWidth={s.strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={`${dashLen} ${gapLen}`}
                    />
                </svg>

                {/* Inner circle with heart */}
                <div
                    className="bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-medical-500/10 dark:shadow-medical-400/5 border border-slate-100 dark:border-slate-800 z-10"
                    style={{ width: s.innerCircle, height: s.innerCircle }}
                >
                    <svg
                        style={{ animation: 'qh-beat 1.2s ease-in-out infinite' }}
                        width={s.heart}
                        height={s.heart}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            className="fill-medical-500 dark:fill-medical-400"
                        />
                    </svg>
                </div>
            </div>

            {/* ECG Pulse Line */}
            <svg
                width={s.ecgWidth}
                height={size === 'sm' ? 16 : 20}
                viewBox={`0 0 ${s.ecgWidth} 20`}
                style={{ overflow: 'visible' }}
            >
                <polyline
                    className="stroke-medical-500 dark:stroke-medical-400"
                    fill="none"
                    strokeWidth={size === 'sm' ? 1.5 : 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={generateEcgPoints(s.ecgWidth)}
                    style={{
                        strokeDasharray: 300,
                        strokeDashoffset: 300,
                        animation: 'qh-ecg-draw 2s linear infinite',
                    }}
                />
            </svg>

            {/* Label */}
            {label && (
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
                    {label}
                </span>
            )}
        </div>
    );
}

/** Global keyframes — injected once via dangerouslySetInnerHTML */
const QH_KEYFRAMES = `
@keyframes qh-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes qh-beat {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  15% { transform: scale(1.35); opacity: 1; }
  30% { transform: scale(1); opacity: 0.85; }
  45% { transform: scale(1.2); opacity: 1; }
  60% { transform: scale(1); opacity: 0.85; }
}
@keyframes qh-ecg-draw {
  0% { stroke-dashoffset: 300; }
  100% { stroke-dashoffset: 0; }
}
`;

/** Generates an ECG-like polyline (flat → spike → flat) */
function generateEcgPoints(width: number): string {
    const h = 10;
    const segments = [
        [0, h],
        [width * 0.25, h],
        [width * 0.32, h - 3],
        [width * 0.36, h + 8],
        [width * 0.40, h - 7],
        [width * 0.44, h + 3],
        [width * 0.48, h],
        [width * 0.75, h],
        [width * 0.80, h - 2],
        [width * 0.84, h + 4],
        [width * 0.87, h - 3],
        [width * 0.90, h + 1],
        [width * 0.93, h],
        [width, h],
    ];
    return segments.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}
