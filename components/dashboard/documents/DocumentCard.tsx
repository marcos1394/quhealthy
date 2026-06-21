"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Award, Clock, CheckCircle2, AlertCircle, File, Eye, Download, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export interface Document {
  id: number; name: string; type: string; url: string; status: "verified" | "pending" | "rejected";
  uploadedAt: string; size?: string; description?: string;
}

interface DocumentCardProps {
  doc: Document; onSelect: (doc: Document) => void; onDownload?: (doc: Document) => void;
  onPreview?: (doc: Document) => void; showActions?: boolean; compact?: boolean;
}

const getDocumentIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("pdf")) return <FileText className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />;
  if (["jpg", "png", "jpeg", "webp", "imagen"].some(x => t.includes(x))) return <ImageIcon className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />;
  if (["certificado", "diploma"].some(x => t.includes(x))) return <Award className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />;
  return <File className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />;
};

const getStatusConfig = (status: Document["status"], t: (key: string, values?: Record<string, string | number | Date>) => string) => {
  switch (status) {
    case "verified": return { text: t('card.verified', { defaultValue: 'VERIFICADO' }), className: "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />, dotColor: "bg-emerald-500" };
    case "pending": return { text: t('card.in_review', { defaultValue: 'EN REVISIÓN' }), className: "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400", icon: <Clock className="w-3 h-3" strokeWidth={1.5} />, dotColor: "bg-amber-500" };
    case "rejected": return { text: t('card.rejected', { defaultValue: 'RECHAZADO' }), className: "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400", icon: <AlertCircle className="w-3 h-3" strokeWidth={1.5} />, dotColor: "bg-red-500" };
    default: return { text: t('card.unknown', { defaultValue: 'DESCONOCIDO' }), className: "border-gray-500/30 bg-gray-50 text-gray-600 dark:bg-[#111] dark:text-gray-400", icon: null, dotColor: "bg-gray-500" };
  }
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onSelect, onDownload, onPreview, showActions = true, compact = false }) => {
  const t = useTranslations('DashboardDocuments');
  const statusInfo = getStatusConfig(doc.status, t);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative bg-white dark:bg-[#0a0a0a] border-b border-r border-black/10 dark:border-white/10 cursor-pointer transition-colors group overflow-hidden rounded-none",
        "hover:bg-gray-50 dark:hover:bg-[#050505]",
        compact ? "p-4" : "p-6"
      )}
      onClick={() => onSelect(doc)}>
      
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-black group-hover:border-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black dark:group-hover:border-white transition-colors">
            {getDocumentIcon(doc.type)}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-xs uppercase tracking-widest text-black dark:text-white truncate mb-1.5">
              {doc.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">
              <span className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-2 py-0.5">{doc.type}</span>
              <span>{new Date(doc.uploadedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</span>
              {doc.size && <span>{doc.size}</span>}
            </div>
            {!compact && doc.description && (
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-semibold line-clamp-1 border-t border-black/10 dark:border-white/10 pt-2">
                {doc.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 mt-2 sm:mt-0">
          <span className={cn("border px-2 py-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest rounded-none", statusInfo.className)}>
            {statusInfo.icon}
            {!compact && <span>{statusInfo.text}</span>}
            {compact && <span className={cn("w-1.5 h-1.5", statusInfo.dotColor)} />}
          </span>
          
          {showActions && (
            <div className="flex items-center gap-0">
              {onPreview && (
                <button aria-label="Preview document" onClick={e => { e.stopPropagation(); onPreview(doc); }} className="w-8 h-8 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors rounded-none">
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              {onDownload && (
                <button aria-label="Download document" onClick={e => { e.stopPropagation(); onDownload(doc); }} className="w-8 h-8 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors rounded-none">
                  <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
              <button aria-label="More options" className="w-8 h-8 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors rounded-none">
                <MoreVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Indicador de proceso técnico estricto */}
      {doc.status === "pending" && !compact && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-black dark:bg-white w-1/3 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export const DocumentGrid: React.FC<{ documents: Document[]; onSelect: (doc: Document) => void; onDownload?: (doc: Document) => void; onPreview?: (doc: Document) => void }> = ({ documents, onSelect, onDownload, onPreview }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
    {documents.map((doc) => (
      <DocumentCard key={doc.id} doc={doc} onSelect={onSelect} onDownload={onDownload} onPreview={onPreview} />
    ))}
  </div>
);

export const DocumentList: React.FC<{ documents: Document[]; onSelect: (doc: Document) => void }> = ({ documents, onSelect }) => (
  <div className="grid grid-cols-1 gap-0 border-t border-l border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
    {documents.map((doc) => (
      <DocumentCard key={doc.id} doc={doc} onSelect={onSelect} showActions={false} compact={true} />
    ))}
  </div>
);