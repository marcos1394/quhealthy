"use client"
/* eslint-disable react-doctor/button-has-type */;

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MapPin, Navigation, AlertCircle, CheckCircle2, Info } from "lucide-react";
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
    <div className="space-y-4">
      {/* Blueprint Map Placeholder */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="h-72 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] relative overflow-hidden"
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-10 dark:opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-[2px]">
          {/* Rigid Icon Box */}
          <div className="w-14 h-14 border border-black dark:border-white bg-white dark:bg-black flex items-center justify-center">
            <MapPin className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black dark:text-white" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                {loadingStages[currentStage]?.label || "Loading..."}
              </p>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
              Setting up exact location
            </p>
          </div>
          
          {/* Strict Progress Line */}
          <div className="w-full max-w-[200px] h-px bg-gray-300 dark:bg-gray-700 relative">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progress}%` }} 
              className="absolute top-0 left-0 h-full bg-black dark:bg-white" 
            />
          </div>
        </div>
      </motion.div>

      {/* Skeleton Input Field */}
      <div className="h-14 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center px-4 gap-4">
        <Navigation className="w-4 h-4 text-gray-400" />
        <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    </div>
  );
};

const MapEngine = dynamic(() => import("./MapModal"), { ssr: false, loading: () => <MapLoadingSkeleton /> });

export default function LocationPicker({ onLocationSelect, initialLocation, className }: LocationPickerProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => { 
    const timer = setTimeout(() => setIsMapReady(true), 3500); 
    return () => clearTimeout(timer); 
  }, []);

  if (hasError) {
    return (
      <div className={cn("border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0a0a0a] p-8 relative", className)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-12 h-12 border border-red-500 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-2">
              Connection Error
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
              Could not establish connection with Map services.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors w-full md:w-auto"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-6", className)}>
      <div className="relative z-0 border border-gray-200 dark:border-gray-800 p-1 bg-gray-50 dark:bg-[#050505]">
        <MapEngine onLocationSelect={onLocationSelect} initialLocation={initialLocation} />
      </div>

    </div>
  );
}

export type { LocationPickerProps };