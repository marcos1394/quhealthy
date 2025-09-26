/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Package, CheckCircle, PackageSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Tipos para los datos
interface Credit {
  serviceId: number;
  quantity: number;
  serviceName: string;
}
interface ConsumerPackage {
  id: number;
  creditsRemaining: Credit[];
  ServicePackage: {
    name: string;
    description: string;
  };
  provider: {
    name: string;
  };
}

export default function ConsumerPackagesPage() {
  const [packages, setPackages] = useState<ConsumerPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/api/consumer/packages', { withCredentials: true });
      setPackages(data);
    } catch (error) {
      toast.error("No se pudieron cargar tus paquetes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Mis Paquetes</h1>
      
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <Card key={pkg.id} className="bg-gray-800/50 border-gray-700 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="text-purple-400"/> {pkg.ServicePackage.name}
                </CardTitle>
                <p className="text-sm text-gray-400">Comprado a: {pkg.provider.name}</p>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                    <p className="text-sm text-gray-300 mb-4">{pkg.ServicePackage.description}</p>
                    <h4 className="font-semibold text-white mb-2">Créditos Restantes:</h4>
                    <ul className="space-y-2">
                    {pkg.creditsRemaining.map(credit => (
                        <li key={credit.serviceId} className="flex items-center gap-2 text-sm bg-gray-700/50 p-2 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400"/>
                        <span className="font-bold text-white">{credit.quantity}</span>
                        <span className="text-gray-300">{credit.serviceName}</span>
                        </li>
                    ))}
                    </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/30 rounded-2xl">
          <PackageSearch className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">No tienes paquetes comprados</h3>
          <p className="text-gray-400 mt-2">Los paquetes que compres aparecerán aquí.</p>
        </div>
      )}
    </motion.div>
  );
}