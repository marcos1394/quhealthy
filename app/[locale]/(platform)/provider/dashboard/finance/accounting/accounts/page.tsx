"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, ChevronDown, Layers } from "lucide-react";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { accountingService, AccountDTO } from "@/services/accounting.service";

export default function ChartOfAccountsPage() {
  const t = useTranslations("ChartOfAccounts");
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await accountingService.listAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
      toast.error(t("toast_load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper para estructurar las cuentas en árbol asumiendo parentAccountId
  const rootAccounts = accounts.filter((acc) => !acc.parentAccountId);

  const renderAccountRow = (account: AccountDTO, depth: number = 0) => {
    const children = accounts.filter(
      (acc) => acc.parentAccountId === account.id
    );
    const hasChildren = children.length > 0;
    const isExpanded = expandedRows[account.id] || false;

    return (
      <React.Fragment key={account.id}>
        <TableRow
          className={cn(
            "hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group border-b border-gray-100 dark:border-gray-800/60",
            depth === 0 && "bg-gray-50/30 dark:bg-gray-900/20"
          )}
        >
          {/* Código SAT */}
          <TableCell className="py-4 px-6">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${depth * 24}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleRow(account.id)}
                  className="w-6 h-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              ) : (
                <span className="w-6 shrink-0" />
              )}
              <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                {account.code}
              </span>
            </div>
          </TableCell>

          {/* Nombre de la Cuenta */}
          <TableCell className="py-4 px-6">
            <div className="flex items-center gap-3">
              {depth === 0 && (
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Layers className="h-4 w-4" strokeWidth={2} />
                </div>
              )}
              <span
                className={cn(
                  "text-xs",
                  depth === 0
                    ? "font-bold text-gray-900 dark:text-white"
                    : "font-medium text-gray-700 dark:text-gray-300"
                )}
              >
                {account.name}
              </span>
            </div>
          </TableCell>

          {/* Tipo */}
          <TableCell className="py-4 px-6">
            <span className="inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40 shadow-sm">
              {account.type}
            </span>
          </TableCell>

          {/* Naturaleza */}
          <TableCell className="py-4 px-6">
            <span className="inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 shadow-sm">
              {account.nature}
            </span>
          </TableCell>
        </TableRow>

        {isExpanded &&
          children.map((child) => renderAccountRow(child, depth + 1))}
      </React.Fragment>
    );
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
              <Layers className="w-7 h-7" strokeWidth={2} />
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

        {/* ── TABLA DE CUENTAS ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-[#050505]">
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
                <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t("th_code")}
                </TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t("th_name")}
                </TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t("th_type")}
                </TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t("th_nature")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {rootAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-16 text-xs font-semibold text-gray-500 dark:text-gray-400"
                  >
                    {t("empty_state")}
                  </TableCell>
                </TableRow>
              ) : (
                rootAccounts.map((acc) => renderAccountRow(acc, 0))
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
}