"use client";

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

// ShadCN UI
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
  variant?: 'destructive' | 'default'; // Para diferenciar borrar vs confirmar simple
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
  variant = 'destructive'
}) => {
  
  // Manejador para evitar que el modal se cierre automáticamente si hay loading
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {/* Icono dinámico según la variante */}
            <div className={`p-3 rounded-full flex-shrink-0 border ${
                variant === 'destructive' 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <AlertDialogTitle className="text-xl font-bold">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400 leading-relaxed">
                {message}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            disabled={isLoading} 
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
          >
            Cancelar
          </AlertDialogCancel>
          
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
                ${variant === 'destructive' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
              </>
            ) : (
              "Sí, confirmar"
            )}
          </Button>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
};