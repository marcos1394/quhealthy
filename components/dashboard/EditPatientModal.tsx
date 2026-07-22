"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import { UserCog, Mail, Phone, X, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
      <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-black dark:text-white p-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors [&>button]:hidden">
        {/* HEADER */}
        <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
              <UserCog className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Módulo de Directorio
              </p>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                {t("edit_modal_title", { defaultValue: "Editar Perfil" })}
              </DialogTitle>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#111] transition-colors shrink-0 disabled:opacity-50"
          >
            <X
              className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col bg-white dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar"
        >
          <div className="p-6 md:p-8 space-y-8">
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              {t("edit_modal_description", {
                defaultValue:
                  "Actualice la información de contacto del paciente para recibir notificaciones y alertas del sistema.",
              })}
            </p>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  {t("email_label", { defaultValue: "Correo Electrónico" })}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="correo@ejemplo.com"
                  className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 transition-colors rounded-xl placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  {t("phone_label", { defaultValue: "Número Telefónico" })}
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+52 000 000 0000"
                  className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 transition-colors rounded-xl placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* NOM-024 (Datos Requeridos) */}
            <div className="pt-8 mt-2 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                Datos Complementarios (NOM-024)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    CURP
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
                    placeholder="18 Caracteres"
                    className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 rounded-xl uppercase"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Derechohabiencia
                  </label>
                  <Select
                    value={formData.healthInsurance}
                    onValueChange={(val) =>
                      setFormData({ ...formData, healthInsurance: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm font-medium focus:ring-emerald-500">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-xl shadow-xl">
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="IMSS">IMSS</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="ISSSTE">ISSSTE</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="INSABI">INSABI / SSA</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="PEMEX">PEMEX / SEDENA / SEMAR</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="SEGURO_PRIVADO">Seguro Médico Privado</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="NINGUNA">Ninguna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Domicilio Completo
                </label>
                <textarea
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Calle, número, colonia, código postal, ciudad, estado"
                  className="w-full min-h-[80px] p-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Grupo Étnico
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
                    placeholder="Seleccionar o crear"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                Contacto de Emergencia
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Nombre Completo
                  </label>
                  <Input
                    value={formData.emergencyContactName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContactName: e.target.value,
                      })
                    }
                    className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Teléfono
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
                    className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER DE COMANDOS */}
          <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 shrink-0 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
            >
              {t("cancel", { defaultValue: "Cancelar" })}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!formData.email && !formData.phone)}
              className="w-full sm:w-auto h-12 px-8 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2 border-0 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" /> Procesando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} />{" "}
                  {t("save_changes", { defaultValue: "Guardar Cambios" })}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
