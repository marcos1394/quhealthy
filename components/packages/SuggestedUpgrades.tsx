"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SuggestedUpgrades() {
    const t = useTranslations('PatientPackages');

    return (
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800 space-y-8">
            <div className="flex items-center gap-3 mb-4">
                <Crown className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
                    {t('upgrades_title', { defaultValue: 'Auditoría de Oportunidades' })}
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upgrade 1: Paquete Familiar */}
                <div className="flex flex-col border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-8 md:p-10 hover:border-black dark:hover:border-white transition-colors group">
                    <span className="border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest w-fit mb-6 inline-block">
                        {t('upgrade_1_badge', { defaultValue: 'Sugerencia de Eficiencia' })}
                    </span>
                    
                    <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2">
                        {t('upgrade_1_title', { defaultValue: 'Plan Familiar' })}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-gray-400 line-through text-sm font-medium">$500</span> 
                        <span className="text-black dark:text-white text-lg font-bold tracking-tight">$350 MXN</span>
                    </div>

                    <p className="text-xs text-gray-500 font-light leading-relaxed mb-8 flex-grow">
                        {t('upgrade_1_desc', { defaultValue: 'Expanda la cobertura a 3 dependientes adicionales asegurando tarifas preferenciales. Incluye base de datos médica unificada.' })}
                    </p>
                    
                    <Button 
                        variant="outline"
                        className="rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 text-[10px] font-bold uppercase tracking-widest w-full sm:w-fit px-8 transition-colors flex items-center justify-between sm:justify-center border-0"
                    >
                        {t('btn_details', { defaultValue: 'Evaluar Contrato' })} <ArrowRight className="w-4 h-4 sm:ml-3" strokeWidth={1.5} />
                    </Button>
                </div>

                {/* Upgrade 2: Salud Preventiva */}
                <div className="flex flex-col border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-8 md:p-10 hover:border-black dark:hover:border-white transition-colors group">
                    <span className="border border-black dark:border-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white w-fit mb-6 inline-block bg-white dark:bg-[#0a0a0a]">
                        {t('upgrade_2_badge', { defaultValue: 'Protocolo Preventivo' })}
                    </span>
                    
                    <h3 className="text-2xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2">
                        {t('upgrade_2_title', { defaultValue: 'Evaluación Anual Plus' })}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-black dark:text-white text-lg font-bold tracking-tight">-40% DESCUENTO</span>
                    </div>

                    <p className="text-xs text-gray-500 font-light leading-relaxed mb-8 flex-grow">
                        {t('upgrade_2_desc', { defaultValue: 'Programe su panel de laboratorios anual de manera anticipada para asegurar bloqueo de tarifas y análisis prioritario.' })}
                    </p>
                    
                    <Button 
                        className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest w-full sm:w-fit px-8 transition-colors flex items-center justify-between sm:justify-center border-0"
                    >
                        {t('btn_activate', { defaultValue: 'Autorizar Ejecución' })} <Zap className="w-4 h-4 sm:ml-3" strokeWidth={1.5} />
                    </Button>
                </div>
            </div>
        </div>
    );
}