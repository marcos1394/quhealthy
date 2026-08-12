"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Wallet, Package } from "lucide-react";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface ServiceCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessCheckout: (payload: { paymentMethod: string; consumerSymptoms?: string; shareVaultAccess: boolean }) => void;
  isProcessing: boolean;
  totalAmount: number;
}

export function ServiceCheckoutModal({
  isOpen,
  onClose,
  onProcessCheckout,
  isProcessing,
  totalAmount,
}: ServiceCheckoutModalProps) {
  const t = useTranslations("Checkout");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [symptoms, setSymptoms] = useState("");
  const [shareVaultAccess, setShareVaultAccess] = useState(false);

  const handleConfirm = () => {
    onProcessCheckout({
      paymentMethod,
      consumerSymptoms: symptoms,
      shareVaultAccess,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar Cita</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Método de Pago</h4>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("CREDIT_CARD")}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                  paymentMethod === "CREDIT_CARD"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-200 hover:border-emerald-600 dark:border-gray-800"
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold text-sm">Tarjeta de Crédito/Débito</div>
                  <div className="text-xs text-gray-500">Pagar con Stripe de forma segura</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Notas para el médico (opcional)</h4>
            <Textarea
              placeholder="Ej. Tengo dolor de cabeza desde hace 3 días..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="resize-none h-24"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Privacidad y Expediente</h4>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <input
                type="checkbox"
                checked={shareVaultAccess}
                onChange={(e) => setShareVaultAccess(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-600"
              />
              <div>
                <div className="font-medium text-sm">Compartir mi expediente clínico</div>
                <div className="text-xs text-gray-500 mt-0.5">Permite al médico acceder a tu historial médico para darte una mejor atención.</div>
              </div>
            </label>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
            <span className="font-semibold">Total a pagar:</span>
            <span className="font-bold text-lg text-emerald-600">${totalAmount.toLocaleString()} MXN</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing} className="bg-emerald-600 text-white hover:bg-emerald-700">
            {isProcessing ? (
              <>
                <QhSpinner size="sm" className="mr-2" /> Procesando...
              </>
            ) : (
              "Confirmar y Pagar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
