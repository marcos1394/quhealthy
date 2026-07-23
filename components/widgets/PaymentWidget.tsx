import React, { useState } from 'react';
import { PaymentWidget as PaymentWidgetType } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface Props {
  widget: PaymentWidgetType;
  onAction?: (action: any) => void;
}

export const PaymentWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data, actions } = widget;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simular retraso de pasarela de pago
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Disparar acción real
      if (actions && actions.length > 0 && onAction) {
        onAction(actions[0]);
      }
    }, 2000);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-sm bg-green-50/50 border-green-200">
        <CardContent className="pt-6 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h3 className="font-semibold text-green-900 text-lg">¡Pago Exitoso!</h3>
          <p className="text-sm text-green-700">Tu cita ha sido confirmada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Checkout Seguro
        </CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg flex justify-between items-center">
          <span className="font-medium">Total:</span>
          <span className="text-2xl font-bold">{data.currency} ${data.amount}</span>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">Métodos disponibles</p>
          <div className="flex gap-2">
            {data.paymentMethods.map(method => (
              <div key={method} className="px-3 py-1 border rounded bg-background text-xs font-medium shadow-sm">
                {method}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handlePayment} 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            `Pagar $${data.amount}`
          )}
        </Button>
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground w-full">
          <ShieldCheck className="w-3 h-3" />
          Pagos encriptados de extremo a extremo
        </div>
      </CardFooter>
    </Card>
  );
};
