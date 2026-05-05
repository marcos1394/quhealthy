"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, Package, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { usePackages } from '@/hooks/usePackages';
import { PackageCard } from '@/components/packages/PackageCard';
import { EmptyPackages } from '@/components/packages/EmptyPackages';
import { SuggestedUpgrades } from '@/components/packages/SuggestedUpgrades';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function ConsumerPackagesPage() {
    const t = useTranslations('PatientPackages');
    const router = useRouter();
    
    // 🚀 Aquí inyectamos el Hook real (conecta con tu backend)
    const { packages, isLoading } = usePackages();

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4 bg-slate-50 dark:bg-slate-950">
                <QhSpinner size="lg" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {t('loading', { defaultValue: 'Cargando tu billetera de salud...' })}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10 max-w-6xl mx-auto px-4 py-8 md:py-12"
            >
                {/* Header (Título y Botón Explorar) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-gradient-to-br from-medical-500 to-emerald-400 rounded-2xl shadow-lg shadow-medical-500/20 text-white">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {t('title', { defaultValue: 'Mis Suscripciones' })}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-lg font-light">
                                {t('subtitle', { defaultValue: 'Gestiona tus paquetes y beneficios activos.' })}
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => router.push('/patient/discover')} 
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-xl transition-all h-12 px-6 rounded-xl font-semibold"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {t('btn_explore', { defaultValue: 'Explorar Nuevos' })}
                    </Button>
                </div>

                {/* Grid de Paquetes Activos o Estado Vacío */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-medical-600 dark:text-medical-400" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {t('active_title', { defaultValue: 'Paquetes Activos' })}
                        </h2>
                    </div>

                    {packages.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {packages.map((pkg, i) => (
                                <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                    <PackageCard pkg={pkg} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyPackages />
                    )}
                </div>

                {/* Up-selling Section */}
                <SuggestedUpgrades />

            </motion.div>
        </div>
    );
}