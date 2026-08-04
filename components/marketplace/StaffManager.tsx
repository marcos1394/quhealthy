"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Trash2,
  User,
  Crown,
  Upload,
  Check,
  Sparkles,
  TrendingUp,
  Star,
  Award,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// ── TIPOS ──────────────────────────────────────────────────────────────
export interface StaffMember {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  imageUrl?: string;
  role?: "professional" | "lead" | "specialist" | "assistant";
  credentials?: string;
  isNew?: boolean;
  hasUnsavedChanges?: boolean;
}

interface StaffManagerProps {
  staff: StaffMember[];
  onAdd: () => void;
  onUpdate: (id: number, field: keyof StaffMember, value: string) => void;
  onDelete: (id: number) => void;
  onImageUpload?: (id: number, file: File) => void;
  isBusinessPlan?: boolean;
  onUpgrade?: () => void;
}

export function StaffManager({
  staff,
  onAdd,
  onUpdate,
  onDelete,
  onImageUpload,
  isBusinessPlan = false,
  onUpgrade,
}: StaffManagerProps) {
  const t = useTranslations("StoreStaff.Manager");
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(
    null
  );

  // Helper para insignias de rol
  const getRoleBadge = useMemo(() => {
    return (role?: string) => {
      const roles = {
        lead: {
          label: t("roles.lead"),
          icon: Award,
        },
        specialist: {
          label: t("roles.specialist"),
          icon: Star,
        },
        assistant: {
          label: t("roles.assistant"),
          icon: User,
        },
        professional: {
          label: t("roles.professional") || "Profesional",
          icon: Star,
        },
      };
      return roles[role as keyof typeof roles] || roles.professional;
    };
  }, [t]);

  // Manejo de carga de imagen
  const handleImageUpload = (
    memberId: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("image_too_large"));
      return;
    }

    setUploadingImage(memberId);

    if (onImageUpload) {
      onImageUpload(memberId, file);
      toast.success(t("image_uploaded"));
    }

    setTimeout(() => setUploadingImage(null), 1000);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors select-none overflow-hidden">
      {/* ── CABECERA SUPERIOR ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505] gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Users className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("card_title")}
            </h2>
            <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>{t("card_desc")}</span>
              {isBusinessPlan && staff.length > 0 && (
                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs">
                  {staff.length}{" "}
                  {staff.length === 1
                    ? t("member_single")
                    : t("member_plural")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isBusinessPlan && (
            <span className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0">
              <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              <span>{t("business_plan_badge")}</span>
            </span>
          )}

          <Button
            type="button"
            onClick={onAdd}
            disabled={!isBusinessPlan}
            className={cn(
              "h-11 px-6 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              !isBusinessPlan
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_add")}</span>
          </Button>
        </div>
      </div>

      {/* ── CUERPO DE MIEMBROS ────────────────────────────────────────── */}
      <div className="p-6 md:p-8 space-y-8">
        {/* Banner de Upgrade para Planes Gratuitos */}
        {!isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-3xl border border-amber-200/80 dark:border-amber-900/40 p-6 flex flex-col md:flex-row gap-6 items-start bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 shadow-2xs">
              <Crown className="w-6 h-6" strokeWidth={2} />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-300">
                  {t("upsell_title")}
                </h4>
                <p
                  className="text-xs font-medium text-amber-800/80 dark:text-amber-400/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t("upsell_desc") }}
                />
              </div>

              {/* Grid de Beneficios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  t("upsell_benefit_1"),
                  t("upsell_benefit_2"),
                  t("upsell_benefit_3"),
                  t("upsell_benefit_4"),
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 p-3 bg-white/80 dark:bg-[#0a0a0a]/80 shadow-2xs"
                  >
                    <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {onUpgrade && (
                <Button
                  type="button"
                  onClick={onUpgrade}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white h-11 px-8 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer w-full sm:w-auto"
                >
                  <Crown className="w-4 h-4 mr-2" strokeWidth={2} />
                  <span>{t("btn_upgrade")}</span>
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Listado de Miembros del Equipo */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {staff.map((member, index) => {
              const roleBadge = getRoleBadge(member.role);
              const RoleIcon = roleBadge.icon;
              const bioLength = member.bio?.length || 0;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  layout
                  className={cn(
                    "group relative rounded-3xl border transition-all duration-200 bg-white dark:bg-[#0a0a0a] shadow-2xs overflow-hidden",
                    member.isNew || member.hasUnsavedChanges
                      ? "border-emerald-500/80 ring-1 ring-emerald-500/20"
                      : "border-gray-100 dark:border-gray-800 hover:border-emerald-500/30"
                  )}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Lateral Izquierdo: Meta y Avatar */}
                    <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-6 md:p-8 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-gray-400">
                            #{String(index + 1).padStart(2, "0")}
                          </span>

                          {(member.isNew || member.hasUnsavedChanges) && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                              <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                              <span>{t("badge_unsaved")}</span>
                            </span>
                          )}
                        </div>

                        {/* Dropzone de Avatar */}
                        <div className="relative group/avatar">
                          <label
                            htmlFor={`avatar-${member.id}`}
                            className="cursor-pointer block w-full aspect-square rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] relative overflow-hidden group-hover/avatar:border-emerald-500 transition-colors shadow-2xs"
                          >
                            {member.imageUrl ? (
                              <img
                                src={member.imageUrl}
                                alt={member.name || "Avatar"}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-[#050505] group-hover/avatar:bg-emerald-50/20 transition-colors p-4 text-center">
                                <User
                                  className="w-10 h-10 mb-2 group-hover/avatar:text-emerald-600 dark:group-hover/avatar:text-emerald-400 transition-colors"
                                  strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover/avatar:text-emerald-600 transition-colors">
                                  {t("upload_photo")}
                                </span>
                              </div>
                            )}

                            {/* Overlay en Hover */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                              {uploadingImage === member.id ? (
                                <QhSpinner size="md" className="text-white" />
                              ) : (
                                <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-2xs flex items-center gap-1.5">
                                  <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>{t("change_photo")}</span>
                                </span>
                              )}
                            </div>
                          </label>

                          <input
                            id={`avatar-${member.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(member.id, e)}
                          />
                        </div>

                        {/* Insignia de Rol */}
                        {member.role && (
                          <div className="rounded-xl border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 bg-white dark:bg-[#0a0a0a] flex items-center gap-2.5 shadow-2xs">
                            <RoleIcon
                              className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                              strokeWidth={2}
                            />
                            <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {roleBadge.label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setMemberToDelete(member)}
                          className="w-full rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all h-10 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                          <span>{t("btn_delete_card")}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Formulario Principal */}
                    <div className="flex-1 p-6 md:p-8 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Nombre */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {t("label_name")}
                          </Label>
                          <Input
                            value={member.name}
                            onChange={(e) =>
                              onUpdate(member.id, "name", e.target.value)
                            }
                            placeholder={t("placeholder_name")}
                            className={cn(
                              "rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs",
                              !member.name
                                ? "border-rose-200 dark:border-rose-900/50"
                                : ""
                            )}
                          />
                        </div>

                        {/* Especialidad */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {t("label_specialty")}
                          </Label>
                          <Input
                            value={member.specialty}
                            onChange={(e) =>
                              onUpdate(member.id, "specialty", e.target.value)
                            }
                            placeholder={t("placeholder_specialty")}
                            className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Cédula / Credenciales */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                          <span>{t("label_credentials")}</span>
                          <span className="text-[11px] font-normal text-gray-400">
                            ({t("optional")})
                          </span>
                        </Label>
                        <Input
                          value={member.credentials || ""}
                          onChange={(e) =>
                            onUpdate(member.id, "credentials", e.target.value)
                          }
                          placeholder={t("placeholder_credentials")}
                          className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-mono font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Biografía */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {t("label_bio")}
                          </Label>
                          <span className="text-[10px] font-bold font-mono text-gray-400">
                            {bioLength} / 200
                          </span>
                        </div>
                        <Textarea
                          value={member.bio}
                          onChange={(e) =>
                            onUpdate(
                              member.id,
                              "bio",
                              e.target.value.slice(0, 200)
                            )
                          }
                          placeholder={t("placeholder_bio")}
                          rows={4}
                          maxLength={200}
                          className="rounded-2xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold p-4 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all resize-none shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Estado Vacío cuando se posee el Plan Business */}
        {isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-2xs">
              <Users className="w-8 h-8" strokeWidth={2} />
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">
              {t("empty_title")}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              {t("empty_desc")}
            </p>
            <Button
              type="button"
              onClick={onAdd}
              className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_add_first")}</span>
            </Button>
          </motion.div>
        )}

        {/* Pie de Página con Recomendaciones de Equipo */}
        {staff.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] shadow-2xs flex flex-col md:flex-row gap-6 items-start md:items-center"
          >
            <div className="flex items-center gap-3 md:w-1/3 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-4 md:pb-0 md:pr-6 w-full">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <TrendingUp className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                {t("tip_title")}
              </p>
            </div>

            <div className="md:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>{t("tip_1")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>{t("tip_2")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>{t("tip_3")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>{t("tip_4")}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal de Confirmación para Eliminación */}
      <ConfirmationModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete) {
            onDelete(memberToDelete.id);
            setMemberToDelete(null);
          }
        }}
        title={t("confirm_delete_title")}
        message={t("confirm_delete", {
          name: memberToDelete?.name || t("confirm_delete_fallback"),
        })}
      />
    </div>
  );
}