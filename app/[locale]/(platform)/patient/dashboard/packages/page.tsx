"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

// Mock Data (Para visualizar el diseño)
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

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      // Intentar fetch real
      // const { data } = await axios.get('/api/consumer/packages', { withCredentials: true });
      // setPackages(data);

      // Fallback a Mock Data
      await new Promise(r => setTimeout(r, 600));
      setPackages(mockPackages);

    } catch (error) {
      console.error(error);
      toast.error("Error al cargar paquetes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  if (isLoading) {
    return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-gray-400">Cargando tus paquetes...</p>
        </div>
    );
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-8 max-w-6xl mx-auto px-4 py-8"
    >
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-500" />
            Mis Paquetes Activos
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
            Gestiona tus sesiones prepagadas y canjéalas por citas.
        </p>
      </div>
      
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <Card key={pkg.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              {/* Header de la Tarjeta */}
              <div className="bg-purple-50 dark:bg-purple-900/10 p-4 border-b border-purple-100 dark:border-purple-900/20">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200">
                        Activo
                    </Badge>
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{pkg.ServicePackage.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{pkg.provider.name}</span>
                  </div>
              </div>

              <CardContent className="flex-grow pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-2 h-10">
                    {pkg.ServicePackage.description}
                </p>
                
                <Separator className="mb-4" />
                
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Créditos Disponibles</p>
                    {pkg.creditsRemaining.map((credit, idx) => (
                        <div key={`${pkg.id}-${credit.serviceId}-${idx}`} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md text-green-600 dark:text-green-400 shrink-0">
                                    <Tag className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                    {credit.serviceName}
                                </span>
                            </div>
                            <Badge className="ml-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700">
                                x{credit.quantity}
                            </Badge>
                        </div>
                    ))}
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 dark:bg-gray-950/30 border-t border-gray-100 dark:border-gray-800 p-4">
                <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => router.push(`/search?provider=${encodeURIComponent(pkg.provider.name)}`)}
                >
                    Usar Créditos
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
          <div className="bg-white dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <PackageSearch className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No tienes paquetes</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-sm mx-auto">
            Ahorra dinero comprando sesiones por adelantado. Busca profesionales que ofrezcan paquetes.
          </p>
          <Button onClick={() => router.push('/search')} size="lg" className="bg-purple-600 hover:bg-purple-700">
            Explorar Ofertas
          </Button>
        </div>
      )}
    </motion.div>
  );
}