"use client";

/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, Search, FolderHeart } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useHealthVault } from "@/hooks/useHealthVault";
import { ConsumerDocument } from "@/types/healthVault";

interface ChatVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (document: ConsumerDocument) => void;
}

export function ChatVaultModal({
  isOpen,
  onClose,
  onAttach,
}: ChatVaultModalProps) {
  const t = useTranslations("PatientMessages");
  const { documents, isLoading, fetchDocuments } = useHealthVault();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, fetchDocuments]);

  const formatDate = (dateString: string) => {
    try {
      return formatInTimeZone(new Date(dateString), "UTC", "d MMM yyyy", {
        locale: es,
      });
    } catch {
      return dateString;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredDocs = documents.filter((doc) => {
    const searchTarget = (doc.title || doc.fileName || "").toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] font-sans shadow-2xl p-0">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <FolderHeart className="w-5 h-5" strokeWidth={2} />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("vault_modal_title")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 pl-13 leading-relaxed">
            {t("vault_modal_desc")}
          </DialogDescription>
        </DialogHeader>

        {/* ── BÚSQUEDA ───────────────────────────────────────────────── */}
        <div className="p-4 sm:px-6 shrink-0 bg-white dark:bg-[#0a0a0a]">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              strokeWidth={2}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_doc_placeholder")}
              className="pl-10 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-11 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs transition-all"
            />
          </div>
        </div>

        {/* ── LISTA DE DOCUMENTOS ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold text-gray-400">
                {t("loading_vault")}
              </p>
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onAttach(doc);
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onAttach(doc);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#050505] hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all cursor-pointer group shadow-xs select-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {doc.title || doc.fileName || t("untitled_note")}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 font-mono">
                      <span>{formatDate(doc.uploadedAt)}</span>
                      {doc.documentType !== "NOTE" && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                          <span>{formatBytes(doc.fileSizeBytes || 0)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0 h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold border-0 shadow-xs cursor-pointer"
                  >
                    {t("btn_attach")}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6 rounded-3xl bg-gray-50/50 dark:bg-[#050505] border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-gray-400">
                <FileText className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("no_docs_found_title")}
                </p>
                <p className="text-[11px] font-medium text-gray-400 leading-relaxed max-w-xs">
                  {t("no_docs_found_desc")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}