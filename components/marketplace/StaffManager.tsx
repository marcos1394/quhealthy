"use client"
/* eslint-disable react-doctor/no-giant-component */;

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
  Loader2
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
  role?: 'lead' | 'specialist' | 'assistant';
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
  onUpgrade
}: StaffManagerProps) {
  const t = useTranslations('StoreStaff.Manager');
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);

  // Helper para role badge
  const getRoleBadge = (role?: string) => {
    const roles = {
      lead: {
        label: t('roles.lead'),
        icon: Award
      },
      specialist: {
        label: t('roles.specialist'),
        icon: Star
      },
      assistant: {
        label: t('roles.assistant'),
        icon: User
      }
    };
    return roles[role as keyof typeof roles] || roles.specialist;
  };

  // Handle image upload
  const handleImageUpload = (memberId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('image_too_large'));
      return;
    }

    setUploadingImage(memberId);

    if (onImageUpload) {
      onImageUpload(memberId, file);
      toast.success(t('image_uploaded'));
    }

    setTimeout(() => setUploadingImage(null), 1000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505] gap-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-3">
            <Users className="w-5 h-5" strokeWidth={1.5} />
            {t('card_title')}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 font-light">
            <span>{t('card_desc')}</span>
            {isBusinessPlan && staff.length > 0 && (
              <span className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
                {staff.length} {staff.length === 1 ? t('member_single') : t('member_plural')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isBusinessPlan && (
            <span className="border border-amber-500 text-amber-600 bg-amber-50 px-3 py-1 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Crown className="w-3.5 h-3.5" strokeWidth={2} /> {t('business_plan_badge')}
            </span>
          )}
          <Button
            onClick={onAdd}
            disabled={!isBusinessPlan}
            className={cn(
              "rounded-none h-10 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors border-0",
              !isBusinessPlan
                ? "bg-gray-100 text-gray-400 dark:bg-gray-900 cursor-not-allowed border border-gray-200 dark:border-gray-800"
                : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            )}
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> {t('btn_add')}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">

        {/* Upsell Message (Architectural Blueprint Note) */}
        {!isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 p-6 flex flex-col md:flex-row gap-6 items-start"
          >
            <div className="w-12 h-12 border border-amber-500 flex items-center justify-center bg-white dark:bg-black shrink-0">
              <Crown className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">
                {t('upsell_title')}
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-light mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('upsell_desc') }} />

              {/* Benefits List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 border border-amber-200 dark:border-amber-800 p-3 bg-white/50 dark:bg-black/50">
                  <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">{t('upsell_benefit_1')}</span>
                </div>
                <div className="flex items-center gap-3 border border-amber-200 dark:border-amber-800 p-3 bg-white/50 dark:bg-black/50">
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">{t('upsell_benefit_2')}</span>
                </div>
                <div className="flex items-center gap-3 border border-amber-200 dark:border-amber-800 p-3 bg-white/50 dark:bg-black/50">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">{t('upsell_benefit_3')}</span>
                </div>
                <div className="flex items-center gap-3 border border-amber-200 dark:border-amber-800 p-3 bg-white/50 dark:bg-black/50">
                  <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">{t('upsell_benefit_4')}</span>
                </div>
              </div>

              {onUpgrade && (
                <Button
                  onClick={onUpgrade}
                  className="rounded-none bg-amber-500 text-white hover:bg-amber-600 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors w-full sm:w-auto"
                >
                  <Crown className="w-4 h-4 mr-3" strokeWidth={2} />
                  {t('btn_upgrade')}
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
                    "group relative border transition-all duration-300 bg-white dark:bg-[#0a0a0a]",
                    member.isNew || member.hasUnsavedChanges
                      ? "border-black dark:border-white ring-1 ring-black dark:ring-white"
                      : "border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white"
                  )}
                >
                  <div className="flex flex-col lg:flex-row">
                    
                    {/* Lateral Info / Meta */}
                    <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-6 md:p-8 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400">
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                          {(member.isNew || member.hasUnsavedChanges) && (
                            <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-2 py-1 flex items-center gap-1.5">
                              <AlertCircle className="w-3 h-3" /> {t('badge_unsaved')}
                            </span>
                          )}
                        </div>

                        {/* Avatar Upload (Architectural Square) */}
                        <div className="relative group/avatar mt-4">
                          <label htmlFor={`avatar-${member.id}`} className="cursor-pointer block w-full aspect-square border border-gray-300 dark:border-gray-700 bg-white dark:bg-black relative overflow-hidden group-hover/avatar:border-black dark:group-hover/avatar:border-white transition-colors">
                            {member.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={member.imageUrl} alt="Avatar" className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-500" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#050505]">
                                <User className="w-12 h-12 mb-2" strokeWidth={1} />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-center px-4">Subir Foto</span>
                              </div>
                            )}

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                              {uploadingImage === member.id ? (
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-white mb-2" strokeWidth={1.5} />
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-white border border-white px-2 py-1">{t('change_photo')}</span>
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
                          <div className="border border-black dark:border-white px-3 py-2 bg-white dark:bg-black flex items-center gap-2 mt-4">
                            <RoleIcon className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                              {roleBadge.label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8">
                        <Button
                          variant="ghost"
                          onClick={() => setMemberToDelete(member)}
                          className="w-full rounded-none border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-900/50 transition-colors h-10 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Eliminar Ficha
                        </Button>
                      </div>
                    </div>

                    {/* Form Fields Area */}
                    <div className="flex-1 p-6 md:p-8 space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                            {t('label_name')}
                          </Label>
                          <Input
                            value={member.name}
                            onChange={(e) => onUpdate(member.id, 'name', e.target.value)}
                            placeholder={t('placeholder_name')}
                            className={cn(
                              "rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors",
                              !member.name ? "border-red-500 dark:border-red-500" : ""
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                            {t('label_specialty')}
                          </Label>
                          <Input
                            value={member.specialty}
                            onChange={(e) => onUpdate(member.id, 'specialty', e.target.value)}
                            placeholder={t('placeholder_specialty')}
                            className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center justify-between">
                          {t('label_credentials')}
                          <span className="text-[9px] font-light text-gray-500 lowercase tracking-normal">({t('optional')})</span>
                        </Label>
                        <Input
                          value={member.credentials || ''}
                          onChange={(e) => onUpdate(member.id, 'credentials', e.target.value)}
                          placeholder={t('placeholder_credentials')}
                          className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                            {t('label_bio')}
                          </Label>
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-widest border px-2 py-0.5",
                            bioLength > 150 ? "border-amber-500 text-amber-500" : "border-gray-300 dark:border-gray-700 text-gray-400"
                          )}>
                            {bioLength}/200
                          </span>
                        </div>
                        <Textarea
                          value={member.bio}
                          onChange={(e) => onUpdate(member.id, 'bio', e.target.value.slice(0, 200))}
                          placeholder={t('placeholder_bio')}
                          rows={4}
                          maxLength={200}
                          className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm p-4 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors resize-none font-light"
                        />
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State (Architectural Blueprint) */}
        {isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] transition-colors"
          >
            <div className="w-16 h-16 border border-gray-400 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-black mb-6">
              <Users className="w-6 h-6 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">{t('empty_title')}</p>
            <p className="text-xs text-gray-500 font-light mb-8 text-center max-w-md">
              {t('empty_desc')}
            </p>
            <Button 
              onClick={onAdd}
              className="rounded-none bg-black text-white dark:bg-white dark:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-0"
            >
              <Plus className="w-4 h-4 mr-3" strokeWidth={2} />
              {t('btn_add_first')}
            </Button>
          </motion.div>
        )}

        {/* Team Benefits Footer (Margin Note Format) */}
        {staff.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-l-2 border-black dark:border-white pl-6 py-4 bg-gray-50 dark:bg-[#050505]"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-4">
              <Info className="w-4 h-4" strokeWidth={1.5} /> {t('tip_title')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 font-light">
              <div className="flex items-center gap-3">
                <Check className="w-3.5 h-3.5 text-black dark:text-white" /> <span>{t('tip_1')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-3.5 h-3.5 text-black dark:text-white" /> <span>{t('tip_2')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-3.5 h-3.5 text-black dark:text-white" /> <span>{t('tip_3')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-3.5 h-3.5 text-black dark:text-white" /> <span>{t('tip_4')}</span>
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
        title={t('confirm_delete_title', { defaultValue: 'Eliminar Miembro' })}
        message={t('confirm_delete', { name: memberToDelete?.name || t('confirm_delete_fallback') })}
      />
    </div>
  );
}