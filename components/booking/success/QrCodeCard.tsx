"use client";

import React from 'react';
import Image from 'next/image';
import { QrCode } from 'lucide-react';

interface Props {
  t: any;
  qrCodeUrl: string | null;
}

export function QrCodeCard({ t, qrCodeUrl }: Props) {
  if (!qrCodeUrl) return null;

  return (
    <div className="mb-12 border border-black dark:border-white p-6 md:p-10 bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center">
          <QrCode className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
          {t('qr_code_title', { defaultValue: 'Código de Acceso' })}
        </h3>
      </div>
      
      <div className="bg-white p-4 border border-gray-200 shadow-sm">
        <Image 
          src={qrCodeUrl} 
          alt="QR Code" 
          width={200} 
          height={200}
          className="w-48 h-48 object-contain"
          unoptimized
        />
      </div>
      
      <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-6 max-w-sm leading-relaxed">
        {t('qr_code_desc', { defaultValue: 'Presenta este código en recepción para agilizar tu ingreso de manera segura.' })}
      </p>
    </div>
  );
}