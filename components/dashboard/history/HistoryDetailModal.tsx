"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, User, FileText, Clock, MapPin, DollarSign, MessageSquare, Download, Share2, X, CheckCircle2, Video, Phone, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { HistoryEntry } from "./HistoryTable";
import { handleApiError } from '@/lib/handleApiError';

type UserRole = "paciente" | "proveedor";

interface HistoryDetailModalProps {
  entry: HistoryEntry | null;
  role: UserRole;
  onOpenChange: (open: boolean) => void;
  onDownloadReceipt?: (entry: HistoryEntry) => void;
  onShare?: (entry: HistoryEntry) => void;
}

const getRatingStars = (rating: number) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={cn("w-5 h-5", i < rating ? "text-amber-500 fill-amber-500" : "text-slate-200 dark:text-slate-700")} />
    ))}
  </div>
);

const getServiceIcon = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes("video") || normalized.includes("teleconsulta")) return <Video className="w-5 h-5 text-medical-600 dark:text-medical-400" />;
  if (normalized.includes("presencial") || normalized.includes("consulta")) return <User className="w-5 h-5 text-medical-600 dark:text-medical-400" />;
  if (normalized.includes("llamada") || normalized.includes("telefónica")) return <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  return <FileText className="w-5 h-5 text-slate-400" />;
};

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ entry, role, onOpenChange, onDownloadReceipt, onShare }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const t = useTranslations("DashboardHistoryDetail");

  if (!entry) return null;

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const configs: Record<string, { text: string; className: string; icon: React.ReactNode }> = {
      completed: { text: t("status_completed" as never) || "Completed", className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
      cancelled: { text: t("status_cancelled" as never) || "Cancelled", className: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20", icon: <X className="w-3 h-3" /> },
      pending: { text: t("status_pending" as never) || "Pending", className: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20", icon: <Clock className="w-3 h-3" /> },
    };
    const config = configs[status] || configs.completed;
    return <Badge variant="outline" className={cn("flex items-center gap-1 text-xs", config.className)}>{config.icon}{config.text}</Badge>;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadReceipt?.(entry);
      toast.success(t("download_success"));
    } catch {
      return;
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    onShare?.(entry);
    toast.success(t("share_success"));
  };

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-0 transition-colors">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 flex-1">
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }}
                  className="p-2.5 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
                  {getServiceIcon(entry.type)}
                </motion.div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2.5 mb-1">
                    <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">{t("title")}</DialogTitle>
                    {getStatusBadge(entry.status)}
                  </div>
                  <DialogDescription className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-sm font-light">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{format(parseISO(entry.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                  </DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="default" onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Main Grid */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Person */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3" /> {role === "paciente" ? t("specialist_label") : t("patient_label")}
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <p className="text-base font-semibold text-slate-900 dark:text-white">
                  {role === "paciente" ? entry.provider?.name : entry.client?.name}
                </p>
                {role === "paciente" && entry.provider?.specialty && (
                  <p className="text-sm text-medical-600 dark:text-medical-400 font-medium">{entry.provider.specialty}</p>
                )}
                {entry.provider?.location && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-light">
                    <MapPin className="w-3 h-3" />{entry.provider.location}
                  </p>
                )}
              </div>
            </div>

            {/* Service */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> {t("service_type")}
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <p className="text-base font-semibold text-slate-900 dark:text-white">{entry.type}</p>
                {entry.duration && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-medical-600 dark:text-medical-400" />
                    <span className="font-medium">{entry.duration}</span>
                  </p>
                )}
                {entry.cost && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />${entry.cost}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* Rating */}
          {entry.rating && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3" /> {role === "paciente" ? t("your_rating") : t("received_rating")}
              </p>
              <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t("stars_of", { rating: String(entry.rating) })}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    {entry.rating >= 4.5 ? t("excellent") : entry.rating >= 3.5 ? t("good") : t("can_improve")}
                  </p>
                </div>
                {getRatingStars(entry.rating)}
              </div>
            </motion.div>
          )}

          {/* Notes */}
          {entry.notes && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> {t("service_notes")}
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">{entry.notes}</p>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          {(onDownloadReceipt || onShare) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-2">
              {onDownloadReceipt && (
                <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading}
                  className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs">
                  {isDownloading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{t("downloading")}</> : <><Download className="w-3.5 h-3.5 mr-1.5" />{t("download_receipt")}</>}
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="sm" onClick={handleShare}
                  className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs">
                  <Share2 className="w-3.5 h-3.5 mr-1.5" />{t("share")}
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none">
            {t("close")}
          </Button>
          {role === "paciente" && !entry.rating && (
            <Button className="flex-1 sm:flex-none">
              <Star className="w-4 h-4 mr-2" />{t("rate_service")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const HistoryDetailModalCompact: React.FC<HistoryDetailModalProps> = (props) => {
  return <HistoryDetailModal {...props} />;
};