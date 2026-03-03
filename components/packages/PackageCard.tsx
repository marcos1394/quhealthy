// src/components/packages/PackageCard.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShieldCheck, User, Tag } from 'lucide-react';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ConsumerPackage } from '@/types/packages';

interface PackageCardProps {
    pkg: ConsumerPackage;
}

export function PackageCard({ pkg }: PackageCardProps) {
    const t = useTranslations('PatientPackages');
    const router = useRouter();

    const handleUseCredits = () => {
        // Redirige al buscador filtrando por el doctor de este paquete
        router.push(`/search?provider=${encodeURIComponent(pkg.provider.name)}`);
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group h-full">
            {/* Cabecera Premium */}
            <div className="relative p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-medical-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-medium px-3 py-1">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        {t('status_active', { defaultValue: 'Activo' })}
                    </Badge>
                    <ShieldCheck className="w-6 h-6 text-medical-300 dark:text-medical-700" />
                </div>
                
                <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-1 relative z-10">
                    {pkg.servicePackage.name}
                </h3>
                
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium relative z-10">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{pkg.provider.name}</span>
                    <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
                    <span className="text-medical-600 dark:text-medical-400 truncate">{pkg.provider.specialty}</span>
                </div>
            </div>

            {/* Contenido y Barras de Progreso */}
            <CardContent className="flex-grow p-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 line-clamp-2 h-10 font-light leading-relaxed">
                    {pkg.servicePackage.description}
                </p>

                <div className="space-y-5">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {t('available_credits', { defaultValue: 'Créditos Disponibles' })}
                    </p>
                    
                    {pkg.creditsRemaining.map((credit, idx) => {
                        const percent = (credit.quantity / credit.totalQuantity) * 100;
                        const isExhausted = credit.quantity === 0;

                        return (
                            <div key={`${pkg.id}-${credit.serviceId}-${idx}`} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className={`font-medium ${isExhausted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {credit.serviceName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Tag className={`w-3.5 h-3.5 ${isExhausted ? 'text-slate-300 dark:text-slate-600' : 'text-medical-500'}`} />
                                        <span className={`font-bold ${isExhausted ? 'text-slate-400 dark:text-slate-500' : 'text-medical-600 dark:text-medical-400'}`}>
                                            {credit.quantity} / {credit.totalQuantity}
                                        </span>
                                    </div>
                                </div>
                                <Progress 
                                    value={percent} 
                                    className={`h-2 shadow-inner ${isExhausted ? 'opacity-50' : ''}`} 
                                    indicatorColor={percent > 50 ? 'bg-emerald-500' : percent > 0 ? 'bg-amber-500' : 'bg-slate-300'} 
                                />
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            {/* Footer con CTA */}
            <CardFooter className="bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 p-6 mt-auto">
                <Button
                    onClick={handleUseCredits}
                    className="w-full bg-medical-50 hover:bg-medical-100 text-medical-700 dark:bg-medical-500/10 dark:hover:bg-medical-500/20 dark:text-medical-300 font-semibold shadow-none border-0 h-11 transition-all"
                >
                    {t('btn_use_credits', { defaultValue: 'Utilizar Créditos' })}
                </Button>
            </CardFooter>
        </Card>
    );
}