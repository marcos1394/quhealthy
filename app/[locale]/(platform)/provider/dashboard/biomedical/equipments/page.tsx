"use client"
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Activity, Plus, Search, Filter, Settings, Wrench, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';

import { BiomedicalEquipmentDTO } from '@/types/biomedical';
import { RegisterEquipmentDrawer } from './RegisterEquipmentDrawer';
import { biomedicalService } from '@/services/biomedical.service';
import { useSessionStore } from '@/stores/SessionStore';
import { toast } from 'react-toastify';

export default function BiomedicalEquipmentsPage() {
    const t = useTranslations('SidebarNav'); 
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [isRegisterDrawerOpen, setIsRegisterDrawerOpen] = useState(false);

    const { user } = useSessionStore();
    const providerId = user?.id || ''; 

    const [equipments, setEquipments] = useState<BiomedicalEquipmentDTO[]>([]);

    const fetchEquipments = async () => {
        if (!providerId) return;
        setIsLoading(true);
        try {
            const data = await biomedicalService.listEquipments(providerId);
            setEquipments(data);
        } catch (error) {
            toast.error("Error al cargar inventario", { theme: 'colored' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipments();
    }, [providerId]);

    const handleEquipmentRegistered = () => {
        fetchEquipments();
    };

    const filteredEquipments = equipments.filter(eq => {
        const matchSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (eq.internalCode && eq.internalCode.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchStatus = filterStatus === 'ALL' || eq.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER ARQUITECTÓNICO --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
                    <div className="flex items-start gap-5">
                        <button 
                            onClick={() => router.push('/provider/dashboard/biomedical')}
                            className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                            <Activity className="w-6 h-6" strokeWidth={1.5} />
                        </button>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                                Ingeniería Clínica
                            </p>
                            <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                                CATÁLOGO DE EQUIPOS
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                INVENTARIO, ESTADO Y TRAZABILIDAD.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsRegisterDrawerOpen(true)}
                        className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none shrink-0"
                    >
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                        REGISTRAR EQUIPO
                    </button>
                </div>

                {/* --- FILTROS --- */}
                <div className="flex flex-col md:flex-row gap-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        <input 
                            placeholder="BUSCAR NOMBRE, SERIE O CÓDIGO..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10">
                        <button 
                            onClick={() => setFilterStatus('ALL')}
                            className={cn(
                                "px-6 h-12 flex items-center justify-center border-r border-black/10 dark:border-white/10 transition-colors text-[9px] font-bold uppercase tracking-widest",
                                filterStatus === 'ALL' ? "bg-black text-white dark:bg-white dark:text-black" : "text-gray-500 hover:bg-white dark:hover:bg-[#111]"
                            )}
                        >
                            TODOS
                        </button>
                        <button 
                            onClick={() => setFilterStatus('ACTIVE')}
                            className={cn(
                                "px-6 h-12 flex items-center justify-center border-r border-black/10 dark:border-white/10 transition-colors text-[9px] font-bold uppercase tracking-widest gap-2",
                                filterStatus === 'ACTIVE' ? "bg-emerald-600 text-white" : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                            )}
                        >
                            <ShieldCheck className="w-3 h-3" strokeWidth={1.5} />
                            ACTIVOS
                        </button>
                        <button 
                            onClick={() => setFilterStatus('OUT_OF_SERVICE')}
                            className={cn(
                                "px-6 h-12 flex items-center justify-center transition-colors text-[9px] font-bold uppercase tracking-widest gap-2",
                                filterStatus === 'OUT_OF_SERVICE' ? "bg-red-600 text-white" : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                            )}
                        >
                            <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
                            FUERA DE SERVICIO
                        </button>
                    </div>
                </div>

                {/* --- DATA TABLE --- */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none min-h-[400px]">
                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] gap-6 bg-white dark:bg-[#0a0a0a]">
                             <QhSpinner size="lg" className="text-black dark:text-white" />
                             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">CARGANDO INVENTARIO BIOMÉDICO...</p>
                         </div>
                    ) : filteredEquipments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center p-8">
                            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
                                <Activity className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
                                SIN COINCIDENCIAS
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
                                NO SE ENCONTRARON EQUIPOS CON LOS FILTROS ACTUALES.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                                <thead className="bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">CÓDIGO / EQUIPO</th>
                                        <th className="px-6 py-4 font-bold">CATEGORÍA</th>
                                        <th className="px-6 py-4 font-bold">FABRICANTE / MODELO</th>
                                        <th className="px-6 py-4 font-bold">ESTADO</th>
                                        <th className="px-6 py-4 font-bold">RIESGO</th>
                                        <th className="px-6 py-4 font-bold text-right">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                                    {filteredEquipments.map((eq) => (
                                        <tr key={eq.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                                        <Activity className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-[11px] text-black dark:text-white">{eq.name}</span>
                                                        <span className="block text-[9px] text-gray-500">{eq.internalCode || eq.serialNumber}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{eq.category}</td>
                                            <td className="px-6 py-4">
                                                <span className="block">{eq.manufacturer}</span>
                                                <span className="block text-[9px] text-gray-500">{eq.model}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {eq.status === 'ACTIVE' && <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30">ACTIVO</span>}
                                                {eq.status === 'OUT_OF_SERVICE' && <span className="inline-flex px-2 py-1 bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30">FUERA DE SERVICIO</span>}
                                                {eq.status === 'IN_MAINTENANCE' && <span className="inline-flex px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30">EN MANTENIMIENTO</span>}
                                                {eq.status === 'DECOMMISSIONED' && <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">DADO DE BAJA</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {eq.riskLevel === 'HIGH' && <span className="text-red-600 dark:text-red-400 font-bold">ALTO</span>}
                                                {eq.riskLevel === 'MEDIUM' && <span className="text-amber-600 dark:text-amber-400 font-bold">MEDIO</span>}
                                                {eq.riskLevel === 'LOW' && <span className="text-blue-600 dark:text-blue-400 font-bold">BAJO</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => router.push(`/provider/dashboard/biomedical/equipments/${eq.id}`)}
                                                    className="inline-flex items-center justify-center w-8 h-8 border border-transparent hover:border-black/20 dark:hover:border-white/20 text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a] transition-all"
                                                >
                                                    <FileText className="w-4 h-4" strokeWidth={1.5} />
                                                </button>
                                                <button 
                                                    className="inline-flex items-center justify-center w-8 h-8 border border-transparent hover:border-black/20 dark:hover:border-white/20 text-gray-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a] transition-all"
                                                >
                                                    <Settings className="w-4 h-4" strokeWidth={1.5} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            <RegisterEquipmentDrawer 
                open={isRegisterDrawerOpen} 
                onOpenChange={setIsRegisterDrawerOpen} 
                onSuccess={handleEquipmentRegistered} 
            />
        </div>
    );
}
