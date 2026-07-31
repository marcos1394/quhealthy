"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Users,
  UserPlus,
  Key,
  CheckCircle2,
  MoreVertical,
  Trash2,
  PowerOff,
  Power,
  Mail,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useClinicStaff } from "@/hooks/useClinicStaff";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const AVAILABLE_MODULE_KEYS = [
  "calendar",
  "patients",
  "store",
  "cash_register",
  "orders",
  "inventory",
  "billing",
  "appointments",
  "messages",
] as const;

export function ProviderTeamSettings() {
  const t = useTranslations("ProviderTeamSettings");

  const {
    staff,
    isLoading,
    fetchStaff,
    inviteStaff,
    updatePermissions,
    toggleStatus,
    resendInvite,
    revokeAccess,
  } = useClinicStaff();

  const [
    {
      isInviteOpen,
      inviteEmail,
      inviteFirstName,
      inviteLastName,
      inviteRole,
      invitePermissions,
      isSubmitting,
      isPermissionsOpen,
      editingStaffId,
      editingPermissions,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_ISINVITEOPEN":
          return {
            ...state,
            isInviteOpen:
              typeof action.payload === "function"
                ? action.payload(state.isInviteOpen)
                : action.payload,
          };
        case "SET_INVITEEMAIL":
          return {
            ...state,
            inviteEmail:
              typeof action.payload === "function"
                ? action.payload(state.inviteEmail)
                : action.payload,
          };
        case "SET_INVITEFIRSTNAME":
          return {
            ...state,
            inviteFirstName:
              typeof action.payload === "function"
                ? action.payload(state.inviteFirstName)
                : action.payload,
          };
        case "SET_INVITELASTNAME":
          return {
            ...state,
            inviteLastName:
              typeof action.payload === "function"
                ? action.payload(state.inviteLastName)
                : action.payload,
          };
        case "SET_INVITEROLE":
          return {
            ...state,
            inviteRole:
              typeof action.payload === "function"
                ? action.payload(state.inviteRole)
                : action.payload,
          };
        case "SET_INVITEPERMISSIONS":
          return {
            ...state,
            invitePermissions:
              typeof action.payload === "function"
                ? action.payload(state.invitePermissions)
                : action.payload,
          };
        case "SET_ISSUBMITTING":
          return {
            ...state,
            isSubmitting:
              typeof action.payload === "function"
                ? action.payload(state.isSubmitting)
                : action.payload,
          };
        case "SET_ISPERMISSIONSOPEN":
          return {
            ...state,
            isPermissionsOpen:
              typeof action.payload === "function"
                ? action.payload(state.isPermissionsOpen)
                : action.payload,
          };
        case "SET_EDITINGSTAFFID":
          return {
            ...state,
            editingStaffId:
              typeof action.payload === "function"
                ? action.payload(state.editingStaffId)
                : action.payload,
          };
        case "SET_EDITINGPERMISSIONS":
          return {
            ...state,
            editingPermissions:
              typeof action.payload === "function"
                ? action.payload(state.editingPermissions)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      isInviteOpen: false,
      inviteEmail: "",
      inviteFirstName: "",
      inviteLastName: "",
      inviteRole: "MEDICAL_ASSISTANT",
      invitePermissions: [],
      isSubmitting: false,
      isPermissionsOpen: false,
      editingStaffId: null,
      editingPermissions: [],
    }
  );

  const setIsInviteOpen = (val: any) =>
    dispatch({ type: "SET_ISINVITEOPEN", payload: val });
  const setInviteEmail = (val: any) =>
    dispatch({ type: "SET_INVITEEMAIL", payload: val });
  const setInviteFirstName = (val: any) =>
    dispatch({ type: "SET_INVITEFIRSTNAME", payload: val });
  const setInviteLastName = (val: any) =>
    dispatch({ type: "SET_INVITELASTNAME", payload: val });
  const setInviteRole = (val: any) =>
    dispatch({ type: "SET_INVITEROLE", payload: val });
  const setInvitePermissions = (val: any) =>
    dispatch({ type: "SET_INVITEPERMISSIONS", payload: val });
  const setIsSubmitting = (val: any) =>
    dispatch({ type: "SET_ISSUBMITTING", payload: val });
  const setIsPermissionsOpen = (val: any) =>
    dispatch({ type: "SET_ISPERMISSIONSOPEN", payload: val });
  const setEditingStaffId = (val: any) =>
    dispatch({ type: "SET_EDITINGSTAFFID", payload: val });
  const setEditingPermissions = (val: any) =>
    dispatch({ type: "SET_EDITINGPERMISSIONS", payload: val });

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleInviteSubmit = async () => {
    if (!inviteEmail || !inviteFirstName || !inviteLastName || !inviteRole) {
      toast.error(t("toast_fill_required"));
      return;
    }
    setIsSubmitting(true);
    const success = await inviteStaff(
      inviteEmail,
      inviteFirstName,
      inviteLastName,
      inviteRole,
      invitePermissions
    );
    setIsSubmitting(false);
    if (success) {
      toast.success(t("toast_invite_sent"));
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteRole("MEDICAL_ASSISTANT");
      setInvitePermissions([]);
    } else {
      toast.error(t("toast_invite_error"));
    }
  };

  const handlePermissionsSubmit = async () => {
    if (!editingStaffId) return;
    setIsSubmitting(true);
    const success = await updatePermissions(
      editingStaffId,
      editingPermissions
    );
    setIsSubmitting(false);
    if (success) {
      toast.success(t("toast_permissions_updated"));
      setIsPermissionsOpen(false);
      setEditingStaffId(null);
    } else {
      toast.error(t("toast_permissions_error"));
    }
  };

  const handleResendInvite = async (staffId: number) => {
    const success = await resendInvite(staffId);
    if (success) {
      toast.success(t("toast_resend_sent"));
    } else {
      toast.error(t("toast_resend_error"));
    }
  };

  const openPermissionsModal = (staffId: number, permissions: string[]) => {
    setEditingStaffId(staffId);
    setEditingPermissions(permissions || []);
    setIsPermissionsOpen(true);
  };

  const togglePermission = (
    permissionsList: string[],
    setPermissionsList: React.Dispatch<React.SetStateAction<string[]>>,
    key: string
  ) => {
    if (permissionsList.includes(key)) {
      setPermissionsList(permissionsList.filter((p) => p !== key));
    } else {
      setPermissionsList([...permissionsList, key]);
    }
  };

  if (isLoading && staff.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-12 shadow-2xs flex items-center justify-center min-h-[350px]">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-6">
      {/* ── ENCABEZADO Y BOTÓN DE INVITAR ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Users className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h1>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_invite")}</span>
        </Button>
      </div>

      {/* ── LISTADO / MATRIZ DE COLABORADORES ────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-2xs">
        {staff.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs font-medium italic">
            {t("empty_staff")}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">{t("col_user")}</th>
                  <th className="px-5 py-3.5">{t("col_status")}</th>
                  <th className="px-5 py-3.5">{t("col_modules")}</th>
                  <th className="px-5 py-3.5 text-right">{t("col_actions")}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {member.name || t("user_pending")}
                      </div>
                      <div className="text-[11px] font-mono font-medium text-gray-400 mt-0.5">
                        {member.email}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {member.status === "ACTIVE" ? (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2} />
                          <span>{t("status_active")}</span>
                        </Badge>
                      ) : member.status === "INACTIVE" ? (
                        <Badge className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                          <span>{t("status_pending")}</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                          <span>{t("status_suspended")}</span>
                        </Badge>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {member.permissions?.length > 0 ? (
                          member.permissions.map((p: string) => (
                            <Badge
                              key={p}
                              variant="outline"
                              className="text-[10px] font-bold rounded-full border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 shadow-2xs"
                            >
                              {AVAILABLE_MODULE_KEYS.includes(p as any)
                                ? t(`modules.${p}`)
                                : p}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[11px] font-medium italic">
                            {t("no_access")}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer shadow-2xs"
                          >
                            <MoreVertical className="w-4 h-4" strokeWidth={2} />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="w-52 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white p-1.5 shadow-xl font-sans text-xs"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              openPermissionsModal(
                                member.id,
                                member.permissions
                              )
                            }
                            className="cursor-pointer rounded-xl px-3 py-2 font-bold hover:bg-gray-50 dark:hover:bg-[#050505]"
                          >
                            <Key className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                            <span>{t("menu_edit_permissions")}</span>
                          </DropdownMenuItem>

                          {member.status === "INACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => handleResendInvite(member.id)}
                              className="cursor-pointer rounded-xl px-3 py-2 font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                            >
                              <Mail className="w-4 h-4 mr-2" strokeWidth={2} />
                              <span>{t("menu_resend_invite")}</span>
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => toggleStatus(member.id)}
                            className="cursor-pointer rounded-xl px-3 py-2 font-bold hover:bg-gray-50 dark:hover:bg-[#050505]"
                          >
                            {member.status === "ACTIVE" ? (
                              <>
                                <PowerOff className="w-4 h-4 mr-2 text-amber-500" strokeWidth={2} />
                                <span>{t("menu_suspend")}</span>
                              </>
                            ) : (
                              <>
                                <Power className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                                <span>{t("menu_reactivate")}</span>
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />

                          <DropdownMenuItem
                            onClick={() => revokeAccess(member.id)}
                            className="cursor-pointer rounded-xl px-3 py-2 font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                            <span>{t("menu_delete")}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: INVITAR STAFF ─────────────────────────────────────── */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-0 overflow-hidden font-sans shadow-2xl">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("modal_invite_title")}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 md:p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Correo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("label_email")}
              </Label>
              <Input
                type="email"
                placeholder={t("placeholder_email")}
                className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("label_firstname")}
                </Label>
                <Input
                  type="text"
                  placeholder={t("placeholder_firstname")}
                  className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("label_lastname")}
                </Label>
                <Input
                  type="text"
                  placeholder={t("placeholder_lastname")}
                  className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Rol */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("label_role")}
              </Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-full h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs">
                  <SelectValue placeholder={t("placeholder_role")} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans text-xs">
                  <SelectItem value="MEDICAL_ASSISTANT" className="rounded-xl font-medium">
                    {t("role_assistant")}
                  </SelectItem>
                  <SelectItem value="RECEPTIONIST" className="rounded-xl font-medium">
                    {t("role_receptionist")}
                  </SelectItem>
                  <SelectItem value="CLINIC_OWNER" className="rounded-xl font-medium">
                    {t("role_owner")}
                  </SelectItem>
                  <SelectItem value="FINANCE_VIEWER" className="rounded-xl font-medium">
                    {t("role_finance_viewer")}
                  </SelectItem>
                  <SelectItem value="FINANCE_OPERATOR" className="rounded-xl font-medium">
                    {t("role_finance_operator")}
                  </SelectItem>
                  <SelectItem value="FINANCE_APPROVER" className="rounded-xl font-medium">
                    {t("role_finance_approver")}
                  </SelectItem>
                  <SelectItem value="FINANCE_DIRECTOR" className="rounded-xl font-medium">
                    {t("role_finance_director")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Módulos de Acceso */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("label_modules")}
              </Label>

              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MODULE_KEYS.map((key) => {
                  const isChecked = invitePermissions.includes(key);

                  return (
                    <label
                      key={key}
                      onClick={() =>
                        togglePermission(
                          invitePermissions,
                          setInvitePermissions,
                          key
                        )
                      }
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer select-none text-xs font-bold shadow-2xs",
                        isChecked
                          ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-300"
                          : "bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={() => {}}
                      />
                      <div
                        className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]"
                        )}
                      >
                        {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{t(`modules.${key}`)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/60 dark:bg-[#050505]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-10 px-5 shadow-2xs cursor-pointer"
            >
              {t("btn_cancel")}
            </Button>

            <Button
              type="button"
              onClick={handleInviteSubmit}
              disabled={!inviteEmail || isSubmitting}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_sending")}</span>
                </>
              ) : (
                <span>{t("btn_send_invite")}</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDITAR PERMISOS ───────────────────────────────────── */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-0 overflow-hidden font-sans shadow-2xl">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("modal_edit_permissions_title")}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 md:p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_selected_modules")}
            </Label>

            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_MODULE_KEYS.map((key) => {
                const isChecked = editingPermissions.includes(key);

                return (
                  <label
                    key={key}
                    onClick={() =>
                      togglePermission(
                        editingPermissions,
                        setEditingPermissions,
                        key
                      )
                    }
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer select-none text-xs font-bold shadow-2xs",
                      isChecked
                        ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-300"
                        : "bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => {}}
                    />
                    <div
                      className={cn(
                        "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                        isChecked
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]"
                      )}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{t(`modules.${key}`)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/60 dark:bg-[#050505]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPermissionsOpen(false)}
              className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] h-10 px-5 shadow-2xs cursor-pointer"
            >
              {t("btn_cancel")}
            </Button>

            <Button
              type="button"
              onClick={handlePermissionsSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_saving")}</span>
                </>
              ) : (
                <span>{t("btn_save_permissions")}</span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}