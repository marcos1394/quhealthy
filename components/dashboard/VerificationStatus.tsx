"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2,
  XCircle,
  Info,
  Shield,
  FileCheck,
  Camera,
  CreditCard,
  Zap,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * VerificationStatus Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR ANSIEDAD
 *    - Progress bar visible
 *    - Tiempo estimado claro
 *    - "¿Qué sigue?" explicado
 *    - Sin sorpresas
 * 
 * 2. PRIMING
 *    - Verde = completo ✓
 *    - Amarillo = en proceso ⏱️
 *    - Rojo = acción requerida ⚠️
 *    - Azul = información ℹ️
 * 
 * 3. FEEDBACK VISUAL
 *    - Progress tracking
 *    - Estados por color
 *    - Iconos descriptivos
 *    - Animaciones suaves
 * 
 * 4. URGENCIA GRADUAL
 *    - "Acción Requerida" urgente
 *    - "En Revisión" neutro
 *    - "Casi Listo" positivo
 *    - Sin alarmismo excesivo
 * 
 * 5. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Checklist visual
 *    - Iconos por paso
 *    - Estados claros
 *    - Next steps visibles
 * 
 * 6. CREDIBILIDAD
 *    - Tiempo estimado
 *    - Pasos específicos
 *    - Beneficios claros
 *    - Sin vaguedades
 */

// --- TIPOS ---
export interface VerificationStatusData {
  kyc: {
    isComplete: boolean;
    status: 'pending' | 'verified' | 'rejected' | 'not_started';
    submittedAt?: string;
    rejectionReason?: string;
  };
  license?: {
    isComplete: boolean;
    status: 'pending' | 'verified' | 'rejected' | 'not_started';
    submittedAt?: string;
    rejectionReason?: string;
  };
  payment?: {
    isComplete: boolean;
    status: 'pending' | 'verified' | 'not_started';
  };
}

interface VerificationStatusProps {
  status: VerificationStatusData;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  status,
  onDismiss,
  showDismiss = false
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // Calcular progreso - FEEDBACK VISUAL
  useEffect(() => {
    let completed = 0;
    let total = 2; // KYC + Payment
    
    if (status.kyc.isComplete) completed++;
    if (status.payment?.isComplete) completed++;
    
    if (status.license) {
      total++;
      if (status.license.isComplete) completed++;
    }
    
    setProgress((completed / total) * 100);
  }, [status]);

