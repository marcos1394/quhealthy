// src/components/packages/SuggestedUpgrades.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Zap, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function SuggestedUpgrades() {
    const t = useTranslations('PatientPackages');

    return (
        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('upgrades_title', { defaultValue: 'Mejoras Sugeridas' })}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upgrade 1: Paquete Familiar */}
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                    <CardContent className="p-8 relative z-10 flex flex-col h-full justify-end">
                        <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0 shadow-sm w-fit mb-4">
                            {t('upgrade_1_badge', { defaultValue: 'Recomendado para ti' })}
                        </Badge>
                        <h3 className="text-2xl font-bold mb-2">
                            {t('upgrade_1_title', { defaultValue: 'Paquete Familiar' })}
                            <span className="text-amber-400 line-through text-lg opacity-80 ml-2">$500</span> 
                            <span className="text-emerald-400 ml-2">$350</span>
                        </h3>
                        <p className="text-slate-300 font-light mb-6">
                            {t('upgrade_1_desc', { defaultValue: 'Añade a 3 miembros de tu familia a tus consultas con descuento. Incluye historial compartido.' })}
                        </p>
                        <Button className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-bold">
                            {t('btn_details', { defaultValue: 'Ver Detalles' })} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Upgrade 2: Salud Preventiva */}
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                    
                    <CardContent className="p-8 relative z-10 flex flex-col h-full justify-end">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0 shadow-sm w-fit mb-4">
                            {t('upgrade_2_badge', { defaultValue: 'Salud Preventiva' })}
                        </Badge>
                        <h3 className="text-2xl font-bold mb-2">
                            {t('upgrade_2_title', { defaultValue: 'Chequeo Anual Plus' })}
                        </h3>
                        <p className="text-indigo-100 font-light mb-6">
                            {t('upgrade_2_desc', { defaultValue: 'Adelanta tus estudios de laboratorio del próximo año y ahorra un 40% adicional.' })}
                        </p>
                        <Button className="w-full sm:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 shadow-lg font-bold">
                            {t('btn_activate', { defaultValue: 'Activar Beneficio' })} <Zap className="w-4 h-4 ml-2 text-amber-300" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}