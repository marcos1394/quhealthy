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
                        className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm border border-rose-200 dark:border-rose-500/30 hover:scale-110 transition-transform group/alert"
                    >
                        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-rose-500"></div>
                        <AlertCircle className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-md">
                            {delayedCount}
                        </span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent className="bg-rose-600 text-white border-rose-700 max-w-xs text-center z-50">
                    <p className="font-medium text-sm">
                        {delayedCount} vacuna{delayedCount > 1 ? 's' : ''} con retraso.
                    </p>
                    <p className="text-xs text-rose-200 mt-1">
                        Haz clic aquí para registrarlas si ya se aplicaron.
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
