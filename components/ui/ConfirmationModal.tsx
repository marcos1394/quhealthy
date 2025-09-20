"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md"
        >
          <div className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-gray-400 mt-1">{message}</p>
            </div>
          </div>
          <div className="p-6 flex justify-end gap-3 border-t border-gray-700 bg-gray-800/50">
            <Button variant="outline" onClick={onClose} className="border-gray-600">
              No, volver
            </Button>
            <Button onClick={onConfirm} variant="destructive" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sí, continuar'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};