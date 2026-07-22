"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Activity, ArrowLeft, CheckCircle, ShieldAlert, Wrench, Settings, FileText, Calendar, Edit3, Trash2, BotMessageSquare } from 'lucide-react';
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

// Componente para ver el estado de procesamiento del PDF
function DocumentProcessingBadge({ documentId, type }: { documentId: string, type: string }) {
    const [status, setStatus] = useState<string>('UNKNOWN');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (type !== 'MANUAL' && type !== 'MAINTENANCE_GUIDE') return;

        let interval: NodeJS.Timeout;
        const fetchStatus = async () => {
            try {
                const res = await biomedicalService.getDocumentProcessingStatus(documentId);
                setStatus(res.status);
                if (res.totalChunks > 0) {
                    setProgress(Math.round((res.processedChunks / res.totalChunks) * 100));
                }
                if (res.status === 'COMPLETED' || res.status === 'FAILED') {
                    clearInterval(interval);
                }
            } catch (err) {
                // Ignore if not found
            }
        };

        fetchStatus();
        interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [documentId, type]);

    if (type !== 'MANUAL' && type !== 'MAINTENANCE_GUIDE') return null;

    if (status === 'COMPLETED') {
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">IA Lista</span>;
    }
    if (status === 'PROCESSING' || status === 'STARTED') {
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 animate-pulse">Procesando {progress}%</span>;
    }
    if (status === 'FAILED') {
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">Error IA</span>;
    }
    return null;
}

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
    
    // Data State
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    
    // Chat State
    const [chatMessages, setChatMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMessage.trim() || !equipmentId) return;

        const question = currentMessage.trim();
        setChatMessages(prev => [...prev, { role: 'user', content: question }]);
        setCurrentMessage('');
        setIsChatLoading(true);

        try {
            const res = await biomedicalService.askAssistant(equipmentId, question);
            setChatMessages(prev => [...prev, { role: 'assistant', content: res.answer }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al consultar la documentación.' }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50/50 dark:bg-[#050505]">
                <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando Ficha del Equipo...</p>
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-900/30">
                    <ShieldAlert className="w-8 h-8 text-red-500" strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Equipo No Encontrado</h2>
                    <p className="text-sm text-gray-500 mt-2 max-w-sm">No pudimos localizar el equipo solicitado en el inventario.</p>
                </div>
                <button 
                    onClick={() => router.back()} 
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-emerald-700 transition-colors"
                >
                    Volver al Inventario
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
                    <div className="flex items-start gap-5">
                        <button 
                            onClick={() => router.back()}
                            className="w-12 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400 shadow-sm">
                                    Ficha Técnica • {equipment.categoryName || 'S/N'}
                                </span>
                                {equipment.status === 'AVAILABLE' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 shadow-sm">Disponible</span>}
                                {equipment.status === 'ACTIVE' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">Activo</span>}
                                {equipment.status === 'OUT_OF_SERVICE' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50 shadow-sm">Fuera de Servicio</span>}
                                {equipment.status === 'IN_MAINTENANCE' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 shadow-sm">En Mantenimiento</span>}
                                {equipment.status === 'DECOMMISSIONED' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50 shadow-sm">Dado de Baja</span>}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-none flex items-center gap-4">
                                {equipment.name}
                            </h1>
                            <p className="text-sm font-medium text-gray-500">
                                S/N: {equipment.serialNumber} {equipment.internalCode && ` | ID: ${equipment.internalCode}`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <button className="h-12 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 shadow-sm">
                            <Edit3 className="w-4 h-4" strokeWidth={2} />
                            Editar
                        </button>
                        <button 
                            onClick={() => setIsWorkOrderDrawerOpen(true)}
                            className="h-12 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center gap-2 shadow-sm shrink-0"
                        >
                            <Wrench className="w-4 h-4" strokeWidth={2} />
                            Nueva Orden
                        </button>
                    </div>
                </div>

                {/* --- TABS --- */}
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="w-full justify-start h-auto p-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-2xl flex-wrap shadow-inner mb-6">
                        <TabsTrigger 
                            value="general"
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                        >
                            <Activity className="w-4 h-4 mr-2" strokeWidth={2} />
                            Info General
                        </TabsTrigger>
                        <TabsTrigger 
                            value="orders"
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                        >
                            <Wrench className="w-4 h-4 mr-2" strokeWidth={2} />
                            Órdenes de Trabajo
                        </TabsTrigger>
                        <TabsTrigger 
                            value="schedule"
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                        >
                            <Calendar className="w-4 h-4 mr-2" strokeWidth={2} />
                            Programación
                        </TabsTrigger>
                        <TabsTrigger 
                            value="documents"
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                        >
                            <FileText className="w-4 h-4 mr-2" strokeWidth={2} />
                            Documentos
                        </TabsTrigger>
                        <TabsTrigger 
                            value="warranties"
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                        >
                            <ShieldAlert className="w-4 h-4 mr-2" strokeWidth={2} />
                            Garantías
                        </TabsTrigger>
                        <TabsTrigger 
                            value="ai-chat"
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                        >
                            <BotMessageSquare className="w-4 h-4 mr-2" strokeWidth={2} />
                            Asistente IA
                        </TabsTrigger>
                    </TabsList>

                    <div className="pt-2">
                        <TabsContent value="general" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Details Card */}
                                <div className="lg:col-span-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl space-y-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
                                        Detalles del Fabricante
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Fabricante</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{equipment.manufacturer}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Modelo</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{equipment.model}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Categoría</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{equipment.categoryName || 'S/N'}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Nivel de Riesgo</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {equipment.riskLevel === 'LOW' && 'Bajo'}
                                                {equipment.riskLevel === 'MEDIUM' && 'Medio'}
                                                {equipment.riskLevel === 'HIGH' && 'Alto'}
                                                {!equipment.riskLevel && 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4 mt-8">
                                        Ciclo de Vida
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Fecha de Adquisición</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{equipment.acquisitionDate || 'No registrada'}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Vida Útil Estimada</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{equipment.usefulLifeYears ? `${equipment.usefulLifeYears} Años` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Stats Card */}
                                <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl space-y-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
                                        Métricas
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">MTTR (Tiempo Medio Reparación)</p>
                                            <p className="text-3xl font-bold tracking-tight text-emerald-900 dark:text-emerald-300">
                                                {mttr !== null ? Math.round(mttr) : '--'} <span className="text-sm font-medium opacity-70">MIN</span>
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-semibold text-gray-500 mb-2">Total Órdenes Correctivas</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{workOrders.filter(wo => wo.type === 'CORRECTIVE').length}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-xs font-semibold text-gray-500 mb-2">Último Mantenimiento</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">--/--/----</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders" className="mt-0 outline-none">
                            <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl shadow-sm min-h-[400px]">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Órdenes de Trabajo
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 mt-1">Historial de mantenimientos e incidencias</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsWorkOrderDrawerOpen(true)}
                                        className="h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <Wrench className="w-4 h-4" />
                                        Crear Orden
                                    </button>
                                </div>

                                {workOrders.length === 0 ? (
                                    <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                        <div className="w-16 h-16 bg-white dark:bg-[#0a0a0a] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
                                            <Wrench className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            No hay órdenes de trabajo registradas
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Las órdenes creadas aparecerán en esta lista.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50/50 dark:bg-[#111]/50 border-b border-gray-100 dark:border-gray-800">
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Tipo</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Prioridad</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Estado</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Fecha Prog.</th>
                                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-right">Detalle</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {workOrders.map((wo: any) => (
                                                    <tr key={wo.id} className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{wo.type === 'CORRECTIVE' ? 'Correctiva' : wo.type === 'PREVENTIVE' ? 'Preventiva' : wo.type.toLowerCase()}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-full text-xs font-bold border",
                                                                wo.priority === 'CRITICAL' ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50" :
                                                                wo.priority === 'HIGH' ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50" :
                                                                wo.priority === 'NORMAL' ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50" :
                                                                "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700/50"
                                                            )}>{wo.priority}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-full text-xs font-bold border",
                                                                wo.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50" :
                                                                wo.status === 'IN_PROGRESS' ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" :
                                                                wo.status === 'CANCELLED' ? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700/50" :
                                                                "bg-white text-gray-700 border-gray-200 dark:bg-[#111] dark:text-gray-300 dark:border-gray-800"
                                                            )}>{wo.status}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-sm font-medium text-gray-500">
                                                                {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline">
                                                                Ver
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
                            <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl shadow-sm min-h-[400px]">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Mantenimiento Preventivo
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 mt-1">Configuración de mantenimientos periódicos</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsScheduleDrawerOpen(true)}
                                        className="h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Programar
                                    </button>
                                </div>

                                {schedules.length === 0 ? (
                                    <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                        <div className="w-16 h-16 bg-white dark:bg-[#0a0a0a] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
                                            <Calendar className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            No hay rutinas de mantenimiento programadas
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Asegura la vida útil del equipo configurando una rutina.</p>
                                    </div>
                                ) : (
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {schedules.map((sched: any) => (
                                            <li key={sched.id} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/50">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-base font-bold text-gray-900 dark:text-white capitalize">
                                                        {sched.periodicity === 'CUSTOM' ? `Cada ${sched.customDays} Días` : sched.periodicity.toLowerCase()}
                                                    </span>
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-xs font-bold", 
                                                        sched.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    )}>
                                                        {sched.isActive ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            Próximo: <span className="font-bold text-gray-900 dark:text-white">{sched.nextMaintenanceDate ? new Date(sched.nextMaintenanceDate).toLocaleDateString() : 'N/A'}</span>
                                                        </p>
                                                    </div>
                                                    {sched.lastMaintenanceDate && (
                                                        <div className="flex items-center gap-2 opacity-70">
                                                            <CheckCircle className="w-4 h-4 text-gray-500" />
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                Último: {new Date(sched.lastMaintenanceDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-0 outline-none">
                            <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl shadow-sm min-h-[400px]">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Documentos Asociados
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 mt-1">Manuales, guías y certificaciones del equipo</p>
                                    </div>
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
                                                "h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors text-sm font-bold cursor-pointer flex items-center justify-center gap-2",
                                                isUploading ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-[#111]" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                                            )}
                                        >
                                            <FileText className="w-4 h-4" />
                                            {isUploading ? "Subiendo..." : "Subir Documento"}
                                        </label>
                                    </div>
                                </div>

                                {documents.length === 0 ? (
                                    <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                        <div className="w-16 h-16 bg-white dark:bg-[#0a0a0a] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
                                            <FileText className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            No hay documentos asociados
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Sube manuales PDF para habilitar el asistente de IA.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {documents.map((doc: any) => (
                                            <div key={doc.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/50 flex justify-between items-center group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                                    </div>
                                                    <div>
                                                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                                                            {doc.type} - v{doc.version}
                                                        </a>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-xs font-medium text-gray-500">
                                                                {new Date(doc.uploadedAt).toLocaleDateString()}
                                                            </p>
                                                            <DocumentProcessingBadge documentId={doc.id} type={doc.type} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="warranties" className="mt-0 outline-none">
                            <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl shadow-sm min-h-[400px]">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Registro de Garantías
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 mt-1">Coberturas vigentes y expiradas</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsWarrantyDrawerOpen(true)}
                                        className="h-10 px-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                        Registrar Garantía
                                    </button>
                                </div>

                                {warranties.length === 0 ? (
                                    <div className="text-center py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                        <div className="w-16 h-16 bg-white dark:bg-[#0a0a0a] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
                                            <ShieldAlert className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            No hay garantías registradas
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Protege tu equipo registrando su póliza o garantía.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {warranties.map((war: any) => (
                                            <div key={war.id} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/50">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-base font-bold text-gray-900 dark:text-white">{war.providerName}</span>
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-xs font-bold", 
                                                        war.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    )}>
                                                        {war.isActive ? 'Vigente' : 'Expirada'}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            {new Date(war.startDate).toLocaleDateString()} - {new Date(war.expirationDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{war.coverageDetails}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="ai-chat" className="mt-0 outline-none">
                            <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] min-h-[600px] flex flex-col rounded-3xl shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-gray-50/50 dark:bg-[#111]/50">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                                        <BotMessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                            Asistente de Documentación (IA)
                                        </h3>
                                        <p className="text-xs font-medium text-gray-500 mt-0.5">Respuestas basadas estrictamente en manuales indexados</p>
                                    </div>
                                </div>
                                
                                <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[500px]">
                                    {chatMessages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-[#111] rounded-full flex items-center justify-center mb-4">
                                                <BotMessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                                ¿En qué te puedo ayudar?
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 max-w-[250px]">
                                                Pregunta sobre calibración, mantenimiento o uso del equipo.
                                            </p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg, idx) => (
                                            <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                                <div className={cn(
                                                    "max-w-[80%] p-4 text-sm leading-relaxed shadow-sm",
                                                    msg.role === 'user' 
                                                        ? "bg-emerald-600 text-white rounded-l-2xl rounded-tr-2xl" 
                                                        : "bg-gray-50 text-gray-900 dark:bg-[#111] dark:text-white rounded-r-2xl rounded-tl-2xl border border-gray-100 dark:border-gray-800"
                                                )}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {isChatLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-r-2xl rounded-tl-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-2 shadow-sm">
                                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-[#111]/30">
                                    <form onSubmit={handleSendMessage} className="flex gap-3">
                                        <input
                                            type="text"
                                            value={currentMessage}
                                            onChange={(e) => setCurrentMessage(e.target.value)}
                                            placeholder="Escribe tu pregunta aquí..."
                                            className="flex-1 h-14 px-6 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm placeholder:text-gray-400"
                                            disabled={isChatLoading}
                                        />
                                        <button 
                                            type="submit"
                                            disabled={isChatLoading || !currentMessage.trim()}
                                            className="h-14 px-8 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-bold flex items-center justify-center disabled:opacity-50 shadow-sm shrink-0"
                                        >
                                            Enviar
                                        </button>
                                    </form>
                                </div>
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
