"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Activity, Check, ChevronsUpDown, Save } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

import { biomedicalService } from "@/services/biomedical.service";
import { accountingService } from "@/services/accounting.service";
import { useSessionStore } from "@/stores/SessionStore";

interface RegisterEquipmentForm {
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  internalCode: string;
  acquisitionDate: string;
  operationalDate: string;
  lifespanYears: number;
  riskLevel: string;
  purchasePrice: number;
  supplierId: string;
  currentAreaId: string;
}

export const RegisterEquipmentDrawer = ({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const t = useTranslations("RegisterEquipmentDrawer");
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RegisterEquipmentForm>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSessionStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const [costCenters, setCostCenters] = useState<any[]>([]);

  useEffect(() => {
    if (open && user?.id) {
      biomedicalService
        .getCategories(user.id.toString())
        .then(setCategories)
        .catch(console.error);

      accountingService
        .listCostCenters()
        .then(setCostCenters)
        .catch(console.error);
    }
  }, [open, user?.id]);

  const onSubmit = async (data: RegisterEquipmentForm) => {
    setIsSubmitting(true);
    try {
      if (!user?.id) throw new Error("Provider ID is missing");
      const payload = {
        ...data,
        categoryName: data.category,
        usefulLifeYears: data.lifespanYears
          ? Number(data.lifespanYears)
          : undefined,
        purchasePrice: data.purchasePrice
          ? Number(data.purchasePrice)
          : undefined,
        riskLevel: data.riskLevel,
        supplierId: data.supplierId ? Number(data.supplierId) : undefined,
        currentAreaId: data.currentAreaId
          ? Number(data.currentAreaId)
          : undefined,
        status: "AVAILABLE",
      };

      await biomedicalService.createEquipment(user.id.toString(), payload);
      toast.success(t("toast_success"));
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("toast_error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        position="right"
        size="lg"
        className="p-0 border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col h-full rounded-l-3xl shadow-2xl font-sans text-gray-900 dark:text-white"
      >
        {/* Header Sticky */}
        <SheetHeader className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 text-left rounded-tl-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <Activity className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t("title")}
                </SheetTitle>
                <SheetDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("description")}
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <form
            id="register-equipment-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Fila 1: Nombre y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_name")}
                </label>
                <input
                  {...register("name", { required: true })}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  placeholder={t("placeholder_name")}
                />
                {errors.name && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    {t("required_error")}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_category")}
                </label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Popover
                      open={openCategoryPopover}
                      onOpenChange={setOpenCategoryPopover}
                      modal={true}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          role="combobox"
                          aria-expanded={openCategoryPopover}
                          className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between transition-all focus:ring-2 focus:ring-emerald-500/20"
                        >
                          {field.value || (
                            <span className="text-gray-400 font-medium">
                              {t("placeholder_select")}
                            </span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg overflow-hidden z-50">
                        <Command className="bg-white dark:bg-[#0a0a0a]">
                          <CommandInput
                            placeholder={t("search_or_create")}
                            onValueChange={setCategorySearch}
                            className="text-xs font-medium"
                          />
                          <CommandList>
                            <CommandEmpty className="py-4 text-center text-xs">
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#111]"
                                onClick={() => {
                                  field.onChange(categorySearch);
                                  setOpenCategoryPopover(false);
                                }}
                              >
                                {t("create_new")}{" "}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {categorySearch}
                                </span>
                              </button>
                            </CommandEmpty>
                            <CommandGroup>
                              {categories.map((cat) => (
                                <CommandItem
                                  key={cat.id}
                                  value={cat.name}
                                  disabled={false}
                                  onSelect={() => {
                                    field.onChange(cat.name);
                                    setOpenCategoryPopover(false);
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    field.onChange(cat.name);
                                    setOpenCategoryPopover(false);
                                  }}
                                  className="text-xs font-bold cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111]"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400",
                                      field.value === cat.name
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {cat.name}
                                </CommandItem>
                              ))}
                              {categorySearch &&
                                !categories.some(
                                  (c) =>
                                    c.name.toLowerCase() ===
                                    categorySearch.toLowerCase()
                                ) && (
                                  <CommandItem
                                    value={categorySearch}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue);
                                      setOpenCategoryPopover(false);
                                    }}
                                    className="text-xs font-bold cursor-pointer text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                  >
                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                    {t("create_action")} {categorySearch}
                                  </CommandItem>
                                )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.category && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    {t("required_error")}
                  </span>
                )}
              </div>
            </div>

            {/* Fila 2: Fabricante y Modelo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_manufacturer")}
                </label>
                <input
                  {...register("manufacturer", { required: true })}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  placeholder={t("placeholder_manufacturer")}
                />
                {errors.manufacturer && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    {t("required_error")}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_model")}
                </label>
                <input
                  {...register("model", { required: true })}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  placeholder={t("placeholder_model")}
                />
                {errors.model && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    {t("required_error")}
                  </span>
                )}
              </div>
            </div>

            {/* Fila 3: Serie y Código Interno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_serial_number")}
                </label>
                <input
                  {...register("serialNumber", { required: true })}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  placeholder={t("placeholder_serial_number")}
                />
                {errors.serialNumber && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    {t("required_error")}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_internal_code")}
                </label>
                <input
                  {...register("internalCode")}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  placeholder={t("placeholder_optional")}
                />
              </div>
            </div>

            {/* Fila 4: Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_acquisition_date")}
                </label>
                <Controller
                  name="acquisitionDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white shadow-sm"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_operational_date")}
                </label>
                <Controller
                  name="operationalDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white shadow-sm"
                    />
                  )}
                />
              </div>
            </div>

            {/* Fila 5: Vida Útil y Riesgo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_lifespan_years")}
                </label>
                <input
                  type="number"
                  {...register("lifespanYears")}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  placeholder={t("placeholder_lifespan")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_risk_level")}
                </label>
                <Controller
                  name="riskLevel"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all">
                        <SelectValue
                          placeholder={
                            <span className="text-gray-400 font-medium">
                              {t("placeholder_select")}
                            </span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                        <SelectItem
                          value="LOW"
                          className="text-xs font-bold rounded-xl"
                        >
                          {t("risk_low")}
                        </SelectItem>
                        <SelectItem
                          value="MEDIUM"
                          className="text-xs font-bold rounded-xl"
                        >
                          {t("risk_medium")}
                        </SelectItem>
                        <SelectItem
                          value="HIGH"
                          className="text-xs font-bold rounded-xl"
                        >
                          {t("risk_high")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.riskLevel && (
                  <span className="text-[10px] text-rose-500 font-bold">
                    {t("required_error")}
                  </span>
                )}
              </div>
            </div>

            {/* Fila 6: Centro de Costos y Precio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_cost_center")}
                </label>
                <Controller
                  name="currentAreaId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all">
                        <SelectValue
                          placeholder={
                            <span className="text-gray-400 font-medium">
                              {t("placeholder_cost_center")}
                            </span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                        {costCenters.map((cc) => (
                          <SelectItem
                            key={cc.id}
                            value={cc.id.toString()}
                            className="text-xs font-bold rounded-xl"
                          >
                            {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_purchase_price")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("purchasePrice")}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  placeholder={t("placeholder_purchase_price")}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 rounded-bl-3xl">
          <Button
            type="submit"
            form="register-equipment-form"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <QhSpinner size="sm" />
                <span>{t("btn_submitting")}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_confirm")}</span>
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};