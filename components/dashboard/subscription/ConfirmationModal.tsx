"use client";

import React from 'react';
import { CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Importar el tipo Plan localmente o desde types
import { Plan } from './PricingCard';

interface ConfirmationModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    plan, isOpen, onConfirm, onCancel, isLoading 
}) => {
  
  if (!plan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 sm:max-w-md shadow-2xl">
        
        <DialogHeader className="space-y-4 pb-2">
            <div className="mx-auto bg-purple-500/10 p-3 rounded-full border border-purple-500/20">
                <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-center">
                <DialogTitle className="text-xl font-bold">Resumen de Suscripción</DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                    Estás a un paso de activar tu plan.
                </DialogDescription>
            </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
            {/* Tarjeta de Resumen */}
            <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{plan.duration === 'monthly' ? 'Facturación Mensual' : 'Facturación Anual'}</p>
                    </div>
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-sm py-1 px-2">
                        ${plan.price}
                    </Badge>
                </div>
                
                <div className="space-y-2">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                            <span>{feature.title}</span>
                        </div>
                    ))}
                    {plan.features.length > 3 && (
                        <p className="text-xs text-gray-500 pl-6 italic">+ {plan.features.length - 3} beneficios más</p>
                    )}
                </div>
            </div>

            {/* Totales */}
            <div className="px-2 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>${plan.price}</span>
                </div>
                {plan.savings && (
                    <div className="flex justify-between text-sm text-emerald-400">
                        <span>Descuento anual</span>
                        <span>-${Math.round(plan.price * 0.2)} (aprox)</span>
                    </div>
                )}
                <Separator className="bg-gray-800 my-2" />
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Total a pagar hoy</span>
                    <span className="text-xl font-bold text-purple-400">${plan.price}</span>
                </div>
            </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
            <Button 
                onClick={onConfirm} 
                className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg shadow-lg font-semibold"
                disabled={isLoading}
            >
                {isLoading ? 'Procesando pago...' : (
                    <>
                        <CreditCard className="w-5 h-5 mr-2" /> Pagar y Suscribirse
                    </>
                )}
            </Button>
            <Button 
                variant="ghost" 
                onClick={onCancel}
                className="w-full text-gray-500 hover:text-white hover:bg-gray-800"
                disabled={isLoading}
            >
                Cancelar y volver
            </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};