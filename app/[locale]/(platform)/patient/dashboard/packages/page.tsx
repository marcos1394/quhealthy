"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Package, PackageSearch, Tag, User } from 'lucide-react';

// ShadCN UI
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Tipos
interface Credit {
  serviceId: number;
  quantity: number;
  serviceName: string;
}

interface ConsumerPackage {
  id: number;
  provider: {
    name: string;
    specialty?: string;
  };
  ServicePackage: {
    name: string;
    description: string;
  };
  creditsRemaining: Credit[];
  purchaseDate: string;
}

// Mock Data
const mockPackages: ConsumerPackage[] = [
  {
    id: 1,
    provider: { name: "Clínica Dental Sonrisas", specialty: "Odontología" },
    ServicePackage: {
      name: "Pack Limpieza Anual",
      description: "Incluye limpiezas profundas y revisiones semestrales para mantener tu salud bucal."
    },
    purchaseDate: new Date().toISOString(),
    creditsRemaining: [
      { serviceId: 101, serviceName: "Limpieza Profunda", quantity: 2 },
      { serviceId: 102, serviceName: "Revisión General", quantity: 1 }
    ]
  },
  {
    id: 2,
    provider: { name: "NutriLife", specialty: "Nutrición" },
    ServicePackage: {
      name: "Reto 90 Días",
      description: "Seguimiento completo de tu plan alimenticio con ajustes mensuales."
    },
    purchaseDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    creditsRemaining: [
      { serviceId: 201, serviceName: "Consulta de Seguimiento", quantity: 5 }
    ]
  }
];

export default function ConsumerPackagesPage() {
  const [packages, setPackages] = useState<ConsumerPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('PatientPackages');

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setPackages(mockPackages);
    } catch (error) {
      console.error(error);
      toast.error(t('toast_error'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-medical-500" />
        <p className="text-slate-500 dark:text-slate-400">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-6xl mx-auto px-4 py-8"
      >

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
            <Package className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <Card key={pkg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                {/* Header de la Tarjeta */}
                <div className="bg-medical-50 dark:bg-medical-500/10 p-4 border-b border-medical-100 dark:border-medical-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-medical-100 dark:bg-medical-500/20 text-medical-700 dark:text-medical-300 hover:bg-medical-200">
                      {t('badge_active')}
                    </Badge>
                    <Package className="w-5 h-5 text-medical-400" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">{pkg.ServicePackage.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{pkg.provider.name}</span>
                  </div>
                </div>

                <CardContent className="flex-grow pt-6">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-2 h-10">
                    {pkg.ServicePackage.description}
                  </p>

                  <Separator className="mb-4 bg-slate-100 dark:bg-slate-800" />

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('label_credits')}</p>
                    {pkg.creditsRemaining.map((credit, idx) => (
                      <div key={`${pkg.id}-${credit.serviceId}-${idx}`} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Tag className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {credit.serviceName}
                          </span>
                        </div>
                        <Badge className="ml-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700">
                          x{credit.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 p-4">
                  <Button
                    className="w-full bg-medical-600 hover:bg-medical-700 text-white"
                    onClick={() => router.push(`/search?provider=${encodeURIComponent(pkg.provider.name)}`)}
                  >
                    {t('btn_use')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
              <PackageSearch className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('empty_title')}</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-sm mx-auto">
              {t('empty_desc')}
            </p>
            <Button onClick={() => router.push('/search')} size="lg" className="bg-medical-600 hover:bg-medical-700">
              {t('btn_explore')}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}