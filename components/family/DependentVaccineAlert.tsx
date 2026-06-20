"use client";

import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { vaccinationService } from '@/services/vaccination.service';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface DependentVaccineAlertProps {
    memberId: number;
}

export function DependentVaccineAlert({ memberId }: DependentVaccineAlertProps) {
    const [delayedCount, setDelayedCount] = useState(0);

    useEffect(() => {
        if (!memberId) return;
        vaccinationService.getVaccinations(memberId)
            .then(data => {
                const delayed = data.filter(v => v.isDelayed).length;
                setDelayedCount(delayed);
            })
            .catch(err => console.error("Error fetching vaccines for alert", err));
    }, [memberId]);

    if (delayedCount === 0) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link 
                        href={`/patient/dashboard/family/${memberId}/vaccinations`}
                        className="absolute left-4 top-4 z-20 flex h-8 items-center justify-center border border-red-500 bg-white dark:bg-[#0a0a0a] px-3 text-red-500 hover:bg-red-500 hover:text-white transition-colors rounded-none group"
                    >
                        <AlertCircle className="h-3.5 w-3.5 mr-2" strokeWidth={2} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            {delayedCount} Atraso{delayedCount > 1 ? 's' : ''}
                        </span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent 
                    className="z-50 max-w-xs rounded-none border border-red-500 bg-red-500 text-white p-4"
                    sideOffset={5}
                >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1">
                        Atención Requerida
                    </p>
                    <p className="text-xs font-light">
                        El expediente indica {delayedCount} vacuna{delayedCount > 1 ? 's' : ''} con retraso. Haga clic para registrar la aplicación o programar una cita.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}