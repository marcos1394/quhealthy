"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Activity, ArrowLeft, CheckCircle, ShieldAlert, Wrench, Settings, FileText, Calendar, Edit3, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';
import { BiomedicalEquipmentDTO } from '@/types/biomedical';
import { biomedicalService } from '@/services/biomedical.service';
import { toast } from 'react-toastify';
import { useSessionStore } from '@/stores/SessionStore';
import axios from 'axios';
import { CreateWorkOrderDrawer } from '../CreateWorkOrderDrawer';
import { CreateWarrantyDrawer } from '../CreateWarrantyDrawer';
import { CreateScheduleDrawer } from '../CreateScheduleDrawer';

export default function EquipmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const equipmentId = params.id as string;
    
    const { user } = useSessionStore();
    const providerId = user?.id?.toString();

    const [equipment, setEquipment] = useState<BiomedicalEquipmentDTO | null>(null);
    const [mttr, setMttr] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [warranties, setWarranties] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    
    // Drawers State
    const [isWorkOrderDrawerOpen, setIsWorkOrderDrawerOpen] = useState(false);
    const [isWarrantyDrawerOpen, setIsWarrantyDrawerOpen] = useState(false);
    const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);

    useEffect(() => {
        const fetchEquipmentDetails = async () => {
            if (!equipmentId || !providerId) return;
            setIsLoading(true);
            try {
                // Fetching MTTR
                const mttrValue = await biomedicalService.getMTTR(equipmentId).catch(() => null);
                if (mttrValue !== null) setMttr(mttrValue);

                // Fetching the equipment from the provider's list
                const equipments = await biomedicalService.listEquipments(providerId);
                const found = equipments.find((eq: BiomedicalEquipmentDTO) => eq.id === equipmentId);
                if (found) {
                    setEquipment(found);
                } else {
                    toast.error("Equipo no encontrado", { theme: 'colored' });
                }
            } catch (err) {
                toast.error("Error al cargar detalles", { theme: 'colored' });
            } finally {
                setIsLoading(false);
            }
        };
        const fetchDocsAndWarranties = async () => {
            if (!equipmentId) return;
            try {
                const docs = await biomedicalService.getDocuments(equipmentId);
                setDocuments(docs);
                const warrs = await biomedicalService.getWarranties(equipmentId);
                setWarranties(warrs);
                const scheds = await biomedicalService.getSchedules(equipmentId);
                setSchedules(scheds);
            } catch (err) {
                console.error(err);
            }
        };

        const fetchWorkOrders = async () => {
            if (!equipmentId) return;
            try {
                const orders = await biomedicalService.getWorkOrders(equipmentId);
                setWorkOrders(orders);
            } catch (err) {
                console.error(err);
            }
        };

        fetchEquipmentDetails();
        fetchDocsAndWarranties();
        fetchWorkOrders();
    }, [equipmentId, providerId]);

    const refreshWorkOrders = async () => {
        try {
            const orders = await biomedicalService.getWorkOrders(equipmentId);
            setWorkOrders(orders);
        } catch (err) {
            console.error(err);
        }
    };

    const refreshWarranties = async () => {
        try {
            const warrs = await biomedicalService.getWarranties(equipmentId);
            setWarranties(warrs);
        } catch (err) {
            console.error(err);
        }
    };

    const refreshSchedules = async () => {
        try {
            const scheds = await biomedicalService.getSchedules(equipmentId);
            setSchedules(scheds);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !equipmentId) return;

        setIsUploading(true);
        try {
            const { signedUrl, publicUrl } = await biomedicalService.getUploadUrl(equipmentId, file.name, file.type);
            
            await axios.put(signedUrl, file, {
                headers: { 'Content-Type': file.type }
            });

            await biomedicalService.registerDocument(equipmentId, 'MANUAL', publicUrl);
            toast.success("Documento subido con éxito", { theme: 'colored' });
            
            const docs = await biomedicalService.getDocuments(equipmentId);
            setDocuments(docs);
        } catch (err) {
            toast.error("Error al subir documento", { theme: 'colored' });
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50 dark:bg-[#050505]">
                <QhSpinner size="lg" className="text-black dark:text-white" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">CARGANDO FICHA DEL EQUIPO...</p>
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <ShieldAlert className="w-12 h-12 text-red-500" strokeWidth={1.5} />
                <h2 className="text-xl font-bold">EQUIPO NO ENCONTRADO</h2>
                <button onClick={() => router.back()} className="text-[10px] font-bold uppercase tracking-widest underline">VOLVER</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER ARQUITECTÓNICO --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
                    <div className="flex items-start gap-5">
                        <button 
                            onClick={() => router.back()}
                            className="w-12 h-12 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                    FICHA TÉCNICA / {equipment.categoryName || 'S/N'}
                                </p>
                                {equipment.status === 'AVAILABLE' && <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">DISPONIBLE</span>}
                                {equipment.status === 'ACTIVE' && <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">ACTIVO</span>}
                                {equipment.status === 'OUT_OF_SERVICE' && <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">FUERA DE SERVICIO</span>}
                                {equipment.status === 'IN_MAINTENANCE' && <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">EN MANTENIMIENTO</span>}
                                {equipment.status === 'DECOMMISSIONED' && <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">DADO DE BAJA</span>}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none flex items-center gap-4">
                                {equipment.name}
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                S/N: {equipment.serialNumber} {equipment.internalCode && ` | ID: ${equipment.internalCode}`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button className="h-10 px-4 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 rounded-none">
                            <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            EDITAR
                        </button>
                        <button 
                            onClick={() => setIsWorkOrderDrawerOpen(true)}
                            className="h-10 px-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border-0 rounded-none shrink-0"
                        >
                            <Wrench className="w-3.5 h-3.5" strokeWidth={1.5} />
                            NUEVA ORDEN
                        </button>
                    </div>
                </div>

                {/* --- TABS --- */}
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-black/10 dark:border-white/10 rounded-none flex-wrap">
                        <TabsTrigger 
                            value="general"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white"
                        >
                            <Activity className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                            INFO GENERAL
                        </TabsTrigger>
                        <TabsTrigger 
                            value="orders"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white"
                        >
                            <Wrench className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                            ÓRDENES DE TRABAJO
                        </TabsTrigger>
                        <TabsTrigger 
                            value="schedule"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white"
                        >
                            <Calendar className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                            PROGRAMACIÓN
                        </TabsTrigger>
                        <TabsTrigger 
                            value="documents"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white"
                        >
                            <FileText className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                            DOCUMENTOS
                        </TabsTrigger>
                        <TabsTrigger 
                            value="warranties"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black dark:data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 data-[state=active]:text-black dark:data-[state=active]:text-white"
                        >
                            <ShieldAlert className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
                            GARANTÍAS
                        </TabsTrigger>
                    </TabsList>

                    <div className="pt-6">
                        <TabsContent value="general" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Details Card */}
                                <div className="lg:col-span-2 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 rounded-none space-y-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-4">
                                        DETALLES DEL FABRICANTE
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Fabricante</p>
                                            <p className="text-sm font-semibold text-black dark:text-white">{equipment.manufacturer}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Modelo</p>
                                            <p className="text-sm font-semibold text-black dark:text-white">{equipment.model}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Categoría</p>
                                            <p className="text-sm font-semibold text-black dark:text-white">{equipment.categoryName || 'S/N'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Nivel de Riesgo</p>
                                            <p className="text-sm font-semibold text-black dark:text-white">
                                                {equipment.riskLevel === 'LOW' && 'BAJO'}
                                                {equipment.riskLevel === 'MEDIUM' && 'MEDIO'}
                                                {equipment.riskLevel === 'HIGH' && 'ALTO'}
                                                {!equipment.riskLevel && 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-4 mt-8">
                                        CICLO DE VIDA
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Fecha Adquisición</p>
                                            <p className="text-sm font-semibold text-black dark:text-white">{equipment.acquisitionDate || 'NO REGISTRADA'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Vida Útil Estimada</p>
                                            <p className="text-sm font-semibold text-black dark:text-white">{equipment.usefulLifeYears ? `${equipment.usefulLifeYears} Años` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Stats Card */}
                                <div className="border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] p-6 rounded-none space-y-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-4">
                                        MÉTRICAS
                                    </h3>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">MTTR (Tiempo Medio Reparación)</p>
                                        <p className="text-2xl font-semibold tracking-tight text-black dark:text-white">{mttr !== null ? Math.round(mttr) : '--'} <span className="text-xs font-normal">MIN</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">Total Órdenes Correctivas</p>
                                        <p className="text-2xl font-semibold tracking-tight text-black dark:text-white">{workOrders.filter(wo => wo.type === 'CORRECTIVE').length}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">Último Mantenimiento</p>
                                        <p className="text-sm font-semibold text-black dark:text-white">--/--/----</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders" className="mt-0 outline-none">
                            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8 min-h-[300px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                                        ÓRDENES DE TRABAJO
                                    </h3>
                                    <button 
                                        onClick={() => setIsWorkOrderDrawerOpen(true)}
                                        className="h-10 px-6 border border-black/20 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center"
                                    >
                                        CREAR ORDEN
                                    </button>
                                </div>

                                {workOrders.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center justify-center">
                                        <Wrench className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-4" strokeWidth={1.5} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            NO HAY ÓRDENES DE TRABAJO REGISTRADAS
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-black/10 dark:border-white/10">
                                                    <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">Tipo</th>
                                                    <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">Prioridad</th>
                                                    <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">Estado</th>
                                                    <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">Fecha Prog.</th>
                                                    <th className="py-3 px-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right">Detalle</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-black/10 dark:divide-white/10">
                                                {workOrders.map((wo: any) => (
                                                    <tr key={wo.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                                                        <td className="py-3 px-4">
                                                            <span className="text-sm font-semibold uppercase">{wo.type === 'CORRECTIVE' ? 'CORRECTIVA' : wo.type === 'PREVENTIVE' ? 'PREVENTIVA' : wo.type}</span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={cn(
                                                                "px-2 py-0.5 text-[8px] font-bold uppercase border",
                                                                wo.priority === 'CRITICAL' ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" :
                                                                wo.priority === 'HIGH' ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" :
                                                                wo.priority === 'NORMAL' ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" :
                                                                "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                                            )}>{wo.priority}</span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={cn(
                                                                "px-2 py-0.5 text-[8px] font-bold uppercase border",
                                                                wo.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" :
                                                                wo.status === 'IN_PROGRESS' ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" :
                                                                wo.status === 'CANCELLED' ? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" :
                                                                "bg-white text-black border-black/20 dark:bg-[#0a0a0a] dark:text-white dark:border-white/20"
                                                            )}>{wo.status}</span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                                {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button className="text-[9px] font-bold uppercase tracking-widest hover:underline text-gray-500 hover:text-black dark:hover:text-white">
                                                                VER
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="schedule" className="mt-0 outline-none">
                            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8 min-h-[300px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                                        MANTENIMIENTO PREVENTIVO
                                    </h3>
                                    <button 
                                        onClick={() => setIsScheduleDrawerOpen(true)}
                                        className="h-10 px-6 border border-black/20 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center"
                                    >
                                        CONFIGURAR PROGRAMACIÓN
                                    </button>
                                </div>

                                {schedules.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center justify-center">
                                        <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-4" strokeWidth={1.5} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            NO HAY PROGRAMACIÓN DE MANTENIMIENTO PREVENTIVO
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-black/10 dark:divide-white/10 border-t border-black/10 dark:border-white/10">
                                        {schedules.map((sched: any) => (
                                            <li key={sched.id} className="py-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-semibold text-black dark:text-white uppercase">
                                                        {sched.periodicity === 'CUSTOM' ? `CADA ${sched.customDays} DÍAS` : sched.periodicity}
                                                    </span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[9px] font-bold uppercase", 
                                                        sched.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    )}>
                                                        {sched.isActive ? 'ACTIVO' : 'INACTIVO'}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                                                    PRÓXIMO MANTENIMIENTO: {sched.nextMaintenanceDate ? new Date(sched.nextMaintenanceDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                                {sched.lastMaintenanceDate && (
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                        ÚLTIMO MANTENIMIENTO: {new Date(sched.lastMaintenanceDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-0 outline-none">
                            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8 min-h-[300px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                                        DOCUMENTOS ASOCIADOS
                                    </h3>
                                    <div>
                                        <input 
                                            type="file" 
                                            id="file-upload" 
                                            className="hidden" 
                                            onChange={handleFileUpload} 
                                            disabled={isUploading}
                                        />
                                        <label 
                                            htmlFor="file-upload" 
                                            className={cn(
                                                "h-10 px-6 border border-black/20 dark:border-white/20 transition-colors text-[9px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center",
                                                isUploading ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-white/5" : "hover:bg-gray-50 dark:hover:bg-[#111]"
                                            )}
                                        >
                                            {isUploading ? "SUBIENDO..." : "SUBIR DOCUMENTO"}
                                        </label>
                                    </div>
                                </div>

                                {documents.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center justify-center">
                                        <FileText className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-4" strokeWidth={1.5} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            NO HAY DOCUMENTOS ASOCIADOS
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-black/10 dark:divide-white/10 border-t border-black/10 dark:border-white/10">
                                        {documents.map((doc: any) => (
                                            <li key={doc.id} className="py-4 flex justify-between items-center">
                                                <div>
                                                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-black dark:text-white hover:underline uppercase">
                                                        {doc.type} - v{doc.version}
                                                    </a>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                        Subido el: {new Date(doc.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="warranties" className="mt-0 outline-none">
                            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-8 min-h-[300px]">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                                        REGISTRO DE GARANTÍAS
                                    </h3>
                                    <button 
                                        onClick={() => setIsWarrantyDrawerOpen(true)}
                                        className="h-10 px-6 border border-black/20 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center"
                                    >
                                        REGISTRAR GARANTÍA
                                    </button>
                                </div>

                                {warranties.length === 0 ? (
                                    <div className="text-center py-12 flex flex-col items-center justify-center">
                                        <ShieldAlert className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-4" strokeWidth={1.5} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            NO HAY GARANTÍAS REGISTRADAS
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-black/10 dark:divide-white/10 border-t border-black/10 dark:border-white/10">
                                        {warranties.map((war: any) => (
                                            <li key={war.id} className="py-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-semibold text-black dark:text-white uppercase">{war.providerName}</span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[9px] font-bold uppercase", 
                                                        war.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    )}>
                                                        {war.isActive ? 'VIGENTE' : 'VENCIDA'}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                                                    VÁLIDA: {new Date(war.startDate).toLocaleDateString()} - {new Date(war.expirationDate).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">{war.coverageDetails}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </TabsContent>

                    </div>
                </Tabs>

            </div>

            <CreateWorkOrderDrawer 
                isOpen={isWorkOrderDrawerOpen} 
                onClose={() => setIsWorkOrderDrawerOpen(false)} 
                onSuccess={refreshWorkOrders}
                equipmentId={equipment.id}
            />
            <CreateWarrantyDrawer
                isOpen={isWarrantyDrawerOpen}
                onClose={() => setIsWarrantyDrawerOpen(false)}
                onSuccess={refreshWarranties}
                equipmentId={equipment.id}
            />
            <CreateScheduleDrawer
                isOpen={isScheduleDrawerOpen}
                onClose={() => setIsScheduleDrawerOpen(false)}
                onSuccess={refreshSchedules}
                equipmentId={equipment.id}
            />
        </div>
    );
}
