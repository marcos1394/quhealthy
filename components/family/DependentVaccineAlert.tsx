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
                    className="absolute left-4 top-4 z-20 flex h-9 min-w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-2 text-rose-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                    >
                        <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"></span>
                        <AlertCircle className="relative h-4 w-4" />
                        <span className="relative ml-1 text-xs font-bold">
                            {delayedCount}
                        </span>
                    </Link>
                </TooltipTrigger>
                <TooltipContent className="z-50 max-w-xs border-rose-700 bg-rose-600 text-center text-white">
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
