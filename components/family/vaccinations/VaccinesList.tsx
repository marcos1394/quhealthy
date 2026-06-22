import React from 'react';
import { Clock, ChevronDown, Check, FileCheck2, Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VaccinationStatusDto } from '@/types/vaccination';

interface VaccinesListProps {
  groupedVaccines: { ageGroup: string, vaccines: VaccinationStatusDto[] }[];
  simulatingAction: number | null;
  onToggleVaccine: (vaccine: VaccinationStatusDto) => void;
}

export function VaccinesList({ groupedVaccines, simulatingAction, onToggleVaccine }: VaccinesListProps) {
  return (
    <Accordion type="multiple" className="space-y-8">
      {groupedVaccines.map((stage) => (
        <AccordionItem
          value={stage.ageGroup}
          key={stage.ageGroup}
          className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-none data-[state=open]:border-black dark:data-[state=open]:border-white transition-colors"
        >
          {/* Cabecera del Grupo */}
          <AccordionTrigger className="bg-gray-50 dark:bg-[#050505] px-6 py-4 hover:no-underline hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors border-b border-transparent data-[state=open]:border-gray-200 dark:data-[state=open]:border-gray-800 [&[data-state=open]>svg]:rotate-180">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                Fase: {stage.ageGroup}
              </h2>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-black dark:text-white" />
          </AccordionTrigger>

          {/* Filas de Vacunas */}
          <AccordionContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {stage.vaccines.map(vaccine => {
                const isApplied = vaccine.isApplied;
                const isSimulating = simulatingAction === vaccine.vaccineCatalogId;

                return (
                  <div key={vaccine.vaccineCatalogId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors group">
                    <div className="flex items-start gap-4">
                      {/* Checkbox Arquitectónico */}
                      <button type="button"
                        onClick={() => onToggleVaccine(vaccine)}
                        disabled={isSimulating}
                        className={cn(
                          "mt-0.5 w-6 h-6 border flex items-center justify-center shrink-0 transition-colors focus:outline-none",
                          isApplied 
                            ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black" 
                            : "border-gray-300 dark:border-gray-700 bg-transparent hover:border-black dark:hover:border-white"
                        )}
                      >
                        {isSimulating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                        ) : isApplied ? (
                          <Check className="w-4 h-4" strokeWidth={3} />
                        ) : null}
                      </button>
                      
                      <div>
                        <h4 className={cn(
                          "text-sm font-bold uppercase tracking-widest transition-colors mb-1",
                          isApplied ? "text-gray-500" : "text-black dark:text-white"
                        )}>
                          {vaccine.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-light uppercase tracking-widest">
                          {vaccine.diseasePrevented} (Dosis {vaccine.doseNumber})
                        </p>

                        {isApplied && vaccine.appliedDate && (
                          <div className="flex items-center gap-2 mt-3 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white border border-gray-300 dark:border-gray-700 px-2 py-1 w-fit bg-gray-50 dark:bg-[#050505]">
                            <FileCheck2 className="w-3 h-3" strokeWidth={1.5} />
                            Aplicada: {vaccine.appliedDate}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isApplied && (
                      <Button type="button"
                        variant="outline"
                        disabled={isSimulating}
                        onClick={() => onToggleVaccine(vaccine)}
                        className="rounded-none border border-black dark:border-white h-8 px-4 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        Registrar Dosis
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
