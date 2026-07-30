"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SortDropdown = () => {
  const t = useTranslations("Discover.SortDropdown");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "relevance";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    // Reiniciar paginación al cambiar el orden
    params.delete("page");
    router.replace(`?${params.toString()}`);
  };

  const getSortLabel = () => {
    switch (currentSort) {
      case "relevance":
        return t("relevance");
      case "price_asc":
        return t("price_asc");
      case "price_desc":
        return t("price_desc");
      case "distance":
        return t("distance");
      case "rating":
        return t("rating");
      default:
        return t("relevance");
    }
  };

  const getSortIcon = () => {
    switch (currentSort) {
      case "relevance":
        return <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
      case "price_asc":
      case "price_desc":
        return <DollarSign className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
      case "distance":
        return <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
      case "rating":
        return <Star className="w-3.5 h-3.5 mr-1.5 text-amber-500 fill-amber-500" strokeWidth={2} />;
      default:
        return <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-10 px-3.5 text-xs font-bold whitespace-nowrap transition-all border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 hover:border-emerald-500/30 hover:bg-gray-50 dark:hover:bg-[#111] shadow-2xs font-sans cursor-pointer"
        >
          {getSortIcon()}
          <span>{getSortLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-1.5 font-sans z-50 space-y-0.5"
      >
        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold text-xs px-3 py-2.5 rounded-xl transition-colors focus:bg-gray-50 dark:focus:bg-[#111]",
            currentSort === "relevance" &&
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          )}
          onClick={() => handleSortChange("relevance")}
        >
          <TrendingUp className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("relevance")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold text-xs px-3 py-2.5 rounded-xl transition-colors focus:bg-gray-50 dark:focus:bg-[#111]",
            currentSort === "distance" &&
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          )}
          onClick={() => handleSortChange("distance")}
        >
          <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("distance")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold text-xs px-3 py-2.5 rounded-xl transition-colors focus:bg-gray-50 dark:focus:bg-[#111]",
            currentSort === "price_asc" &&
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          )}
          onClick={() => handleSortChange("price_asc")}
        >
          <DollarSign className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("price_asc")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold text-xs px-3 py-2.5 rounded-xl transition-colors focus:bg-gray-50 dark:focus:bg-[#111]",
            currentSort === "price_desc" &&
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          )}
          onClick={() => handleSortChange("price_desc")}
        >
          <DollarSign className="w-3.5 h-3.5 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("price_desc")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            "cursor-pointer font-bold text-xs px-3 py-2.5 rounded-xl transition-colors focus:bg-gray-50 dark:focus:bg-[#111]",
            currentSort === "rating" &&
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          )}
          onClick={() => handleSortChange("rating")}
        >
          <Star className="w-3.5 h-3.5 mr-2 text-amber-500 fill-amber-500" strokeWidth={2} />
          <span>{t("rating")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};