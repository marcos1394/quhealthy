"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useReducer } from "react";
import { useTranslations } from "next-intl";
import { Database, FileDown, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { securityService } from "@/services/security.service";

interface PrivacySettingsProps {
  algorithmicConsent: boolean;
  onConsentChange: (accepted: boolean) => Promise<boolean>;
}

export function PrivacySettings({
  algorithmicConsent,
  onConsentChange,
}: PrivacySettingsProps) {
  const t = useTranslations("SettingsPrivacy");

  const [
    {
      isUpdatingConsent,
      isDeleteModalOpen,
      deleteConfirmation,
      deletePassword,
      isDeleting,
    },
    dispatch,
  ] = useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_ISUPDATINGCONSENT":
          return {
            ...state,
            isUpdatingConsent:
              typeof action.payload === "function"
                ? action.payload(state.isUpdatingConsent)
                : action.payload,
          };
        case "SET_ISDELETEMODALOPEN":
          return {
            ...state,
            isDeleteModalOpen:
              typeof action.payload === "function"
                ? action.payload(state.isDeleteModalOpen)
                : action.payload,
          };
        case "SET_DELETECONFIRMATION":
          return {
            ...state,
            deleteConfirmation:
              typeof action.payload === "function"
                ? action.payload(state.deleteConfirmation)
                : action.payload,
          };
        case "SET_DELETEPASSWORD":
          return {
            ...state,
            deletePassword:
              typeof action.payload === "function"
                ? action.payload(state.deletePassword)
                : action.payload,
          };
        case "SET_ISDELETING":
          return {
            ...state,
            isDeleting:
              typeof action.payload === "function"
                ? action.payload(state.isDeleting)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      isUpdatingConsent: false,
      isDeleteModalOpen: false,
      deleteConfirmation: "",
      deletePassword: "",
      isDeleting: false,
    }
  );

  const setIsUpdatingConsent = (val: any) =>
    dispatch({ type: "SET_ISUPDATINGCONSENT", payload: val });
  const setIsDeleteModalOpen = (val: any) =>
    dispatch({ type: "SET_ISDELETEMODALOPEN", payload: val });
  const setDeleteConfirmation = (val: any) =>
    dispatch({ type: "SET_DELETECONFIRMATION", payload: val });
  const setDeletePassword = (val: any) =>
    dispatch({ type: "SET_DELETEPASSWORD", payload: val });
  const setIsDeleting = (val: any) =>
    dispatch({ type: "SET_ISDELETING", payload: val });

  const confirmKeyword = t("confirm_keyword");

  const handleToggleConsent = async () => {
    setIsUpdatingConsent(true);
    const success = await onConsentChange(!algorithmicConsent);
    if (!success) {
      toast.error(t("toast_consent_error"));
    }
    setIsUpdatingConsent(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.trim() !== confirmKeyword) {
      toast.error(t("toast_confirm_mismatch", { word: confirmKeyword }));
      return;
    }
    if (!deletePassword) {
      toast.error(t("toast_password_required"));
      return;
    }

    setIsDeleting(true);
    try {
      await securityService.deleteAccount(deletePassword);
      toast.success(t("toast_delete_success"));
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.error ||
          "Error al eliminar la cuenta. Verifica tu contraseña."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── ENCABEZADO ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Database className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("title")}
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── TARJETA: IA Y CONSENTIMIENTO ALGORÍTMICO ─────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs overflow-hidden">
        <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {t("ai_title")}
          </h3>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                {t("consent_title")}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("consent_desc")}
              </p>
            </div>

            <Switch
              checked={algorithmicConsent}
              disabled={isUpdatingConsent}
              onCheckedChange={handleToggleConsent}
            />
          </div>
        </div>
      </div>

      {/* ── TARJETA: EXPORTAR EXPEDIENTE (PRÓXIMAMENTE) ──────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs opacity-75 overflow-hidden">
        <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <span>{t("export_title")}</span>
          </h3>

          <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
            {t("badge_coming_soon")}
          </Badge>
        </div>

        <div className="p-6 text-xs font-medium text-gray-400 dark:text-gray-500 italic leading-relaxed">
          {t("export_desc")}
        </div>
      </div>

      {/* ── TARJETA: ZONA DE PELIGRO ─────────────────────────────────── */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" strokeWidth={2} />
              <span>{t("danger_zone_title")}</span>
            </h3>

            <p className="text-xs font-medium text-rose-900/80 dark:text-rose-200/80 leading-relaxed max-w-xl">
              {t("danger_zone_desc")}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(true)}
            className="rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all h-10 px-5 text-xs font-bold shadow-2xs cursor-pointer shrink-0"
          >
            {t("btn_delete_account")}
          </Button>
        </div>
      </div>

      {/* ── MODAL: CONFIRMACIÓN DE ELIMINACIÓN ───────────────────────── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-[#0a0a0a] border border-rose-200 dark:border-rose-900/40 p-0 overflow-hidden font-sans shadow-2xl">
          <div className="p-6 md:p-8 border-b border-rose-100 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/30">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold text-rose-700 dark:text-rose-400 tracking-tight">
                {t("dialog_title")}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
              {t("dialog_desc", { confirmWord: confirmKeyword })}
            </p>

            <div className="space-y-4">
              {/* Palabra de confirmación */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("label_confirm")}
                </label>

                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={t("placeholder_confirm")}
                  className="rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-bold text-gray-900 dark:text-white shadow-2xs"
                />
              </div>

              {/* Contraseña actual */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("label_password")}
                </label>

                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder={t("placeholder_password")}
                  className="rounded-xl h-11 focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/60 dark:bg-[#050505]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-10 px-5 shadow-2xs cursor-pointer flex-1"
            >
              {t("btn_cancel")}
            </Button>

            <Button
              type="button"
              onClick={handleDeleteAccount}
              disabled={
                isDeleting ||
                deleteConfirmation.trim() !== confirmKeyword ||
                !deletePassword
              }
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_deleting")}</span>
                </>
              ) : (
                <span>{t("btn_confirm_delete")}</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}