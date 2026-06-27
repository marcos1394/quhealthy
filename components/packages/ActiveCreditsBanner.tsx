"use client";

import React, { useMemo } from 'react';
import { usePackages } from '@/hooks/usePackages';
import { Sparkles, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConsumerPackage } from '@/types/packages';

interface ActiveCreditsBannerProps {
    providerSlug: string;
    brandColor?: string;
    className?: string;
    isBookingView?: boolean;
}

export function ActiveCreditsBanner({ providerSlug, brandColor = '#000000', className, isBookingView }: ActiveCreditsBannerProps) {
    const { packages, isLoading } = usePackages();

    const activeCreditsCount = useMemo(() => {
        if (!packages || packages.length === 0) return 0;
        
        // Find packages belonging to this provider
        const providerPackages = packages.filter(
            (pkg: ConsumerPackage) => pkg.provider?.slug === providerSlug
        );

        // Sum remaining credits
        let totalRemaining = 0;
        providerPackages.forEach((pkg: ConsumerPackage) => {
            pkg.creditsRemaining?.forEach((credit) => {
                totalRemaining += credit.quantity;
            });
        });

        return totalRemaining;
    }, [packages, providerSlug]);

    if (isLoading || activeCreditsCount === 0) {
        return null;
    }

    const safeColor = brandColor && brandColor !== '#ffffff' && brandColor !== '#000000' ? brandColor : '#000000';

    return (
        <div className={cn("w-full bg-black text-white dark:bg-white dark:text-black py-3 px-6 shadow-md z-40 relative flex flex-col sm:flex-row items-center justify-between gap-4 border-b-4", className)} style={{ borderBottomColor: safeColor }}>
            <div className="flex items-center gap-3">
                <div className="bg-white text-black dark:bg-black dark:text-white p-2 shrink-0 border border-black dark:border-white">
                    <PackageCheck className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        ¡Tienes Sesiones Disponibles!
                    </h4>
                    <p className="text-[10px] uppercase tracking-widest opacity-80 mt-0.5">
                        Cuentas con <span className="font-bold underline decoration-2">{activeCreditsCount} sesiones prepagadas</span> con este especialista.
                    </p>
                </div>
            </div>
            
            {isBookingView ? (
                <div className="text-[9px] uppercase tracking-widest font-bold border border-white/30 dark:border-black/30 px-3 py-1.5 shrink-0 bg-white/10 dark:bg-black/10 text-green-400 dark:text-green-600">
                    Crédito aplicado para agendar
                </div>
            ) : (
                <div className="text-[9px] uppercase tracking-widest font-bold border border-white/30 dark:border-black/30 px-3 py-1.5 shrink-0 bg-white/10 dark:bg-black/10">
                    Selecciona un servicio para agendar
                </div>
            )}
        </div>
    );
}
