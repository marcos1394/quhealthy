"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, Navigation, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LocationPickerProps } from "@/types/location";

const loadingStages = [
  { id: 1, label: "Initializing Maps", duration: 1000 },
  { id: 2, label: "Syncing with Google", duration: 1500 },
  { id: 3, label: "Preparing interactive view", duration: 500 }
];

const MapLoadingSkeleton = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setProgress(prev => (prev >= 100 ? 100 : prev + 5)), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = loadingStages.map((stage, index) => {
      const delay = loadingStages.slice(0, index).reduce((acc, s) => acc + s.duration, 0);
      return setTimeout(() => setCurrentStage(index), delay);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="space-y-3">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="h-72 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-colors">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 bg-white/40 dark:bg-slate-950/40">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="p-4 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
            <MapPin className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </motion.div>
          <div className="text-center space-y-1">
            <div className="flex items-center gap-2 justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-medical-600 dark:text-medical-400" />
              <p className="text-slate-900 dark:text-white text-sm font-medium">{loadingStages[currentStage]?.label || "Loading..."}</p>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-light uppercase tracking-wider">Setting up exact location</p>
          </div>
          <div className="w-full max-w-[180px] h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-medical-600 dark:bg-medical-400" />
          </div>
        </div>
      </motion.div>
      <div className="h-11 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center px-3 gap-2.5">
        <Navigation className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        <div className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

const MapEngine = dynamic(() => import("./MapModal"), { ssr: false, loading: () => <MapLoadingSkeleton /> });

export default function LocationPicker({ onLocationSelect, initialLocation, className }: LocationPickerProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => { const timer = setTimeout(() => setIsMapReady(true), 3500); return () => clearTimeout(timer); }, []);

  if (hasError) {
    return (
      <div className={cn("p-7 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 text-center space-y-3 transition-colors")}>
        <div className="mx-auto w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-slate-900 dark:text-white font-semibold">Connection Error</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light">Could not establish connection with Map services.</p>
        </div>
        <button onClick={() => window.location.reload()}
          className="px-5 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg transition-all">
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className={cn("relative group")}>
      <div className="relative z-0"><MapEngine onLocationSelect={onLocationSelect} initialLocation={initialLocation} /></div>
      <AnimatePresence>
        {isMapReady && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="absolute top-3 right-3 z-10 pointer-events-none">
            <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 backdrop-blur-md px-2.5 py-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />Synced with Google
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-3 flex items-start gap-2.5 px-1">
        <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
          <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-light italic">
          <strong className="font-medium">Pro Tip:</strong> If your office is inside a plaza or medical tower, move the red marker exactly to the local or main entrance to better guide your patients.
        </div>
      </div>
    </div>
  );
}

export type { LocationPickerProps };