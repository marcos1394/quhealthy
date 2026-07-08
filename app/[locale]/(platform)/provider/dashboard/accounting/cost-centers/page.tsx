"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Plus } from 'lucide-react';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { CostCenterDTO } from '@/types/accounting';
import { accountingService } from '@/services/accounting.service';
import { toast } from 'react-toastify';

export default function CostCentersPage() {
    const router = useRouter();
    const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCostCenters = async () => {
            try {
                const data = await accountingService.listCostCenters();
                setCostCenters(data);
            } catch (error) {
                toast.error("Error al cargar centros de costos", { theme: "colored" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchCostCenters();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50 dark:bg-[#050505]">
                <QhSpinner size="lg" className="text-black dark:text-white" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">CARGANDO CENTROS DE COSTOS...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
                    <div className="flex items-start gap-5">
                        <button 
                            onClick={() => router.push('/provider/dashboard/accounting')}
                            className="w-12 h-12 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                    ERP FINANCIERO / CONTABILIDAD
                                </p>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none flex items-center gap-4">
                                CENTROS DE COSTOS
                            </h1>
                        </div>
                    </div>
                    
                    <button className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none shrink-0">
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                        NUEVO CENTRO DE COSTO
                    </button>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                                    <th className="py-4 px-6 text-[9px] font-bold uppercase tracking-widest text-gray-500">CÓDIGO</th>
                                    <th className="py-4 px-6 text-[9px] font-bold uppercase tracking-widest text-gray-500">NOMBRE</th>
                                    <th className="py-4 px-6 text-[9px] font-bold uppercase tracking-widest text-gray-500">DESCRIPCIÓN</th>
                                    <th className="py-4 px-6 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {costCenters.length > 0 ? (
                                    costCenters.map((cc) => (
                                        <tr key={cc.id} className="border-b border-black/5 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                                            <td className="py-4 px-6 text-sm font-medium text-black dark:text-white">{cc.code}</td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{cc.name}</td>
                                            <td className="py-4 px-6 text-sm text-gray-500">{cc.description || '-'}</td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="text-[9px] font-bold uppercase tracking-widest underline text-gray-500 hover:text-black dark:hover:text-white">EDITAR</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 px-6 text-center">
                                            <Building2 className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-4" strokeWidth={1.5} />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">NO HAY CENTROS DE COSTOS REGISTRADOS</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
