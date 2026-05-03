import React from 'react';
import { PrescriptionSettings } from '@/components/provider/PrescriptionSettings';
import { Metadata } from 'next';

// Metadatos para SEO interno o título de la pestaña del navegador
export const metadata: Metadata = {
  title: 'Configuración de Receta | QuHealthy',
  description: 'Personaliza tu receta médica digital con tu logotipo, colores y firma.',
};

export default function PrescriptionSettingsPage() {
  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* 
        El componente PrescriptionSettings ya tiene su propio 'max-w-6xl mx-auto' 
        por lo que se centrará y adaptará perfectamente al layout de settings.
      */}
      <PrescriptionSettings />
    </div>
  );
}
