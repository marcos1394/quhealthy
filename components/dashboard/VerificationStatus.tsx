"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- DEFINICIÓN DE TIPOS ---
export interface VerificationStatusData {
  kyc: {
    isComplete: boolean;
    status: 'pending' | 'verified' | 'rejected' | 'not_started';
  };
  license?: {
    isComplete: boolean;
    status: 'pending' | 'verified' | 'rejected' | 'not_started';
  };
}

interface VerificationStatusProps {
  status: VerificationStatusData;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ status }) => {
  const isKycComplete = status.kyc.isComplete;
  const isLicenseRequired = !!status.license;
  const isLicenseComplete = status.license?.isComplete || false;

  // Si todo está completo, no mostramos nada (o podríamos mostrar un mensaje de "Todo OK" temporalmente)
  if (isKycComplete && (!isLicenseRequired || isLicenseComplete)) {
    return null;
  }

  // Lógica de Estado
  const getStatusConfig = () => {
    const isUnderReview = status.kyc.status === 'pending' || status.license?.status === 'pending';

    if (isUnderReview) {
      return {
        bgColor: 'bg-yellow-900/10', // Más sutil
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-500',
        titleColor: 'text-yellow-400',
        icon: Clock,
        title: 'Verificación en Proceso',
        description: 'Estamos revisando tu documentación. Te notificaremos cuando esté lista.',
        actionText: 'Ver Estado',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white border-0'
      };
    } else {
      return {
        bgColor: 'bg-red-900/10',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-500',
        titleColor: 'text-red-400',
        icon: AlertTriangle,
        title: 'Acción Requerida',
        description: 'Completa tu verificación para activar pagos y visibilidad pública.',
        actionText: 'Completar Ahora',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white border-0'
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 overflow-hidden"
      >
        <Card className={`${config.bgColor} border ${config.borderColor} shadow-sm`}>
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gray-900/50 border ${config.borderColor} flex-shrink-0`}>
                <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div>
                <h3 className={`font-semibold text-lg ${config.titleColor}`}>{config.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xl">{config.description}</p>
                
                {/* Detalles extra (opcional) */}
                <div className="flex gap-4 mt-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                        {status.kyc.isComplete ? <CheckCircle2 className="w-3 h-3 text-green-500"/> : <div className="w-2 h-2 rounded-full bg-red-500"/>}
                        Identidad
                    </span>
                    {isLicenseRequired && (
                        <span className="flex items-center gap-1">
                            {status.license?.isComplete ? <CheckCircle2 className="w-3 h-3 text-green-500"/> : <div className="w-2 h-2 rounded-full bg-red-500"/>}
                            Licencia
                        </span>
                    )}
                </div>
              </div>
            </div>

            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button className={`w-full sm:w-auto shadow-md transition-all ${config.buttonClass}`}>
                {config.actionText} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};