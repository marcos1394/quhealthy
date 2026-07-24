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
      <Card className="w-full max-w-sm bg-quhealthy-green/10 dark:bg-emerald-900/20 border-quhealthy-green/20 dark:border-emerald-800/40 shadow-sm">
        <CardContent className="pt-8 pb-8 text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-quhealthy-green/20 dark:bg-emerald-800/40 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-quhealthy-green dark:text-emerald-400" />
          </div>
          <h3 className="font-bold text-quhealthy-green dark:text-emerald-400 text-xl">¡Pago Exitoso!</h3>
          <p className="text-sm font-medium text-gray-700 dark:text-emerald-200/80">Tu cita ha sido confirmada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl">
      <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          Checkout Seguro
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">{data.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex justify-between items-center">
          <span className="font-semibold text-gray-600 dark:text-gray-400">Total:</span>
          <span className="text-2xl font-bold text-quhealthy-green dark:text-emerald-400">{data.currency} ${data.amount}</span>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Métodos disponibles</p>
          <div className="flex gap-2 flex-wrap">
            {data.paymentMethods.map(method => (
              <div key={method} className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-[#0a0a0a] text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
                {method}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-2 pb-5 px-6">
        <Button 
          className="w-full rounded-xl h-12 bg-quhealthy-green hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 font-bold shadow-md shadow-emerald-900/20 transition-all" 
          onClick={handlePayment} 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Procesando pago...
            </>
          ) : (
            `Pagar $${data.amount}`
          )}
        </Button>
        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 w-full bg-gray-50 dark:bg-white/5 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-quhealthy-green dark:text-emerald-400" />
          Pagos encriptados de extremo a extremo
        </div>
      </CardFooter>
    </Card>
  );
};
