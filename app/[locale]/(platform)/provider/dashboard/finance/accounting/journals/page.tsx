"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, FileSpreadsheet } from "lucide-react";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  accountingService,
  JournalEntryDTO,
} from "@/services/accounting.service";

export default function JournalEntriesPage() {
  const t = useTranslations("JournalEntries");
  const [journals, setJournals] = useState<JournalEntryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJournals = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await accountingService.getJournalEntries();
      setJournals(data);
    } catch (error) {
      console.error(error);
      toast.error(t("toast_load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const handlePost = async (id: number) => {
    try {
      await accountingService.postJournalEntry(id);
      toast.success(t("toast_post_success"));
      fetchJournals();
    } catch (error) {
      console.error(error);
      toast.error(t("toast_post_error"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-7 h-7" strokeWidth={2} />
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

          <Link href="/provider/dashboard/finance/accounting/journals/create">
            <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 shrink-0">
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_new")}</span>
            </Button>
          </Link>
        </div>

        {/* ── TABLA DE PÓLIZAS ────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-gray-50/50 dark:bg-[#050505]">
                <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_date")}
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_concept")}
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_type")}
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_status")}
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("th_uuid")}
                  </TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                    {t("th_actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {journals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-16 text-xs font-semibold text-gray-500 dark:text-gray-400"
                    >
                      {t("empty_state")}
                    </TableCell>
                  </TableRow>
                ) : (
                  journals.map((journal) => (
                    <TableRow
                      key={journal.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group"
                    >
                      <TableCell className="py-4 px-6 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(journal.entryDate).toLocaleDateString()}
                      </TableCell>

                      <TableCell
                        className="py-4 px-6 text-xs font-bold text-gray-900 dark:text-white max-w-[220px] truncate"
                        title={journal.description}
                      >
                        {journal.description}
                      </TableCell>

                      <TableCell className="py-4 px-6 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                        {journal.type}
                      </TableCell>

                      <TableCell className="py-4 px-6">
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-sm border",
                            journal.status === "POSTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                              : journal.status === "DRAFT"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                              : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          )}
                        >
                          {journal.status === "POSTED"
                            ? t("status_posted")
                            : journal.status === "DRAFT"
                            ? t("status_draft")
                            : journal.status}
                        </span>
                      </TableCell>

                      <TableCell
                        className="py-4 px-6 font-mono text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]"
                        title={journal.cfdiUuid || ""}
                      >
                        {journal.cfdiUuid || "—"}
                      </TableCell>

                      <TableCell className="py-4 px-6 text-right">
                        {journal.status === "DRAFT" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePost(journal.id!)}
                            className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 dark:hover:bg-emerald-900/50 text-[10px] font-bold h-8 px-3 shadow-sm"
                          >
                            {t("btn_post")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}