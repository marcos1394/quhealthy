"use client";

import React from 'react';
import { Check, Mail } from 'lucide-react';

interface Props {
 t: any;
 email?: string;
}

export function SuccessHeader({ t, email }: Props) {
 return (
 <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] mb-12">
 <div className="p-8 md:p-12 text-center flex flex-col items-center">
 
 {/* Sello de Aprobación */}
 <div className="w-20 h-20 border-2 border-black dark:border-white flex items-center justify-center bg-black text-white dark:bg-white dark:text-black mb-8">
 <Check className="w-10 h-10" strokeWidth={3} />
 </div>
 
 <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black dark:text-white mb-3">
 {t('title', { defaultValue: 'Confirmación de Operación' })}
 </h1>
 
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-md mx-auto mb-8">
 {t('subtitle', { defaultValue: 'SU RESERVA Y LIQUIDACIÓN HAN SIDO PROCESADAS EXITOSAMENTE EN LA RED.' })}
 </p>
 
 {email && (
 <div className="inline-flex items-center gap-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] px-6 py-3">
 <Mail className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
 <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
 COMPROBANTE EMITIDO A: {email}
 </span>
 </div>
 )}
 </div>
 </div>
 );
}