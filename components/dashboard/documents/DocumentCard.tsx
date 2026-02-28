"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Award, Clock, CheckCircle, AlertCircle, File, Eye, Download, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  if (t.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (["jpg", "png", "jpeg", "webp", "imagen"].some(x => t.includes(x))) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (["certificado", "diploma"].some(x => t.includes(x))) return <Award className="w-5 h-5 text-amber-500" />;
  return <File className="w-5 h-5 text-slate-400" />;
};

const getStatusConfig = (status: Document["status"], t: (key: string) => string) => {
  switch (status) {
    case "verified": return { text: t('card.verified'), className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0", icon: <CheckCircle className="w-3 h-3" />, dotColor: "bg-emerald-500" };
    case "pending": return { text: t('card.in_review'), className: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0", icon: <Clock className="w-3 h-3" />, dotColor: "bg-amber-500" };
    case "rejected": return { text: t('card.rejected'), className: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-0", icon: <AlertCircle className="w-3 h-3" />, dotColor: "bg-red-500" };
    default: return { text: t('card.unknown'), className: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-0", icon: null, dotColor: "bg-slate-500" };
  }
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onSelect, onDownload, onPreview, showActions = true, compact = false }) => {
  const t = useTranslations('DashboardDocuments');
  const statusInfo = getStatusConfig(doc.status, t);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer transition-all group overflow-hidden",
        "hover:border-medical-200 dark:hover:border-medical-500/20 hover:shadow-sm",
        compact ? "p-3" : "p-4"
      )}
      onClick={() => onSelect(doc)}>
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn("p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors", compact ? "p-2" : "p-2.5")}>
            {getDocumentIcon(doc.type)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={cn("font-medium text-slate-900 dark:text-white truncate group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors", compact ? "text-sm" : "text-sm")}>
              {doc.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
              <span className="font-medium">{doc.type.toUpperCase()}</span><span>•</span>
              <span>{new Date(doc.uploadedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}</span>
              {doc.size && <><span>•</span><span>{doc.size}</span></>}
            </div>
            {!compact && doc.description && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-light">{doc.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={cn("transition-all flex items-center gap-1", statusInfo.className, compact ? "text-[10px] px-1.5 py-0" : "px-2 py-0.5 text-xs")}>
            {statusInfo.icon}
            <span className={compact ? "sr-only" : undefined}>{statusInfo.text}</span>
            {compact && <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dotColor)} />}
          </Badge>
          {showActions && (
            <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }} className="flex items-center gap-0.5">
              {onPreview && <button aria-label="Preview document" onClick={e => { e.stopPropagation(); onPreview(doc); }} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Eye className="w-3.5 h-3.5" /></button>}
              {onDownload && <button aria-label="Download document" onClick={e => { e.stopPropagation(); onDownload(doc); }} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><Download className="w-3.5 h-3.5" /></button>}
              <button aria-label="More options" className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><MoreVertical className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </div>
      </div>
      {doc.status === "pending" && !compact && (
        <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="h-full bg-gradient-to-r from-amber-400 to-amber-500" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
        </motion.div>
      )}
    </motion.div>
  );
};

export const DocumentGrid: React.FC<{ documents: Document[]; onSelect: (doc: Document) => void; onDownload?: (doc: Document) => void; onPreview?: (doc: Document) => void }> = ({ documents, onSelect, onDownload, onPreview }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{documents.map((doc, i) => <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}><DocumentCard doc={doc} onSelect={onSelect} onDownload={onDownload} onPreview={onPreview} /></motion.div>)}</div>
);

export const DocumentList: React.FC<{ documents: Document[]; onSelect: (doc: Document) => void }> = ({ documents, onSelect }) => (
  <div className="space-y-1.5">{documents.map((doc, i) => <motion.div key={doc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}><DocumentCard doc={doc} onSelect={onSelect} showActions={false} compact={true} /></motion.div>)}</div>
);