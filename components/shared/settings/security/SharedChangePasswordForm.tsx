"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Save, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { securityService } from "@/services/security.service";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SharedChangePasswordForm() {
  const t = useTranslations("SettingsSecurity");

  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PasswordFormValues>();

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data: PasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t("password_page.mismatch"));
      return;
    }

    try {
      setLoading(true);
      await securityService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success(t("password_page.success_toast"));
      reset();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.error || t("password_page.error_toast")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 space-y-1">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
              {t("password_page.title")}
            </CardTitle>
            <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("password_page.subtitle")}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-5">
            {/* Contraseña Actual */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("password_page.current_password")}
              </Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder={t("password_page.current_placeholder")}
                  className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 pr-10 shadow-sm"
                  {...register("currentPassword", {
                    required: t("password_page.field_required"),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("password_page.new_password")}
              </Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder={t("password_page.new_placeholder")}
                  className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 pr-10 shadow-sm"
                  {...register("newPassword", {
                    required: t("password_page.field_required"),
                    minLength: {
                      value: 8,
                      message: t("password_page.min_length"),
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {t("password_page.confirm_password")}
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder={t("password_page.confirm_placeholder")}
                  className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 pr-10 shadow-sm"
                  {...register("confirmPassword", {
                    required: t("password_page.field_required"),
                    validate: (value) =>
                      value === newPasswordValue ||
                      t("password_page.mismatch"),
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-bold text-rose-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <QhSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span>{t("password_page.save_btn")}</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
}
