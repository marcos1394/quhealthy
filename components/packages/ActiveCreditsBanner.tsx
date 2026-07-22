"use client";

import React, { useMemo } from "react";
import { usePackages } from "@/hooks/usePackages";
import { Sparkles, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConsumerPackage } from "@/types/packages";

interface ActiveCreditsBannerProps {
  providerId: number;
  brandColor?: string;
  className?: string;
  isBookingView?: boolean;
}

export function ActiveCreditsBanner({
  providerId,
  brandColor = "#000000",
  className,
  isBookingView,
}: ActiveCreditsBannerProps) {
  const { packages, isLoading } = usePackages();

  const activeCreditsCount = useMemo(() => {
    if (!packages || packages.length === 0) return 0;

    // Find packages belonging to this provider
    const providerPackages = packages.filter(
      (pkg: ConsumerPackage) => pkg.provider?.id === providerId,
    );

    // Sum remaining credits
    let totalRemaining = 0;
    providerPackages.forEach((pkg: ConsumerPackage) => {
      pkg.creditsRemaining?.forEach((credit) => {
        totalRemaining += credit.quantity;
      });
    });

    return totalRemaining;
  }, [packages, providerId]);

  if (isLoading || activeCreditsCount === 0) {
    return null;
  }

  const safeColor =
    brandColor && brandColor !== "#ffffff" && brandColor !== "#000000"
      ? brandColor
      : "#000000";

  return (
    <div
      className={cn(
        "w-full py-3 px-6 shadow-md z-40 relative flex flex-col sm:flex-row items-center justify-between gap-4",
        className,
      )}
      style={{ backgroundColor: safeColor, color: "#ffffff" }}
    >
      <div className="flex items-center gap-3">
        <div className="bg-white text-black p-2 shrink-0 border border-transparent">
          <PackageCheck className="w-5 h-5" strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            ¡Tienes Sesiones Disponibles!
          </h4>
          <p className="text-[10px] uppercase tracking-widest opacity-80 mt-0.5">
            Cuentas con{" "}
            <span className="font-bold underline decoration-2">
              {activeCreditsCount} sesiones prepagadas
            </span>{" "}
            con este especialista.
          </p>
        </div>
      </div>

      {isBookingView ? (
        <div className="text-[9px] uppercase tracking-widest font-bold border border-white/40 px-3 py-1.5 shrink-0 bg-white/20 text-white">
          Crédito aplicado para agendar
        </div>
      ) : (
        <div className="text-[9px] uppercase tracking-widest font-bold border border-white/40 px-3 py-1.5 shrink-0 bg-white/20 text-white">
          Selecciona un servicio para agendar
        </div>
      )}
    </div>
  );
}
