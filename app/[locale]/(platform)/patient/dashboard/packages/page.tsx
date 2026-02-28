"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Package, PackageSearch, Tag, User, Sparkles, Zap, ArrowRight, ShieldCheck, Activity, Crown } from 'lucide-react';

// ShadCN UI
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Tipos
interface Credit {
  serviceId: number;
  quantity: number;
  totalQuantity: number;
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
      name: "Pack Limpieza Anual VIP",
      description: "Incluye limpiezas profundas y revisiones semestrales para mantener tu salud bucal integrando lo mejor en tecnología y confort."
    },
    purchaseDate: new Date().toISOString(),
    creditsRemaining: [
      { serviceId: 101, serviceName: "Limpieza Profunda", quantity: 1, totalQuantity: 2 },
      { serviceId: 102, serviceName: "Revisión General", quantity: 0, totalQuantity: 1 }
    ]
  },
  {
    id: 2,
    provider: { name: "NutriLife", specialty: "Nutrición" },
    ServicePackage: {
      name: "Reto 90 Días Premium",
      description: "Seguimiento completo de tu plan alimenticio con ajustes mensuales y asesoría para alcanzar tus metas de una forma más rápida y segura."
    },
    purchaseDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    creditsRemaining: [
      { serviceId: 201, serviceName: "Consulta de Seguimiento", quantity: 3, totalQuantity: 5 }
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
        className="space-y-10 max-w-6xl mx-auto px-4 py-8 md:py-12"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-gradient-to-br from-medical-500 to-emerald-400 rounded-2xl shadow-lg shadow-medical-500/20 text-white">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Mis Suscripciones
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-lg font-light">
                Gestiona tus paquetes y beneficios activos.
              </p>
            </div>
          </div>
          <Button onClick={() => router.push('/search')} className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-xl transition-all h-12 px-6 rounded-xl font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Explorar Nuevos
          </Button>
        </div>

        {/* Active Packages Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-medical-600 dark:text-medical-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Paquetes Activos</h2>
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {packages.map((pkg, i) => (
                <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group h-full">

                    {/* Header de la Tarjeta Premium */}
                    <div className="relative p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-medical-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-medium px-3 py-1">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                          Activo
                        </Badge>
                        <ShieldCheck className="w-6 h-6 text-medical-300 dark:text-medical-700" />
                      </div>
                      <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-1 relative z-10">{pkg.ServicePackage.name}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium relative z-10">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{pkg.provider.name}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-medical-600 dark:text-medical-400">{pkg.provider.specialty}</span>
                      </div>
                    </div>

                    <CardContent className="flex-grow p-6">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 line-clamp-2 h-10 font-light leading-relaxed">
                        {pkg.ServicePackage.description}
                      </p>

                      <div className="space-y-5">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Créditos Disponibles</p>
                        {pkg.creditsRemaining.map((credit, idx) => {
                          const percent = (credit.quantity / credit.totalQuantity) * 100;
                          const isExhausted = credit.quantity === 0;

                          return (
                            <div key={`${pkg.id}-${credit.serviceId}-${idx}`} className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className={`font-medium ${isExhausted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {credit.serviceName}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Tag className={`w-3.5 h-3.5 ${isExhausted ? 'text-slate-300' : 'text-medical-500'}`} />
                                  <span className={`font-bold ${isExhausted ? 'text-slate-400' : 'text-medical-600 dark:text-medical-400'}`}>
                                    {credit.quantity} / {credit.totalQuantity}
                                  </span>
                                </div>
                              </div>
                              <Progress value={percent} className={`h-2 shadow-inner ${isExhausted ? 'opacity-50' : ''}`} indicatorColor={percent > 50 ? 'bg-emerald-500' : percent > 0 ? 'bg-amber-500' : 'bg-slate-300'} />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>

                    <CardFooter className="bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 p-6 mt-auto">
                      <Button
                        className="w-full bg-medical-50 hover:bg-medical-100 text-medical-700 dark:bg-medical-500/10 dark:hover:bg-medical-500/20 dark:text-medical-300 font-semibold shadow-none border-0 h-11 transition-all"
                        onClick={() => router.push(`/search?provider=${encodeURIComponent(pkg.provider.name)}`)}
                      >
                        Utilizar Créditos
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                <PackageSearch className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aún no tienes suscripciones</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-sm mx-auto font-light">
                Puedes comprar paquetes de servicios para obtener mejores precios en tus consultas y tratamientos recurrentes.
              </p>
            </div>
          )}
        </div>

        {/* Upgrade Cards Section (Premium Aesthetic) */}
        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mejoras Sugeridas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

              <CardContent className="p-8 relative z-10 flex flex-col h-full justify-end">
                <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0 shadow-sm w-fit mb-4">Recomendado para ti</Badge>
                <h3 className="text-2xl font-bold mb-2">Paquete Familiar <span className="text-amber-400 line-through text-lg opacity-80 ml-2">$500</span> <span className="text-emerald-400">$350</span></h3>
                <p className="text-slate-300 font-light mb-6">Añade a 3 miembros de tu familia a tus consultas con descuento. Incluye historial compartido.</p>
                <Button className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-bold">
                  Ver Detalles <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
              <CardContent className="p-8 relative z-10 flex flex-col h-full justify-end">
                <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0 shadow-sm w-fit mb-4">Salud Preventiva</Badge>
                <h3 className="text-2xl font-bold mb-2">Chequeo Anual Plus</h3>
                <p className="text-indigo-100 font-light mb-6">Adelanta tus estudios de laboratorio del próximo año y ahorra un 40% adicional.</p>
                <Button className="w-full sm:w-auto bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 shadow-lg font-bold">
                  Activar Beneficio <Zap className="w-4 h-4 ml-2 text-amber-300" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </motion.div>
    </div>
  );
}