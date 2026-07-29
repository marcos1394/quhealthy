"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { UserX, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
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

export default function DeleteAccountPage() {
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-rose-100 dark:selection:bg-rose-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <Link
            href="/provider/dashboard/settings"
            className="w-10 h-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm shrink-0"
          >
            <ArrowLeft
              className="w-4 h-4 text-gray-700 dark:text-gray-200"
              strokeWidth={2}
            />
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-sm">
            <UserX className="w-6 h-6" strokeWidth={2} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 leading-tight">
                {t("delete_account.title")}
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400 shadow-sm">
                {t("delete_account.danger_badge")}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("options.delete_account.desc")}
            </p>
          </div>
        </div>

        {/* ── TARJETA Y FORMULARIO DE ELIMINACIÓN ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
}