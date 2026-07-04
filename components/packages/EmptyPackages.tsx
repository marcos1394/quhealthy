"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { PackageSearch } from 'lucide-react';

export function EmptyPackages() {
 const t = useTranslations('PatientPackages');

 return (
 <div className="flex flex-col items-center justify-center py-24 px-4 border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] text-center">
 <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center mb-6">
 <PackageSearch className="w-6 h-6 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
 </div>
 <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
 {t('empty_title', { defaultValue: 'Directorio Vacío' })}
 </h3>
 <p className="text-xs text-gray-500 font-light max-w-sm mx-auto leading-relaxed">
 {t('empty_desc', { defaultValue: 'Los paquetes clínicos y suscripciones de servicio aparecerán aquí para su gestión y redención de créditos.' })}
 </p>
 </div>
 );
}