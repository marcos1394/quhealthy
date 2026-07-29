"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Workflow, Layers, Landmark } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { accountingService, AccountDTO } from "@/services/accounting.service";

const CATEGORY_KEYS = [
  "CONSULTATIONS",
  "SURGERIES_AND_PROCEDURES",
  "LABORATORY",
  "PHARMACY",
  "HOSPITALIZATION",
  "IMAGING",
  "OTHER_INCOME",
  "PAYROLL_MEDICAL",
  "PAYROLL_ADMIN",
  "MEDICAL_SUPPLIES",
  "PHARMACEUTICALS",
  "EQUIPMENT_MAINTENANCE",
  "RENT",
  "UTILITIES",
  "MARKETING",
  "INSURANCE_AND_MALPRACTICE",
  "TAXES",
  "OTHER_EXPENSE",
];

export default function AccountingMappingPage() {
  const t = useTranslations("AccountingMapping");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [satBanks, setSatBanks] = useState<
    { code: string; shortName: string; fullName: string }[]
  >([]);
  const [satPaymentMethods, setSatPaymentMethods] = useState<
    { code: string; name: string }[]
  >([]);

  const [categoryMappings, setCategoryMappings] = useState<any[]>([]);
  const [bankMappings, setBankMappings] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryAccountId, setCategoryAccountId] = useState("");

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [accs, banks, methods, catMap, bankMap] = await Promise.all([
        accountingService.getChartOfAccounts(),
        accountingService.getSatBanks(),
        accountingService.getSatPaymentMethods(),
        accountingService.getCategoryMappings(),
        accountingService.getBankMappings(),
      ]);
      setAccounts(accs);
      setSatBanks(banks);
      setSatPaymentMethods(methods);
      setCategoryMappings(catMap);
      setBankMappings(bankMap);
    } catch (error) {
      console.error(error);
      toast.error(t("toast_load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveCategoryMapping = async () => {
    if (!selectedCategory || !categoryAccountId) return;
    try {
      setIsSaving(true);
      const budgetType = ["CONSULTATIONS", "OTHER_INCOME"].includes(
        selectedCategory
      )
        ? "INCOME"
        : "EXPENSE";
      await accountingService.saveCategoryMapping({
        budgetCategory: selectedCategory,
        budgetType: budgetType,
        accountId: categoryAccountId,
      });
      toast.success(t("toast_category_saved"));
      fetchData();
      setSelectedCategory("");
      setCategoryAccountId("");
    } catch (error) {
      console.error(error);
      toast.error(t("toast_save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBankMapping = async () => {
    if (!selectedPaymentMethod || !bankAccountId) return;
    try {
      setIsSaving(true);
      await accountingService.saveBankMapping({
        satPaymentMethodCode: selectedPaymentMethod,
        satBankCode:
          selectedBank === "none" || !selectedBank ? null : selectedBank,
        accountId: bankAccountId,
      });
      toast.success(t("toast_treasury_saved"));
      fetchData();
      setSelectedPaymentMethod("");
      setSelectedBank("");
      setBankAccountId("");
    } catch (error) {
      console.error(error);
      toast.error(t("toast_save_error"));
    } finally {
      setIsSaving(false);
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
              <Workflow className="w-7 h-7" strokeWidth={2} />
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

        {/* ── PESTAÑAS Y NAVEGACIÓN ────────────────────────────────────── */}
        <Tabs defaultValue="categories" className="w-full space-y-6">
          <TabsList className="bg-gray-100/70 dark:bg-gray-800/40 p-1.5 rounded-2xl w-fit shadow-sm flex gap-1 h-auto border-0">
            <TabsTrigger
              value="categories"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <Layers className="w-4 h-4 mr-2" strokeWidth={2} />
              <span>{t("tabs.categories")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="treasury"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <Landmark className="w-4 h-4 mr-2" strokeWidth={2} />
              <span>{t("tabs.treasury")}</span>
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: CATEGORÍAS (RESULTADOS) ─────────────────────────── */}
          <TabsContent value="categories" className="space-y-6">
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">
                {t("categories_tab.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("categories_tab.label_category")}
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm">
                      <SelectValue
                        placeholder={t("categories_tab.placeholder_category")}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-60 z-50">
                      {CATEGORY_KEYS.map((key) => (
                        <SelectItem
                          key={key}
                          value={key}
                          className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                        >
                          {t(`categories.${key}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("categories_tab.label_account")}
                  </Label>
                  <Select
                    value={categoryAccountId}
                    onValueChange={setCategoryAccountId}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm">
                      <SelectValue
                        placeholder={t("categories_tab.placeholder_account")}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-60 z-50">
                      {accounts.map((acc) => (
                        <SelectItem
                          key={acc.id}
                          value={acc.id.toString()}
                          className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                        >
                          {acc.code} - {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSaveCategoryMapping}
                  disabled={isSaving || !selectedCategory || !categoryAccountId}
                  className="h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  {isSaving ? (
                    <QhSpinner size="sm" />
                  ) : (
                    <span>{t("categories_tab.btn_add")}</span>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {t("categories_tab.th_category")}
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {t("categories_tab.th_type")}
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {t("categories_tab.th_mapped_account")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {categoryMappings.map((m) => {
                      const acc = accounts.find((a) => a.id === m.accountId);
                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                        >
                          <td className="py-4 px-6 text-xs font-bold text-gray-900 dark:text-white">
                            {t(`categories.${m.budgetCategory}`, {
                              defaultValue: m.budgetCategory,
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={cn(
                                "inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-sm border",
                                m.budgetType === "INCOME"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                              )}
                            >
                              {m.budgetType === "INCOME"
                                ? t("categories_tab.type_income")
                                : t("categories_tab.type_expense")}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs font-bold font-mono text-gray-600 dark:text-gray-400">
                            {acc ? `${acc.code} - ${acc.name}` : m.accountId}
                          </td>
                        </tr>
                      );
                    })}
                    {categoryMappings.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                        >
                          {t("categories_tab.empty_state")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 2: TESORERÍA (ACTIVO) ───────────────────────────────── */}
          <TabsContent value="treasury" className="space-y-6">
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-6">
                {t("treasury_tab.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("treasury_tab.label_payment_method")}
                  </Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm">
                      <SelectValue
                        placeholder={t(
                          "treasury_tab.placeholder_payment_method"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-60 z-50">
                      {satPaymentMethods.map((m) => (
                        <SelectItem
                          key={m.code}
                          value={m.code}
                          className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                        >
                          {m.code} - {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("treasury_tab.label_bank")}
                  </Label>
                  <Select
                    value={selectedBank}
                    onValueChange={setSelectedBank}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm">
                      <SelectValue
                        placeholder={t("treasury_tab.placeholder_bank")}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-60 z-50">
                      <SelectItem
                        value="none"
                        className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30 text-gray-500"
                      >
                        {t("treasury_tab.bank_any")}
                      </SelectItem>
                      {satBanks.map((b) => (
                        <SelectItem
                          key={b.code}
                          value={b.code}
                          className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                        >
                          {b.shortName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("treasury_tab.label_account")}
                  </Label>
                  <Select
                    value={bankAccountId}
                    onValueChange={setBankAccountId}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm">
                      <SelectValue
                        placeholder={t("treasury_tab.placeholder_account")}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-60 z-50">
                      {accounts.map((acc) => (
                        <SelectItem
                          key={acc.id}
                          value={acc.id.toString()}
                          className="text-xs font-bold rounded-xl focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                        >
                          {acc.code} - {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSaveBankMapping}
                  disabled={
                    isSaving || !selectedPaymentMethod || !bankAccountId
                  }
                  className="h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 w-full"
                >
                  {isSaving ? (
                    <QhSpinner size="sm" />
                  ) : (
                    <span>{t("treasury_tab.btn_add")}</span>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {t("treasury_tab.th_payment_method")}
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {t("treasury_tab.th_sat_bank")}
                      </th>
                      <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {t("treasury_tab.th_mapped_account")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {bankMappings.map((m) => {
                      const method = satPaymentMethods.find(
                        (x) => x.code === m.satPaymentMethodCode
                      );
                      const bank = satBanks.find(
                        (x) => x.code === m.satBankCode
                      );
                      const acc = accounts.find((a) => a.id === m.accountId);
                      return (
                        <tr
                          key={m.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                        >
                          <td className="py-4 px-6 text-xs font-bold text-gray-900 dark:text-white">
                            <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-mono mr-2 text-gray-600 dark:text-gray-400">
                              {m.satPaymentMethodCode}
                            </span>
                            {method ? method.name : ""}
                          </td>
                          <td className="py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300">
                            {bank ? (
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                {bank.shortName}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">
                                {t("treasury_tab.bank_any")}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-xs font-bold font-mono text-gray-600 dark:text-gray-400">
                            {acc ? `${acc.code} - ${acc.name}` : m.accountId}
                          </td>
                        </tr>
                      );
                    })}
                    {bankMappings.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                        >
                          {t("treasury_tab.empty_state")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}