  // Calcular tiempo estimado - CREDIBILIDAD
  useEffect(() => {
    const isPending = status.kyc.status === 'pending' || status.license?.status === 'pending';
    
    if (isPending && status.kyc.submittedAt) {
      const submitted = new Date(status.kyc.submittedAt);
      const now = new Date();
      const hoursPassed = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));
      const hoursLeft = Math.max(0, 24 - hoursPassed);
      
      if (hoursLeft > 0) {
        setTimeLeft(`~${hoursLeft}h restantes`);
      } else {
        setTimeLeft('Pronto');
      }
    }
  }, [status]);

  const isKycComplete = status.kyc.isComplete;
  const isLicenseRequired = !!status.license;
  const isLicenseComplete = status.license?.isComplete || false;
  const isPaymentComplete = status.payment?.isComplete || false;

  // Si todo está completo, no mostramos - MINIMIZAR RUIDO
  const allComplete = isKycComplete && 
                      (!isLicenseRequired || isLicenseComplete) && 
                      isPaymentComplete;
  
  if (allComplete) return null;

  // Helper para config de estado - PRIMING
  const getStatusConfig = () => {
    const hasRejection = status.kyc.status === 'rejected' || status.license?.status === 'rejected';
    const isUnderReview = status.kyc.status === 'pending' || status.license?.status === 'pending';
    const isNotStarted = status.kyc.status === 'not_started';

    if (hasRejection) {
      return {
        type: 'rejected',
        bgColor: 'bg-red-500/5',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400',
        titleColor: 'text-red-400',
        icon: XCircle,
        title: 'Verificación Rechazada',
        description: 'Necesitamos que reenvíes tu documentación con las correcciones indicadas.',
        actionText: 'Ver Detalles',
        buttonClass: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white',
        urgency: 'high'
      };
    } else if (isUnderReview) {
      return {
        type: 'pending',
        bgColor: 'bg-amber-500/5',
        borderColor: 'border-amber-500/20',
        iconColor: 'text-amber-400',
        titleColor: 'text-amber-300',
        icon: Clock,
        title: 'Verificación en Proceso',
        description: 'Estamos revisando tu información. Recibirás una notificación cuando esté lista.',
        actionText: 'Ver Estado',
        buttonClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white',
        urgency: 'low'
      };
    } else if (!isNotStarted && progress > 50) {
      return {
        type: 'almost',
        bgColor: 'bg-blue-500/5',
        borderColor: 'border-blue-500/20',
        iconColor: 'text-blue-400',
        titleColor: 'text-blue-300',
        icon: Zap,
        title: '¡Casi Listo!',
        description: 'Solo te faltan unos pasos para activar tu perfil completamente.',
        actionText: 'Continuar',
        buttonClass: 'bg-gradient-to-r from-blue-600 to-medical-600 hover:from-blue-500 hover:to-purple-500 text-white',
        urgency: 'medium'
      };
    } else {
      return {
        type: 'required',
        bgColor: 'bg-purple-500/5',
        borderColor: 'border-purple-500/20',
        iconColor: 'text-purple-400',
        titleColor: 'text-purple-300',
        icon: AlertTriangle,
        title: 'Completa tu Verificación',
        description: 'Activa pagos y visibilidad pública completando tu verificación de identidad.',
        actionText: 'Empezar Ahora',
        buttonClass: 'bg-gradient-to-r from-medical-600 to-medical-700 hover:from-medical-500 hover:to-medical-600 text-white',
        urgency: 'high'
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  // Checklist de pasos - RECONOCIMIENTO
  const steps = [
    {
      id: 'kyc',
      label: 'Identidad Verificada',
      icon: Camera,
      isComplete: status.kyc.isComplete,
      isPending: status.kyc.status === 'pending',
      isRejected: status.kyc.status === 'rejected',
      rejectionReason: status.kyc.rejectionReason
    },
    ...(isLicenseRequired ? [{
      id: 'license',
      label: 'Licencia Profesional',
      icon: FileCheck,
      isComplete: status.license?.isComplete || false,
      isPending: status.license?.status === 'pending',
      isRejected: status.license?.status === 'rejected',
      rejectionReason: status.license?.rejectionReason
    }] : []),
    {
      id: 'payment',
      label: 'Método de Pago',
      icon: CreditCard,
      isComplete: status.payment?.isComplete || false,
      isPending: status.payment?.status === 'pending',
      isRejected: false
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 overflow-hidden"
      >
        <Card className={cn(
          "border shadow-xl transition-all duration-300",
          config.bgColor,
          config.borderColor
        )}>
          <CardContent className="p-6">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={cn(
                    "p-3 rounded-2xl border shadow-lg",
                    "bg-slate-900/50",
                    config.borderColor
                  )}
                >
                  <StatusIcon className={cn("w-6 h-6", config.iconColor)} />
                </motion.div>

                {/* Title & Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={cn("font-black text-xl", config.titleColor)}>
                      {config.title}
                    </h3>
                    {config.urgency === 'high' && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Urgente
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {config.description}
                  </p>
                </div>
              </div>

              {/* Dismiss Button */}
              {showDismiss && onDismiss && (
                <Button
                  variant="ghost"
                  size="default"
                  onClick={onDismiss}
                  className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Progress Bar - FEEDBACK VISUAL */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Progreso de Verificación
                </p>
                <span className="text-xs font-bold text-purple-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-slate-800"
              />
            </div>

            {/* Steps Checklist - RECONOCIMIENTO */}
            <div className="space-y-3 mb-5">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border transition-all",
                      step.isComplete ? "bg-emerald-500/5 border-emerald-500/20" : "",
                      step.isPending ? "bg-amber-500/5 border-amber-500/20" : "",
                      step.isRejected ? "bg-red-500/5 border-red-500/20" : "",
                      !step.isComplete && !step.isPending && !step.isRejected ? "bg-slate-900/30 border-slate-800" : ""
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "p-2 rounded-lg",
                      step.isComplete ? "bg-emerald-500/10" : "",
                      step.isPending ? "bg-amber-500/10" : "",
                      step.isRejected ? "bg-red-500/10" : "",
                      !step.isComplete && !step.isPending && !step.isRejected ? "bg-slate-800" : ""
                    )}>
                      <StepIcon className={cn(
                        "w-4 h-4",
                        step.isComplete ? "text-emerald-400" : "",
                        step.isPending ? "text-amber-400" : "",
                        step.isRejected ? "text-red-400" : "",
                        !step.isComplete && !step.isPending && !step.isRejected ? "text-slate-500" : ""
                      )} />
                    </div>

                    {/* Label & Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                          "text-sm font-semibold",
                          step.isComplete ? "text-white" : "text-slate-400"
                        )}>
                          {step.label}
                        </p>
                        {step.isComplete && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        {step.isPending && (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                            En revisión
                          </Badge>
                        )}
                      </div>
                      
                      {/* Rejection Reason */}
                      {step.isRejected && step.rejectionReason && (
                        <p className="text-xs text-red-400 mt-1">
                          ⚠️ {step.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Time Left (if pending) */}
                    {step.isPending && timeLeft && (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs whitespace-nowrap">
                        <Clock className="w-3 h-3 mr-1" />
                        {timeLeft}
                      </Badge>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Benefits Info - CREDIBILIDAD */}
            {config.type === 'required' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5"
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-400 mb-2">
                      Beneficios de verificarte:
                    </p>
                    <ul className="space-y-1.5 text-xs text-blue-300/80">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>Recibe pagos directamente en tu cuenta</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>Aparece en búsquedas públicas y rankings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>Badge de verificación en tu perfil</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>Mayor confianza de los pacientes (+60% conversión)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Review Time Info - MINIMIZAR ANSIEDAD */}
            {config.type === 'pending' && (
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-300 mb-1">
                      Tiempo estimado de revisión: 24-48 horas
                    </p>
                    <p>
                      Nuestro equipo revisa cada solicitud manualmente para garantizar 
                      la seguridad de la plataforma. Te notificaremos por email cuando 
                      esté lista.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Link href="/onboarding" className="block">
              <Button 
                className={cn(
                  "w-full h-12 text-base font-bold shadow-2xl transition-all duration-300 hover:scale-[1.02]",
                  config.buttonClass
                )}
              >
                <span className="flex items-center gap-2">
                  {config.actionText}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </Link>

          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};