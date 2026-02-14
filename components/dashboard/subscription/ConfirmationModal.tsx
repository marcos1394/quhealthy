"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
  Info,
  X,
  Calendar,
  RefreshCw,
  AlertCircle
} from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * ConfirmationModal Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR ANSIEDAD
 *    - Seguridad visible (Shield, Lock icons)
 *    - Garantía de cancelación
 *    - Información clara de cargos
 *    - Sin sorpresas
 * 
 * 2. CREDIBILIDAD
 *    - Desglose transparente
 *    - Políticas claras
 *    - Badges de confianza
 *    - Fecha de próximo cargo
 * 
 * 3. FEEDBACK INMEDIATO
 *    - Loading states
 *    - Confirmación visual
 *    - Progress steps
 *    - Success animation
 * 
 * 4. AVERSIÓN A LA PÉRDIDA
 *    - Destacar ahorros
 *    - Resaltar beneficios
 *    - "Sin riesgos" visible
 *    - Valor por dinero
 * 
 * 5. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Resumen visual
 *    - Iconos descriptivos
 *    - Precio destacado
 *    - Features principales
 * 
 * 6. MINIMIZAR ERRORES
 *    - Confirmación requerida
 *    - Botón cancelar visible
 *    - Estados disabled
 *    - Double-check info
 */

// Tipo Plan
import { Plan } from './PricingCard';

interface ConfirmationModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  plan, 
  isOpen, 
  onConfirm, 
  onCancel, 
  isLoading = false
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!plan) return null;

  // Helper para calcular próxima fecha de cargo - CREDIBILIDAD
  const getNextBillingDate = () => {
    const date = new Date();
    if (plan.duration === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Helper para calcular ahorros - AVERSIÓN A LA PÉRDIDA
  const calculateSavings = () => {
    if (!plan.savings) return 0;
    return Math.round(plan.price * 0.2);
  };

  const savings = calculateSavings();
  const nextBillingDate = getNextBillingDate();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header - FEEDBACK VISUAL */}
        <DialogHeader className="space-y-4 pb-2">
          <div className="flex items-start justify-between">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-2xl border border-purple-500/20 shadow-lg"
            >
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </motion.div>

            {!isLoading && (
              <Button
                variant="ghost"
                size="default"
                onClick={onCancel}
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-2xl font-black text-white">
              Confirmar Suscripción
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-base">
              Revisa los detalles de tu plan antes de continuar
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Plan Summary Card - RECONOCIMIENTO */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-950/80 to-gray-900/50 p-5 rounded-2xl border border-gray-800 shadow-xl"
          >
            <div className="flex justify-between items-start mb-5">
              <div className="space-y-1">
                <h3 className="font-black text-xl text-white">{plan.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" />
                  {plan.duration === 'monthly' ? 'Facturación Mensual' : 'Facturación Anual'}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-lg py-2 px-4 font-bold"
              >
                ${plan.price}
                <span className="text-xs font-normal text-gray-400 ml-1">
                  /{plan.duration === 'monthly' ? 'mes' : 'año'}
                </span>
              </Badge>
            </div>
            
            {/* Features - VALOR POR DINERO */}
            <div className="space-y-3 bg-gray-950/50 p-4 rounded-xl border border-gray-800">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Lo que incluye:
              </p>
              <div className="space-y-2">
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature.title}</span>
                  </motion.div>
                ))}
                {plan.features.length > 4 && (
                  <p className="text-xs text-purple-400 pl-6 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    + {plan.features.length - 4} beneficios adicionales
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Billing Details - CREDIBILIDAD */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 px-2"
          >
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-semibold">${plan.price}</span>
              </div>
              
              {savings > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-between text-sm bg-emerald-500/10 -mx-2 px-2 py-2 rounded-lg"
                >
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Ahorro anual
                  </span>
                  <span className="text-emerald-400 font-bold">-${savings}</span>
                </motion.div>
              )}
              
              <Separator className="bg-gray-800" />
              
              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-white text-lg">Total a pagar hoy</span>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ${plan.price}
                </span>
              </div>
            </div>

            {/* Next billing info - TRANSPARENCIA */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-start gap-2">
              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-400 mb-1">
                  Próximo Cargo Automático
                </p>
                <p className="text-xs text-blue-300/80">
                  {nextBillingDate} • Puedes cancelar en cualquier momento
                </p>
              </div>
            </div>
          </motion.div>

          {/* Security & Guarantees - MINIMIZAR ANSIEDAD */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">Pago 100% Seguro</p>
                  <p className="text-xs text-gray-500">Encriptación SSL de grado bancario</p>
                </div>
              </div>

              <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">Sin Compromiso</p>
                  <p className="text-xs text-gray-500">Cancela cuando quieras, sin cargos extra</p>
                </div>
              </div>

              <div className="bg-gray-950/50 border border-gray-800 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">Garantía de Satisfacción</p>
                  <p className="text-xs text-gray-500">Reembolso completo en los primeros 14 días</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Important Info - TRANSPARENCIA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2"
          >
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-amber-300/80">
              <p className="font-semibold text-amber-400 mb-1">Información Importante</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Tu suscripción se renovará automáticamente</li>
                <li>Recibirás un recordatorio antes de cada cargo</li>
                <li>Puedes gestionar tu plan desde tu cuenta</li>
              </ul>
            </div>
          </motion.div>
        </div>

        <Separator className="bg-gray-800" />

        {/* Footer - JERARQUÍA CLARA */}
        <DialogFooter className="flex-col gap-3 mt-2">
          
          {/* Primary CTA */}
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            className={cn(
              "w-full h-14 text-lg font-bold shadow-2xl transition-all duration-300",
              "bg-gradient-to-r from-purple-600 to-pink-600",
              "hover:from-purple-500 hover:to-pink-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              !isLoading ? "hover:scale-[1.02]" : ""
            )}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando pago seguro...
                </motion.div>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Confirmar y Pagar ${plan.price}
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Secondary CTA */}
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={isLoading}
            className="w-full text-gray-400 hover:text-white hover:bg-gray-800 h-11"
          >
            Cancelar
          </Button>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600 pt-2">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>SSL Seguro</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>PCI Compliant</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>Sin compromiso</span>
            </div>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};