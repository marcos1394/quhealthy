"use client";

import React from "react";
import { useDiscoverFilters } from "@/hooks/useDiscoverFilters";

const OPTIONS = [
  { label: "Cualquiera", value: "" },
  { label: "Presencial", value: "IN_PERSON" },
  { label: "Online", value: "ONLINE" },
  { label: "Híbrido", value: "HYBRID" },
];

export function ModalityFilter() {
  const { filters, setFilter } = useDiscoverFilters();

  return (
    <div className="space-y-3">
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
        Modalidad
      </span>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const isActive =
            filters.modality === opt.value ||
            (!filters.modality && opt.value === "");
          return (
            <button
              key={opt.value}
              onClick={() => setFilter("modality", opt.value)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${
                isActive
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
                  : "bg-white text-black border-black dark:bg-[#0a0a0a] dark:text-white dark:border-white hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
