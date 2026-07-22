"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowDownAZ,
  Star,
  MapPin,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SortDropdown = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "relevance";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    // Restart pagination when sorting changes
    params.delete("page");
    router.replace(`?${params.toString()}`);
  };

  const getSortLabel = () => {
    switch (currentSort) {
      case "relevance":
        return "Recomendados";
      case "price_asc":
        return "Menor Precio";
      case "price_desc":
        return "Mayor Precio";
      case "distance":
        return "Más Cercanos";
      case "rating":
        return "Mejor Evaluados";
      default:
        return "Recomendados";
    }
  };

  const getSortIcon = () => {
    switch (currentSort) {
      case "relevance":
        return <TrendingUp className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />;
      case "price_asc":
        return <DollarSign className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />;
      case "price_desc":
        return <DollarSign className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />;
      case "distance":
        return <MapPin className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />;
      case "rating":
        return <Star className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />;
      default:
        return <TrendingUp className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-none h-8 px-4 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:border-black dark:hover:border-white shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff]"
        >
          {getSortIcon()} {getSortLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white dark:bg-black border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] z-50"
      >
        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold uppercase tracking-widest text-[10px] rounded-none",
            currentSort === "relevance" && "bg-gray-100 dark:bg-gray-900",
          )}
          onClick={() => handleSortChange("relevance")}
        >
          <TrendingUp className="w-3 h-3 mr-2" strokeWidth={2} /> Recomendados
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold uppercase tracking-widest text-[10px] rounded-none",
            currentSort === "distance" && "bg-gray-100 dark:bg-gray-900",
          )}
          onClick={() => handleSortChange("distance")}
        >
          <MapPin className="w-3 h-3 mr-2" strokeWidth={2} /> Más Cercanos
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold uppercase tracking-widest text-[10px] rounded-none",
            currentSort === "price_asc" && "bg-gray-100 dark:bg-gray-900",
          )}
          onClick={() => handleSortChange("price_asc")}
        >
          <DollarSign className="w-3 h-3 mr-2" strokeWidth={2} /> Menor Precio
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold uppercase tracking-widest text-[10px] rounded-none",
            currentSort === "price_desc" && "bg-gray-100 dark:bg-gray-900",
          )}
          onClick={() => handleSortChange("price_desc")}
        >
          <DollarSign className="w-3 h-3 mr-2" strokeWidth={2} /> Mayor Precio
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold uppercase tracking-widest text-[10px] rounded-none",
            currentSort === "rating" && "bg-gray-100 dark:bg-gray-900",
          )}
          onClick={() => handleSortChange("rating")}
        >
          <Star className="w-3 h-3 mr-2" strokeWidth={2} /> Mejor Evaluados
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
