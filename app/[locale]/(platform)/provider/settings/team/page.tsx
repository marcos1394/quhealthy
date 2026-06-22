"use client"
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Save, Loader2, Key, X, ShieldAlert, CheckCircle2, MoreVertical, Trash2, PowerOff, Power } from "lucide-react";
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

export default function TeamManagementPage() {
  const router = useRouter();
  const { staff, isLoading, fetchStaff, inviteStaff, updatePermissions, toggleStatus, revokeAccess } = useClinicStaff();

    const [{ isInviteOpen, inviteEmail, invitePermissions, isSubmitting, isPermissionsOpen, editingStaffId, editingPermissions }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_ISINVITEOPEN': return { ...state, isInviteOpen: typeof action.payload === 'function' ? action.payload(state.isInviteOpen) : action.payload };
      case 'SET_INVITEEMAIL': return { ...state, inviteEmail: typeof action.payload === 'function' ? action.payload(state.inviteEmail) : action.payload };
      case 'SET_INVITEPERMISSIONS': return { ...state, invitePermissions: typeof action.payload === 'function' ? action.payload(state.invitePermissions) : action.payload };
      case 'SET_ISSUBMITTING': return { ...state, isSubmitting: typeof action.payload === 'function' ? action.payload(state.isSubmitting) : action.payload };
      case 'SET_ISPERMISSIONSOPEN': return { ...state, isPermissionsOpen: typeof action.payload === 'function' ? action.payload(state.isPermissionsOpen) : action.payload };
      case 'SET_EDITINGSTAFFID': return { ...state, editingStaffId: typeof action.payload === 'function' ? action.payload(state.editingStaffId) : action.payload };
      case 'SET_EDITINGPERMISSIONS': return { ...state, editingPermissions: typeof action.payload === 'function' ? action.payload(state.editingPermissions) : action.payload };
          default: return state;
        }
      },
      {
        isInviteOpen: false, inviteEmail: "", invitePermissions: [], isSubmitting: false, isPermissionsOpen: false, editingStaffId: null, editingPermissions: []
      }
    );

    const setIsInviteOpen = (val: any) => dispatch({ type: 'SET_ISINVITEOPEN', payload: val });
    const setInviteEmail = (val: any) => dispatch({ type: 'SET_INVITEEMAIL', payload: val });
    const setInvitePermissions = (val: any) => dispatch({ type: 'SET_INVITEPERMISSIONS', payload: val });
    const setIsSubmitting = (val: any) => dispatch({ type: 'SET_ISSUBMITTING', payload: val });
    const setIsPermissionsOpen = (val: any) => dispatch({ type: 'SET_ISPERMISSIONSOPEN', payload: val });
    const setEditingStaffId = (val: any) => dispatch({ type: 'SET_EDITINGSTAFFID', payload: val });
    const setEditingPermissions = (val: any) => dispatch({ type: 'SET_EDITINGPERMISSIONS', payload: val });









  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleInviteSubmit = async () => {
    if (!inviteEmail) return;
    setIsSubmitting(true);
    const success = await inviteStaff(inviteEmail, invitePermissions);
    setIsSubmitting(false);
    if (success) {
      toast.success("Invitación enviada correctamente");
      setIsInviteOpen(false);
      setInviteEmail("");
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

  const openPermissionsModal = (staffId: number, permissions: string[]) => {
    setEditingStaffId(staffId);
    setEditingPermissions(permissions || []);
    setIsPermissionsOpen(true);
  };

  const togglePermission = (permissionsList: string[], setPermissionsList: React.Dispatch<React.SetStateAction<string[]>>, key: string) => {
    if (permissionsList.includes(key)) {
      setPermissionsList(permissionsList.filter(p => p !== key));
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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-medical-500" />
            Gestión de Equipo (Staff)
          </h1>
          <p className="text-slate-500 mt-1">Invita y administra los permisos de acceso de tu equipo.</p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invitar Staff
        </Button>
      </div>

      {/* STAFF LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm overflow-hidden">
        {staff.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No tienes miembros en tu equipo aún. Invita a alguien para comenzar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-medium text-xs">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Módulos Permitidos</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{member.name || "Usuario Pendiente"}</div>
                      <div className="text-slate-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {member.status === 'ACTIVE' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Activo
                        </Badge>
                      ) : member.status === 'INACTIVE' ? (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          Pendiente / Inactivo
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-700">
                          Suspendido
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.permissions?.length > 0 ? member.permissions.map(p => (
                          <Badge key={p} variant="outline" className="text-[10px] bg-slate-50">
                            {AVAILABLE_MODULES.find(m => m.key === p)?.label || p}
                          </Badge>
                        )) : (
                          <span className="text-slate-400 italic">Sin acceso</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openPermissionsModal(member.id, member.permissions)}>
                            <Key className="w-4 h-4 mr-2 text-slate-500" />
                            Editar Permisos
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(member.id)}>
                            {member.status === 'ACTIVE' ? (
                              <><PowerOff className="w-4 h-4 mr-2 text-orange-500" /> Suspender Acceso</>
                            ) : (
                              <><Power className="w-4 h-4 mr-2 text-emerald-500" /> Reactivar Acceso</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => revokeAccess(member.id)}>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar al Equipo</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input 
                type="email" 
                placeholder="ej. asistente@clinica.com" 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-3">
              <Label>Módulos de Acceso</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MODULES.map(module => (
                  <label key={module.key} className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-medical-600 focus:ring-medical-500"
                      checked={invitePermissions.includes(module.key)}
                      onChange={() => togglePermission(invitePermissions, setInvitePermissions, module.key)}
                    />
                    <span className="text-sm font-medium">{module.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancelar</Button>
            <Button onClick={handleInviteSubmit} disabled={!inviteEmail || isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enviar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: EDITAR PERMISOS */}
      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Permisos de Acceso</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Módulos Seleccionados</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MODULES.map(module => (
                  <label key={module.key} className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-medical-600 focus:ring-medical-500"
                      checked={editingPermissions.includes(module.key)}
                      onChange={() => togglePermission(editingPermissions, setEditingPermissions, module.key)}
                    />
                    <span className="text-sm font-medium">{module.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>Cancelar</Button>
            <Button onClick={handlePermissionsSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar Permisos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
