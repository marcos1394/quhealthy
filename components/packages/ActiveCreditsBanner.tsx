"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, PackageCheck } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";
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
  brandColor = "#059669",
  className,
  isBookingView,
}: ActiveCreditsBannerProps) {
  const t = useTranslations("ActiveCreditsBanner");
  const { packages, isLoading } = usePackages();

  const activeCreditsCount = useMemo(() => {
    if (!packages || packages.length === 0) return 0;

    const providerPackages = packages.filter(
      (pkg: ConsumerPackage) => pkg.provider?.id === providerId
    );

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
      : "#059669";

  return (
    <div
      className={cn(
        "w-full py-3.5 px-6 shadow-xs z-40 relative flex flex-col sm:flex-row items-center justify-between gap-4 font-sans select-none rounded-2xl border border-white/10 backdrop-blur-md transition-all",
        className
      )}
      style={{ backgroundColor: safeColor, color: "#ffffff" }}
    >
      <div className="flex items-center gap-3.5">
        <div className="bg-white/20 dark:bg-black/20 p-2.5 rounded-xl shrink-0 backdrop-blur-xs border border-white/20">
          <PackageCheck className="w-5 h-5 text-white" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h4 className="text-xs font-bold tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" strokeWidth={2} />
            <span>{t("title")}</span>
          </h4>

          <p className="text-xs font-medium text-white/90 leading-relaxed">
            {t.rich("subtitle", {
              count: activeCreditsCount,
              highlight: (chunks) => (
                <span className="font-bold underline decoration-white/60">
                  {chunks}
                </span>
              ),
            })}
          </p>
        </div>
      </div>

      <div className="text-[11px] font-bold tracking-wider uppercase border border-white/30 px-3.5 py-1.5 rounded-full shrink-0 bg-white/10 backdrop-blur-xs text-white shadow-2xs">
        {isBookingView ? t("booking_notice") : t("select_notice")}
      </div>
    </div>
  );
}