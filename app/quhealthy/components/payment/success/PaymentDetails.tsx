"use client";
import { Badge } from "@/components/ui/badge";

interface PaymentDetailsProps {
  planName: string;
  planPrice: number;
  planDuration: string;
  orderNumber: string;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ planName, planPrice, planDuration, orderNumber }) => {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  };

  return (
    <div className="bg-gray-700/60 rounded-lg p-4 border border-gray-600/50">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-3">
        <h3 className="font-semibold text-lg text-white">{planName}</h3>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-medium px-3 py-1">
          {formatPrice(planPrice)} / {planDuration}
        </Badge>
      </div>
      <p
        className="text-xs text-gray-400 text-center sm:text-left"
        title={orderNumber !== "NoDisponible" ? `Número de Orden: ${orderNumber}` : 'Número de Orden no disponible'}
      >
        {orderNumber !== "NoDisponible" ? `Orden #${orderNumber.substring(0, 25)}...` : 'ID de Orden no encontrado'}
      </p>
    </div>
  );
};