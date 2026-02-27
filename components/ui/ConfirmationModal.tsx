"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
  const handleConfirm = (e: React.MouseEvent) => { e.preventDefault(); onConfirm(); };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-md transition-colors">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 border ${variant === "destructive"
                ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-lg font-medium text-slate-900 dark:text-white">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 dark:text-slate-400 leading-relaxed font-light text-sm">{message}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3">
          <AlertDialogCancel disabled={isLoading}
            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white bg-transparent rounded-xl">
            Cancel
          </AlertDialogCancel>
          <Button variant={variant} onClick={handleConfirm} disabled={isLoading}
            className={`rounded-xl shadow-none ${variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900"
              }`}>
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : "Yes, confirm"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};