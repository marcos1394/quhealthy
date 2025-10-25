"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VerificationStatus as VerificationStatusData } from '@/app/quhealthy/types/dashboard';

// Interfaz de Props actualizada para usar el tipo de dato real
interface VerificationStatusProps {
  status: VerificationStatusData;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ status }) => {
  const isKycComplete = status.kyc.isComplete;
  const isLicenseRequired = !!status.license;
  const isLicenseComplete = status.license?.isComplete || false;

  // Si todas las verificaciones requeridas están completas, no mostramos nada.
  if (isKycComplete && (!isLicenseRequired || isLicenseComplete)) {
    return null;
  }

  // Lógica para determinar el estado general y la configuración visual
  const getStatusConfig = () => {
    const isUnderReview = status.kyc.status === 'pending' || status.license?.status === 'pending';

    if (isUnderReview) {
      return {
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-300',
        icon: Clock,
        title: 'Verificación en Proceso',
        description: 'Estamos revisando tu documentación. Te notificaremos cuando esté lista.',
        actionText: 'Ver Estado',
      };
    } else {
      // Cualquier otro estado incompleto (not_started, rejected, etc.) requiere acción.
      return {
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400',
        titleColor: 'text-red-300',
        icon: AlertTriangle,
        title: 'Acción Requerida',
        description: 'Completa tu verificación para activar todas las funciones, incluyendo los pagos.',
        actionText: 'Completar Verificación',
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="mb-6" // margen inferior para separarlo del contenido
      >
        <Card className={`${config.bgColor} border ${config.borderColor}`}>
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-xl border ${config.borderColor} flex items-center justify-center flex-shrink-0`}>
                <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${config.titleColor}`}>{config.title}</h3>
                <p className="text-sm text-gray-300/80">{config.description}</p>
              </div>
            </div>
            <Link href="/quhealthy/provider/onboarding/checklist" className="flex-shrink-0 w-full sm:w-auto">
              <Button className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold">
                {config.actionText} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};