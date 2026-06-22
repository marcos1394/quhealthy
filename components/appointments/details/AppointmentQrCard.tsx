import React from 'react';
import Image from 'next/image';
import { QrCode } from 'lucide-react';

export function AppointmentQrCard({
  status,
  qrCodeUrl
}: {
  status: string;
  qrCodeUrl?: string | null;
}) {
  if (status !== 'SCHEDULED' || !qrCodeUrl) {
    return null;
  }

  return (
    <div className="border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a0a0a]">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-1">
          <QrCode className="w-4 h-4" strokeWidth={1.5} /> Identificación QR
        </h3>
        <p className="text-[9px] font-light uppercase tracking-widest text-gray-500">
          Escanear en Módulo de Recepción
        </p>
      </div>
      <div className="p-8 flex items-center justify-center">
        <div className="bg-white p-3 border border-gray-300">
          <Image src={qrCodeUrl} alt="Código QR Check-in" width={180} height={180} className="w-48 h-48 mix-blend-multiply" />
        </div>
      </div>
    </div>
  );
}
