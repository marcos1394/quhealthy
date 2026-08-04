import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontLocation } from '@/types/storefront';

interface LocationSelectorProps {
  locations: StorefrontLocation[];
  selectedLocationId: number | null;
  onSelect: (locationId: number) => void;
  safeColor: string;
  stepCounter: number;
  title: string;
  subtitle: string;
}

export function LocationSelector({
  locations,
  selectedLocationId,
  onSelect,
  safeColor,
  stepCounter,
  title,
  subtitle,
}: LocationSelectorProps) {
  if (!locations || locations.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden space-y-6"
    >
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-sm"
          style={{ backgroundColor: safeColor, color: "#ffffff" }}
        >
          {stepCounter}
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <button
            key={location.id}
            className={cn(
              "p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 text-left shadow-sm",
              selectedLocationId === location.id
                ? "bg-store-50/50 dark:bg-store-950/20 text-gray-900 dark:text-white ring-2"
                : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:border-gray-200 dark:hover:border-gray-700"
            )}
            style={{ 
              borderColor: selectedLocationId === location.id ? safeColor : undefined,
              boxShadow: selectedLocationId === location.id ? `0 0 0 2px ${safeColor}33` : undefined 
            }}
            onClick={() => onSelect(location.id)}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors border",
                selectedLocationId === location.id
                  ? "text-white border-transparent"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700"
              )}
              style={{ backgroundColor: selectedLocationId === location.id ? safeColor : undefined }}
            >
              <MapPin className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {location.name} {location.isMain && "⭐"}
              </h4>
              {location.address && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {location.address}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
