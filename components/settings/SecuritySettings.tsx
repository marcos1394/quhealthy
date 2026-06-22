"use client";

import React, { useState } from "react";
import { KeyRound, Shield, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { securityService } from "@/services/security.service";
import { ActiveSessionsList } from "./ActiveSessionsList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function SecuritySettings() {
  // Password state
    const [{ currentPassword, newPassword, confirmPassword, isChangingPassword, isMfaEnabled, isMfaModalOpen, mfaSecret, mfaQrUri, mfaCode, isMfaProcessing, mfaPassword, isMfaDisableModalOpen }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_CURRENTPASSWORD': return { ...state, currentPassword: typeof action.payload === 'function' ? action.payload(state.currentPassword) : action.payload };
      case 'SET_NEWPASSWORD': return { ...state, newPassword: typeof action.payload === 'function' ? action.payload(state.newPassword) : action.payload };
      case 'SET_CONFIRMPASSWORD': return { ...state, confirmPassword: typeof action.payload === 'function' ? action.payload(state.confirmPassword) : action.payload };
      case 'SET_ISCHANGINGPASSWORD': return { ...state, isChangingPassword: typeof action.payload === 'function' ? action.payload(state.isChangingPassword) : action.payload };
      case 'SET_ISMFAENABLED': return { ...state, isMfaEnabled: typeof action.payload === 'function' ? action.payload(state.isMfaEnabled) : action.payload };
      case 'SET_ISMFAMODALOPEN': return { ...state, isMfaModalOpen: typeof action.payload === 'function' ? action.payload(state.isMfaModalOpen) : action.payload };
      case 'SET_MFASECRET': return { ...state, mfaSecret: typeof action.payload === 'function' ? action.payload(state.mfaSecret) : action.payload };
      case 'SET_MFAQRURI': return { ...state, mfaQrUri: typeof action.payload === 'function' ? action.payload(state.mfaQrUri) : action.payload };
      case 'SET_MFACODE': return { ...state, mfaCode: typeof action.payload === 'function' ? action.payload(state.mfaCode) : action.payload };
      case 'SET_ISMFAPROCESSING': return { ...state, isMfaProcessing: typeof action.payload === 'function' ? action.payload(state.isMfaProcessing) : action.payload };
      case 'SET_MFAPASSWORD': return { ...state, mfaPassword: typeof action.payload === 'function' ? action.payload(state.mfaPassword) : action.payload };
      case 'SET_ISMFADISABLEMODALOPEN': return { ...state, isMfaDisableModalOpen: typeof action.payload === 'function' ? action.payload(state.isMfaDisableModalOpen) : action.payload };
          default: return state;
        }
      },
      {
        currentPassword: "", newPassword: "", confirmPassword: "", isChangingPassword: false, isMfaEnabled: false, isMfaModalOpen: false, mfaSecret: "", mfaQrUri: "", mfaCode: "", isMfaProcessing: false, mfaPassword: "", isMfaDisableModalOpen: false
      }
    );

    const setCurrentPassword = (val: any) => dispatch({ type: 'SET_CURRENTPASSWORD', payload: val });
    const setNewPassword = (val: any) => dispatch({ type: 'SET_NEWPASSWORD', payload: val });
    const setConfirmPassword = (val: any) => dispatch({ type: 'SET_CONFIRMPASSWORD', payload: val });
    const setIsChangingPassword = (val: any) => dispatch({ type: 'SET_ISCHANGINGPASSWORD', payload: val });
    const setIsMfaEnabled = (val: any) => dispatch({ type: 'SET_ISMFAENABLED', payload: val });
    const setIsMfaModalOpen = (val: any) => dispatch({ type: 'SET_ISMFAMODALOPEN', payload: val });
    const setMfaSecret = (val: any) => dispatch({ type: 'SET_MFASECRET', payload: val });
    const setMfaQrUri = (val: any) => dispatch({ type: 'SET_MFAQRURI', payload: val });
    const setMfaCode = (val: any) => dispatch({ type: 'SET_MFACODE', payload: val });
    const setIsMfaProcessing = (val: any) => dispatch({ type: 'SET_ISMFAPROCESSING', payload: val });
    const setMfaPassword = (val: any) => dispatch({ type: 'SET_MFAPASSWORD', payload: val });
    const setIsMfaDisableModalOpen = (val: any) => dispatch({ type: 'SET_ISMFADISABLEMODALOPEN', payload: val });





  // MFA State (Simulated check, ideally comes from profile context)
 








  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await securityService.changePassword({ currentPassword, newPassword });
      toast.success("Contraseña actualizada exitosamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al cambiar la contraseña.");
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
      toast.error(error.response?.data?.error || "Error al configurar MFA.");
    } finally {
      setIsMfaProcessing(false);
    }
  };

  const handleEnableMfa = async () => {
    if (!mfaCode) return;
    setIsMfaProcessing(true);
    try {
      await securityService.enableMfa(mfaCode);
      toast.success("MFA activado exitosamente.");
      setIsMfaEnabled(true);
      setIsMfaModalOpen(false);
      setMfaCode("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Código incorrecto.");
    } finally {
      setIsMfaProcessing(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!mfaPassword) return;
    setIsMfaProcessing(true);
    try {
      await securityService.disableMfa(mfaPassword);
      toast.success("MFA desactivado.");
      setIsMfaEnabled(false);
      setIsMfaDisableModalOpen(false);
      setMfaPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Contraseña incorrecta.");
    } finally {
      setIsMfaProcessing(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4" strokeWidth={1.5} /> Seguridad y Acceso
          </h2>
          <p className="text-sm text-gray-500 font-light mt-1">Protege tu cuenta con contraseñas seguras y verificación en dos pasos.</p>
        </div>
      </div>

      {/* PASSWORD FORM */}
      <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
        <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
            <KeyRound className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
            Cambiar Contraseña
          </h2>
        </div>
        
        <form onSubmit={handleChangePassword} className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Contraseña Actual</label>
            <Input 
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Nueva Contraseña</label>
              <Input 
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Confirmar Contraseña</label>
              <Input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" 
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full md:w-auto rounded-none bg-black text-white dark:bg-white dark:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar Contraseña"}
          </Button>
        </form>
      </div>

      {/* MFA SECTION */}
      <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
        <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
            <Shield className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
            Autenticación de Dos Factores (MFA)
          </h2>
        </div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-2">
              {isMfaEnabled ? (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Activado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                  <AlertCircle className="w-3.5 h-3.5" /> Desactivado
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Agrega una capa adicional de seguridad a tu cuenta solicitando un código temporal (TOTP) al iniciar sesión, además de tu contraseña.
            </p>
          </div>
          <div>
            {isMfaEnabled ? (
              <Button 
                variant="outline"
                onClick={() => setIsMfaDisableModalOpen(true)}
                className="w-full md:w-auto rounded-none border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Desactivar MFA
              </Button>
            ) : (
              <Button 
                onClick={handleSetupMfa}
                disabled={isMfaProcessing}
                className="w-full md:w-auto rounded-none bg-black text-white dark:bg-white dark:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                {isMfaProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Configurar MFA"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* SESSIONS SECTION */}
      <ActiveSessionsList />

      {/* MFA SETUP MODAL */}
      <Dialog open={isMfaModalOpen} onOpenChange={setIsMfaModalOpen}>
        <DialogContent className="sm:max-w-md rounded-none bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 gap-0">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
              Configurar Aplicación Autenticadora
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Escanea este código QR con Google Authenticator, Authy, o tu aplicación preferida.
            </p>
            <div className="flex justify-center bg-white p-4 border border-gray-200">
              {/* In a real app, render a QR code here from mfaQrUri. We'll use an image or placeholder */}
              {mfaQrUri ? (
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaQrUri)}`} alt="QR Code" />
              ) : (
                <div className="w-[200px] h-[200px] bg-gray-100 animate-pulse flex items-center justify-center text-xs text-gray-400">
                  Cargando QR...
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Ingresa el código de 6 dígitos</label>
              <Input 
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                placeholder="000000"
                className="text-center tracking-[1em] text-lg font-mono rounded-none h-14 border-gray-300 dark:border-gray-700 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
              />
            </div>
          </div>
          <DialogFooter className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsMfaModalOpen(false)}
              className="rounded-none border-black dark:border-white uppercase tracking-widest text-[9px] font-bold flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEnableMfa}
              disabled={isMfaProcessing || mfaCode.length !== 6}
              className="rounded-none bg-black text-white dark:bg-white dark:text-black uppercase tracking-widest text-[9px] font-bold flex-1 transition-colors"
            >
              {isMfaProcessing ? "Verificando..." : "Activar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MFA DISABLE MODAL */}
      <Dialog open={isMfaDisableModalOpen} onOpenChange={setIsMfaDisableModalOpen}>
        <DialogContent className="sm:max-w-md rounded-none bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 gap-0">
          <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
              Desactivar MFA
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Para desactivar la autenticación en dos pasos, ingresa tu contraseña actual.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Contraseña</label>
              <Input 
                type="password"
                value={mfaPassword}
                onChange={(e) => setMfaPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-none h-12 border-gray-300 dark:border-gray-700 focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white"
              />
            </div>
          </div>
          <DialogFooter className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsMfaDisableModalOpen(false)}
              className="rounded-none border-black dark:border-white uppercase tracking-widest text-[9px] font-bold flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDisableMfa}
              disabled={isMfaProcessing || !mfaPassword}
              className="rounded-none bg-red-600 hover:bg-red-700 text-white uppercase tracking-widest text-[9px] font-bold flex-1 transition-colors"
            >
              {isMfaProcessing ? "Procesando..." : "Desactivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
