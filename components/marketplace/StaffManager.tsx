"use client";
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Trash2,
  User,
  Crown,
  Upload,
  Camera,
  Check,
  Sparkles,
  TrendingUp,
  Star,
  Award,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// --- TIPOS ---
export interface StaffMember {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  imageUrl?: string;
  role?: "lead" | "specialist" | "assistant";
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
    null,
  );

  // Helper para role badge
  const getRoleBadge = (role?: string) => {
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
    };
    return roles[role as keyof typeof roles] || roles.specialist;
  };

  // Handle image upload
  const handleImageUpload = (
    memberId: number,
    event: React.ChangeEvent<HTMLInputElement>,
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
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] rounded-t-3xl gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            {t("card_title")}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-sm font-medium text-gray-500">
            <span>{t("card_desc")}</span>
            {isBusinessPlan && staff.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {staff.length}{" "}
                {staff.length === 1 ? t("member_single") : t("member_plural")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isBusinessPlan && (
            <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Crown className="w-4 h-4" strokeWidth={2} />{" "}
              {t("business_plan_badge")}
            </span>
          )}
          <Button
            onClick={onAdd}
            disabled={!isBusinessPlan}
            className={cn(
              "rounded-xl h-10 px-6 text-sm font-bold transition-colors shadow-sm",
              !isBusinessPlan
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700",
            )}
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> {t("btn_add")}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-white dark:bg-[#0a0a0a] rounded-b-3xl">
        {/* Upsell Message */}
        {!isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-200 dark:border-amber-900/30 p-6 flex flex-col md:flex-row gap-6 items-start bg-amber-50 dark:bg-amber-900/10 shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2">
                {t("upsell_title")}
              </h4>
              <p
                className="text-sm text-amber-700/80 dark:text-amber-400/80 font-medium mb-6 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t("upsell_desc") }}
              />

              {/* Benefits List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 p-4 bg-white/50 dark:bg-black/50 shadow-sm">
                  <TrendingUp
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    strokeWidth={2}
                  />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    {t("upsell_benefit_1")}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 p-4 bg-white/50 dark:bg-black/50 shadow-sm">
                  <Users
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    strokeWidth={2}
                  />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    {t("upsell_benefit_2")}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 p-4 bg-white/50 dark:bg-black/50 shadow-sm">
                  <Sparkles
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    strokeWidth={2}
                  />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    {t("upsell_benefit_3")}
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 p-4 bg-white/50 dark:bg-black/50 shadow-sm">
                  <Star
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    strokeWidth={2}
                  />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    {t("upsell_benefit_4")}
                  </span>
                </div>
              </div>

              {onUpgrade && (
                <Button
                  onClick={onUpgrade}
                  className="rounded-xl bg-amber-500 text-white hover:bg-amber-600 h-12 px-8 text-sm font-bold transition-colors w-full sm:w-auto shadow-sm border-0"
                >
                  <Crown className="w-4 h-4 mr-3" strokeWidth={2} />
                  {t("btn_upgrade")}
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Staff Members List */}
        <div className="grid grid-cols-1 gap-8">
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
                  transition={{ duration: 0.4 }}
                  layout
                  className={cn(
                    "group relative rounded-3xl border transition-all duration-300 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden",
                    member.isNew || member.hasUnsavedChanges
                      ? "border-emerald-500 ring-1 ring-emerald-500/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md",
                  )}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Lateral Info / Meta */}
                    <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 p-6 md:p-8 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400">
                            #{String(index + 1).padStart(2, "0")}
                          </span>
                          {(member.isNew || member.hasUnsavedChanges) && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                              <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />{" "}
                              {t("badge_unsaved")}
                            </span>
                          )}
                        </div>

                        {/* Avatar Upload */}
                        <div className="relative group/avatar mt-6">
                          <label
                            htmlFor={`avatar-${member.id}`}
                            className="cursor-pointer block w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] relative overflow-hidden group-hover/avatar:border-emerald-500 transition-colors shadow-sm"
                          >
                            {member.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={member.imageUrl}
                                alt="Avatar"
                                className="w-full h-full object-cover transition-all duration-500 group-hover/avatar:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-[#050505]/50 group-hover/avatar:bg-emerald-50/50 dark:group-hover/avatar:bg-emerald-900/10 transition-colors">
                                <User
                                  className="w-12 h-12 mb-2 group-hover/avatar:text-emerald-500 transition-colors"
                                  strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4 group-hover/avatar:text-emerald-600 transition-colors">
                                  Subir Foto
                                </span>
                              </div>
                            )}

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                              {uploadingImage === member.id ? (
                                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" strokeWidth={2} />
                              ) : (
                                <>
                                  <Upload
                                    className="w-6 h-6 text-white mb-2"
                                    strokeWidth={2}
                                  />
                                  <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full">
                                    {t("change_photo")}
                                  </span>
                                </>
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

                        {member.role && (
                          <div className="rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-[#0a0a0a] flex items-center gap-3 mt-6 shadow-sm">
                            <RoleIcon
                              className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                              strokeWidth={2}
                            />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                              {roleBadge.label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8">
                        <Button
                          variant="ghost"
                          onClick={() => setMemberToDelete(member)}
                          className="w-full rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 transition-colors h-12 text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />{" "}
                          Eliminar Ficha
                        </Button>
                      </div>
                    </div>

                    {/* Form Fields Area */}
                    <div className="flex-1 p-6 md:p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            {t("label_name")}
                          </Label>
                          <Input
                            value={member.name}
                            onChange={(e) =>
                              onUpdate(member.id, "name", e.target.value)
                            }
                            placeholder={t("placeholder_name")}
                            className={cn(
                              "rounded-2xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm font-medium focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors shadow-sm",
                              !member.name
                                ? "border-red-300 dark:border-red-500/50 ring-1 ring-red-500/20"
                                : "",
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            {t("label_specialty")}
                          </Label>
                          <Input
                            value={member.specialty}
                            onChange={(e) =>
                              onUpdate(member.id, "specialty", e.target.value)
                            }
                            placeholder={t("placeholder_specialty")}
                            className="rounded-2xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm font-medium focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center justify-between">
                          {t("label_credentials")}
                          <span className="text-xs font-medium text-gray-500 normal-case tracking-normal">
                            ({t("optional")})
                          </span>
                        </Label>
                        <Input
                          value={member.credentials || ""}
                          onChange={(e) =>
                            onUpdate(member.id, "credentials", e.target.value)
                          }
                          placeholder={t("placeholder_credentials")}
                          className="rounded-2xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm font-medium focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors shadow-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                            {t("label_bio")}
                          </Label>
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                              bioLength > 150
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
                            )}
                          >
                            {bioLength}/200
                          </span>
                        </div>
                        <Textarea
                          value={member.bio}
                          onChange={(e) =>
                            onUpdate(
                              member.id,
                              "bio",
                              e.target.value.slice(0, 200),
                            )
                          }
                          placeholder={t("placeholder_bio")}
                          rows={4}
                          maxLength={200}
                          className="rounded-2xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm font-medium p-5 focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors resize-none shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 transition-colors shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6 shadow-sm">
              <Users
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                strokeWidth={2}
              />
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-white mb-2">
              {t("empty_title")}
            </p>
            <p className="text-sm text-gray-500 font-medium mb-8 text-center max-w-md">
              {t("empty_desc")}
            </p>
            <Button
              onClick={onAdd}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 h-12 px-8 text-sm font-bold transition-colors shadow-sm border-0"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
              {t("btn_add_first")}
            </Button>
          </motion.div>
        )}

        {/* Team Benefits Footer */}
        {staff.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-sm flex gap-4"
          >
            <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-3">
                {t("tip_title")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-emerald-700/80 dark:text-emerald-400/80 font-medium">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} />
                  <span>{t("tip_1")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} />
                  <span>{t("tip_2")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} />
                  <span>{t("tip_3")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" strokeWidth={2.5} />
                  <span>{t("tip_4")}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete) {
            onDelete(memberToDelete.id);
            setMemberToDelete(null);
          }
        }}
        title={t("confirm_delete_title", { defaultValue: "Eliminar Miembro" })}
        message={t("confirm_delete", {
          name: memberToDelete?.name || t("confirm_delete_fallback"),
        })}
      />
    </div>
  );
}
