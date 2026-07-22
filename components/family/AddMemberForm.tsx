import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { m } from "framer-motion";
import { Plus, X, Loader2, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFamily } from "@/hooks/useFamily";
import { DependentRequest } from "@/types/dependent";

interface AddMemberFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function AddMemberForm({ onCancel, onSuccess }: AddMemberFormProps) {
  const t = useTranslations("PatientFamilyDashboard");
  const { addMember, isSubmitting } = useFamily();

  const [formData, setFormData] = useState<DependentRequest>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "OTHER",
    relationship: "CHILD",
    medicalNotes: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "OTHER",
      relationship: "CHILD",
      medicalNotes: "",
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMember(formData, () => {
      resetForm();
      onSuccess();
    });
  };

  const minDate = useMemo(() => new Date("1900-01-01"), []);
  const maxDate = useMemo(() => new Date(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <m.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-8 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 p-6 md:p-8">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t("form_title") || "Creación de Expediente"}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Defina los parámetros básicos de identidad para el nuevo
              dependiente.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleAddSubmit} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 block">
                {t("label_first_name") || "Nombre(s)"}
              </label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm focus-visible:ring-2 focus-visible:ring-quhealthy-green/20 focus-visible:border-quhealthy-green transition-all shadow-sm"
                placeholder="Ej. María"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 block">
                {t("label_last_name") || "Apellidos"}
              </label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm focus-visible:ring-2 focus-visible:ring-quhealthy-green/20 focus-visible:border-quhealthy-green transition-all shadow-sm"
                placeholder="Ej. Pérez"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 block">
                {t("label_dob") || "Fecha de nacimiento"}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-start rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm font-normal focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all shadow-sm",
                      !formData.dateOfBirth && "text-gray-400",
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4" strokeWidth={2} />
                    {formData.dateOfBirth ? (
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {format(
                          new Date(`${formData.dateOfBirth}T12:00:00`),
                          "dd MMM yyyy",
                          { locale: es },
                        )}
                      </span>
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[100] w-auto rounded-xl border border-gray-200 dark:border-gray-800 p-0 bg-white dark:bg-[#0a0a0a] shadow-lg overflow-hidden"
                  align="start"
                >
                  <CalendarUI
                    mode="single"
                    selected={
                      formData.dateOfBirth
                        ? new Date(`${formData.dateOfBirth}T12:00:00`)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    disabled={(date) => date > maxDate || date < minDate}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={currentYear}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 block">
                {t("label_relationship") || "Parentesco"}
              </label>
              <Select
                value={formData.relationship}
                onValueChange={(val) =>
                  setFormData({ ...formData, relationship: val })
                }
                required
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm focus:ring-2 focus:ring-quhealthy-green/20 focus:border-quhealthy-green transition-all shadow-sm">
                  <SelectValue placeholder="Seleccione vínculo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                  <SelectItem
                    value="CHILD"
                    className="text-sm font-medium"
                  >
                    {t("rel_child") || "Hijo/a"}
                  </SelectItem>
                  <SelectItem
                    value="PARENT"
                    className="text-sm font-medium"
                  >
                    {t("rel_parent") || "Padre/Madre"}
                  </SelectItem>
                  <SelectItem
                    value="SPOUSE"
                    className="text-sm font-medium"
                  >
                    {t("rel_spouse") || "Cónyuge"}
                  </SelectItem>
                  <SelectItem
                    value="SIBLING"
                    className="text-sm font-medium"
                  >
                    {t("rel_sibling") || "Hermano/a"}
                  </SelectItem>
                  <SelectItem
                    value="OTHER"
                    className="text-sm font-medium"
                  >
                    {t("rel_other") || "Otro"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-4 border-t border-gray-100 dark:border-gray-800 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-12 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-bold px-8 transition-all shadow-sm"
            >
              {t("btn_cancel") || "Cancelar"}
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.dateOfBirth
              }
              className="h-12 rounded-xl bg-quhealthy-green text-white hover:bg-emerald-700 text-sm font-bold px-8 transition-all shadow-sm border-0 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="mr-3 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-3 h-4 w-4" strokeWidth={2} />
              )}
              {t("btn_save") || "Guardar Registro"}
            </Button>
          </div>
        </form>
      </div>
    </m.div>
  );
}
