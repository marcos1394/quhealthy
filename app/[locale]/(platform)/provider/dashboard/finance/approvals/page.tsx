"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Clock,
  CheckCircle2,
  XCircle,
  CornerUpLeft,
  ChevronRight,
  History,
  Inbox,
  ArrowRightLeft,
  FileCheck2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  approvalService,
  ApprovalRequestDTO,
  ApprovalRequestStatus,
  ApprovalDecisionType,
  ApprovalEntityType,
} from "@/services/approval.service";

// Temporal — en producción proviene del contexto de sesión / usuario
const PROVIDER_ID = 1;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

// ── COMPONENTE MODAL DE DECISIÓN DE APROBACIÓN ───────────────────────
interface DecisionModalProps {
  request: ApprovalRequestDTO;
  onClose: () => void;
  onDecision: (
    requestId: number,
    decision: ApprovalDecisionType,
    comments: string
  ) => Promise<void>;
}

function DecisionModal({ request, onClose, onDecision }: DecisionModalProps) {
  const t = useTranslations("Approvals");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDecision, setPendingDecision] =
    useState<ApprovalDecisionType | null>(null);

  const handleDecision = async (decision: ApprovalDecisionType) => {
    if (decision === ApprovalDecisionType.REJECTED && !comments.trim()) {
      toast.warning(t("toasts.reject_comment_required"));
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

  const entityIcons: Record<ApprovalEntityType, React.ReactNode> = {
    [ApprovalEntityType.EXECUTION]: <FileCheck2 className="w-5 h-5" strokeWidth={2} />,
    [ApprovalEntityType.TRANSFER]: <ArrowRightLeft className="w-5 h-5" strokeWidth={2} />,
    [ApprovalEntityType.COMMITMENT]: <Clock className="w-5 h-5" strokeWidth={2} />,
  };

  const entityKeyMap: Record<ApprovalEntityType, string> = {
    [ApprovalEntityType.EXECUTION]: "entities.execution",
    [ApprovalEntityType.TRANSFER]: "entities.transfer",
    [ApprovalEntityType.COMMITMENT]: "entities.commitment",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              {entityIcons[request.entityType]}
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {t(entityKeyMap[request.entityType])}
              </p>
              <p className="text-xs font-mono text-gray-400">
                {t("modal.title_id", { id: request.entityId })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 transition-colors"
          >
            <XCircle className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Contenido Modal */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("modal.requested_by")}
              </p>
              <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">
                {request.requestedByName ||
                  t("card.user_fallback", { id: request.requestedBy })}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("modal.amount")}
              </p>
              <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(request.amount)}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("modal.description")}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                {request.description}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                {t("modal.progress")}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${
                        ((request.currentStep - 1) / request.totalSteps) * 100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {t("card.step", {
                    current: request.currentStep,
                    total: request.totalSteps,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Historial de decisiones previas */}
          {request.decisions && request.decisions.length > 0 && (
            <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {t("modal.history_title")}
              </p>
              {request.decisions.map((d, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-gray-50/50 dark:bg-[#050505] p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800"
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                      d.decision === ApprovalDecisionType.APPROVED
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                        : d.decision === ApprovalDecisionType.REJECTED
                        ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                        : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                    )}
                  >
                    {d.decision === ApprovalDecisionType.APPROVED ? (
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                    ) : d.decision === ApprovalDecisionType.REJECTED ? (
                      <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    ) : (
                      <CornerUpLeft className="w-3.5 h-3.5" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {d.decidedByName ||
                          t("card.user_fallback", { id: d.decidedBy })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {d.decidedAt ? formatDate(d.decidedAt) : ""}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {t("modal.step_badge", { step: d.stepOrder })}
                    </p>
                    {d.comments && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                        {d.comments}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Campo de Comentarios */}
          <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-6">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <span>{t("modal.comments_label")}</span>
              {pendingDecision === ApprovalDecisionType.REJECTED && (
                <span className="text-rose-500 text-[10px] font-bold">
                  {t("modal.comments_required")}
                </span>
              )}
            </label>
            <Textarea
              placeholder={t("modal.comments_placeholder")}
              className="rounded-2xl resize-none text-xs min-h-[90px] border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        {/* Acciones Modal */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0">
          <Button
            onClick={() => handleDecision(ApprovalDecisionType.APPROVED)}
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 border-0 rounded-xl h-11 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting &&
            pendingDecision === ApprovalDecisionType.APPROVED ? (
              <QhSpinner size="sm" />
            ) : (
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            )}
            <span>{t("modal.btn_approve")}</span>
          </Button>

          <Button
            onClick={() => handleDecision(ApprovalDecisionType.RETURNED)}
            disabled={isSubmitting}
            variant="outline"
            className="flex-1 sm:flex-none border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-xl h-11 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting &&
            pendingDecision === ApprovalDecisionType.RETURNED ? (
              <QhSpinner size="sm" />
            ) : (
              <CornerUpLeft className="w-4 h-4" strokeWidth={2} />
            )}
            <span>{t("modal.btn_return")}</span>
          </Button>

          <Button
            onClick={() => handleDecision(ApprovalDecisionType.REJECTED)}
            disabled={isSubmitting}
            variant="outline"
            className="flex-1 sm:flex-none border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl h-11 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting &&
            pendingDecision === ApprovalDecisionType.REJECTED ? (
              <QhSpinner size="sm" />
            ) : (
              <XCircle className="w-4 h-4" strokeWidth={2} />
            )}
            <span>{t("modal.btn_reject")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTE TARJETA DE SOLICITUD ─────────────────────────────────
function RequestCard({
  request,
  onClick,
}: {
  request: ApprovalRequestDTO;
  onClick: () => void;
}) {
  const t = useTranslations("Approvals");

  const statusConfig: Record<
    ApprovalRequestStatus,
    { labelKey: string; color: string; bg: string; icon: React.ReactNode }
  > = {
    [ApprovalRequestStatus.PENDING]: {
      labelKey: "status.pending",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40",
      icon: <Clock className="w-3.5 h-3.5" strokeWidth={2} />,
    },
    [ApprovalRequestStatus.IN_PROGRESS]: {
      labelKey: "status.in_progress",
      color: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40",
      icon: <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />,
    },
    [ApprovalRequestStatus.APPROVED]: {
      labelKey: "status.approved",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40",
      icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />,
    },
    [ApprovalRequestStatus.REJECTED]: {
      labelKey: "status.rejected",
      color: "text-rose-700 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40",
      icon: <XCircle className="w-3.5 h-3.5" strokeWidth={2} />,
    },
    [ApprovalRequestStatus.CANCELLED]: {
      labelKey: "status.cancelled",
      color: "text-gray-700 dark:text-gray-300",
      bg: "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
      icon: <XCircle className="w-3.5 h-3.5" strokeWidth={2} />,
    },
  };

  const entityIcons: Record<ApprovalEntityType, React.ReactNode> = {
    [ApprovalEntityType.EXECUTION]: <FileCheck2 className="w-5 h-5" strokeWidth={2} />,
    [ApprovalEntityType.TRANSFER]: <ArrowRightLeft className="w-5 h-5" strokeWidth={2} />,
    [ApprovalEntityType.COMMITMENT]: <Clock className="w-5 h-5" strokeWidth={2} />,
  };

  const entityKeyMap: Record<ApprovalEntityType, string> = {
    [ApprovalEntityType.EXECUTION]: "entities.execution",
    [ApprovalEntityType.TRANSFER]: "entities.transfer",
    [ApprovalEntityType.COMMITMENT]: "entities.commitment",
  };

  const statusCfg = statusConfig[request.status];

  return (
    <div
      onClick={onClick}
      className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:border-emerald-500/40 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-4 sm:w-auto w-full">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-950/30 dark:group-hover:text-emerald-400 transition-colors shrink-0 shadow-sm">
          {entityIcons[request.entityType]}
        </div>
        <div className="flex-1 min-w-0 sm:hidden">
          <p className="font-bold text-base font-mono text-gray-900 dark:text-white">
            {formatCurrency(request.amount)}
          </p>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
            {t(entityKeyMap[request.entityType])}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-0.5 border shadow-sm",
              statusCfg.color,
              statusCfg.bg
            )}
          >
            {statusCfg.icon}
            <span>{t(statusCfg.labelKey)}</span>
          </span>
        </div>
        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
          {request.description}
        </p>
        <p className="text-[10px] font-medium text-gray-400 mt-1 flex items-center gap-2">
          <span className="truncate max-w-[150px]">
            {request.requestedByName ||
              t("card.user_fallback", { id: request.requestedBy })}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="font-mono">{formatDate(request.createdAt)}</span>
        </p>
      </div>

      <div className="hidden sm:flex flex-col items-end shrink-0 justify-center">
        <p className="font-bold text-base font-mono text-gray-900 dark:text-white">
          {formatCurrency(request.amount)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 dark:bg-emerald-400 h-full transition-all"
              style={{
                width: `${
                  ((request.currentStep - 1) / request.totalSteps) * 100
                }%`,
              }}
            />
          </div>
          <p className="text-[10px] font-bold text-gray-400">
            {t("card.step", {
              current: request.currentStep,
              total: request.totalSteps,
            })}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center shrink-0 ml-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/60 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-colors">
          <ChevronRight
            className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
}

// ── PÁGINA PRINCIPAL: BANDEJA DE APROBACIONES ──────────────────────────
export default function ApprovalsPage() {
  const t = useTranslations("Approvals");

  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [pendingRequests, setPendingRequests] = useState<
    ApprovalRequestDTO[]
  >([]);
  const [historyRequests, setHistoryRequests] = useState<
    ApprovalRequestDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequestDTO | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pending, history] = await Promise.all([
        approvalService.getPendingRequests(PROVIDER_ID),
        approvalService.getRequestHistory(PROVIDER_ID),
      ]);
      setPendingRequests(pending || []);
      setHistoryRequests(history || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDecision = async (
    requestId: number,
    decision: ApprovalDecisionType,
    comments: string
  ) => {
    try {
      await approvalService.processDecision(PROVIDER_ID, requestId, {
        decision,
        comments,
      });
      toast.success(
        decision === ApprovalDecisionType.APPROVED
          ? t("toasts.approved_success")
          : decision === ApprovalDecisionType.REJECTED
          ? t("toasts.rejected_success")
          : t("toasts.returned_success")
      );
      await loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || t("toasts.process_error"));
      throw error;
    }
  };

  const displayList = tab === "pending" ? pendingRequests : historyRequests;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0 relative">
              <Inbox className="w-7 h-7" strokeWidth={2} />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── NAVEGACIÓN PESTAÑAS ───────────────────────────────────────── */}
        <div className="flex bg-gray-100/70 dark:bg-gray-800/40 p-1.5 rounded-2xl w-fit shadow-sm gap-1">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={cn(
              "flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-xl transition-all",
              tab === "pending"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Clock className="w-4 h-4" strokeWidth={2} />
            <span>{t("tabs.pending")}</span>
            {pendingRequests.length > 0 && (
              <span className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab("history")}
            className={cn(
              "flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-xl transition-all",
              tab === "history"
                ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <History className="w-4 h-4" strokeWidth={2} />
            <span>{t("tabs.history")}</span>
          </button>
        </div>

        {/* ── CONTENIDO PRINCIPAL / ESTADOS ────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-12">
            <QhSpinner size="lg" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
              {t("loading")}
            </p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            {tab === "pending" ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" strokeWidth={2} />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  {t("empty.pending_title")}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                  {t("empty.pending_desc")}
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                  <History className="w-7 h-7" strokeWidth={2} />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  {t("empty.history_title")}
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                  {t("empty.history_desc")}
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

        {/* ── MODAL DECISIÓN ────────────────────────────────────────────── */}
        {selectedRequest && (
          <DecisionModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onDecision={handleDecision}
          />
        )}

      </div>
    </div>
  );
}