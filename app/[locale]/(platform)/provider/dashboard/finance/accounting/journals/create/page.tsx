"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShieldAlert,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  accountingService,
  AccountDTO,
  JournalEntryRequest,
  JournalEntryLineDTO,
} from "@/services/accounting.service";

export default function CreateJournalEntryPage() {
  const t = useTranslations("CreateJournalEntry");
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cabecera state
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [type, setType] = useState<"INCOME" | "EXPENSE" | "JOURNAL">("JOURNAL");
  const [description, setDescription] = useState("");

  // Metadatos SAT Cabecera
  const [cfdiUuid, setCfdiUuid] = useState("");
  const [satRequestType, setSatRequestType] = useState("");
  const [satOrderNumber, setSatOrderNumber] = useState("");
  const [satProcedureNumber, setSatProcedureNumber] = useState("");

  // Detalle state
  const [lines, setLines] = useState<JournalEntryLineDTO[]>([
    { accountId: 0, description: "", debit: 0, credit: 0 },
    { accountId: 0, description: "", debit: 0, credit: 0 },
  ]);

  // Modal state para metadatos SAT por línea
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  useEffect(() => {
    accountingService
      .getChartOfAccounts()
      .then(setAccounts)
      .catch(console.error);
  }, []);

  const addLine = () => {
    setLines([
      ...lines,
      { accountId: 0, description: "", debit: 0, credit: 0 },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      toast.warning(t("toast_min_lines"));
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (
    index: number,
    field: keyof JournalEntryLineDTO,
    value: any
  ) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const totalDebit = lines.reduce(
    (sum, line) => sum + (Number(line.debit) || 0),
    0
  );
  const totalCredit = lines.reduce(
    (sum, line) => sum + (Number(line.credit) || 0),
    0
  );
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && difference === 0;

  const handleSubmit = async () => {
    if (!description || lines.some((l) => l.accountId === 0)) {
      toast.error(t("toast_missing_fields"));
      return;
    }

    if (!isBalanced) {
      toast.error(t("toast_unbalanced"));
      return;
    }

    setIsSubmitting(true);
    try {
      const request: JournalEntryRequest = {
        entryDate,
        type,
        description,
        cfdiUuid: cfdiUuid || undefined,
        satRequestType: satRequestType || undefined,
        satOrderNumber: satOrderNumber || undefined,
        satProcedureNumber: satProcedureNumber || undefined,
        lines,
      };

      await accountingService.createJournalEntry(request);
      toast.success(t("toast_success"));
      router.push("/provider/dashboard/finance/accounting/journals");
    } catch (error) {
      toast.error(t("toast_error"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER CON BOTÓN REGRESAR ─────────────────────────────────── */}
        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
          <Link
            href="/provider/dashboard/finance/accounting/journals"
            className="w-12 h-12 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm text-gray-600 dark:text-gray-400 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* ── CABECERA / DATOS GENERALES ──────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="h-5 w-5" strokeWidth={2} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t("general_data")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("entry_date")}
              </Label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("type")}
              </Label>
              <select
                className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-xs font-bold text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="JOURNAL">{t("type_journal")}</option>
                <option value="INCOME">{t("type_income")}</option>
                <option value="EXPENSE">{t("type_expense")}</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("description")}
              </Label>
              <Input
                placeholder={t("description_placeholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
              />
            </div>
          </div>

          {/* Metadatos SAT Cabecera */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-6">
              <ShieldAlert className="h-4 w-4 text-blue-500" strokeWidth={2} />
              <span>{t("sat_metadata_header")}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("sat_request_type")}
                </Label>
                <select
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-xs font-bold text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  value={satRequestType}
                  onChange={(e) => setSatRequestType(e.target.value)}
                >
                  <option value="">{t("sat_request_none")}</option>
                  <option value="AF">{t("sat_request_af")}</option>
                  <option value="FC">{t("sat_request_fc")}</option>
                  <option value="DE">{t("sat_request_de")}</option>
                  <option value="CO">{t("sat_request_co")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("sat_order_number")}
                </Label>
                <Input
                  placeholder={t("sat_order_placeholder")}
                  value={satOrderNumber}
                  onChange={(e) => setSatOrderNumber(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("sat_procedure_number")}
                </Label>
                <Input
                  placeholder={t("sat_procedure_placeholder")}
                  value={satProcedureNumber}
                  onChange={(e) => setSatProcedureNumber(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("cfdi_uuid_global")}
                </Label>
                <Input
                  placeholder={t("cfdi_uuid_placeholder")}
                  value={cfdiUuid}
                  onChange={(e) => setCfdiUuid(e.target.value)}
                  className="h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold font-mono shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── DETALLE / ASIENTOS CONTABLES ─────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {t("entries_detail")}
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={addLine}
              className="rounded-xl h-11 px-4 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("btn_add_line")}</span>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-left bg-white dark:bg-[#0a0a0a] border-collapse min-w-[700px]">
              <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-1/3">
                    {t("th_account")}
                  </th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-1/4">
                    {t("th_concept")}
                  </th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-32 text-right">
                    {t("th_debit")}
                  </th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-32 text-right">
                    {t("th_credit")}
                  </th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 w-24 text-center">
                    {t("th_sat")}
                  </th>
                  <th className="p-4 w-12 text-center" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {lines.map((line, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                  >
                    <td className="p-3">
                      <select
                        className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-xs font-bold text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={line.accountId}
                        onChange={(e) =>
                          updateLine(
                            index,
                            "accountId",
                            Number(e.target.value)
                          )
                        }
                      >
                        <option value={0} disabled>
                          {t("select_account_placeholder")}
                        </option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <Input
                        placeholder={t("line_concept_placeholder")}
                        value={line.description}
                        onChange={(e) =>
                          updateLine(index, "description", e.target.value)
                        }
                        className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-xs font-bold"
                      />
                    </td>

                    <td className="p-3">
                      <Input
                        type="number"
                        step="0.01"
                        className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-right font-mono text-xs font-bold"
                        value={line.debit || ""}
                        onChange={(e) =>
                          updateLine(
                            index,
                            "debit",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={line.credit > 0}
                      />
                    </td>

                    <td className="p-3">
                      <Input
                        type="number"
                        step="0.01"
                        className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-right font-mono text-xs font-bold"
                        value={line.credit || ""}
                        onChange={(e) =>
                          updateLine(
                            index,
                            "credit",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        disabled={line.debit > 0}
                      />
                    </td>

                    <td className="p-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "rounded-xl h-9 px-3 text-[10px] font-bold border-gray-200 dark:border-gray-800 shadow-sm transition-all",
                          (line.cfdiUuid || line.thirdPartyRfc) &&
                            "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
                        )}
                        onClick={() => setActiveLineIndex(index)}
                      >
                        {t("btn_line_sat_data")}
                      </Button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeLine(index)}
                        className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CUADRE RESUMEN DE POLIZA */}
          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-sm border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <span className="text-xs font-bold text-gray-500">
                  {t("total_debits")}
                </span>
                <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                  $
                  {totalDebit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <span className="text-xs font-bold text-gray-500">
                  {t("total_credits")}
                </span>
                <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                  $
                  {totalCredit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div
                className={cn(
                  "flex justify-between p-4 text-xs font-bold transition-colors",
                  isBalanced
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                )}
              >
                <span>{t("difference")}</span>
                <span className="font-mono">
                  $
                  {difference.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!isBalanced || isSubmitting}
              className="w-full sm:w-auto h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-8 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" />
                  <span>{t("btn_saving")}</span>
                </>
              ) : (
                <span>{t("btn_save")}</span>
              )}
            </Button>
          </div>
        </div>

        {/* ── MODAL DETALLE FISCAL POR ASIENTO ─────────────────────────── */}
        {activeLineIndex !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl font-sans text-gray-900 dark:text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold">
                  {t("modal_sat_title", { index: activeLineIndex + 1 })}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_cfdi_uuid")}
                  </Label>
                  <Input
                    placeholder="8-4-4-4-12"
                    value={lines[activeLineIndex].cfdiUuid || ""}
                    onChange={(e) =>
                      updateLine(activeLineIndex, "cfdiUuid", e.target.value)
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_third_party_rfc")}
                  </Label>
                  <Input
                    placeholder="XEXX010101000"
                    value={lines[activeLineIndex].thirdPartyRfc || ""}
                    onChange={(e) =>
                      updateLine(
                        activeLineIndex,
                        "thirdPartyRfc",
                        e.target.value
                      )
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 uppercase font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_cfdi_total")}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={lines[activeLineIndex].cfdiTotalAmount || ""}
                    onChange={(e) =>
                      updateLine(
                        activeLineIndex,
                        "cfdiTotalAmount",
                        parseFloat(e.target.value)
                      )
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_payment_method")}
                  </Label>
                  <Input
                    placeholder={t("modal_payment_method_placeholder")}
                    value={lines[activeLineIndex].paymentMethodCode || ""}
                    onChange={(e) =>
                      updateLine(
                        activeLineIndex,
                        "paymentMethodCode",
                        e.target.value
                      )
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2 md:col-span-2 mt-2">
                  <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("modal_banks_currencies")}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_currency")}
                  </Label>
                  <Input
                    placeholder="MXN, USD"
                    value={lines[activeLineIndex].currencyCode || ""}
                    onChange={(e) =>
                      updateLine(
                        activeLineIndex,
                        "currencyCode",
                        e.target.value
                      )
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_exchange_rate")}
                  </Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={lines[activeLineIndex].exchangeRate || ""}
                    onChange={(e) =>
                      updateLine(
                        activeLineIndex,
                        "exchangeRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_bank_code")}
                  </Label>
                  <Input
                    placeholder={t("modal_bank_code_placeholder")}
                    value={lines[activeLineIndex].nationalBankCode || ""}
                    onChange={(e) =>
                      updateLine(
                        activeLineIndex,
                        "nationalBankCode",
                        e.target.value
                      )
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_origin_account")}
                  </Label>
                  <Input
                    value={lines[activeLineIndex].originAccount || ""}
                    onChange={(e) =>
                      updateLine(
                        activeLineIndex,
                        "originAccount",
                        e.target.value
                      )
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_destination_account")}
                  </Label>
                  <Input
                    value={lines[activeLineIndex].destinationAccount || ""}
                    onChange={(e) =>
                      updateLine(
                        activeLineIndex,
                        "destinationAccount",
                        e.target.value
                      )
                    }
                    className="h-11 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                <Button
                  onClick={() => setActiveLineIndex(null)}
                  className="rounded-xl h-11 px-6 font-bold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs shadow-sm border-0"
                >
                  {t("btn_done")}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}