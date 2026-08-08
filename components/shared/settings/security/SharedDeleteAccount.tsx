"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { UserX, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

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
import { useAuth } from "@/hooks/useAuth";

interface DeleteAccountFormValues {
  password: string;
}

export function SharedDeleteAccount() {
  const t = useTranslations("SettingsSecurity");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountFormValues>();

  const onSubmit = async (data: DeleteAccountFormValues) => {
    try {
      setLoading(true);
      await securityService.deleteAccount(data.password);
      toast.success(t("delete_account.success_toast"));

      if (logout) {
        await logout();
      }
      router.push("/");
    } catch (error: any) {
      console.error("Error al eliminar cuenta:", error);
      toast.error(
        error.response?.data?.error || t("delete_account.error_toast")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="bg-white dark:bg-[#0a0a0a] border-rose-100 dark:border-rose-900/30 rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="p-6 md:p-8 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/30 space-y-2">
          <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400 mb-1">
            <AlertTriangle className="w-6 h-6 shrink-0" strokeWidth={2} />
            <CardTitle className="text-base font-bold tracking-tight">
              {t("delete_account.warning_title")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs font-medium text-rose-800/80 dark:text-rose-300/80 leading-relaxed pl-9">
            {t("delete_account.warning_desc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              {t("delete_account.password_label")}
            </Label>
            <Input
              type="password"
              placeholder={t("delete_account.password_placeholder")}
              className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 shadow-sm"
              {...register("password", {
                required: t("delete_account.password_required"),
              })}
            />
            {errors.password && (
              <p className="text-[11px] font-bold text-rose-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <QhSpinner size="sm" />
            ) : (
              <>
                <UserX className="w-4 h-4" strokeWidth={2} />
                <span>{t("delete_account.confirm_btn")}</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
