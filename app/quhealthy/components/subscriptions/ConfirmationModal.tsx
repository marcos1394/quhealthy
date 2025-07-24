"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, CreditCard } from "lucide-react";
import { Plan } from '@/app/quhealthy/types/subscriptions';

interface ConfirmationModalProps {
  plan: Plan | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ plan, onConfirm, onCancel }) => {
  if (!plan) return null;

  return (
    <Dialog open={!!plan} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CheckCircle className="text-teal-400 w-5 h-5" /><span>Confirmar suscripción</span></DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <Badge className="bg-teal-500/20 text-teal-400">${plan.price}/{plan.duration}</Badge>
            </div>
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="text-teal-400 w-4 h-4" />
                  <span>{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={onConfirm} className="bg-teal-500 hover:bg-teal-600"><CreditCard className="w-4 h-4 mr-2" /> Proceder al pago</Button>
            <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};