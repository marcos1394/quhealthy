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
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/30",
        icon: <Clock className="w-3 h-3" />,
    },
    [ApprovalRequestStatus.IN_PROGRESS]: {
        label: "En Progreso",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700/30",
        icon: <ChevronRight className="w-3 h-3" />,
    },
    [ApprovalRequestStatus.APPROVED]: {
        label: "Aprobado",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700/30",
        icon: <CheckCircle2 className="w-3 h-3" />,
    },
    [ApprovalRequestStatus.REJECTED]: {
        label: "Rechazado",
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-700/30",
        icon: <XCircle className="w-3 h-3" />,
    },
    [ApprovalRequestStatus.CANCELLED]: {
        label: "Cancelado",
        color: "text-gray-500",
        bg: "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10",
        icon: <XCircle className="w-3 h-3" />,
    },
};

const ENTITY_ICON: Record<ApprovalEntityType, React.ReactNode> = {
    [ApprovalEntityType.EXECUTION]: <FileCheck2 className="w-4 h-4" />,
    [ApprovalEntityType.TRANSFER]: <ArrowRightLeft className="w-4 h-4" />,
    [ApprovalEntityType.COMMITMENT]: <Clock className="w-4 h-4" />,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#111] border border-black/20 dark:border-white/20 w-full max-w-lg mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a]">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">{ENTITY_ICON[request.entityType]}</span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest">{ENTITY_LABEL[request.entityType]}</p>
                            <p className="text-[10px] text-gray-500">ID #{request.entityId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded">
                        <XCircle className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500">Solicitado por</p>
                            <p className="font-medium mt-0.5">{request.requestedByName || `Usuario #${request.requestedBy}`}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500">Monto</p>
                            <p className="font-bold text-base mt-0.5">{formatCurrency(request.amount)}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500">Descripción</p>
                            <p className="mt-0.5 text-gray-700 dark:text-gray-300">{request.description}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500">Progreso de aprobación</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-gray-100 dark:bg-white/10 h-1.5">
                                    <div
                                        className="bg-black dark:bg-white h-1.5 transition-all"
                                        style={{ width: `${((request.currentStep - 1) / request.totalSteps) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">
                                    Paso {request.currentStep}/{request.totalSteps}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Historial de decisiones previas */}
                    {request.decisions && request.decisions.length > 0 && (
                        <div className="space-y-2 border-t border-black/10 dark:border-white/10 pt-3">
                            <p className="text-[10px] uppercase tracking-widest text-gray-500">Historial</p>
                            {request.decisions.map((d, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                    <span className={cn(
                                        "mt-0.5",
                                        d.decision === ApprovalDecisionType.APPROVED ? "text-emerald-500" :
                                        d.decision === ApprovalDecisionType.REJECTED ? "text-red-500" : "text-amber-500"
                                    )}>
                                        {d.decision === ApprovalDecisionType.APPROVED ? <CheckCircle2 className="w-3 h-3" /> :
                                         d.decision === ApprovalDecisionType.REJECTED ? <XCircle className="w-3 h-3" /> :
                                         <CornerUpLeft className="w-3 h-3" />}
                                    </span>
                                    <div>
                                        <span className="font-medium">{d.decidedByName || `Usuario #${d.decidedBy}`}</span>
                                        <span className="text-gray-500"> · Paso {d.stepOrder} · {d.decidedAt ? formatDate(d.decidedAt) : ""}</span>
                                        {d.comments && <p className="text-gray-400 mt-0.5">{d.comments}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Comentarios */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500">
                            Comentarios {pendingDecision === ApprovalDecisionType.REJECTED && <span className="text-red-500">*requerido</span>}
                        </label>
                        <Textarea
                            placeholder="Agrega un comentario a tu decisión..."
                            className="rounded-none resize-none text-sm min-h-[80px]"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-4 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a]">
                    <Button
                        onClick={() => handleDecision(ApprovalDecisionType.APPROVED)}
                        disabled={isSubmitting}
                        className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-0 rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5"
                    >
                        {isSubmitting && pendingDecision === ApprovalDecisionType.APPROVED ? <QhSpinner size="sm" /> : <CheckCircle2 className="w-3 h-3" />}
                        Aprobar
                    </Button>
                    <Button
                        onClick={() => handleDecision(ApprovalDecisionType.RETURNED)}
                        disabled={isSubmitting}
                        variant="outline"
                        className="border-black/20 dark:border-white/20 rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5 text-amber-600 hover:text-amber-700"
                    >
                        {isSubmitting && pendingDecision === ApprovalDecisionType.RETURNED ? <QhSpinner size="sm" /> : <CornerUpLeft className="w-3 h-3" />}
                        Devolver
                    </Button>
                    <Button
                        onClick={() => handleDecision(ApprovalDecisionType.REJECTED)}
                        disabled={isSubmitting}
                        variant="outline"
                        className="border-red-200 dark:border-red-800/30 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5"
                    >
                        {isSubmitting && pendingDecision === ApprovalDecisionType.REJECTED ? <QhSpinner size="sm" /> : <XCircle className="w-3 h-3" />}
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
            className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4 flex items-center gap-4 cursor-pointer hover:border-black dark:hover:border-white transition-colors group"
            onClick={onClick}
        >
            <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-gray-500 group-hover:border-black dark:group-hover:border-white transition-colors shrink-0">
                {ENTITY_ICON[request.entityType]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 border border-black/10 dark:border-white/10 px-1.5 py-0.5">
                        {ENTITY_LABEL[request.entityType]}
                    </span>
                    <span className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest border px-1.5 py-0.5", statusCfg.color, statusCfg.bg)}>
                        {statusCfg.icon} {statusCfg.label}
                    </span>
                </div>
                <p className="text-sm font-medium truncate">{request.description}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                    {request.requestedByName || `Usuario #${request.requestedBy}`} · {formatDate(request.createdAt)}
                </p>
            </div>
            <div className="text-right shrink-0">
                <p className="font-bold">{formatCurrency(request.amount)}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Paso {request.currentStep}/{request.totalSteps}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0" />
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Bandeja de Aprobaciones</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Gestiona los movimientos financieros que requieren autorización
                    </p>
                </div>
                <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center relative">
                    <Inbox className="w-4 h-4 text-gray-500" />
                    {pendingRequests.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                            {pendingRequests.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-black/10 dark:border-white/10 gap-6">
                <button
                    onClick={() => setTab("pending")}
                    className={cn(
                        "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest pb-3 border-b-2 transition-colors",
                        tab === "pending"
                            ? "border-black dark:border-white text-black dark:text-white"
                            : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                >
                    <Clock className="w-3 h-3" />
                    Pendientes
                    {pendingRequests.length > 0 && (
                        <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setTab("history")}
                    className={cn(
                        "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest pb-3 border-b-2 transition-colors",
                        tab === "history"
                            ? "border-black dark:border-white text-black dark:text-white"
                            : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    )}
                >
                    <History className="w-3 h-3" />
                    Historial
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
                    <QhSpinner size="lg" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cargando solicitudes...</p>
                </div>
            ) : displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4 border border-dashed border-black/20 dark:border-white/20">
                    {tab === "pending" ? (
                        <>
                            <CheckCircle2 className="w-8 h-8 text-gray-300" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-500">Sin solicitudes pendientes</p>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                                    Cuando un movimiento requiera aprobación aparecerá aquí
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <History className="w-8 h-8 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">Sin historial aún</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
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
