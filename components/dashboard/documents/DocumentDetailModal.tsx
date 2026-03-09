"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye, Download, FileText, Calendar, HardDrive, ShieldCheck, AlertTriangle, CheckCircle, Clock, X, ExternalLink, Copy, Loader2, Image as ImageIcon, FileCode, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { Document } from "./DocumentCard";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { handleApiError } from '@/lib/handleApiError';

interface DocumentDetailModalProps {
  doc: Document | null; isOpen: boolean; onClose: () => void;
  onDelete?: (id: number) => void; onDownload?: (doc: Document) => void; onShare?: (doc: Document) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({ doc, isOpen, onClose, onDelete, onDownload, onShare }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewError] = useState(false);
  const t = useTranslations('DashboardDocumentDetail');

  if (!doc) return null;

  const getStatusInfo = () => {
    switch (doc.status) {
      case "verified": return { icon: <CheckCircle className="w-3.5 h-3.5" />, text: t('status.verified'), className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20", description: t('status.verified_desc') };
      case "pending": return { icon: <Clock className="w-3.5 h-3.5" />, text: t('status.pending'), className: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20", description: t('status.pending_desc') };
      case "rejected": return { icon: <AlertTriangle className="w-3.5 h-3.5" />, text: t('status.rejected'), className: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20", description: t('status.rejected_desc') };
      default: return { icon: <AlertTriangle className="w-3.5 h-3.5" />, text: "Unknown", className: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700", description: "" };
    }
  };
  const statusInfo = getStatusInfo();

  const getFileTypeInfo = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("pdf")) return { icon: <FileText className="w-10 h-10 text-red-500" />, canPreview: true };
    if (["jpg", "png", "imagen"].some(x => t.includes(x))) return { icon: <ImageIcon className="w-10 h-10 text-blue-500" />, canPreview: true };
    if (t.includes("certificado")) return { icon: <ShieldCheck className="w-10 h-10 text-amber-500" />, canPreview: true };
    if (t.includes("video")) return { icon: <Film className="w-10 h-10 text-medical-500" />, canPreview: false };
    return { icon: <FileCode className="w-10 h-10 text-slate-400" />, canPreview: false };
  };
  const fileTypeInfo = getFileTypeInfo(doc.type);

  const handleDelete = async () => {
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    setIsDeleting(true);
    try { await onDelete?.(doc.id); toast.success("Document deleted"); onClose(); }
    catch (e) { handleApiError(e); setIsDeleting(false); }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try { await onDownload?.(doc); toast.success("Download started"); }
    catch (e) { handleApiError(e); }
    finally { setIsDownloading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-xl transition-colors">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">{fileTypeInfo.icon}</div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white truncate mb-0.5">{doc.name}</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm font-light">{doc.description || "Document uploaded to QuHealthy"}</DialogDescription>
                <div className="mt-2">
                  <Badge variant="outline" className={cn("flex items-center gap-1.5 w-fit", statusInfo.className)}>{statusInfo.icon}<span>{statusInfo.text}</span></Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="default" onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-8 w-8"><X className="w-4 h-4" /></Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Preview */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn("w-full h-48 rounded-xl border-2 border-dashed overflow-hidden transition-all",
              fileTypeInfo.canPreview ? "border-medical-200 dark:border-medical-500/20 bg-slate-50 dark:bg-slate-800/30" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20")}>
            {fileTypeInfo.canPreview && !previewError ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Eye className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-light">Preview available</p>
                  <Button variant="outline" size="sm" className="border-medical-200 dark:border-medical-500/20 text-medical-600 dark:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10 rounded-lg text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />Open in new tab
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">{fileTypeInfo.icon}<span className="text-xs font-light">Preview not available for this file type</span></div>
            )}
          </motion.div>

          {/* Metadata */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><HardDrive className="w-2.5 h-2.5" />File Type</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white uppercase bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg inline-block border border-slate-200 dark:border-slate-700">{doc.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />Upload Date</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg inline-block border border-slate-200 dark:border-slate-700">
                {new Date(doc.uploadedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            {doc.size && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><HardDrive className="w-2.5 h-2.5" />Size</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg inline-block border border-slate-200 dark:border-slate-700">{doc.size}</p>
              </div>
            )}
            <div className="space-y-1 md:col-span-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" />Verification Status</p>
              <div className={cn("flex items-start gap-2.5 px-3 py-2.5 rounded-xl border", statusInfo.className)}>
                {statusInfo.icon}
                <div className="flex-1">
                  <p className="font-medium text-xs mb-0.5">{statusInfo.text}</p>
                  <p className="text-[10px] opacity-80 font-light">{statusInfo.description}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(doc.url); toast.success("Link copied"); }}
              className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs">
              <Copy className="w-3 h-3 mr-1" />Copy Link
            </Button>
            {onShare && (
              <Button variant="outline" size="sm" onClick={() => onShare(doc)}
                className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />Share
              </Button>
            )}
          </motion.div>
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-800" />

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          {onDelete && (
            <div className="flex gap-1.5">
              <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
                  <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs">Cancel</Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 rounded-lg text-xs">
                      {isDeleting ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Deleting...</> : <><Trash2 className="w-3 h-3 mr-1" />Confirm</>}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="delete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs">
                      <Trash2 className="w-3 h-3 mr-1" />Delete
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose}
              className="flex-1 sm:flex-none border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm">
              Close
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading}
              className="flex-1 sm:flex-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-xl shadow-none text-sm">
              {isDownloading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Downloading...</> : <><Download className="w-3.5 h-3.5 mr-1.5" />Download</>}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};