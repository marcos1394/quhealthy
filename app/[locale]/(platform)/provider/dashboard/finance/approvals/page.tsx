"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    approvalService,
    ApprovalRequestDTO,
    ApprovalRequestStatus,
    ApprovalDecisionType,
    ApprovalEntityType,
} from "@/services/approval.service";
import {
    Clock,
    CheckCircle2,
    XCircle,
    CornerUpLeft,
    ChevronRight,
    Filter,
    History,
    Inbox,
    AlertTriangle,
    ArrowRightLeft,
    FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Temporal — en producción viene del contexto de auth
const PROVIDER_ID = 1;

const STATUS_CONFIG: Record<ApprovalRequestStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    [ApprovalRequestStatus.PENDING]: {
        label: "Pendiente",
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/30",
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    [ApprovalRequestStatus.IN_PROGRESS]: {
        label: "En Progreso",
        color: "text-blue-700 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/30",
        icon: <ChevronRight className="w-3.5 h-3.5" />,
    },
    [ApprovalRequestStatus.APPROVED]: {
        label: "Aprobado",
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/30",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    [ApprovalRequestStatus.REJECTED]: {
        label: "Rechazado",
        color: "text-red-700 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700/30",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
    [ApprovalRequestStatus.CANCELLED]: {
        label: "Cancelado",
        color: "text-gray-700 dark:text-gray-300",
        bg: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
};

const ENTITY_ICON: Record<ApprovalEntityType, React.ReactNode> = {
    [ApprovalEntityType.EXECUTION]: <FileCheck2 className="w-5 h-5" />,
    [ApprovalEntityType.TRANSFER]: <ArrowRightLeft className="w-5 h-5" />,
    [ApprovalEntityType.COMMITMENT]: <Clock className="w-5 h-5" />,
};

const ENTITY_LABEL: Record<ApprovalEntityType, string> = {
    [ApprovalEntityType.EXECUTION]: "Ejecución",
    [ApprovalEntityType.TRANSFER]: "Transferencia",
    [ApprovalEntityType.COMMITMENT]: "Compromiso",
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

interface DecisionModalProps {
    request: ApprovalRequestDTO;
    onClose: () => void;
    onDecision: (requestId: number, decision: ApprovalDecisionType, comments: string) => Promise<void>;
}

function DecisionModal({ request, onClose, onDecision }: DecisionModalProps) {
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingDecision, setPendingDecision] = useState<ApprovalDecisionType | null>(null);

    const handleDecision = async (decision: ApprovalDecisionType) => {
        if (decision === ApprovalDecisionType.REJECTED && !comments.trim()) {
            toast.warning("Debes agregar un comentario al rechazar una solicitud", { theme: "colored" });
            return;
        }
        setIsSubmitting(true);
        setPendingDecision(decision);
        try {
            await onDecision(request.id, decision, comments);
            onClose();
        } finally {
            setIsSubmitting(false);
            setPendingDecision(null);
        }
    };

    const statusCfg = STATUS_CONFIG[request.status];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            {ENTITY_ICON[request.entityType]}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{ENTITY_LABEL[request.entityType]}</p>
                            <p className="text-sm font-medium text-gray-500">ID #{request.entityId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <XCircle className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Solicitado por</p>
                            <p className="font-semibold text-gray-900 dark:text-white mt-1">{request.requestedByName || `Usuario #${request.requestedBy}`}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monto</p>
                            <p className="font-bold text-xl text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(request.amount)}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</p>
                            <p className="mt-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{request.description}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Progreso de aprobación</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all duration-500 ease-out"
                                        style={{ width: `${((request.currentStep - 1) / request.totalSteps) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                    Paso {request.currentStep}/{request.totalSteps}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Historial de decisiones previas */}
                    {request.decisions && request.decisions.length > 0 && (
                        <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historial</p>
                            {request.decisions.map((d, i) => (
                                <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                        d.decision === ApprovalDecisionType.APPROVED ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" :
                                        d.decision === ApprovalDecisionType.REJECTED ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                    )}>
                                        {d.decision === ApprovalDecisionType.APPROVED ? <CheckCircle2 className="w-4 h-4" /> :
                                         d.decision === ApprovalDecisionType.REJECTED ? <XCircle className="w-4 h-4" /> :
                                         <CornerUpLeft className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{d.decidedByName || `Usuario #${d.decidedBy}`}</span>
                                            <span className="text-xs text-gray-500 font-medium shrink-0">{d.decidedAt ? formatDate(d.decidedAt) : ""}</span>
                                        </div>
                                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">Paso {d.stepOrder}</p>
                                        {d.comments && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{d.comments}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Comentarios */}
                    <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-6">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Comentarios {pendingDecision === ApprovalDecisionType.REJECTED && <span className="text-red-500 ml-1">*requerido</span>}
                        </label>
                        <Textarea
                            placeholder="Agrega un comentario a tu decisión..."
                            className="rounded-xl resize-none text-sm min-h-[100px] border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap sm:flex-nowrap gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                    <Button
                        onClick={() => handleDecision(ApprovalDecisionType.APPROVED)}
                        disabled={isSubmitting}
                        className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-xl h-11 text-sm font-bold shadow-sm transition-all"
                    >
                        {isSubmitting && pendingDecision === ApprovalDecisionType.APPROVED ? <QhSpinner size="sm" className="mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Aprobar
                    </Button>
                    <Button
                        onClick={() => handleDecision(ApprovalDecisionType.RETURNED)}
                        disabled={isSubmitting}
                        variant="outline"
                        className="flex-1 sm:flex-none border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 rounded-xl h-11 text-sm font-bold transition-all"
                    >
                        {isSubmitting && pendingDecision === ApprovalDecisionType.RETURNED ? <QhSpinner size="sm" className="mr-2" /> : <CornerUpLeft className="w-4 h-4 mr-2" />}
                        Devolver
                    </Button>
                    <Button
                        onClick={() => handleDecision(ApprovalDecisionType.REJECTED)}
                        disabled={isSubmitting}
                        variant="outline"
                        className="flex-1 sm:flex-none border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl h-11 text-sm font-bold transition-all"
                    >
                        {isSubmitting && pendingDecision === ApprovalDecisionType.REJECTED ? <QhSpinner size="sm" className="mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                        Rechazar
                    </Button>
                </div>
            </div>
        </div>
    );
}

function RequestCard({ request, onClick }: { request: ApprovalRequestDTO; onClick: () => void }) {
    const statusCfg = STATUS_CONFIG[request.status];
    return (
        <div
            className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all group"
            onClick={onClick}
        >
            <div className="flex items-center gap-4 sm:w-auto w-full">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-900/20 dark:group-hover:text-emerald-400 transition-colors shrink-0 shadow-sm">
                    {ENTITY_ICON[request.entityType]}
                </div>
                <div className="flex-1 min-w-0 sm:hidden">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(request.amount)}</p>
                </div>
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {ENTITY_LABEL[request.entityType]}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-1", statusCfg.color, statusCfg.bg)}>
                        {statusCfg.icon} {statusCfg.label}
                    </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{request.description}</p>
                <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-2">
                    <span className="truncate max-w-[150px]">{request.requestedByName || `Usuario #${request.requestedBy}`}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                    <span>{formatDate(request.createdAt)}</span>
                </p>
            </div>
            
            <div className="hidden sm:flex flex-col items-end shrink-0 justify-center">
                <p className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(request.amount)}</p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                         <div
                             className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all"
                             style={{ width: `${((request.currentStep - 1) / request.totalSteps) * 100}%` }}
                         />
                    </div>
                    <p className="text-xs font-bold text-gray-500">Paso {request.currentStep}/{request.totalSteps}</p>
                </div>
            </div>
            
            <div className="hidden sm:flex items-center shrink-0 ml-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
            </div>
        </div>
    );
}

export default function ApprovalsPage() {
    const [tab, setTab] = useState<"pending" | "history">("pending");
    const [pendingRequests, setPendingRequests] = useState<ApprovalRequestDTO[]>([]);
    const [historyRequests, setHistoryRequests] = useState<ApprovalRequestDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestDTO | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [pending, history] = await Promise.all([
                approvalService.getPendingRequests(PROVIDER_ID),
                approvalService.getRequestHistory(PROVIDER_ID),
            ]);
            setPendingRequests(pending);
            setHistoryRequests(history);
        } catch {
            toast.error("Error al cargar las solicitudes de aprobación", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDecision = async (requestId: number, decision: ApprovalDecisionType, comments: string) => {
        try {
            await approvalService.processDecision(PROVIDER_ID, requestId, { decision, comments });
            toast.success(
                decision === ApprovalDecisionType.APPROVED ? "Solicitud aprobada" :
                decision === ApprovalDecisionType.REJECTED ? "Solicitud rechazada" :
                "Solicitud devuelta para corrección",
                { theme: "colored" }
            );
            await loadData();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Error al procesar la decisión", { theme: "colored" });
            throw error;
        }
    };

    const displayList = tab === "pending" ? pendingRequests : historyRequests;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bandeja de Aprobaciones</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Gestiona los movimientos financieros que requieren autorización
                    </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center relative shadow-sm">
                    <Inbox className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    {pendingRequests.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-bounce">
                            {pendingRequests.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setTab("pending")}
                    className={cn(
                        "flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all",
                        tab === "pending"
                            ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    <Clock className="w-4 h-4" />
                    Pendientes
                    {pendingRequests.length > 0 && (
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setTab("history")}
                    className={cn(
                        "flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all",
                        tab === "history"
                            ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                >
                    <History className="w-4 h-4" />
                    Historial
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    <QhSpinner size="lg" className="text-emerald-600" />
                    <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando solicitudes...</p>
                </div>
            ) : displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    {tab === "pending" ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0a0a0a] shadow-sm flex items-center justify-center text-gray-400 mb-2">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="text-center max-w-sm">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">Sin solicitudes pendientes</p>
                                <p className="text-sm font-medium text-gray-500 mt-2">
                                    Cuando un movimiento requiera aprobación aparecerá aquí. ¡Todo está al día!
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0a0a0a] shadow-sm flex items-center justify-center text-gray-400 mb-2">
                                <History className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">Sin historial aún</p>
                            <p className="text-sm font-medium text-gray-500 mt-2">
                                No has procesado ninguna solicitud todavía.
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {displayList.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onClick={() => setSelectedRequest(request)}
                        />
                    ))}
                </div>
            )}

            {/* Decision Modal */}
            {selectedRequest && (
                <DecisionModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onDecision={handleDecision}
                />
            )}
        </div>
    );
}
