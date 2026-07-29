"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Save, Building2, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

import {
  accountingService,
  CostCenterRequestDTO,
} from "@/services/accounting.service";
import { CostCenterDTO } from "@/types/accounting";
import { locationService } from "@/services/location.service";
import { ProviderLocation } from "@/types/providerLocation";

interface CreateCostCenterForm {
  name: string;
  code: string;
  locationId: string;
}

interface CreateCostCenterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  parentId?: string | null;
  parentName?: string;
  editNode?: CostCenterDTO | null;
}

export function CreateCostCenterDrawer({
  open,
  onOpenChange,
  onSuccess,
  parentId,
  parentName,
  editNode,
}: CreateCostCenterDrawerProps) {
  const t = useTranslations("CreateCostCenterDrawer");

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateCostCenterForm>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<ProviderLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const fetchLocations = useCallback(async () => {
    setIsLoadingLocations(true);
    try {
      const data = await locationService.getMyLocations();
      setLocations(data || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_locations_error"));
    } finally {
      setIsLoadingLocations(false);
    }
  }, [t]);

  useEffect(() => {
    if (open) {
      fetchLocations();

      if (editNode) {
        setValue("name", editNode.name);
        setValue("code", editNode.code);
        if (editNode.associatedAreaId) {
          setValue("locationId", editNode.associatedAreaId.toString());
        }
      } else {
        reset();
      }
    }
  }, [open, editNode, setValue, reset, fetchLocations]);

  const onSubmit = async (data: CreateCostCenterForm) => {
    setIsSubmitting(true);
    try {
      const payload: CostCenterRequestDTO = {
        name: data.name,
        code: data.code,
        locationId: Number(data.locationId),
      };

      if (parentId && !editNode) {
        payload.parentId = parentId;
      }

      if (editNode) {
        await accountingService.updateCostCenter(editNode.id, payload);
        toast.success(t("toasts.update_success"));
      } else {
        await accountingService.createCostCenter(payload);
        toast.success(t("toasts.create_success"));
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      const apiMessage = error?.response?.data?.message;
      toast.error(apiMessage || t("toasts.default_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 p-0 overflow-y-auto sm:rounded-l-3xl shadow-2xl flex flex-col h-full font-sans text-gray-900 dark:text-white">
        
        {/* ── HEADER SHEET ────────────────────────────────────────────── */}
        <SheetHeader className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0 rounded-tl-3xl text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <Building2 className="w-6 h-6" strokeWidth={2} />
            </div>
            <SheetClose className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-4 h-4" strokeWidth={2} />
            </SheetClose>
          </div>
          <SheetTitle className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            {editNode
              ? t("title_edit")
              : parentId
              ? t("title_sub")
              : t("title_new")}
          </SheetTitle>
          <SheetDescription className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {editNode
              ? t("subtitle_edit", { name: editNode.name })
              : parentId
              ? t("subtitle_sub", { name: parentName || "" })
              : t("subtitle_new")}
          </SheetDescription>
        </SheetHeader>

        {/* ── FORMULARIO PRINCIPAL ─────────────────────────────────────── */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
          {isLoadingLocations ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <QhSpinner size="md" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                {t("loading_locations")}
              </p>
            </div>
          ) : (
            <form
              id="create-cost-center-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Sucursal / Ubicación */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_location")}
                </Label>
                <Controller
                  name="locationId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full h-11 px-3 text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
                        <SelectValue placeholder={t("placeholder_location")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-52">
                        {locations.map((loc) => (
                          <SelectItem
                            key={loc.id}
                            value={loc.id.toString()}
                            className="text-xs font-bold rounded-xl"
                          >
                            {loc.name}{" "}
                            {loc.isMain ? t("main_branch_tag") : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.locationId && (
                  <span className="text-[10px] text-rose-500 font-bold block mt-1">
                    {t("error_required")}
                  </span>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_name")}
                </Label>
                <Input
                  {...register("name", { required: true })}
                  className="w-full h-11 px-3 text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
                  placeholder={t("placeholder_name")}
                />
                {errors.name && (
                  <span className="text-[10px] text-rose-500 font-bold block mt-1">
                    {t("error_required")}
                  </span>
                )}
              </div>

              {/* Código */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_code")}
                </Label>
                <Input
                  {...register("code", { required: true })}
                  className="w-full h-11 px-3 text-xs font-mono font-bold uppercase rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
                  placeholder={t("placeholder_code")}
                />
                {errors.code && (
                  <span className="text-[10px] text-rose-500 font-bold block mt-1">
                    {t("error_required")}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>

        {/* ── FOOTER BOTÓN ────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] shrink-0 rounded-bl-3xl">
          <Button
            type="submit"
            form="create-cost-center-form"
            disabled={isSubmitting || isLoadingLocations}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all border-0 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <QhSpinner size="sm" />
                <span>{t("btn_saving")}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_save")}</span>
              </>
            )}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}