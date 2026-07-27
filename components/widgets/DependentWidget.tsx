import React from 'react';
import { DependentWidget as DependentWidgetType } from '@quhealthy/health-os-contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, Calendar, Activity } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Props {
  widget: DependentWidgetType;
  onAction?: (action: any) => void;
}

export const DependentWidget: React.FC<Props> = ({ widget }) => {
  const { data } = widget;

  if (!data?.dependents || data.dependents.length === 0) {
    return (
      <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
        <CardContent className="p-6 text-center text-sm font-medium text-gray-500">
          No tienes dependientes registrados en tu familia.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md min-w-0 bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden my-2">
      <CardHeader className="pb-3 bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 dark:text-white min-w-0">
          <div className="bg-quhealthy-green/10 dark:bg-emerald-900/30 p-2 rounded-xl text-quhealthy-green dark:text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate font-bold">Familia y Dependientes</span>
            <span className="text-xs text-gray-500 font-medium truncate capitalize">
              {data.dependents.length} registrado{data.dependents.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap p-4">
          <div className="flex w-max space-x-4 pr-4">
            {data.dependents.map((dep) => (
              <div 
                key={dep.id} 
                className="flex flex-col items-center bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-xl p-4 w-36 shrink-0 transition-colors hover:border-quhealthy-green/40 dark:hover:border-emerald-800/40"
              >
                <div className="w-12 h-12 bg-white dark:bg-[#050505] rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-800 mb-3 shadow-sm text-gray-400">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate w-full text-center">
                  {dep.firstName}
                </h4>
                <p className="text-xs text-gray-500 truncate w-full text-center">
                  {dep.lastName}
                </p>
                <div className="w-full mt-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-white dark:bg-[#050505] p-1.5 rounded-md border border-gray-100 dark:border-gray-800">
                    <Activity className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{dep.relationship || 'Familiar'}</span>
                  </div>
                  {dep.dateOfBirth && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 bg-white dark:bg-[#050505] p-1.5 rounded-md border border-gray-100 dark:border-gray-800">
                      <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{dep.dateOfBirth}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
