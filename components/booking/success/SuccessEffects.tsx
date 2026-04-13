// Ubicación: src/components/booking/success/SuccessEffects.tsx
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl" />
      <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 10, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-medical-500/10 dark:bg-medical-500/20 rounded-full blur-3xl" />
    </div>
  );
}

export function Confetti({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(30)].map((_, i) => (
            <motion.div key={i} initial={{ top: '-10%', left: `${Math.random() * 100}%`, rotate: 0 }} animate={{ top: '110%', rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }} transition={{ duration: 3 + Math.random() * 2, delay: Math.random() * 2, ease: "linear" }} className="absolute">
              <Sparkles className={cn("w-6 h-6", i % 3 === 0 ? "text-emerald-400" : "", i % 3 === 1 ? "text-medical-400" : "", i % 3 === 2 ? "text-pink-400" : "text-slate-400")} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}