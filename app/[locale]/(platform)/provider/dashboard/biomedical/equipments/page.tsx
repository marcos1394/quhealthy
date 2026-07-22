"use client"
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Activity, Plus, Search, Filter, Settings, Wrench, AlertTriangle, ShieldCheck, FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
    const providerId = user?.id?.toString() || ''; 

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

    const handleExportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Inventario de Equipos Biomédicos', 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["Código", "Nombre", "Categoría", "Fabricante", "Modelo", "Serie", "Estado"];
        const tableRows = filteredEquipments.map(eq => [
            eq.internalCode || 'N/A',
            eq.name,
            eq.categoryName || 'N/A',
            eq.manufacturer || 'N/A',
            eq.model || 'N/A',
            eq.serialNumber,
            eq.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save('inventario-biomedico.pdf');
    };

    const handleExportExcel = () => {
        const wsData = filteredEquipments.map(eq => ({
            'Código Interno': eq.internalCode,
            'Nombre': eq.name,
            'Categoría': eq.categoryName,
            'Fabricante': eq.manufacturer,
            'Modelo': eq.model,
            'Número de Serie': eq.serialNumber,
            'Estado': eq.status,
            'Vida Útil (Años)': eq.usefulLifeYears
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventario");
        XLSX.writeFile(wb, "inventario-biomedico.xlsx");
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 transition-colors duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-5">
                        <button 
                            onClick={() => router.push('/provider/dashboard/biomedical')}
                            className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
                        >
                            <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </button>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">
                                Ingeniería Clínica
                            </p>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                                Catálogo de Equipos
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-3 shrink-0 flex-wrap">
                        <button 
                            onClick={handleExportPdf}
                            className="h-12 px-4 rounded-xl bg-white border border-gray-200 dark:bg-[#0a0a0a] dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Download className="w-4 h-4" strokeWidth={2} />
                            PDF
                        </button>
                        <button 
                            onClick={handleExportExcel}
                            className="h-12 px-4 rounded-xl bg-white border border-gray-200 dark:bg-[#0a0a0a] dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Download className="w-4 h-4" strokeWidth={2} />
                            Excel
                        </button>
                        <button 
                            onClick={() => setIsRegisterDrawerOpen(true)}
                            className="h-12 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm border-0"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2} />
                            Registrar Equipo
                        </button>
                    </div>
                </div>

                {/* --- FILTROS --- */}
                <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-4 rounded-3xl shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                        <input 
                            placeholder="Buscar nombre, serie o código..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                        />
                    </div>
                    <div className="flex bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-xl p-1 gap-1">
                        <button 
                            onClick={() => setFilterStatus('ALL')}
                            className={cn(
                                "px-4 h-10 flex items-center justify-center rounded-lg transition-colors text-xs font-bold",
                                filterStatus === 'ALL' ? "bg-white dark:bg-[#111] text-emerald-600 shadow-sm border border-gray-200 dark:border-gray-700" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]"
                            )}
                        >
                            Todos
                        </button>
                        <button 
                            onClick={() => setFilterStatus('ACTIVE')}
                            className={cn(
                                "px-4 h-10 flex items-center justify-center rounded-lg transition-colors text-xs font-bold gap-2",
                                filterStatus === 'ACTIVE' ? "bg-white dark:bg-[#111] text-emerald-600 shadow-sm border border-gray-200 dark:border-gray-700" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]"
                            )}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                            Activos
                        </button>
                        <button 
                            onClick={() => setFilterStatus('OUT_OF_SERVICE')}
                            className={cn(
                                "px-4 h-10 flex items-center justify-center rounded-lg transition-colors text-xs font-bold gap-2",
                                filterStatus === 'OUT_OF_SERVICE' ? "bg-white dark:bg-[#111] text-red-600 shadow-sm border border-gray-200 dark:border-gray-700" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]"
                            )}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                            Fuera de Servicio
                        </button>
                    </div>
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] gap-6 bg-white dark:bg-[#0a0a0a]">
                             <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
                             <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando inventario biomédico...</p>
                         </div>
                    ) : filteredEquipments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center p-8">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-6">
                                <Activity className="w-6 h-6 text-gray-400" strokeWidth={2} />
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Sin Coincidencias
                            </p>
                            <p className="text-sm font-medium text-gray-500 max-w-xs leading-relaxed">
                                No se encontraron equipos con los filtros actuales.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500">Equipo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500">Categoría</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500">Fabricante / Modelo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500">Estado</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500">Riesgo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredEquipments.map((eq) => (
                                        <tr key={eq.id} className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                                                        <Activity className="w-5 h-5 text-gray-400" strokeWidth={2} />
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-bold text-gray-900 dark:text-white">{eq.name}</span>
                                                        <span className="block text-xs font-semibold text-gray-500">{eq.internalCode || eq.serialNumber}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{eq.categoryName || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className="block text-sm font-bold text-gray-900 dark:text-white">{eq.manufacturer}</span>
                                                <span className="block text-xs font-semibold text-gray-500">{eq.model}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {eq.status === 'AVAILABLE' && <span className="inline-flex px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/30 text-xs font-bold shadow-sm">Disponible</span>}
                                                {eq.status === 'ACTIVE' && <span className="inline-flex px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30 text-xs font-bold shadow-sm">Activo</span>}
                                                {eq.status === 'OUT_OF_SERVICE' && <span className="inline-flex px-2 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30 text-xs font-bold shadow-sm">Fuera de Servicio</span>}
                                                {eq.status === 'IN_MAINTENANCE' && <span className="inline-flex px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/30 text-xs font-bold shadow-sm">En Mantenimiento</span>}
                                                {eq.status === 'DECOMMISSIONED' && <span className="inline-flex px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200 dark:bg-[#111] dark:text-gray-400 dark:border-gray-800 text-xs font-bold shadow-sm">Dado de Baja</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {eq.riskLevel === 'LOW' && <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Bajo</span>}
                                                {eq.riskLevel === 'MEDIUM' && <span className="text-amber-600 dark:text-amber-400 text-sm font-bold">Medio</span>}
                                                {eq.riskLevel === 'HIGH' && <span className="text-red-600 dark:text-red-400 text-sm font-bold">Alto</span>}
                                                {!eq.riskLevel && <span className="text-gray-400 text-sm font-bold">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => router.push(`/provider/dashboard/biomedical/equipments/${eq.id}`)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4" strokeWidth={2} />
                                                    </button>
                                                    <button 
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                    >
                                                        <Settings className="w-4 h-4" strokeWidth={2} />
                                                    </button>
                                                </div>
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
