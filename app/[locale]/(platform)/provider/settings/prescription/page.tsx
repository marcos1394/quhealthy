import { PrescriptionSettings } from '@/components/provider/PrescriptionSettings';
import React from 'react';

export const metadata = {
 title: 'Configurar Receta | QuHealthy',
 description: 'Configura el logotipo, firma y pie de página de tus recetas médicas.',
};

export default function PrescriptionSettingsPage() {
 return (
 <div className="w-full">
 <PrescriptionSettings />
 </div>
 );
}
