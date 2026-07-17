"use client"
/* eslint-disable react-doctor/no-react19-deprecated-apis */;

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface ConfirmationModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void;
 title: string;
 message: string;
 isLoading?: boolean;
 variant?: "destructive" | "default";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, isLoading = false, variant = "destructive" }) => {
 const t = useTranslations('Common'); // Just in case we need general translations
 const handleConfirm = (e: React.MouseEvent) => { e.preventDefault(); onConfirm(); };

 return (
 <AlertDialog open={isOpen} onOpenChange={onClose}>
 <AlertDialogContent className="bg-white dark:bg-[#0a0a0a] border-black dark:border-white text-black dark:text-white max-w-md rounded-none transition-colors">
 <AlertDialogHeader>
 <div className="flex flex-col gap-4">
 <div className={`w-12 h-12 border flex items-center justify-center shrink-0 ${variant === "destructive"
 ? "border-red-600 bg-red-50 dark:bg-red-950/20 text-red-600"
 : "border-black dark:border-white bg-gray-50 dark:bg-[#050505] text-black dark:text-white"
 }`}>
 <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
 </div>
 <div className="space-y-2 text-left">
 <AlertDialogTitle className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">{title}</AlertDialogTitle>
 <AlertDialogDescription className="text-gray-500 dark:text-gray-400 leading-relaxed font-light text-sm">{message}</AlertDialogDescription>
 </div>
 </div>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
 <AlertDialogCancel disabled={isLoading}
 className="rounded-none border-gray-200 dark:border-gray-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111111] bg-transparent uppercase font-bold text-[10px] tracking-widest h-10">
 Cancelar
 </AlertDialogCancel>
 <Button variant={variant === "destructive" ? "destructive" : "default"} onClick={handleConfirm} disabled={isLoading}
 className={`rounded-none h-10 uppercase font-bold text-[10px] tracking-widest ${variant === "destructive"
 ? "bg-red-600 hover:bg-red-700 text-white border-0"
 : "bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black border-0"
 }`}>
 {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>) : "Confirmar"}
 </Button>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 );
};