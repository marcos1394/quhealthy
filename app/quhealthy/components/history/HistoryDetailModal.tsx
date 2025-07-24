"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MessageCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { HistoryEntry, UserRole } from '@/app/quhealthy/types/history';

interface HistoryDetailModalProps {
  entry: HistoryEntry | null;
  role: UserRole;
  onOpenChange: (open: boolean) => void;
}

const getRatingStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} />
      ))}
    </div>
);

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ entry, role, onOpenChange }) => {
  if (!entry) return null;

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-teal-400">Detalles del servicio</DialogTitle>
          <DialogDescription className="text-gray-400">
            {format(parseISO(entry.date), "PPP", { locale: es })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400">{role === "paciente" ? "Proveedor" : "Cliente"}</h4>
              <p className="text-white">{role === "paciente" ? entry.provider?.name : entry.client?.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400">Tipo de servicio</h4>
              <p className="text-white">{entry.type}</p>
            </div>
          </div>
          {/* ... (resto de los detalles como descripción, notas, duración, etc.) ... */}
          {role === "paciente" && entry.rating && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Calificación</h4>
              {getRatingStars(entry.rating)}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
            {/* ... (lógica de botones de acción) ... */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};