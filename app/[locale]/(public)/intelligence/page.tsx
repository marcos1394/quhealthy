import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Activity, Building2, BarChart3, Database } from 'lucide-react';
import dynamic from 'next/dynamic';

// Carga dinámica del mapa para evitar problemas con 'window' en SSR
const NationalHealthcareMap = dynamic(
  () => import('@/components/intelligence/NationalHealthcareMap'),
  { ssr: false, loading: () => <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Cargando mapa interactivo...</div> }
);

import { IntelligenceSummaryRow } from '@/components/intelligence/IntelligenceSummaryRow';
import { StateDistributionChart } from '@/components/intelligence/StateDistributionChart';
import { InstitutionDistributionChart } from '@/components/intelligence/InstitutionDistributionChart';
import { HealthcareExplorerTable } from '@/components/intelligence/HealthcareExplorerTable';

export const metadata: Metadata = {
  title: 'Inteligencia en Salud | QuHealthy',
  description: 'Dashboard público e interactivo de establecimientos de salud en México georreferenciados por QuHealthy.',
};

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 dark:from-slate-900 dark:to-slate-950 text-white pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold tracking-tight">QuHealthy Health Intelligence</h1>
          </div>
          <p className="text-lg text-blue-100 max-w-2xl mb-8">
            El censo más preciso y georreferenciado de establecimientos de salud en México.
            Explora la distribución de la infraestructura médica del país en tiempo real.
          </p>
          
          <IntelligenceSummaryRow />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10 space-y-8">
        
        {/* Mapa Principal */}
        <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-white dark:bg-slate-900 border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Mapa Nacional de Salud
                </CardTitle>
                <CardDescription>
                  Visualiza la distribución geográfica de hospitales, clínicas y consultorios.
                </CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <Database className="h-4 w-4" />
                <span>Datos oficiales en tiempo real</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-slate-100 dark:bg-slate-900 relative">
            <NationalHealthcareMap />
          </CardContent>
        </Card>

        {/* Paneles de Datos Analíticos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Distribución por Estado
              </CardTitle>
              <CardDescription>Entidades con mayor infraestructura médica.</CardDescription>
            </CardHeader>
            <CardContent>
              <StateDistributionChart />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-500" />
                Distribución por Institución
              </CardTitle>
              <CardDescription>Desglose de establecimientos por dependencia.</CardDescription>
            </CardHeader>
            <CardContent>
              <InstitutionDistributionChart />
            </CardContent>
          </Card>
        </div>

        {/* Tabla Explorable */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Directorio Interactivo</CardTitle>
            <CardDescription>Explora y filtra los datos a nivel granular, exportables para tu análisis.</CardDescription>
          </CardHeader>
          <CardContent>
            <HealthcareExplorerTable />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
