"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  ChevronsUpDown,
  CheckCircle,
  Download,
  FileText,
  Activity,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  budgetService,
  BudgetExecutionLogDTO,
  BudgetDTO,
  BudgetLineItemDTO,
  BudgetExecutionRequest,
} from "@/services/budget.service";
import { accountingService, AccountDTO } from "@/services/accounting.service";

export default function ExecutionsPage() {
  const t = useTranslations("BudgetExecutions");

  const [executions, setExecutions] = useState<BudgetExecutionLogDTO[]>([]);
  const [filteredExecutions, setFilteredExecutions] = useState<
    BudgetExecutionLogDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de Comboboxes
  const [openDebitCombobox, setOpenDebitCombobox] = useState(false);
  const [openCreditCombobox, setOpenCreditCombobox] = useState(false);

  // Catálogos y Presupuesto Activo
  const [activeBudget, setActiveBudget] = useState<BudgetDTO | null>(null);
  const [lineItems, setLineItems] = useState<BudgetLineItemDTO[]>([]);
  const [accounts, setAccounts] = useState<AccountDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos del Formulario
  const [selectedLineItemId, setSelectedLineItemId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Tesorería / SAT
  const [satBanks, setSatBanks] = useState<
    { code: string; shortName: string; fullName: string }[]
  >([]);
  const [satPaymentMethods, setSatPaymentMethods] = useState<
    { code: string; name: string }[]
  >([]);
  const [satCurrencies, setSatCurrencies] = useState<
    { code: string; name: string }[]
  >([]);
  const [paymentMethodCode, setPaymentMethodCode] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [currencyCode, setCurrencyCode] = useState("MXN");
  const [exchangeRate, setExchangeRate] = useState("1.0");

  // Opciones Contables Avanzadas
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [debitAccountId, setDebitAccountId] = useState<string>("none");
  const [creditAccountId, setCreditAccountId] = useState<string>("none");

  const fetchExecutions = useCallback(async () => {
    setIsLoading(true);
    try {
      const budgets = await budgetService.listBudgets();
      const current =
        budgets.find((b) => b.status === "ACTIVE") || budgets[0];

      if (current) {
        setActiveBudget(current);
        const [
          data,
          linesData,
          accountsData,
          banks,
          methods,
          currencies,
        ] = await Promise.all([
          budgetService.getExecutionHistory(current.id),
          budgetService.getBudgetLineItems(current.id),
          accountingService.getChartOfAccounts(),
          accountingService.getSatBanks(),
          accountingService.getSatPaymentMethods(),
          accountingService.getSatCurrencies(),
        ]);
        setExecutions(data || []);
        setFilteredExecutions(data || []);
        setLineItems(linesData || []);
        setAccounts(accountsData || []);
        setSatBanks(banks || []);
        setSatPaymentMethods(methods || []);
        setSatCurrencies(currencies || []);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredExecutions(executions);
    } else {
      setFilteredExecutions(
        executions.filter((e) => e.approvalStatus === statusFilter)
      );
    }
  }, [statusFilter, executions]);

  const handleRegisterExecution = async () => {
    if (!activeBudget) return;
    if (!selectedLineItemId || !amount || !description) {
      toast.warning(t("toasts.required_fields"));
      return;
    }

    try {
      setIsSubmitting(true);
      const request: BudgetExecutionRequest = {
        budgetLineItemId: Number(selectedLineItemId),
        amount: Number(amount),
        description,
        paymentMethodCode: paymentMethodCode || undefined,
        bankCode: bankCode || undefined,
        currencyCode: currencyCode,
        exchangeRate: Number(exchangeRate) || 1.0,
        debitAccountId: debitAccountId !== "none" ? debitAccountId : null,
        creditAccountId: creditAccountId !== "none" ? creditAccountId : null,
      };

      await budgetService.recordExecution(activeBudget.id, request);
      toast.success(t("toasts.success"));

      // Limpieza de Formulario
      setIsModalOpen(false);
      setSelectedLineItemId("");
      setAmount("");
      setDescription("");
      setPaymentMethodCode("");
      setBankCode("");
      setCurrencyCode("MXN");
      setExchangeRate("1.0");
      setShowAdvanced(false);
      setDebitAccountId("none");
      setCreditAccountId("none");

      // Recargar listado
      fetchExecutions();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.record_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryTranslation = (category: string) => {
    try {
      return t(`categories.${category}`);
    } catch {
      return category;
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
              <Activity className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle", { name: activeBudget?.name || "..." })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Filtro por Estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-11 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm bg-white dark:bg-[#0a0a0a]">
                <SelectValue placeholder={t("filter_placeholder")} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                <SelectItem value="ALL" className="text-xs font-bold">
                  {t("filters.all")}
                </SelectItem>
                <SelectItem value="APPROVED" className="text-xs font-bold">
                  {t("filters.approved")}
                </SelectItem>
                <SelectItem value="PENDING" className="text-xs font-bold">
                  {t("filters.pending")}
                </SelectItem>
                <SelectItem value="REJECTED" className="text-xs font-bold">
                  {t("filters.rejected")}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Modal de Registro de Movimiento */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2">
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>{t("btn_execute")}</span>
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[550px] bg-white dark:bg-[#0a0a0a] rounded-3xl border-gray-100 dark:border-gray-800 shadow-2xl p-0 overflow-hidden font-sans text-gray-900 dark:text-white">
                <DialogHeader className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                  <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t("modal.title")}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 p-6 sm:p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                  
                  {/* Partida presupuestal */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("modal.label_line_item")}
                    </Label>
                    <Select
                      value={selectedLineItemId}
                      onValueChange={setSelectedLineItemId}
                    >
                      <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 h-11 text-xs font-bold bg-white dark:bg-[#0a0a0a] shadow-sm">
                        <SelectValue
                          placeholder={t("modal.placeholder_line_item")}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-56">
                        {lineItems.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={item.id.toString()}
                            className="text-xs font-bold rounded-xl"
                          >
                            {item.name} ({getCategoryTranslation(item.category)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Monto */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("modal.label_amount")}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                        $
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("modal.placeholder_amount")}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="rounded-xl border-gray-200 dark:border-gray-800 h-11 pl-7 text-xs font-mono font-bold shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("modal.label_description")}
                    </Label>
                    <Input
                      placeholder={t("modal.placeholder_description")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-gray-800 h-11 text-xs font-bold shadow-sm"
                    />
                  </div>

                  {/* Sección Tesorería */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                      {t("modal.section_treasury")}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {t("modal.label_payment_method")}
                        </Label>
                        <Select
                          value={paymentMethodCode}
                          onValueChange={setPaymentMethodCode}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 h-11 text-xs font-bold shadow-sm">
                            <SelectValue
                              placeholder={t("modal.placeholder_select")}
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 max-h-48">
                            {satPaymentMethods.map((m) => (
                              <SelectItem
                                key={m.code}
                                value={m.code}
                                className="text-xs font-bold"
                              >
                                {m.code} - {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {t("modal.label_bank")}
                        </Label>
                        <Select
                          value={bankCode}
                          onValueChange={setBankCode}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 h-11 text-xs font-bold shadow-sm">
                            <SelectValue
                              placeholder={t("modal.placeholder_optional")}
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 max-h-48">
                            {satBanks.map((b) => (
                              <SelectItem
                                key={b.code}
                                value={b.code}
                                className="text-xs font-bold"
                              >
                                {b.shortName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {t("modal.label_currency")}
                        </Label>
                        <Select
                          value={currencyCode}
                          onValueChange={setCurrencyCode}
                        >
                          <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 h-11 text-xs font-bold shadow-sm">
                            <SelectValue placeholder="Moneda" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 max-h-48">
                            {satCurrencies.map((c) => (
                              <SelectItem
                                key={c.code}
                                value={c.code}
                                className="text-xs font-bold"
                              >
                                {c.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {t("modal.label_exchange_rate")}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.0001"
                          value={exchangeRate}
                          onChange={(e) => setExchangeRate(e.target.value)}
                          disabled={currencyCode === "MXN"}
                          className="rounded-xl border-gray-200 dark:border-gray-800 h-11 text-xs font-mono font-bold shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Opciones Contables Avanzadas */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      {showAdvanced ? (
                        <ChevronUp className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <ChevronDown className="w-4 h-4" strokeWidth={2} />
                      )}
                      <span>{t("modal.toggle_advanced")}</span>
                    </button>

                    {showAdvanced && (
                      <div className="space-y-4 mt-4 bg-gray-50/50 dark:bg-[#050505] p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                          {t("modal.advanced_help")}
                        </p>

                        {/* Cuenta Debe */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("modal.label_debit_account")}
                          </Label>
                          <Popover
                            open={openDebitCombobox}
                            onOpenChange={setOpenDebitCombobox}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openDebitCombobox}
                                className="w-full justify-between h-11 rounded-xl text-xs font-bold border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                              >
                                {debitAccountId !== "none"
                                  ? accounts.find(
                                      (acc) =>
                                        acc.id.toString() === debitAccountId
                                    )?.name
                                  : t("modal.auto_account")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[360px] p-0 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-lg border-gray-100 dark:border-gray-800"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder={t(
                                    "modal.search_account_placeholder"
                                  )}
                                  className="text-xs font-medium"
                                />
                                <CommandList>
                                  <CommandEmpty className="p-3 text-xs text-gray-400">
                                    {t("modal.no_account_found")}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value="none"
                                      onSelect={() => {
                                        setDebitAccountId("none");
                                        setOpenDebitCombobox(false);
                                      }}
                                      className="text-xs font-bold rounded-xl"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          debitAccountId === "none"
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {t("modal.auto_account")}
                                    </CommandItem>
                                    {accounts.map((acc) => (
                                      <CommandItem
                                        key={acc.id}
                                        value={`${acc.code} ${acc.name}`}
                                        onSelect={() => {
                                          setDebitAccountId(
                                            acc.id.toString()
                                          );
                                          setOpenDebitCombobox(false);
                                        }}
                                        className="text-xs font-bold rounded-xl"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            debitAccountId === acc.id.toString()
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <span className="font-mono mr-2 text-gray-400">
                                          {acc.code}
                                        </span>{" "}
                                        {acc.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Cuenta Haber */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {t("modal.label_credit_account")}
                          </Label>
                          <Popover
                            open={openCreditCombobox}
                            onOpenChange={setOpenCreditCombobox}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openCreditCombobox}
                                className="w-full justify-between h-11 rounded-xl text-xs font-bold border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                              >
                                {creditAccountId !== "none"
                                  ? accounts.find(
                                      (acc) =>
                                        acc.id.toString() === creditAccountId
                                    )?.name
                                  : t("modal.auto_account")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[360px] p-0 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-lg border-gray-100 dark:border-gray-800"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder={t(
                                    "modal.search_account_placeholder"
                                  )}
                                  className="text-xs font-medium"
                                />
                                <CommandList>
                                  <CommandEmpty className="p-3 text-xs text-gray-400">
                                    {t("modal.no_account_found")}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value="none"
                                      onSelect={() => {
                                        setCreditAccountId("none");
                                        setOpenCreditCombobox(false);
                                      }}
                                      className="text-xs font-bold rounded-xl"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          creditAccountId === "none"
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {t("modal.auto_account")}
                                    </CommandItem>
                                    {accounts.map((acc) => (
                                      <CommandItem
                                        key={acc.id}
                                        value={`${acc.code} ${acc.name}`}
                                        onSelect={() => {
                                          setCreditAccountId(
                                            acc.id.toString()
                                          );
                                          setOpenCreditCombobox(false);
                                        }}
                                        className="text-xs font-bold rounded-xl"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            creditAccountId ===
                                              acc.id.toString()
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <span className="font-mono mr-2 text-gray-400">
                                          {acc.code}
                                        </span>{" "}
                                        {acc.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                      </div>
                    )}
                  </div>

                </div>

                <DialogFooter className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl h-11 px-5 text-xs font-bold border-gray-200 dark:border-gray-800"
                  >
                    {t("modal.btn_cancel")}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleRegisterExecution}
                    disabled={isSubmitting}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl h-11 px-6 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 border-0"
                  >
                    {isSubmitting ? (
                      <>
                        <QhSpinner size="sm" />
                        <span>{t("modal.btn_submitting")}</span>
                      </>
                    ) : (
                      <span>{t("modal.btn_submit")}</span>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        {/* ── TABLA DE EJECUCIONES ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("table.th_date")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("table.th_type")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("table.th_category")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t("table.th_description")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                    {t("table.th_amount")}
                  </th>
                  <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                    {t("table.th_cfdi")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredExecutions.length > 0 ? (
                  filteredExecutions.map((exec) => (
                    <tr
                      key={exec.id}
                      className={cn(
                        "transition-colors group",
                        exec.approvalStatus === "REJECTED"
                          ? "bg-rose-50/40 dark:bg-rose-950/20"
                          : "hover:bg-gray-50/50 dark:hover:bg-[#111]/50"
                      )}
                    >
                      <td className="py-4 px-6 text-xs font-mono font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {exec.createdAt
                          ? new Date(exec.createdAt).toLocaleDateString()
                          : "N/A"}
                        {exec.approvalStatus === "REJECTED" && (
                          <p className="text-[10px] font-bold text-rose-500 mt-0.5">
                            {t("table.blocked_badge")}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={cn(
                            "inline-flex px-2.5 py-0.5 text-[10px] font-bold rounded-full shadow-sm border",
                            exec.budgetLineItem?.type === "INCOME"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                          )}
                        >
                          {exec.budgetLineItem?.type === "INCOME"
                            ? t("table.type_income")
                            : t("table.type_expense")}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs font-bold text-gray-900 dark:text-white">
                        {exec.budgetLineItem?.category
                          ? getCategoryTranslation(exec.budgetLineItem.category)
                          : t("table.uncategorized")}
                      </td>

                      <td
                        className="py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300 max-w-[240px] truncate"
                        title={exec.description}
                      >
                        {exec.description}
                      </td>

                      <td className="py-4 px-6 text-right text-xs font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                        $
                        {(exec.amount || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="py-4 px-6 text-center">
                        {exec.approvalStatus === "REJECTED" ? (
                          <span className="text-[10px] font-bold text-rose-500">
                            {t("table.rejected_policy")}
                          </span>
                        ) : exec.cfdiUuid ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle
                              className="w-4 h-4 text-emerald-500"
                              strokeWidth={2}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                              title={t("table.cfdi_tooltip", {
                                uuid: exec.cfdiUuid,
                              })}
                            >
                              <Download
                                className="w-3.5 h-3.5 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                strokeWidth={2}
                              />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="h-8 px-3 text-[10px] font-bold rounded-xl border-gray-200 dark:border-gray-800 shadow-sm text-gray-700 dark:text-gray-300"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                            <span>{t("table.btn_generate_cfdi")}</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                    >
                      {t("table.empty_state")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}