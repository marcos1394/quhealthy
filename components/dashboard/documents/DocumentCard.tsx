"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-multi-comp */

import React from "react";
import {
  FileText,
  Image as ImageIcon,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  File,
  Eye,
  Download,
  MoreVertical,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
  status: "verified" | "pending" | "rejected";
  uploadedAt: string;
  size?: string;
  description?: string;
}

interface DocumentCardProps {
  doc: Document;
  onSelect: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
  showActions?: boolean;
  compact?: boolean;
}

const getDocumentIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("pdf")) {
    return <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
  }
  if (["jpg", "png", "jpeg", "webp", "imagen"].some((x) => t.includes(x))) {
    return <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
  }
  if (["certificado", "diploma"].some((x) => t.includes(x))) {
    return <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
  }
  return <File className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
};

const getStatusConfig = (
  status: Document["status"],
  t: (key: string) => string
) => {
  switch (status) {
    case "verified":
      return {
        text: t("card.verified"),
        className:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40",
        icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />,
        dotColor: "bg-emerald-500",
      };
    case "pending":
      return {
        text: t("card.in_review"),
        className:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40",
        icon: <Clock className="w-3.5 h-3.5 animate-pulse" strokeWidth={2} />,
        dotColor: "bg-amber-500",
      };
    case "rejected":
      return {
        text: t("card.rejected"),
        className:
          "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/40",
        icon: <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />,
        dotColor: "bg-red-500",
      };
    default:
      return {
        text: t("card.unknown"),
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
        icon: null,
        dotColor: "bg-gray-400",
      };
  }
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onSelect,
  onDownload,
  onPreview,
  showActions = true,
  compact = false,
}) => {
  const t = useTranslations("DashboardDocuments");
  const statusInfo = getStatusConfig(doc.status, t);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(doc)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(doc)}
      className={cn(
        "relative bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl cursor-pointer transition-all group overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/30 font-sans select-none",
        compact ? "p-4" : "p-5 sm:p-6"
      )}
    >
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Lado Izquierdo: Icono e Información */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            {getDocumentIcon(doc.type)}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {doc.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-400 font-mono">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 shadow-2xs font-sans text-[10px] uppercase font-bold">
                {doc.type}
              </span>
              <span>•</span>
              <span>
                {new Date(doc.uploadedAt).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              {doc.size && (
                <>
                  <span>•</span>
                  <span>{doc.size}</span>
                </>
              )}
            </div>

            {!compact && doc.description && (
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-1 pt-1">
                {doc.description}
              </p>
            )}
          </div>
        </div>

        {/* Lado Derecho: Badge de Estado y Botones de Acción */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs",
              statusInfo.className
            )}
          >
            {statusInfo.icon}
            {!compact && <span>{statusInfo.text}</span>}
            {compact && <span className={cn("w-2 h-2 rounded-full", statusInfo.dotColor)} />}
          </span>

          {showActions && (
            <div className="flex items-center gap-1">
              {onPreview && (
                <button
                  type="button"
                  aria-label={t("actions.preview")}
                  title={t("actions.preview")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(doc);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-100 dark:border-gray-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <Eye className="w-4 h-4" strokeWidth={2} />
                </button>
              )}

              {onDownload && (
                <button
                  type="button"
                  aria-label={t("actions.download")}
                  title={t("actions.download")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(doc);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-100 dark:border-gray-800 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                </button>
              )}

              <button
                type="button"
                aria-label={t("actions.more_options")}
                title={t("actions.more_options")}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-100 dark:border-gray-800 transition-colors shadow-2xs cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de proceso en revisión */}
      {doc.status === "pending" && !compact && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-100 dark:bg-amber-950/30 overflow-hidden">
          <div className="h-full bg-amber-500 w-1/3 animate-pulse rounded-full" />
        </div>
      )}
    </div>
  );
};

export const DocumentGrid: React.FC<{
  documents: Document[];
  onSelect: (doc: Document) => void;
  onDownload?: (doc: Document) => void;
  onPreview?: (doc: Document) => void;
}> = ({ documents, onSelect, onDownload, onPreview }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
    {documents.map((doc) => (
      <DocumentCard
        key={doc.id}
        doc={doc}
        onSelect={onSelect}
        onDownload={onDownload}
        onPreview={onPreview}
      />
    ))}
  </div>
);

export const DocumentList: React.FC<{
  documents: Document[];
  onSelect: (doc: Document) => void;
}> = ({ documents, onSelect }) => (
  <div className="grid grid-cols-1 gap-3 font-sans">
    {documents.map((doc) => (
      <DocumentCard
        key={doc.id}
        doc={doc}
        onSelect={onSelect}
        showActions={false}
        compact={true}
      />
    ))}
  </div>
);