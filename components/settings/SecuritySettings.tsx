"use client"
/* eslint-disable react-doctor/no-giant-component */;

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
 <div className="space-y-8">
 {/* HEADER */}
 <div className="flex items-center justify-between pb-2">
 <div>
 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
 <Shield className="w-5 h-5 text-emerald-600" strokeWidth={2} /> Seguridad y Acceso
 </h2>
 <p className="text-base text-gray-500 mt-1">Protege tu cuenta con contraseñas seguras y verificación en dos pasos.</p>
 </div>
 </div>

 {/* PASSWORD FORM */}
 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
 <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-sm shrink-0">
 <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-500" strokeWidth={2} />
 </div>
 <h2 className="text-base font-bold text-gray-900 dark:text-white">
 Cambiar Contraseña
 </h2>
 </div>
 
 <form onSubmit={handleChangePassword} className="p-6 md:p-8 space-y-6">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña Actual</label>
 <Input 
 type="password"
 required
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 className="h-12 rounded-xl bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-sm transition-colors" 
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nueva Contraseña</label>
 <Input 
 type="password"
 required
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="h-12 rounded-xl bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-sm transition-colors" 
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
 <Input 
 type="password"
 required
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="h-12 rounded-xl bg-white dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-sm transition-colors" 
 />
 </div>
 </div>
 <Button 
 type="submit" 
 disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
 className="w-full md:w-auto rounded-xl bg-gray-900 hover:bg-gray-800 text-white h-12 px-8 text-sm font-bold shadow-sm transition-colors"
 >
 {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Actualizar Contraseña"}
 </Button>
 </form>
 </div>

 {/* MFA SECTION */}
 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
 <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-sm shrink-0">
 <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-500" strokeWidth={2} />
 </div>
 <h2 className="text-base font-bold text-gray-900 dark:text-white">
 Autenticación de Dos Factores (MFA)
 </h2>
 </div>
 <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="max-w-xl">
 <div className="flex items-center gap-3 mb-2">
 {isMfaEnabled ? (
 <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
 <CheckCircle2 className="w-3.5 h-3.5" /> Activado
 </span>
 ) : (
 <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded-lg dark:bg-amber-900/30 dark:text-amber-400">
 <AlertCircle className="w-3.5 h-3.5" /> Desactivado
 </span>
 )}
 </div>
 <p className="text-base text-gray-500">
 Agrega una capa adicional de seguridad a tu cuenta solicitando un código temporal (TOTP) al iniciar sesión, además de tu contraseña.
 </p>
 </div>
 <div>
 {isMfaEnabled ? (
 <Button 
 variant="outline"
 onClick={() => setIsMfaDisableModalOpen(true)}
 className="w-full md:w-auto rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-12 px-8 text-sm font-bold shadow-sm transition-colors"
 >
 Desactivar MFA
 </Button>
 ) : (
 <Button 
 onClick={handleSetupMfa}
 disabled={isMfaProcessing}
 className="w-full md:w-auto rounded-xl bg-gray-900 hover:bg-gray-800 text-white h-12 px-8 text-sm font-bold shadow-sm transition-colors"
 >
 {isMfaProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Configurar MFA"}
 </Button>
 )}
 </div>
 </div>
 </div>

 {/* SESSIONS SECTION */}
 <ActiveSessionsList />

 {/* MFA SETUP MODAL */}
 <Dialog open={isMfaModalOpen} onOpenChange={setIsMfaModalOpen}>
 <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 gap-0 shadow-xl">
 <DialogHeader className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] rounded-t-3xl">
 <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
 Configurar Aplicación Autenticadora
 </DialogTitle>
 </DialogHeader>
 <div className="p-6 space-y-6">
 <p className="text-sm text-gray-600 dark:text-gray-400">
 Escanea este código QR con Google Authenticator, Authy, o tu aplicación preferida.
 </p>
 <div className="flex justify-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
 {mfaQrUri ? (
 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaQrUri)}`} alt="QR Code" className="rounded-lg" />
 ) : (
 <div className="w-[200px] h-[200px] bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-sm font-semibold text-gray-400">
 Cargando QR...
 </div>
 )}
 </div>
 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ingresa el código de 6 dígitos</label>
 <Input 
 value={mfaCode}
 onChange={(e) => setMfaCode(e.target.value)}
 maxLength={6}
 placeholder="000000"
 className="text-center tracking-[0.5em] text-2xl font-bold rounded-xl h-14 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-sm"
 />
 </div>
 </div>
 <DialogFooter className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] rounded-b-3xl flex gap-3">
 <Button 
 variant="outline" 
 onClick={() => setIsMfaModalOpen(false)}
 className="rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-white shadow-sm flex-1"
 >
 Cancelar
 </Button>
 <Button 
 onClick={handleEnableMfa}
 disabled={isMfaProcessing || mfaCode.length !== 6}
 className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm flex-1 transition-colors"
 >
 {isMfaProcessing ? "Verificando..." : "Activar"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* MFA DISABLE MODAL */}
 <Dialog open={isMfaDisableModalOpen} onOpenChange={setIsMfaDisableModalOpen}>
 <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 gap-0 shadow-xl">
 <DialogHeader className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] rounded-t-3xl">
 <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
 Desactivar MFA
 </DialogTitle>
 </DialogHeader>
 <div className="p-6 space-y-4">
 <p className="text-sm text-gray-600 dark:text-gray-400">
 Para desactivar la autenticación en dos pasos, ingresa tu contraseña actual.
 </p>
 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
 <Input 
 type="password"
 value={mfaPassword}
 onChange={(e) => setMfaPassword(e.target.value)}
 placeholder="••••••••"
 className="rounded-xl h-12 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 shadow-sm bg-white"
 />
 </div>
 </div>
 <DialogFooter className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] rounded-b-3xl flex gap-3">
 <Button 
 variant="outline" 
 onClick={() => setIsMfaDisableModalOpen(false)}
 className="rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-white shadow-sm flex-1"
 >
 Cancelar
 </Button>
 <Button 
 onClick={handleDisableMfa}
 disabled={isMfaProcessing || !mfaPassword}
 className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm flex-1 transition-colors"
 >
 {isMfaProcessing ? "Procesando..." : "Desactivar"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}
