// hooks/useDiscoverFoundations.ts
import { useMemo } from "react";
import useSWR from "swr";
import { foundationService } from "@/services/foundation.service";
import { FoundationPublicStorefront } from "@/types/foundation";

export const useDiscoverFoundations = (q?: string, enabled: boolean = true) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<FoundationPublicStorefront[]>(
    enabled ? ["/api/onboarding/foundation/public/list", q] : null,
    async () => {
      try {
        const list = await foundationService.getPublicFoundationsList();
        return list || [];
      } catch (err) {
        console.error("Error fetching public foundations:", err);
        return [];
      }
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  const filteredFoundations = useMemo(() => {
    if (!data) return [];
    if (!q || !q.trim()) return data;

    const query = q.toLowerCase().trim();
    return data.filter((f) => {
      const brand = (f.brandName || "").toLowerCase();
      const legal = (f.legalName || "").toLowerCase();
      const mission = (f.mission || "").toLowerCase();
      const city = (f.addressCity || "").toLowerCase();
      const causes = (f.primaryCauses || []).join(" ").toLowerCase();
      const progNames = (f.programs || []).map((p) => p.name).join(" ").toLowerCase();

      return (
        brand.includes(query) ||
        legal.includes(query) ||
        mission.includes(query) ||
        city.includes(query) ||
        causes.includes(query) ||
        progNames.includes(query)
      );
    });
  }, [data, q]);

  return {
    foundations: filteredFoundations,
    allFoundations: data || [],
    isLoading: isLoading && enabled,
    isValidating: isValidating && enabled,
    isError: !!error,
    mutate,
  };
};
