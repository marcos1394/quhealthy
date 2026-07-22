"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useDiscoverContext } from './context/DiscoverContext';

export const DiscoverSkeleton = () => {
  const { viewMode, isFiltersOpen } = useDiscoverContext();

  // Create an array of 8 items for the skeleton
  const skeletons = Array(8).fill(null);

  return (
    <div className={cn(
      "w-full pointer-events-auto custom-scrollbar", 
      viewMode === "MAP" 
        ? "flex overflow-x-auto overflow-y-hidden gap-3 pb-4 md:flex-col md:flex-1 md:overflow-x-hidden md:overflow-y-auto md:gap-3 md:pb-6 px-4 md:px-0" 
        : "pb-20 md:pb-0 flex gap-8 max-w-7xl mx-auto"
    )}>
      
      {/* SIDEBAR FILTER PANEL SKELETON SOLO PARA GRID */}
      {viewMode === "GRID" && (
        <aside className={cn("hidden md:block flex-shrink-0 transition-all duration-300", isFiltersOpen ? "w-[300px]" : "w-[60px]")}>
          <div className={cn(
            "bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 animate-pulse",
            isFiltersOpen ? "h-[500px] w-full" : "h-[60px] w-full"
          )}></div>
        </aside>
      )}

      <div className={cn(
        viewMode === "GRID" 
          ? (isFiltersOpen ? "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start" : "flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start") 
          : "flex gap-3 md:flex-col md:gap-3 w-full"
      )}>
        {skeletons.map((_, idx) => (
          <div 
            key={idx}
            className={cn(
              "relative w-72 shrink-0 md:w-full self-start bg-white dark:bg-[#0a0a0a] flex flex-col border border-gray-200 dark:border-gray-800 animate-pulse"
            )}
          >
            {/* Image Skeleton */}
            <div className="h-40 md:h-48 w-full bg-gray-200 dark:bg-gray-800"></div>

            {/* Info Block Skeleton */}
            <div className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 w-1/3"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 shrink-0"></div>
              </div>
              <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-3" />
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 w-12"></div>
              </div>
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-800 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
