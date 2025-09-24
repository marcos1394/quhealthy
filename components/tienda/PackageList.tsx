"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Check, ArrowRight } from 'lucide-react';
import { ServicePackage, Service } from '@/app/quhealthy/types/marketplace';

// Definimos las props que el componente espera
interface PackageListProps {
  packages: ServicePackage[];
  allServices: Service[]; // Lista completa de servicios para buscar nombres
  onPurchaseClick: (pkg: ServicePackage) => void;
}

export const PackageList: React.FC<PackageListProps> = ({ packages, allServices, onPurchaseClick }) => {
  // Si no hay paquetes, mostramos un estado vacío profesional
  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-400">Sin Paquetes Disponibles</h3>
        <p className="max-w-md mt-2 mx-auto">Este profesional aún no ha creado paquetes de servicios. Vuelve a consultarlo más tarde.</p>
      </div>
    );
  }

  // Función de ayuda para encontrar el nombre de un servicio por su ID
  const getServiceName = (serviceId: number): string => {
    const service = allServices.find(s => s.id === serviceId);
    return service ? service.name : `Servicio Desconocido`;
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {packages.map((pkg, index) => (
        <motion.div
          key={pkg.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Información del Paquete */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Package className="text-purple-400"/> {pkg.name}
                  </h3>
                  <p className="text-gray-400 mt-2 text-base">{pkg.description}</p>
                  <ul className="mt-4 space-y-2 text-gray-300">
                    {pkg.servicesIncluded.map(item => (
                      <li key={item.serviceId} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400 shrink-0"/>
                        <span><strong className="text-white">{item.quantity}</strong> x {getServiceName(item.serviceId)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Precio y Botón de Compra */}
                <div className="flex flex-col items-center justify-center text-center md:text-right border-t md:border-t-0 md:border-l border-gray-700/50 pt-6 md:pt-0 md:pl-6">
                  <p className="text-4xl font-bold text-white">${pkg.price}</p>
                  <p className="text-sm text-gray-400 mb-4">Pago único</p>
                  <Button onClick={() => onPurchaseClick(pkg)} size="lg" className="group w-full md:w-auto bg-purple-600 hover:bg-purple-700">
                    Comprar Paquete
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
};
