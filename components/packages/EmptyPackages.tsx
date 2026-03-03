// src/components/packages/EmptyPackages.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import { PackageSearch } from 'lucide-react';

export function EmptyPackages() {
    const t = useTranslations('PatientPackages');

    return (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                <PackageSearch className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('empty_title', { defaultValue: 'Aún no tienes suscripciones' })}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto font-light leading-relaxed">
                {t('empty_desc', { defaultValue: 'Puedes comprar paquetes de servicios para obtener mejores precios en tus consultas y tratamientos recurrentes.' })}
            </p>
        </div>
    );
}