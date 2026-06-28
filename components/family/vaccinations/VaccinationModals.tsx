import React, { useMemo } from 'react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, FileCheck2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VaccinationModalsProps {
  isManualMarkModalOpen: boolean;
  setIsManualMarkModalOpen: (open: boolean) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  simulatingAction: number | null;
  confirmManualMark: () => void;
}

export function VaccinationModals({
  isManualMarkModalOpen,
  setIsManualMarkModalOpen,
  selectedDate,
  setSelectedDate,
  simulatingAction,
  confirmManualMark
}: VaccinationModalsProps) {

  const todayDate = useMemo(() => new Date(), []);
  const minDate = useMemo(() => new Date("1900-01-01"), []);

  return (
    <Dialog open={isManualMarkModalOpen} onOpenChange={setIsManualMarkModalOpen}>
      <DialogContent className="sm:max-w-md rounded-none bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 gap-0 shadow-2xl">
        <DialogHeader className="p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
          <DialogTitle className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
            Auditoría de Dosis
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">
            Seleccione la fecha cronológica de la aplicación. Por defecto se asigna la fecha actual.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-4">
          <div className="space-y-3 flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Fecha de Registro
            </label>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              disabled={(date) => date > todayDate || date < minDate}
              placeholder="Seleccionar fecha"
              className="w-full h-12 text-xs font-mono rounded-none border-gray-300 dark:border-gray-700 bg-white dark:bg-black"
              popoverClassName="z-[60] bg-white dark:bg-[#0a0a0a] border-black dark:border-white rounded-none"
            />
          </div>
        </div>

        <DialogFooter className="p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsManualMarkModalOpen(false)}
            className="rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white h-12 px-6 text-[10px] font-bold uppercase tracking-widest w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={confirmManualMark}
            disabled={!selectedDate || simulatingAction !== null}
            className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-6 text-[10px] font-bold uppercase tracking-widest w-full sm:w-auto border-0 disabled:opacity-50"
          >
            {simulatingAction !== null ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCheck2 className="w-4 h-4 mr-2" strokeWidth={1.5} />}
            Sincronizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
