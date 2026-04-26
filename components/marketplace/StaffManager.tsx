"use client";

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
  Info
} from "lucide-react";
import { toast } from "react-toastify";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  // Helper para role badge - Dinámico con traducciones
  const getRoleBadge = (role?: string) => {
    const roles = {
      lead: {
        label: t('roles.lead'),
        color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
        icon: Award
      },
      specialist: {
        label: t('roles.specialist'),
        color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        icon: Star
      },
      assistant: {
        label: t('roles.assistant'),
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
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
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">

      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white text-xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-2 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-500/10 dark:to-yellow-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20"
            >
              <Users className="w-6 h-6 text-orange-500 dark:text-orange-400" />
            </motion.div>
            {t('card_title')}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            {t('card_desc')}
            {isBusinessPlan && staff.length > 0 && (
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                {staff.length} {staff.length === 1 ? t('member_single') : t('member_plural')}
              </Badge>
            )}
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          {!isBusinessPlan && (
            <Badge variant="outline" className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-500/10 dark:to-yellow-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 hidden sm:flex gap-1">
              <Crown className="w-3 h-3" /> {t('business_plan_badge')}
            </Badge>
          )}
          <Button
            onClick={onAdd}
            disabled={!isBusinessPlan}
            className={cn(
              "shadow-2xl transition-all duration-300",
              !isBusinessPlan
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                : ""
            )}
          >
            <Plus className="w-4 h-4 mr-2" /> {t('btn_add')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">

        {/* Upsell Message */}
        {!isBusinessPlan && staff.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-500/5 dark:to-yellow-500/5 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-5"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-xl">
                <Crown className="w-6 h-6 text-orange-500 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-orange-800 dark:text-orange-300 mb-2">
                  {t('upsell_title')}
                </h4>
                <p className="text-sm text-orange-700/80 dark:text-orange-200/80 mb-4" dangerouslySetInnerHTML={{ __html: t('upsell_desc') }} />

                {/* Benefits List */}
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2 text-xs text-orange-800/80 dark:text-orange-300/80">
                    <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500 dark:text-orange-400" />
                    <span>{t('upsell_benefit_1')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-orange-800/80 dark:text-orange-300/80">
                    <Users className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500 dark:text-orange-400" />
                    <span>{t('upsell_benefit_2')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-orange-800/80 dark:text-orange-300/80">
                    <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500 dark:text-orange-400" />
                    <span>{t('upsell_benefit_3')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-orange-800/80 dark:text-orange-300/80">
                    <Star className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-500 dark:text-orange-400" />
                    <span>{t('upsell_benefit_4')}</span>
                  </li>
                </ul>

                {onUpgrade && (
                  <Button
                    onClick={onUpgrade}
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {t('btn_upgrade')}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Staff Members List */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {staff.map((member, index) => {
              const roleBadge = getRoleBadge(member.role);
              const RoleIcon = roleBadge.icon;
              const bioLength = member.bio?.length || 0;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                  className={cn(
                    "group relative rounded-2xl border transition-all duration-300",
                    member.isNew || member.hasUnsavedChanges
                      ? "bg-purple-50 dark:bg-gradient-to-br dark:from-medical-500/5 dark:to-medical-600/5 border-purple-200 dark:border-purple-500/30 shadow-lg shadow-purple-500/10"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xl"
                  )}
                >
                  <div className="p-6 space-y-5">

                    {/* Header Actions */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs">
                          #{index + 1}
                        </Badge>
                        {member.role && (
                          <Badge variant="outline" className={cn("text-xs", roleBadge.color)}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleBadge.label}
                          </Badge>
                        )}
                        {(member.isNew || member.hasUnsavedChanges) && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {t('badge_unsaved')}
                          </Badge>
                        )}
                      </div>

                      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          size="default"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(t('confirm_delete', { name: member.name || t('confirm_delete_fallback') }))) {
                              onDelete(member.id);
                            }
                          }}
                          className="h-9 w-9 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">

                      {/* Avatar Upload Section */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <label
                            htmlFor={`avatar-${member.id}`}
                            className="relative group/avatar cursor-pointer block"
                          >
                            <Avatar className="w-24 h-24 border-2 border-slate-200 dark:border-slate-800 group-hover/avatar:border-purple-500 transition-all group-hover/avatar:scale-105">
                              <AvatarImage src={member.imageUrl} />
                              <AvatarFallback className="bg-slate-100 text-slate-400 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 dark:text-slate-500">
                                <User className="w-10 h-10" />
                              </AvatarFallback>
                            </Avatar>

                            {/* Upload Overlay */}
                            <div className="absolute inset-0 bg-black/60 dark:bg-black/70 rounded-full flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all">
                              {uploadingImage === member.id ? (
                                <div className="animate-spin">
                                  <Camera className="w-6 h-6 text-white" />
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-white mb-1" />
                                  <span className="text-[10px] text-white font-semibold">{t('change_photo')}</span>
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
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                          {t('profile_photo')}
                        </span>
                      </div>

                      {/* Form Fields */}
                      <div className="flex-1 space-y-4">

                        {/* Name & Specialty */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              {t('label_name')}
                            </Label>
                            <Input
                              value={member.name}
                              onChange={(e) => {
                                onUpdate(member.id, 'name', e.target.value);
                              }}
                              placeholder={t('placeholder_name')}
                              className={cn(
                                "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11 text-base transition-all text-slate-900 dark:text-white",
                                "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
                                !member.name ? "border-red-300 dark:border-red-500/50" : ""
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              {t('label_specialty')}
                            </Label>
                            <Input
                              value={member.specialty}
                              onChange={(e) => {
                                onUpdate(member.id, 'specialty', e.target.value);
                              }}
                              placeholder={t('placeholder_specialty')}
                              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11 text-base text-slate-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>

                        {/* Credentials */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            {t('label_credentials')}
                            <span className="text-slate-400 dark:text-slate-600 text-[10px] normal-case">({t('optional')})</span>
                          </Label>
                          <Input
                            value={member.credentials || ''}
                            onChange={(e) => {
                              onUpdate(member.id, 'credentials', e.target.value);
                            }}
                            placeholder={t('placeholder_credentials')}
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-11 text-sm text-slate-900 dark:text-white focus:border-blue-500"
                          />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              {t('label_bio')}
                            </Label>
                            <span className={cn(
                              "text-xs font-semibold",
                              bioLength > 150 ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-600"
                            )}>
                              {bioLength}/200
                            </span>
                          </div>
                          <Textarea
                            value={member.bio}
                            onChange={(e) => {
                              onUpdate(member.id, 'bio', e.target.value.slice(0, 200));
                            }}
                            placeholder={t('placeholder_bio')}
                            rows={3}
                            maxLength={200}
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50"
          >
            <div className="p-4 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-full mb-4 border border-slate-100 dark:border-slate-700 shadow-sm">
              <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('empty_title')}</p>
            <p className="text-sm text-slate-500 mb-6">
              {t('empty_desc')}
            </p>
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              {t('btn_add_first')}
            </Button>
          </motion.div>
        )}

        {/* Team Benefits Footer */}
        {staff.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                {t('tip_title')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-600/90 dark:text-blue-300/80">
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  <span>{t('tip_1')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  <span>{t('tip_2')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  <span>{t('tip_3')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  <span>{t('tip_4')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}