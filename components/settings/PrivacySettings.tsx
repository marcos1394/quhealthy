"use client";

import React, { useState } from "react";
import { Database, AlertTriangle, FileDown, ShieldAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { securityService } from "@/services/security.service";

interface PrivacySettingsProps {
 algorithmicConsent: boolean;
 onConsentChange: (accepted: boolean) => Promise<boolean>;
}

export function PrivacySettings({ algorithmicConsent, onConsentChange }: PrivacySettingsProps) {
 const [{ isUpdatingConsent, isDeleteModalOpen, deleteConfirmation, deletePassword, isDeleting }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_ISUPDATINGCONSENT': return { ...state, isUpdatingConsent: typeof action.payload === 'function' ? action.payload(state.isUpdatingConsent) : action.payload };
 case 'SET_ISDELETEMODALOPEN': return { ...state, isDeleteModalOpen: typeof action.payload === 'function' ? action.payload(state.isDeleteModalOpen) : action.payload };
 case 'SET_DELETECONFIRMATION': return { ...state, deleteConfirmation: typeof action.payload === 'function' ? action.payload(state.deleteConfirmation) : action.payload };
 case 'SET_DELETEPASSWORD': return { ...state, deletePassword: typeof action.payload === 'function' ? action.payload(state.deletePassword) : action.payload };
 case 'SET_ISDELETING': return { ...state, isDeleting: typeof action.payload === 'function' ? action.payload(state.isDeleting) : action.payload };
 default: return state;
 }
 },
 {
 isUpdatingConsent: false, isDeleteModalOpen: false, deleteConfirmation: "", deletePassword: "", isDeleting: false
 }
 );

 const setIsUpdatingConsent = (val: any) => dispatch({ type: 'SET_ISUPDATINGCONSENT', payload: val });
 const setIsDeleteModalOpen = (val: any) => dispatch({ type: 'SET_ISDELETEMODALOPEN', payload: val });
 const setDeleteConfirmation = (val: any) => dispatch({ type: 'SET_DELETECONFIRMATION', payload: val });
 const setDeletePassword = (val: any) => dispatch({ type: 'SET_DELETEPASSWORD', payload: val });
 const setIsDeleting = (val: any) => dispatch({ type: 'SET_ISDELETING', payload: val });






 const handleToggleConsent = async () => {
 setIsUpdatingConsent(true);
 const success = await onConsentChange(!algorithmicConsent);
 if (!success) {
 toast.error("No se pudo actualizar el consentimiento.");
 }
 setIsUpdatingConsent(false);
 };

 const handleDeleteAccount = async () => {
 if (deleteConfirmation !== "ELIMINAR") {
 toast.error("Debes escribir ELIMINAR para confirmar.");
 return;
 }
 if (!deletePassword) {
 toast.error("La contraseña es requerida.");
 return;
 }

 setIsDeleting(true);
 try {
 await securityService.deleteAccount(deletePassword);
 toast.success("Cuenta eliminada correctamente. Redirigiendo...");
 setTimeout(() => {
 window.location.href = "/";
 }, 2000);
 } catch (error: any) {
 toast.error(error.response?.data?.error || "Error al eliminar la cuenta. Verifica tu contraseña.");
 } finally {
 setIsDeleting(false);
 }
 };

 return (
 <div className="space-y-8">
 <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
 <div>
 <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <Database className="w-4 h-4" strokeWidth={1.5} /> Privacidad y Datos
 </h2>
 <p className="text-sm text-gray-500 font-light mt-1">Controla cómo interactuamos con tus datos médicos y algoritmos de IA.</p>
 </div>
 </div>

 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800">
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Motor de Inteligencia Artificial</h3>
 </div>
 <div className="p-6">
 <div className="flex items-start justify-between">
 <div className="max-w-2xl">
 <p className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight">Consentimiento Algorítmico</p>
 <p className="text-xs text-gray-500 mt-2 leading-relaxed">
 Al habilitar esta opción, permites que los algoritmos de aprendizaje automático de QuHealthy analicen tus parámetros biométricos (wearables, vacunas, laboratorios) de forma completamente anónima y encriptada, con el fin de sugerirte estrategias de salud preventivas personalizadas. 
 </p>
 </div>
 <Switch 
 checked={algorithmicConsent} 
 disabled={isUpdatingConsent}
 onCheckedChange={handleToggleConsent} 
 className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
 />
 </div>
 </div>
 </div>

 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] opacity-60">
 <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
 <FileDown className="w-4 h-4" strokeWidth={1.5} /> Exportar Expediente
 </h3>
 <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600 border border-amber-600 px-2 py-0.5">Próximamente</span>
 </div>
 <div className="p-6">
 <p className="text-xs text-gray-500">Podrás descargar todo tu expediente clínico en formato JSON y HL7/FHIR.</p>
 </div>
 </div>

 {/* DANGER ZONE */}
 <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-[#1a0505]">
 <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
 <div>
 <h3 className="text-sm font-semibold text-red-600 dark:text-red-500 uppercase tracking-tight flex items-center gap-2">
 <ShieldAlert className="w-4 h-4" /> Zona de Peligro
 </h3>
 <p className="text-xs text-red-900/70 dark:text-red-300 mt-2">
 Eliminar tu cuenta destruirá permanentemente tu expediente, tus conexiones de wearables y tu historial. Esta acción no se puede deshacer.
 </p>
 </div>
 <Button 
 variant="outline" 
 onClick={() => setIsDeleteModalOpen(true)}
 className="rounded-none border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold shrink-0"
 >
 Eliminar Cuenta
 </Button>
 </div>
 </div>

 <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
 <DialogContent className="sm:max-w-md rounded-none bg-white dark:bg-[#0a0a0a] border border-red-600 p-0 gap-0">
 <DialogHeader className="p-6 border-b border-red-200 dark:border-red-900 bg-red-50 dark:bg-[#1a0505]">
 <DialogTitle className="text-sm font-bold uppercase tracking-widest text-red-600">
 Advertencia Crítica
 </DialogTitle>
 </DialogHeader>
 <div className="p-6 space-y-6">
 <p className="text-sm text-gray-700 dark:text-gray-300">
 Estás a punto de borrar tu cuenta de forma permanente. Para confirmar, escribe <span className="font-bold text-black dark:text-white select-none">ELIMINAR</span> en el campo de abajo e ingresa tu contraseña.
 </p>
 
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Confirmación</label>
 <Input 
 value={deleteConfirmation}
 onChange={(e) => setDeleteConfirmation(e.target.value)}
 placeholder="ELIMINAR"
 className="rounded-none h-12 focus-visible:ring-red-600 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]"
 />
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Contraseña Actual</label>
 <Input 
 type="password"
 value={deletePassword}
 onChange={(e) => setDeletePassword(e.target.value)}
 placeholder="••••••••"
 className="rounded-none h-12 focus-visible:ring-red-600 border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]"
 />
 </div>
 </div>
 </div>
 <DialogFooter className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex gap-3">
 <Button 
 variant="outline" 
 onClick={() => setIsDeleteModalOpen(false)}
 className="rounded-none border-black dark:border-white uppercase tracking-widest text-[9px] font-bold w-full sm:w-auto"
 >
 Cancelar
 </Button>
 <Button 
 onClick={handleDeleteAccount}
 disabled={isDeleting || deleteConfirmation !== "ELIMINAR" || !deletePassword}
 className="rounded-none bg-red-600 hover:bg-red-700 text-white uppercase tracking-widest text-[9px] font-bold w-full sm:w-auto transition-colors"
 >
 {isDeleting ? "Procesando..." : "Destruir Cuenta"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}
