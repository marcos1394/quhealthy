import React from 'react';
import { MessageSquare, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QhSpinner } from '@/components/ui/QhSpinner';

export function AppointmentActionsCard({
  status,
  paymentStatus,
  handleStartChat,
  isStartingChat
}: {
  status: string;
  paymentStatus: string;
  handleStartChat: () => void;
  isStartingChat: boolean;
}) {
  return (
    <div className="space-y-4">
      {(status === 'SCHEDULED' || status === 'COMPLETED') && paymentStatus === 'SETTLED' && (
        <Button type="button" 
          onClick={handleStartChat}
          disabled={isStartingChat}
          className="w-full rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between px-6 disabled:opacity-50"
        >
          Mensaje al Proveedor
          {isStartingChat ? <QhSpinner size="sm" /> : <MessageSquare className="w-4 h-4" strokeWidth={1.5} />}
        </Button>
      )}

      {status === 'SCHEDULED' && (
        <div className="flex flex-col gap-3 border-t border-gray-200 dark:border-gray-800 pt-6">
          <Button type="button" variant="outline" className="w-full rounded-none border border-gray-300 dark:border-gray-700 text-gray-600 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white h-12 text-[10px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-6">
            <RotateCcw className="w-3.5 h-3.5 mr-3" strokeWidth={2} /> Reprogramar Cita
          </Button>
          <Button type="button" variant="outline" className="w-full rounded-none border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/50 h-12 text-[10px] font-bold uppercase tracking-widest transition-colors flex justify-start pl-6">
            <XCircle className="w-3.5 h-3.5 mr-3" strokeWidth={2} /> Anular Registro
          </Button>
        </div>
      )}
    </div>
  );
}
