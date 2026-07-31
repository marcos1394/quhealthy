"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Save, UserCircle } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { staffService } from "@/services/staff.service";
import { StaffDTO } from "@/types/staff";

export function ProviderProfileSettings() {
  const t = useTranslations("ProviderProfileSettings");

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staffId, setStaffId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const staffList = await staffService.getMyStaff();
        const leadStaff = staffList.find((s) => s.role === "LEAD");

        if (leadStaff) {
          setStaffId(leadStaff.id || null);
          setFormData({
            name: leadStaff.name || "",
            specialty: leadStaff.specialty || "",
            email: leadStaff.email || "",
            phone: leadStaff.phone || "",
            bio: leadStaff.bio || "",
          });
        }
      } catch (error) {
        console.error("Error al obtener perfil del proveedor:", error);
        toast.error(t("toast_load_error"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [t]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error(t("err_name_required"));
      return;
    }

    setIsSaving(true);
    try {
      const payload: StaffDTO = {
        name: formData.name,
        specialty: formData.specialty,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        role: "LEAD",
      };

      if (staffId) {
        await staffService.updateStaffMember(staffId, payload);
        toast.success(t("toast_update_success"));
      } else {
        const newStaff = await staffService.addStaffMember(payload);
        setStaffId(newStaff.id || null);
        toast.success(t("toast_create_success"));
      }
    } catch (err) {
      console.error("Error al guardar perfil del proveedor:", err);
      toast.error(t("toast_save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[300px]">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── CABECERA DEL PERFIL ───────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <UserCircle className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("card_title")}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("card_desc")}
          </p>
        </div>
      </div>

      {/* ── FORMULARIO PRINCIPAL ─────────────────────────────────────── */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nombre Completo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_name")}
            </Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t("placeholder_name")}
              className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          {/* Especialidad */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_specialty")}
            </Label>
            <Input
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              placeholder={t("placeholder_specialty")}
              className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_email")}
            </Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t("placeholder_email")}
              className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          {/* Teléfono Público */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_phone")}
            </Label>
            <Input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t("placeholder_phone")}
              className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-mono font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Biografía Corta */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("label_bio")}
          </Label>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder={t("placeholder_bio")}
            rows={4}
            className="rounded-2xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white p-4 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all resize-none shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>

        {/* Acciones */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <QhSpinner size="sm" className="text-white" />
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
      </form>
    </div>
  );
}