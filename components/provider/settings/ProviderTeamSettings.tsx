"use client";
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Save,
  Loader2,
  Key,
  X,
  ShieldAlert,
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

const AVAILABLE_MODULES = [
  { key: "calendar", label: "Calendario" },
  { key: "patients", label: "Pacientes" },
  { key: "store", label: "Perfil Público" },
  { key: "cash_register", label: "Caja" },
  { key: "orders", label: "Órdenes" },
  { key: "inventory", label: "Inventario" },
  { key: "billing", label: "Facturación" },
  { key: "appointments", label: "Citas" },
  { key: "messages", label: "Mensajes" },
];

export function ProviderTeamSettings() {
  const router = useRouter();
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
    },
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
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    setIsSubmitting(true);
    const success = await inviteStaff(
      inviteEmail,
      inviteFirstName,
      inviteLastName,
      inviteRole,
      invitePermissions,
    );
    setIsSubmitting(false);
    if (success) {
      toast.success("Invitación enviada correctamente");
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteRole("MEDICAL_ASSISTANT");
      setInvitePermissions([]);
    } else {
      toast.error("Error al enviar la invitación");
    }
  };

  const handlePermissionsSubmit = async () => {
    if (!editingStaffId) return;
    setIsSubmitting(true);
    const success = await updatePermissions(editingStaffId, editingPermissions);
    setIsSubmitting(false);
    if (success) {
      toast.success("Permisos actualizados");
      setIsPermissionsOpen(false);
      setEditingStaffId(null);
    } else {
      toast.error("Error al actualizar los permisos");
    }
  };

  const handleResendInvite = async (staffId: number) => {
    const success = await resendInvite(staffId);
    if (success) {
      toast.success("Invitación reenviada correctamente");
    } else {
      toast.error("Error al reenviar la invitación");
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
    key: string,
  ) => {
    if (permissionsList.includes(key)) {
      setPermissionsList(permissionsList.filter((p) => p !== key));
    } else {
      setPermissionsList([...permissionsList, key]);
    }
  };

  if (isLoading && staff.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <QhSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/20 dark:border-white/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-black dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-black dark:text-white" />
            Gestión de Equipo (Staff)
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
            Invita y administra los permisos de acceso de tu equipo.
          </p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="gap-2 rounded-none border border-black bg-black text-white hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white uppercase tracking-widest text-[10px] font-bold transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Invitar Staff
        </Button>
      </div>

      {/* STAFF LIST */}
      <div className="bg-transparent rounded-none border border-black/20 dark:border-white/20 overflow-hidden">
        {staff.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            No tienes miembros en tu equipo aún. Invita a alguien para comenzar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-black/20 dark:border-white/20 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Módulos Permitidos</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold uppercase tracking-tight text-black dark:text-white">
                        {member.name || "Usuario Pendiente"}
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1">
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.status === "ACTIVE" ? (
                        <Badge className="bg-black text-white dark:bg-white dark:text-black border-black dark:border-white rounded-none text-[9px] uppercase tracking-widest hover:bg-black dark:hover:bg-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Activo
                        </Badge>
                      ) : member.status === "INACTIVE" ? (
                        <Badge
                          variant="outline"
                          className="border-black/50 dark:border-white/50 text-gray-500 dark:text-gray-400 rounded-none text-[9px] uppercase tracking-widest"
                        >
                          Pendiente / Inactivo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-red-500 text-red-500 rounded-none text-[9px] uppercase tracking-widest"
                        >
                          Suspendido
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.permissions?.length > 0 ? (
                          member.permissions.map((p) => (
                            <Badge
                              key={p}
                              variant="outline"
                              className="text-[9px] uppercase tracking-widest rounded-none border-black/20 dark:border-white/20 bg-transparent text-gray-600 dark:text-gray-300"
                            >
                              {AVAILABLE_MODULES.find((m) => m.key === p)
                                ?.label || p}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest italic">
                            Sin acceso
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none border border-black/10 hover:border-black dark:border-white/10 dark:hover:border-white"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-none border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              openPermissionsModal(
                                member.id,
                                member.permissions,
                              )
                            }
                            className="uppercase tracking-widest text-[10px] font-bold focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Editar Permisos
                          </DropdownMenuItem>
                          
                          {member.status === "INACTIVE" && (
                            <DropdownMenuItem
                              onClick={() => handleResendInvite(member.id)}
                              className="uppercase tracking-widest text-[10px] font-bold focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer text-blue-600 focus:text-blue-700"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Reenviar Invitación
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => toggleStatus(member.id)}
                            className="uppercase tracking-widest text-[10px] font-bold focus:bg-black/5 dark:focus:bg-white/5 cursor-pointer"
                          >
                            {member.status === "ACTIVE" ? (
                              <>
                                <PowerOff className="w-4 h-4 mr-2 text-orange-500" />{" "}
                                Suspender Acceso
                              </>
                            ) : (
                              <>
                                <Power className="w-4 h-4 mr-2 text-emerald-500" />{" "}
                                Reactivar Acceso
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-black/20 dark:bg-white/20" />
                          <DropdownMenuItem
                            className="text-red-600 uppercase tracking-widest text-[10px] font-bold focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={() => revokeAccess(member.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar Usuario
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

      {/* MODAL: INVITAR STAFF */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#050505] rounded-none border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold tracking-tighter text-black dark:text-white">
              Invitar al Equipo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="uppercase font-bold tracking-widest text-[10px] text-gray-500">
                Correo electrónico
              </Label>
              <Input
                type="email"
                placeholder="ej. asistente@clinica.com"
                className="rounded-none border-black/20 focus-visible:ring-black dark:border-white/20 dark:focus-visible:ring-white"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase font-bold tracking-widest text-[10px] text-gray-500">
                  Nombre
                </Label>
                <Input
                  type="text"
                  placeholder="Nombre"
                  className="rounded-none border-black/20 focus-visible:ring-black dark:border-white/20 dark:focus-visible:ring-white"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase font-bold tracking-widest text-[10px] text-gray-500">
                  Apellido
                </Label>
                <Input
                  type="text"
                  placeholder="Apellido"
                  className="rounded-none border-black/20 focus-visible:ring-black dark:border-white/20 dark:focus-visible:ring-white"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase font-bold tracking-widest text-[10px] text-gray-500">
                Rol
              </Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-full h-10 rounded-none border border-black/20 bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:border-white/20 dark:focus:ring-white">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-black dark:border-white">
                  <SelectItem
                    className="cursor-pointer"
                    value="MEDICAL_ASSISTANT"
                  >
                    Médico Asistente
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="RECEPTIONIST">
                    Recepcionista
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="CLINIC_OWNER">
                    Dueño de Clínica
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="FINANCE_VIEWER">
                    Visor de Finanzas
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="FINANCE_OPERATOR"
                  >
                    Operador de Finanzas
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="FINANCE_APPROVER"
                  >
                    Aprobador de Finanzas
                  </SelectItem>
                  <SelectItem
                    className="cursor-pointer"
                    value="FINANCE_DIRECTOR"
                  >
                    Director de Finanzas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="uppercase font-bold tracking-widest text-[10px] text-gray-500">
                Módulos de Acceso
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MODULES.map((module) => (
                  <label
                    key={module.key}
                    className="flex items-center space-x-2 border border-black/20 dark:border-white/20 p-2 rounded-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="rounded-none border-black/50 text-black focus:ring-black dark:border-white/50 dark:checked:bg-white dark:focus:ring-white"
                      checked={invitePermissions.includes(module.key)}
                      onChange={() =>
                        togglePermission(
                          invitePermissions,
                          setInvitePermissions,
                          module.key,
                        )
                      }
                    />
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      {module.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none border-black dark:border-white uppercase tracking-widest text-[10px] font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-none border border-black bg-black text-white hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white uppercase tracking-widest text-[10px] font-bold"
              onClick={handleInviteSubmit}
              disabled={!inviteEmail || isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Enviar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: EDITAR PERMISOS */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#050505] rounded-none border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold tracking-tighter text-black dark:text-white">
              Editar Permisos de Acceso
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="uppercase font-bold tracking-widest text-[10px] text-gray-500">
                Módulos Seleccionados
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MODULES.map((module) => (
                  <label
                    key={module.key}
                    className="flex items-center space-x-2 border border-black/20 dark:border-white/20 p-2 rounded-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="rounded-none border-black/50 text-black focus:ring-black dark:border-white/50 dark:checked:bg-white dark:focus:ring-white"
                      checked={editingPermissions.includes(module.key)}
                      onChange={() =>
                        togglePermission(
                          editingPermissions,
                          setEditingPermissions,
                          module.key,
                        )
                      }
                    />
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      {module.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none border-black dark:border-white uppercase tracking-widest text-[10px] font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              onClick={() => setIsPermissionsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-none border border-black bg-black text-white hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white uppercase tracking-widest text-[10px] font-bold"
              onClick={handlePermissionsSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Guardar Permisos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
