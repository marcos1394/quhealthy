"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck, User, Tag, ChevronRight } from 'lucide-react';
import { ConsumerPackage } from '@/types/packages';
import { Button } from '@/components/ui/button';

interface PackageCardProps {
    pkg: ConsumerPackage;
}

export function PackageCard({ pkg }: PackageCardProps) {
    const t = useTranslations('PatientPackages');
    const router = useRouter();

    const handleUseCredits = () => {
        router.push(`/search?provider=${encodeURIComponent(pkg.provider.name)}`);
    };

    return (
        <div className="flex flex-col border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-colors group h-full">
            
            {/* Cabecera Técnica */}
            <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                        <span className="w-1.5 h-1.5 bg-white dark:bg-black rounded-full animate-pulse" />
                        {pkg.type === 'SERVICE' ? 'Servicio Prepagado' : t('status_active', { defaultValue: 'Paquete Activo' })}
                    </span>
                    <ShieldCheck className="w-5 h-5 text-black dark:text-white shrink-0" strokeWidth={1.5} />
                </div>
                
                <div>
                    <h3 className="text-xl font-semibold tracking-tight text-black dark:text-white uppercase line-clamp-1 mb-1">
                        {pkg.servicePackage.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        <User className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span className="truncate">{pkg.provider.name}</span>
                        <span>•</span>
                        <span className="truncate text-black dark:text-white">{pkg.provider.specialty}</span>
                    </div>
                </div>
            </div>

            {/* Contenido y Progreso (Barras Arquitectónicas) */}
            <div className="p-6 md:p-8 flex-grow flex flex-col">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 line-clamp-2 h-10 font-light leading-relaxed">
                    {pkg.servicePackage.description}
                </p>

                <div className="space-y-6">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-2">
                        {t('available_credits', { defaultValue: 'Sesiones disponibles' })}
                    </p>
                    
                    {pkg.creditsRemaining.map((credit, idx) => {
                        const percent = (credit.quantity / credit.totalQuantity) * 100;
                        const isExhausted = credit.quantity === 0;

                        return (
                            <div key={`${pkg.id}-${credit.serviceId}-${idx}`} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isExhausted ? 'text-gray-400 line-through' : 'text-black dark:text-white'}`}>
                                        {credit.serviceName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Tag className={`w-3 h-3 ${isExhausted ? 'text-gray-400' : 'text-black dark:text-white'}`} strokeWidth={2} />
                                        <span className={`text-[10px] font-bold ${isExhausted ? 'text-gray-400' : 'text-black dark:text-white'}`}>
                                            {credit.quantity} / {credit.totalQuantity}
                                        </span>
                                    </div>
                                </div>
                                {/* Barra Blueprint */}
                                <div className={`w-full h-1.5 bg-gray-200 dark:bg-gray-800 overflow-hidden ${isExhausted ? 'opacity-50' : ''}`}>
                                    <div 
                                        className="h-full bg-black dark:bg-white transition-all duration-500" 
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer con CTA */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 mt-auto bg-gray-50 dark:bg-[#050505]">
                <Button
                    onClick={handleUseCredits}
                    className="w-full rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between px-6 border-0"
                >
                    {t('btn_use_credits', { defaultValue: 'Usar mis sesiones' })}
                    <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </Button>
            </div>
        </div>
    );
}