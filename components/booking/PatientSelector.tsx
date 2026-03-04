import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { User, Users, Baby, Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useFamily } from '@/hooks/useFamily';
import { useBookingStore } from '@/hooks/useBookingStore';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/stores/SessionStore';

export function PatientSelector() {
    const t = useTranslations('PatientCheckout');
    const router = useRouter();
    const { user } = useSessionStore();
    const { family, isLoading } = useFamily();
    const { dependentId, setDependentId } = useBookingStore();

    // Por defecto, seleccionar al titular (null) si no hay nada
    useEffect(() => {
        if (dependentId === undefined) {
            setDependentId(null);
        }
    }, [dependentId, setDependentId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin text-medical-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-medical-500" />
                    ¿Para quién es la cita?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Selecciona al paciente que recibirá la atención médica.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Tarjeta del Titular (Yo) */}
                <div
                    onClick={() => setDependentId(null)}
                    className={cn(
                        "cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4",
                        dependentId === null
                            ? "border-medical-500 bg-medical-50 dark:bg-medical-500/10 shadow-md"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-medical-300 dark:hover:border-medical-700"
                    )}
                >
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        dependentId === null ? "bg-medical-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}>
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Para mí</p>
                        <p className="text-xs text-slate-500">{user?.firstName} {user?.lastName}</p>
                    </div>
                </div>

                {/* 2. Tarjetas de Familiares */}
                {family.map(member => (
                    <div
                        key={member.id}
                        onClick={() => setDependentId(member.id)}
                        className={cn(
                            "cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4",
                            dependentId === member.id
                                ? "border-medical-500 bg-medical-50 dark:bg-medical-500/10 shadow-md"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-medical-300 dark:hover:border-medical-700"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                            dependentId === member.id ? "bg-medical-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}>
                            {member.relationship === 'CHILD' ? <Baby className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                                {member.firstName} {member.lastName}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-medical-600 dark:text-medical-400">
                                {member.relationship}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Botón para añadir a alguien más rápido */}
            <button
                onClick={() => router.push('/patient/dashboard/family')}
                className="text-sm font-semibold text-medical-600 dark:text-medical-400 hover:text-medical-700 transition-colors flex items-center mt-2"
            >
                <PlusCircle className="w-4 h-4 mr-1" /> Añadir otro familiar
            </button>
        </div>
    );
}
