"use client";

/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { useTranslations } from "next-intl";
import { KeyRound, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { securityService } from "@/services/security.service";
import { ActiveSessionsList } from "./ActiveSessionsList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function SecuritySettings() {
  const t = useTranslations("SecuritySettings");

  const [
    {
      currentPassword,
      newPassword,
      confirmPassword,
      isChangingPassword,
      isMfaEnabled,
      isMfaModalOpen,
      mfaSecret,
      mfaQrUri,
      mfaCode,
      isMfaProcessing,
      mfaPassword,
      isMfaDisableModalOpen,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_CURRENTPASSWORD":
          return {
            ...state,
            currentPassword:
              typeof action.payload === "function"
                ? action.payload(state.currentPassword)
                : action.payload,
          };
        case "SET_NEWPASSWORD":
          return {
            ...state,
            newPassword:
              typeof action.payload === "function"
                ? action.payload(state.newPassword)
                : action.payload,
          };
        case "SET_CONFIRMPASSWORD":
          return {
            ...state,
            confirmPassword:
              typeof action.payload === "function"
                ? action.payload(state.confirmPassword)
                : action.payload,
          };
        case "SET_ISCHANGINGPASSWORD":
          return {
            ...state,
            isChangingPassword:
              typeof action.payload === "function"
                ? action.payload(state.isChangingPassword)
                : action.payload,
          };
        case "SET_ISMFAENABLED":
          return {
            ...state,
            isMfaEnabled:
              typeof action.payload === "function"
                ? action.payload(state.isMfaEnabled)
                : action.payload,
          };
        case "SET_ISMFAMODALOPEN":
          return {
            ...state,
            isMfaModalOpen:
              typeof action.payload === "function"
                ? action.payload(state.isMfaModalOpen)
                : action.payload,
          };
        case "SET_MFASECRET":
          return {
            ...state,
            mfaSecret:
              typeof action.payload === "function"
                ? action.payload(state.mfaSecret)
                : action.payload,
          };
        case "SET_MFAQRURI":
          return {
            ...state,
            mfaQrUri:
              typeof action.payload === "function"
                ? action.payload(state.mfaQrUri)
                : action.payload,
          };
        case "SET_MFACODE":
          return {
            ...state,
            mfaCode:
              typeof action.payload === "function"
                ? action.payload(state.mfaCode)
                : action.payload,
          };
        case "SET_ISMFAPROCESSING":
          return {
            ...state,
            isMfaProcessing:
              typeof action.payload === "function"
                ? action.payload(state.isMfaProcessing)
                : action.payload,
          };
        case "SET_MFAPASSWORD":
          return {
            ...state,
            mfaPassword:
              typeof action.payload === "function"
                ? action.payload(state.mfaPassword)
                : action.payload,
          };
        case "SET_ISMFADISABLEMODALOPEN":
          return {
            ...state,
            isMfaDisableModalOpen:
              typeof action.payload === "function"
                ? action.payload(state.isMfaDisableModalOpen)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      isChangingPassword: false,
      isMfaEnabled: false,
      isMfaModalOpen: false,
      mfaSecret: "",
      mfaQrUri: "",
      mfaCode: "",
      isMfaProcessing: false,
      mfaPassword: "",
      isMfaDisableModalOpen: false,
    }
  );

  const setCurrentPassword = (val: any) =>
    dispatch({ type: "SET_CURRENTPASSWORD", payload: val });
  const setNewPassword = (val: any) =>
    dispatch({ type: "SET_NEWPASSWORD", payload: val });
  const setConfirmPassword = (val: any) =>
    dispatch({ type: "SET_CONFIRMPASSWORD", payload: val });
  const setIsChangingPassword = (val: any) =>
    dispatch({ type: "SET_ISCHANGINGPASSWORD", payload: val });
  const setIsMfaEnabled = (val: any) =>
    dispatch({ type: "SET_ISMFAENABLED", payload: val });
  const setIsMfaModalOpen = (val: any) =>
    dispatch({ type: "SET_ISMFAMODALOPEN", payload: val });
  const setMfaSecret = (val: any) =>
    dispatch({ type: "SET_MFASECRET", payload: val });
  const setMfaQrUri = (val: any) =>
    dispatch({ type: "SET_MFAQRURI", payload: val });
  const setMfaCode = (val: any) =>
    dispatch({ type: "SET_MFACODE", payload: val });
  const setIsMfaProcessing = (val: any) =>
    dispatch({ type: "SET_ISMFAPROCESSING", payload: val });
  const setMfaPassword = (val: any) =>
    dispatch({ type: "SET_MFAPASSWORD", payload: val });
  const setIsMfaDisableModalOpen = (val: any) =>
    dispatch({ type: "SET_ISMFADISABLEMODALOPEN", payload: val });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("toast_password_mismatch"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("toast_password_length"));
      return;
    }
    setIsChangingPassword(true);
    try {
      await securityService.changePassword({ currentPassword, newPassword });
      toast.success(t("toast_password_success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.error || t("toast_password_error")
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSetupMfa = async () => {
    setIsMfaProcessing(true);
    try {
      const data = await securityService.setupMfa();
      setMfaSecret(data.secret);
      setMfaQrUri(data.qrCodeUri);
      setIsMfaModalOpen(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || t("toast_mfa_setup_error"));
    } finally {
      setIsMfaProcessing(false);
    }
  };

  const handleEnableMfa = async () => {
    if (!mfaCode) return;
    setIsMfaProcessing(true);
    try {
      await securityService.enableMfa(mfaCode);
      toast.success(t("toast_mfa_enable_success"));
      setIsMfaEnabled(true);
      setIsMfaModalOpen(false);
      setMfaCode("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || t("toast_mfa_enable_error"));
    } finally {
      setIsMfaProcessing(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!mfaPassword) return;
    setIsMfaProcessing(true);
    try {
      await securityService.disableMfa(mfaPassword);
      toast.success(t("toast_mfa_disable_success"));
      setIsMfaEnabled(false);
      setIsMfaDisableModalOpen(false);
      setMfaPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || t("toast_mfa_disable_error"));
    } finally {
      setIsMfaProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-8">
      {/* ── ENCABEZADO DE SECCIÓN ────────────────────────────────────── */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Shield className="w-6 h-6" strokeWidth={2} />
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

      {/* ── FORMULARIO DE CAMBIO DE CONTRASEÑA ───────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs overflow-hidden">
        <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <KeyRound className="w-4 h-4" strokeWidth={2} />
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {t("change_password_title")}
          </h3>
        </div>

        <form onSubmit={handleChangePassword} className="p-5 md:p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("current_password")}
            </label>
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("new_password")}
              </label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("confirm_password")}
              </label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={
                isChangingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("updating_password")}</span>
                </>
              ) : (
                <span>{t("update_password_btn")}</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ── SECCIÓN AUTENTICACIÓN MFA ─────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs overflow-hidden">
        <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Shield className="w-4 h-4" strokeWidth={2} />
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {t("mfa_title")}
          </h3>
        </div>

        <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              {isMfaEnabled ? (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                  <span>{t("mfa_enabled")}</span>
                </Badge>
              ) : (
                <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                  <span>{t("mfa_disabled")}</span>
                </Badge>
              )}
            </div>

            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("mfa_desc")}
            </p>
          </div>

          <div className="shrink-0">
            {isMfaEnabled ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMfaDisableModalOpen(true)}
                className="w-full sm:w-auto rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-10 px-5 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <span>{t("disable_mfa_btn")}</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSetupMfa}
                disabled={isMfaProcessing}
                className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isMfaProcessing ? (
                  <>
                    <QhSpinner size="sm" className="text-white" />
                    <span>{t("processing")}</span>
                  </>
                ) : (
                  <span>{t("setup_mfa_btn")}</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── LISTADO DE SESIONES ACTIVAS ───────────────────────────────── */}
      <ActiveSessionsList />

      {/* ── MODAL: CONFIGURAR MFA ─────────────────────────────────────── */}
      <Dialog open={isMfaModalOpen} onOpenChange={setIsMfaModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 overflow-hidden font-sans shadow-2xl">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("mfa_modal_title")}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 md:p-8 space-y-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("mfa_modal_desc")}
            </p>

            <div className="flex justify-center bg-white p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs">
              {mfaQrUri ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    mfaQrUri
                  )}`}
                  alt="QR Code MFA"
                  className="rounded-xl w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 bg-gray-50 dark:bg-[#050505] rounded-xl flex items-center justify-center text-xs font-semibold text-gray-400">
                  {t("mfa_qr_loading")}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("mfa_code_label")}
              </label>

              <Input
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                placeholder={t("mfa_code_placeholder")}
                className="text-center font-mono font-bold tracking-[0.4em] text-lg rounded-xl h-12 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/60 dark:bg-[#050505]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMfaModalOpen(false)}
              className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-10 px-5 shadow-2xs cursor-pointer flex-1"
            >
              {t("cancel")}
            </Button>

            <Button
              type="button"
              onClick={handleEnableMfa}
              disabled={isMfaProcessing || mfaCode.length !== 6}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
            >
              {isMfaProcessing ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("verifying")}</span>
                </>
              ) : (
                <span>{t("activate")}</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: DESACTIVAR MFA ─────────────────────────────────────── */}
      <Dialog
        open={isMfaDisableModalOpen}
        onOpenChange={setIsMfaDisableModalOpen}
      >
        <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 overflow-hidden font-sans shadow-2xl">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("disable_mfa_modal_title")}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 md:p-8 space-y-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("disable_mfa_modal_desc")}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("password")}
              </label>

              <Input
                type="password"
                value={mfaPassword}
                onChange={(e) => setMfaPassword(e.target.value)}
                placeholder={t("placeholder_password")}
                className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/60 dark:bg-[#050505]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMfaDisableModalOpen(false)}
              className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-10 px-5 shadow-2xs cursor-pointer flex-1"
            >
              {t("cancel")}
            </Button>

            <Button
              type="button"
              onClick={handleDisableMfa}
              disabled={isMfaProcessing || !mfaPassword}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white h-10 px-6 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
            >
              {isMfaProcessing ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("processing")}</span>
                </>
              ) : (
                <span>{t("disable")}</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}