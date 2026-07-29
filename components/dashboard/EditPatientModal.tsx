"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { UserCog, Mail, Phone, X, Save, Shield } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePatientDirectory } from "@/hooks/usePatientDirectory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { PatientDirectoryProfile } from "@/types/medicalHistory";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientDirectoryProfile | null;
  onUpdated?: () => void;
}

export function EditPatientModal({
  isOpen,
  onClose,
  patient,
  onUpdated,
}: EditPatientModalProps) {
  const { updatePatient, isSubmitting } = usePatientDirectory();
  const t = useTranslations("DashboardPatientDetail");

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    curp: "",
    ethnicGroup: "",
    healthInsurance: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    address: "",
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        email: patient.email || "",
        phone: patient.phone || "",
        curp: patient.curp || "",
        ethnicGroup: patient.ethnicGroup || "",
        healthInsurance: patient.healthInsurance || "",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
        address: patient.address || "",
      });
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const success = await updatePatient(patient.id, {
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      curp: formData.curp || undefined,
      ethnicGroup: formData.ethnicGroup || undefined,
      healthInsurance: formData.healthInsurance || undefined,
      emergencyContactName: formData.emergencyContactName || undefined,
      emergencyContactPhone: formData.emergencyContactPhone || undefined,
      address: formData.address || undefined,
    });

    if (success) {
      onUpdated?.();
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-colors [&>button]:hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 sm:p-8 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 dark:text-emerald-400">
              <UserCog className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t("edit_modal_module")}
              </p>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("edit_modal_title")}
              </DialogTitle>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── CUERPO DEL FORMULARIO ─────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 bg-white dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar"
        >
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("edit_modal_description")}
            </p>

            {/* Datos de Contacto Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("email_label")}</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={t("email_placeholder")}
                  className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("phone_label")}</span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder={t("phone_placeholder")}
                  className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs placeholder:text-gray-400 font-mono"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Datos Complementarios NOM-024 */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("nom024_section")}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("curp_label")}
                  </label>
                  <Input
                    value={formData.curp || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        curp: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={18}
                    placeholder={t("curp_placeholder")}
                    className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs uppercase"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("health_insurance_label")}
                  </label>
                  <Select
                    value={formData.healthInsurance}
                    onValueChange={(val) =>
                      setFormData({ ...formData, healthInsurance: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer">
                      <SelectValue placeholder={t("health_insurance_placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="IMSS">IMSS</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="ISSSTE">ISSSTE</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="INSABI">INSABI / SSA</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="PEMEX">PEMEX / SEDENA / SEMAR</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="SEGURO_PRIVADO">Seguro Médico Privado</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="NINGUNA">Ninguna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("address_label")}
                </label>
                <textarea
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder={t("address_placeholder")}
                  className="w-full min-h-[75px] p-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 rounded-xl resize-none shadow-2xs leading-relaxed"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("ethnic_group_label")}
                  </label>
                  <CreatableSelect
                    options={[
                      { label: "Ninguno", value: "Ninguno" },
                      { label: "Náhuatl", value: "Náhuatl" },
                      { label: "Maya", value: "Maya" },
                      { label: "Zapoteco", value: "Zapoteco" },
                      { label: "Mixteco", value: "Mixteco" },
                      { label: "Otomí", value: "Otomí" },
                      { label: "Totonaca", value: "Totonaca" },
                      { label: "Tsotsil", value: "Tsotsil" },
                      { label: "Tzeltal", value: "Tzeltal" },
                      { label: "Mazahua", value: "Mazahua" },
                      { label: "Huasteco", value: "Huasteco" },
                    ]}
                    value={formData.ethnicGroup || ""}
                    onChange={(val) =>
                      setFormData({ ...formData, ethnicGroup: val })
                    }
                    placeholder={t("ethnic_group_placeholder")}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="pt-2 space-y-3">
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("emergency_contact_title")}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("emergency_contact_name")}
                    </label>
                    <Input
                      value={formData.emergencyContactName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContactName: e.target.value,
                        })
                      }
                      className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("emergency_contact_phone")}
                    </label>
                    <Input
                      type="tel"
                      value={formData.emergencyContactPhone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContactPhone: e.target.value,
                        })
                      }
                      className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FOOTER DE COMANDOS ────────────────────────────────────── */}
          <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold rounded-xl disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!formData.email && !formData.phone)}
              className="w-full sm:w-auto h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 shadow-xs border-0 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("processing")}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span>{t("save_changes")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}