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
 <div className="flex items-center justify-between pb-2">
 <div>
 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
 <Database className="w-5 h-5 text-emerald-600" strokeWidth={2} /> Privacidad y Datos
 </h2>
 <p className="text-base text-gray-500 mt-1">Controla cómo interactuamos con tus datos médicos y algoritmos de IA.</p>
 </div>
 </div>

 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
 <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800">
 <h3 className="text-base font-bold text-gray-900 dark:text-white">Motor de Inteligencia Artificial</h3>
 </div>
 <div className="p-6">
 <div className="flex items-start justify-between">
 <div className="max-w-2xl">
 <p className="text-base font-bold text-gray-900 dark:text-white">Consentimiento Algorítmico</p>
 <p className="text-sm text-gray-500 mt-2 leading-relaxed">
 Al habilitar esta opción, permites que los algoritmos de aprendizaje automático de QuHealthy analicen tus parámetros biométricos (wearables, vacunas, laboratorios) de forma completamente anónima y encriptada, con el fin de sugerirte estrategias de salud preventivas personalizadas. 
 </p>
 </div>
 <Switch 
 checked={algorithmicConsent} 
 disabled={isUpdatingConsent}
 onCheckedChange={handleToggleConsent} 
 className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
 />
 </div>
 </div>
 </div>

 <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm opacity-60 overflow-hidden">
 <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
 <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
 <FileDown className="w-5 h-5 text-gray-500" strokeWidth={2} /> Exportar Expediente
 </h3>
 <span className="inline-flex text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-lg">Próximamente</span>
 </div>
 <div className="p-6">
 <p className="text-sm text-gray-500">Podrás descargar todo tu expediente clínico en formato JSON y HL7/FHIR.</p>
 </div>
 </div>

 {/* DANGER ZONE */}
 <div className="rounded-3xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-[#1a0505] shadow-sm">
 <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
 <div>
 <h3 className="text-base font-bold text-red-700 dark:text-red-500 flex items-center gap-2">
 <ShieldAlert className="w-5 h-5" strokeWidth={2} /> Zona de Peligro
 </h3>
 <p className="text-sm text-red-900/70 dark:text-red-300 mt-2">
 Eliminar tu cuenta destruirá permanentemente tu expediente, tus conexiones de wearables y tu historial. Esta acción no se puede deshacer.
 </p>
 </div>
 <Button 
 variant="outline" 
 onClick={() => setIsDeleteModalOpen(true)}
 className="rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors h-12 px-6 font-bold shadow-sm shrink-0"
 >
 Eliminar Cuenta
 </Button>
 </div>
 </div>

 <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
 <DialogContent className="sm:max-w-md rounded-3xl bg-white dark:bg-[#0a0a0a] border border-red-100 dark:border-red-900/30 p-0 gap-0 shadow-xl">
 <DialogHeader className="p-6 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-[#1a0505] rounded-t-3xl">
 <DialogTitle className="text-lg font-bold text-red-700 dark:text-red-500">
 Advertencia Crítica
 </DialogTitle>
 </DialogHeader>
 <div className="p-6 space-y-6">
 <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
 Estás a punto de borrar tu cuenta de forma permanente. Para confirmar, escribe <span className="font-bold text-gray-900 dark:text-white select-none">ELIMINAR</span> en el campo de abajo e ingresa tu contraseña.
 </p>
 
 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirmación</label>
 <Input 
 value={deleteConfirmation}
 onChange={(e) => setDeleteConfirmation(e.target.value)}
 placeholder="ELIMINAR"
 className="rounded-xl h-12 focus-visible:ring-red-600 focus-visible:border-red-600 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] shadow-sm"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña Actual</label>
 <Input 
 type="password"
 value={deletePassword}
 onChange={(e) => setDeletePassword(e.target.value)}
 placeholder="••••••••"
 className="rounded-xl h-12 focus-visible:ring-red-600 focus-visible:border-red-600 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] shadow-sm"
 />
 </div>
 </div>
 </div>
 <DialogFooter className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] rounded-b-3xl flex gap-3">
 <Button 
 variant="outline" 
 onClick={() => setIsDeleteModalOpen(false)}
 className="rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-white shadow-sm flex-1"
 >
 Cancelar
 </Button>
 <Button 
 onClick={handleDeleteAccount}
 disabled={isDeleting || deleteConfirmation !== "ELIMINAR" || !deletePassword}
 className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm flex-1 transition-colors"
 >
 {isDeleting ? "Procesando..." : "Destruir Cuenta"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}
