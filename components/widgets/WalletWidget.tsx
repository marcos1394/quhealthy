import React from 'react';
import { BaseWidget } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Package, Activity, CreditCard } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WalletData {
  wallet?: {
    balance?: number;
    points?: number;
  };
  packages?: Array<{
    id: string;
    name: string;
    totalSessions: number;
    usedSessions: number;
    remainingSessions: number;
    expiresAt?: string;
  }>;
}

type WalletWidgetType = BaseWidget<WalletData>;

interface Props {
  widget: WalletWidgetType;
  onAction?: (action: any) => void;
}

export const WalletWidget: React.FC<Props> = ({ widget, onAction }) => {
  const { data } = widget;
  const balance = data.wallet?.balance || 0;
  const points = data.wallet?.points || 0;
  const packages = data.packages || [];

  return (
    <Card className="w-full max-w-sm bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white mb-4">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
          Mi Billetera de Salud
        </CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Saldo
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">${balance} <span className="text-xs font-normal text-gray-500">MXN</span></div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 shadow-xs">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-500" /> QuPoints
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-500">{points} <span className="text-xs font-normal text-amber-500/70">Pts</span></div>
          </div>
        </div>
      </CardHeader>
      
      <div className="flex-1 p-4">
        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          Paquetes Activos ({packages.length})
        </h4>
        
        {packages.length === 0 ? (
          <div className="text-center p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-500">
            No tienes paquetes de salud activos.
          </div>
        ) : (
          <ScrollArea className="max-h-[220px] -mx-4 px-4">
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-[#0a0a0a]">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white mb-2">{pkg.name}</div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Usadas: <span className="font-medium text-gray-700 dark:text-gray-300">{pkg.usedSessions}</span> de {pkg.totalSessions}
                      </div>
                      {pkg.expiresAt && (
                        <div className="text-[10px] text-gray-400">
                          Expira: {pkg.expiresAt}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-500 mb-0.5">Disponibles</div>
                      <div className="text-lg font-bold text-quhealthy-green dark:text-emerald-400 leading-none">
                        {pkg.remainingSessions}
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-quhealthy-green dark:bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${(pkg.usedSessions / pkg.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </Card>
  );
};
