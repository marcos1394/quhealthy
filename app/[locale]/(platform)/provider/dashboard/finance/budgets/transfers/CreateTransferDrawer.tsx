"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { ArrowLeftRight, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  budgetService,
  BudgetDTO,
  BudgetLineItemDTO,
} from "@/services/budget.service";

interface CreateTransferDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTransferDrawer({
  open,
  onOpenChange,
  onSuccess,
}: CreateTransferDrawerProps) {
  const t = useTranslations("CreateTransferDrawer");

  const [isLoading, setIsLoading] = useState(false);
  const [budgets, setBudgets] = useState<BudgetDTO[]>([]);
  const [lineItems, setLineItems] = useState<BudgetLineItemDTO[]>([]);

  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  const [fromLineItemId, setFromLineItemId] = useState<number | null>(null);
  const [toLineItemId, setToLineItemId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const reset = useCallback(() => {
    setSelectedBudgetId(null);
    setFromLineItemId(null);
    setToLineItemId(null);
    setAmount("");
    setReason("");
    setLineItems([]);
  }, []);

  const loadBudgets = useCallback(async () => {
    try {
      const data = await budgetService.listBudgets();
      setBudgets(data || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_budgets_error"));
    }
  }, [t]);

  useEffect(() => {
    if (open) {
      loadBudgets();
    } else {
      reset();
    }
  }, [open, loadBudgets, reset]);

  const handleBudgetChange = async (id: number) => {
    setSelectedBudgetId(id);
    setFromLineItemId(null);
    setToLineItemId(null);
    try {
      const items = await budgetService.getBudgetLineItems(id);
      setLineItems(items || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_items_error"));
    }
  };

  const handleSave = async () => {
    if (!fromLineItemId || !toLineItemId || !amount || !reason) {
      toast.error(t("toasts.required_fields"));
      return;
    }

    if (fromLineItemId === toLineItemId) {
      toast.error(t("toasts.same_line_items"));
      return;
    }

    setIsLoading(true);
    try {
      await budgetService.requestTransfer({
        fromLineItemId,
        toLineItemId,
        amount: parseFloat(amount),
        reason,
      });
      toast.success(t("toasts.success"));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 p-0 overflow-y-auto sm:rounded-l-3xl shadow-2xl flex flex-col h-full font-sans text-gray-900 dark:text-white">
        
        {/* ── HEADER SHEET ────────────────────────────────────────────── */}
        <SheetHeader className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0 rounded-tl-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <ArrowLeftRight className="w-6 h-6" strokeWidth={2} />
            </div>
            <SheetClose className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-4 h-4" strokeWidth={2} />
            </SheetClose>
          </div>
          <SheetTitle className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            {t("title")}
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {t("subtitle")}
          </SheetDescription>
        </SheetHeader>

        {/* ── FORMULARIO PRINCIPAL ─────────────────────────────────────── */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Presupuesto */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {t("label_budget")}
            </Label>
            <select
              value={selectedBudgetId || ""}
              onChange={(e) => handleBudgetChange(Number(e.target.value))}
              className="w-full h-11 px-3 text-xs font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
            >
              <option value="" disabled>
                {t("placeholder_budget")}
              </option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Partida Origen */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {t("label_from_item")}
            </Label>
            <select
              value={fromLineItemId || ""}
              onChange={(e) => setFromLineItemId(Number(e.target.value))}
              disabled={!selectedBudgetId}
              className="w-full h-11 px-3 text-xs font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all disabled:opacity-50"
            >
              <option value="" disabled>
                {t("placeholder_from_item")}
              </option>
              {lineItems.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} (${l.projectedAmount})
                </option>
              ))}
            </select>
          </div>

          {/* Partida Destino */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {t("label_to_item")}
            </Label>
            <select
              value={toLineItemId || ""}
              onChange={(e) => setToLineItemId(Number(e.target.value))}
              disabled={!selectedBudgetId}
              className="w-full h-11 px-3 text-xs font-bold border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all disabled:opacity-50"
            >
              <option value="" disabled>
                {t("placeholder_to_item")}
              </option>
              {lineItems.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} (${l.projectedAmount})
                </option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {t("label_amount")}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                $
              </span>
              <Input
                type="number"
                placeholder={t("placeholder_amount")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 pl-7 pr-3 text-xs font-mono font-bold border-gray-200 dark:border-gray-800 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {t("label_reason")}
            </Label>
            <Textarea
              placeholder={t("placeholder_reason")}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[110px] text-xs font-bold border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/20 resize-none"
            />
          </div>
        </div>

        {/* ── FOOTER BOTONES ─────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0 rounded-bl-3xl">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl text-xs font-bold border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              {t("btn_cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 border-0 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isLoading && <QhSpinner size="sm" />}
              <span>{t("btn_submit")}</span>
            </Button>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}