"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Eye,
  Download,
  FileText,
  Calendar,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
  Copy,
  Image as ImageIcon,
  FileCode,
  Film,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Document } from "./DocumentCard";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/handleApiError";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DocumentDetailModalProps {
  doc: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: number) => void;
  onDownload?: (doc: Document) => void;
  onShare?: (doc: Document) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  doc,
  isOpen,
  onClose,
  onDelete,
  onDownload,
  onShare,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewError] = useState(false);
  const t = useTranslations("DashboardDocumentDetail");

  if (!doc) return null;

  const getStatusInfo = () => {
    switch (doc.status) {
      case "verified":
        return {
          icon: <CheckCircle2 className="w-4 h-4" strokeWidth={2} />,
          text: t("status.verified"),
          className:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40",
          description: t("status.verified_desc"),
        };
      case "pending":
        return {
          icon: <Clock className="w-4 h-4 animate-pulse" strokeWidth={2} />,
          text: t("status.pending"),
          className:
            "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40",
          description: t("status.pending_desc"),
        };
      case "rejected":
        return {
          icon: <AlertTriangle className="w-4 h-4" strokeWidth={2} />,
          text: t("status.rejected"),
          className:
            "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40",
          description: t("status.rejected_desc"),
        };
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4" strokeWidth={2} />,
          text: "UNKNOWN",
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
          description: "",
        };
    }
  };
  const statusInfo = getStatusInfo();

  const getFileTypeInfo = (type: string) => {
    const fileType = type.toLowerCase();
    if (fileType.includes("pdf")) {
      return {
        icon: <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />,
        canPreview: true,
      };
    }
    if (["jpg", "png", "jpeg", "webp", "imagen"].some((x) => fileType.includes(x))) {
      return {
        icon: <ImageIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />,
        canPreview: true,
      };
    }
    if (fileType.includes("certificado")) {
      return {
        icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />,
        canPreview: true,
      };
    }
    if (fileType.includes("video")) {
      return {
        icon: <Film className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />,
        canPreview: false,
      };
    }
    return {
      icon: <FileCode className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />,
      canPreview: false,
    };
  };
  const fileTypeInfo = getFileTypeInfo(doc.type);

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete?.(doc.id);
      toast.success(t("deleted_success"));
      onClose();
    } catch (e) {
      handleApiError(e);
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload?.(doc);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (doc.url) {
      navigator.clipboard.writeText(doc.url);
      toast.success(t("link_copied"));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDownloading && !isDeleting) {
          onClose();
          setTimeout(() => setShowDeleteConfirm(false), 300);
        }
      }}
    >
      <DialogContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white sm:max-w-2xl p-0 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl font-sans transition-colors">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] shrink-0">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-xs">
              {fileTypeInfo.icon}
            </div>

            <div className="flex-1 min-w-0 pr-2 space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t("doc_id", { id: doc.id })}
              </p>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                {doc.name}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                {doc.description || t("default_description")}
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 shrink-0 cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── BODY ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a] flex flex-col p-6 sm:p-8 space-y-6">
          {/* Previsualizador */}
          <div
            className={cn(
              "w-full min-h-[180px] rounded-2xl border flex flex-col items-center justify-center p-6 text-center transition-colors shadow-2xs",
              fileTypeInfo.canPreview
                ? "bg-gray-900 text-white border-gray-800"
                : "bg-gray-50/60 dark:bg-[#050505] border-gray-100 dark:border-gray-800 text-gray-500"
            )}
          >
            {fileTypeInfo.canPreview && !previewError ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-800/80 border border-gray-700 flex items-center justify-center mx-auto text-emerald-400 shadow-xs">
                  <Eye className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">
                    {t("preview_available")}
                  </p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>{t("open_preview")}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mx-auto shadow-2xs">
                  {fileTypeInfo.icon}
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs">
                  {t("preview_unavailable")}
                </p>
              </div>
            )}
          </div>

          {/* Matriz de Metadatos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Formato */}
            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("format")}</span>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white uppercase font-mono pl-6">
                {doc.type}
              </p>
            </div>

            {/* Fecha de Registro */}
            <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("uploaded_date")}</span>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white font-mono pl-6">
                {new Date(doc.uploadedAt).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Peso */}
            {doc.size && (
              <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("file_size")}</span>
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-white font-mono pl-6">
                  {doc.size}
                </p>
              </div>
            )}

            {/* Estado Auditoría */}
            <div
              className={cn(
                "p-4 rounded-2xl border space-y-1 shadow-2xs",
                statusInfo.className
              )}
            >
              <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                <span>{t("audit_status")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold pl-6">
                {statusInfo.icon}
                <span>{statusInfo.text}</span>
              </div>
            </div>
          </div>

          {/* Botones de Acción sobre Enlace */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("copy_link")}</span>
            </button>

            {onShare && (
              <button
                type="button"
                onClick={() => onShare(doc)}
                className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("share")}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── FOOTER DE ACCIONES ────────────────────────────────────────── */}
        <div className="bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 shrink-0">
          <div className="flex-1">
            {onDelete && (
              <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      {t("cancel")}
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0"
                    >
                      {isDeleting ? (
                        <>
                          <QhSpinner size="sm" className="text-white" />
                          <span>{t("deleting")}</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                          <span>{t("confirm_delete")}</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="delete"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full sm:w-auto h-11 px-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                      <span>{t("btn_delete")}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {t("btn_close")}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-0"
            >
              {isDownloading ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("downloading")}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" strokeWidth={2} />
                  <span>{t("btn_download")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};